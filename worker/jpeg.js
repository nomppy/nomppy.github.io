// Reads width and height from a JPEG's start-of-frame marker.
// Returns null if the bytes are not a JPEG we can parse.
export function jpegSize(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = b[i + 1];
    // Standalone markers without a length field.
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    if (marker === 0xff) {
      i++;
      continue;
    }
    const len = (b[i + 2] << 8) | b[i + 3];
    // SOF0..SOF15, excluding DHT (C4), JPG (C8) and DAC (CC).
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      const height = (b[i + 5] << 8) | b[i + 6];
      const width = (b[i + 7] << 8) | b[i + 8];
      return width && height ? { width, height } : null;
    }
    i += 2 + len;
  }
  return null;
}

// Instagram accepts feed images between 4:5 (portrait) and 1.91:1 (landscape).
export function fitsInstagram(width, height) {
  if (!width || !height) return false;
  const ratio = width / height;
  return ratio >= 0.8 - 1e-3 && ratio <= 1.91 + 1e-3;
}

// Removes location data from a JPEG without re-encoding it.
// - EXIF (APP1 "Exif"): the GPS block is wiped in place; orientation, camera,
//   date and colour information are kept, so photos stay upright.
// - XMP (other APP1) and IPTC (APP13) segments, which can repeat the location,
//   are dropped. If the EXIF block cannot be parsed safely it is dropped too.
// Returns { bytes, orientation } where orientation is the EXIF value (1-8).
export function scrubJpeg(input) {
  const b = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return { bytes: b, orientation: 1 };
  const parts = [b.subarray(0, 2)];
  let orientation = 1;
  let i = 2;
  while (i + 4 <= b.length) {
    if (b[i] !== 0xff) return { bytes: b, orientation: 1 }; // unexpected layout: leave untouched
    const marker = b[i + 1];
    if (marker === 0xda) {
      parts.push(b.subarray(i)); // start of scan: copy the rest verbatim
      break;
    }
    const len = (b[i + 2] << 8) | b[i + 3];
    const end = i + 2 + len;
    if (end > b.length) return { bytes: b, orientation: 1 };
    const seg = b.subarray(i, end);
    if (marker === 0xe1 && isExif(seg)) {
      const copy = new Uint8Array(seg); // never mutate the caller's buffer
      const result = wipeGps(copy);
      if (result) {
        orientation = result.orientation;
        parts.push(copy);
      }
    } else if (marker !== 0xe1 && marker !== 0xed) {
      parts.push(seg);
    }
    i = end;
  }
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return { bytes: out, orientation };
}

function isExif(seg) {
  return seg.length > 10 && seg[4] === 0x45 && seg[5] === 0x78 && seg[6] === 0x69 && seg[7] === 0x66 && seg[8] === 0 && seg[9] === 0;
}

const TYPE_SIZE = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 6: 1, 7: 1, 8: 2, 9: 4, 10: 8, 11: 4, 12: 8 };

// Wipes the GPS IFD inside an EXIF APP1 segment (mutates seg).
// Returns { orientation } on success, or null if the block looks malformed.
function wipeGps(seg) {
  const t = 10; // TIFF header starts after FF E1, length, "Exif\0\0"
  if (seg.length < t + 8) return null;
  const le = seg[t] === 0x49 && seg[t + 1] === 0x49;
  const be = seg[t] === 0x4d && seg[t + 1] === 0x4d;
  if (!le && !be) return null;
  const n = seg.length - t;
  const u16 = (o) => (le ? seg[t + o] | (seg[t + o + 1] << 8) : (seg[t + o] << 8) | seg[t + o + 1]);
  const u32 = (o) =>
    le
      ? (seg[t + o] | (seg[t + o + 1] << 8) | (seg[t + o + 2] << 16) | (seg[t + o + 3] << 24)) >>> 0
      : ((seg[t + o] << 24) | (seg[t + o + 1] << 16) | (seg[t + o + 2] << 8) | seg[t + o + 3]) >>> 0;
  const ok = (o, len) => o >= 0 && o + len <= n;
  const zero = (o, len) => seg.fill(0, t + o, t + o + len);

  const ifd0 = u32(4);
  if (!ok(ifd0, 2)) return null;
  const count0 = u16(ifd0);
  if (!ok(ifd0 + 2, count0 * 12)) return null;
  let orientation = 1;
  let gps = null;
  for (let k = 0; k < count0; k++) {
    const e = ifd0 + 2 + k * 12;
    const tag = u16(e);
    if (tag === 0x0112) orientation = u16(e + 8) || 1;
    if (tag === 0x8825) gps = u32(e + 8);
  }
  if (gps !== null && gps !== 0) {
    if (!ok(gps, 2)) return null;
    const count = u16(gps);
    if (!ok(gps + 2, count * 12)) return null;
    for (let k = 0; k < count; k++) {
      const e = gps + 2 + k * 12;
      const size = (TYPE_SIZE[u16(e + 2)] || 1) * u32(e + 4);
      if (size > 4) {
        const at = u32(e + 8);
        if (!ok(at, size)) return null;
        zero(at, size);
      }
    }
    zero(gps, 2 + count * 12); // entry count becomes 0 and every entry is blanked
  }
  return { orientation: orientation >= 1 && orientation <= 8 ? orientation : 1 };
}

// Display size after applying EXIF orientation (5-8 rotate by 90 degrees).
export function displaySize(size, orientation) {
  if (!size) return size;
  return orientation >= 5 ? { width: size.height, height: size.width } : size;
}
