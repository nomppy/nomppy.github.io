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

// Removes EXIF/XMP (APP1) and IPTC (APP13) segments, which can carry GPS
// location and camera details. Keeps the colour profile (APP2) and pixels.
// The Apple Shortcut resizes before upload, which bakes in the rotation, so
// dropping the EXIF orientation tag does not turn photos sideways.
export function stripMetadata(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return b;
  const parts = [b.subarray(0, 2)];
  let i = 2;
  while (i + 4 <= b.length) {
    if (b[i] !== 0xff) return b; // unexpected layout: leave untouched
    const marker = b[i + 1];
    if (marker === 0xda) {
      parts.push(b.subarray(i)); // start of scan: copy the rest verbatim
      break;
    }
    const len = (b[i + 2] << 8) | b[i + 3];
    const end = i + 2 + len;
    if (end > b.length) return b;
    if (marker !== 0xe1 && marker !== 0xed) parts.push(b.subarray(i, end));
    i = end;
  }
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}
