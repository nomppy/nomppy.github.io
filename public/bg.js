// Page background: tints the frosted panels with the photo's own colour.
// The background itself is picked before the page paints by the inline
// script from worker/backgrounds.js, which leaves window.__bg behind.
(() => {
  const bg = window.__bg;
  if (!bg || bg.pick.mode !== "photo") return;

  // A light, still-coloured version of the photo: average its pixels,
  // counting colourful ones more so the tint isn't a muddy grey, then keep
  // the hue and set a lightness that black text reads well on.
  function tintOf(image) {
    const n = 24;
    const c = document.createElement("canvas");
    c.width = c.height = n;
    const x = c.getContext("2d", { willReadFrequently: true });
    x.drawImage(image, 0, 0, n, n);
    const d = x.getImageData(0, 0, n, n).data;
    let r = 0, g = 0, b = 0, w = 0;
    for (let i = 0; i < d.length; i += 4) {
      const max = Math.max(d[i], d[i + 1], d[i + 2]), min = Math.min(d[i], d[i + 1], d[i + 2]);
      const k = 0.15 + (max - min) / 255; // more weight to saturated pixels
      r += d[i] * k; g += d[i + 1] * k; b += d[i + 2] * k; w += k;
    }
    let [h, s] = hsl(r / w, g / w, b / w);
    s = Math.min(0.55, Math.max(0.12, s * 1.2));
    // Plain average lightness: darker photos get thicker frost so the text
    // keeps a light background.
    let l = 0;
    for (let i = 0; i < d.length; i += 4) l += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    l /= (d.length / 4) * 255;
    return { tint: `hsl(${Math.round(h)} ${Math.round(s * 100)}% 86%)`, frost: Math.round(55 + (1 - l) * 30) };
  }
  function hsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, dd = max - min;
    if (!dd) return [0, 0, l];
    const s = dd / (1 - Math.abs(2 * l - 1));
    const h = max === r ? ((g - b) / dd) % 6 : max === g ? (b - r) / dd + 2 : (r - g) / dd + 4;
    return [(h * 60 + 360) % 360, s, l];
  }

  const img = new Image();
  img.onload = () => {
    try {
      Object.assign(bg.pick, tintOf(img));
      bg.apply("photo", true);
    } catch {
      // keep the neutral tint
    }
  };
  img.src = `/cdn-cgi/image/width=48,quality=60,fit=scale-down,format=auto${bg.pick.photo.u}`;
})();
