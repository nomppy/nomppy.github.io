// Random page background, chosen per page load and written into the HTML
// before it reaches the browser (no flash). Managed from /admin.
//   { kind: "color", color: "#e2ebe6" }
//   { kind: "image", id, tint: "#ececec" }  image stored in R2 at bg/<id>.jpg;
//     page content then sits on a frosted panel tinted with `tint`.
import { kvGet, kvPut } from "./kv.js";

const KEY = "backgrounds";
const CACHE_MS = 60_000;

// Light tones that keep black text and the blue links readable.
export const DEFAULT_BACKGROUNDS = [
  { id: "c-grey", kind: "color", color: "#ececec", enabled: true },
  { id: "c-paper", kind: "color", color: "#f1e9da", enabled: true },
  { id: "c-sage", kind: "color", color: "#e2ebe6", enabled: true },
  { id: "c-mist", kind: "color", color: "#e6e9f2", enabled: true },
  { id: "c-blush", kind: "color", color: "#f2e4e1", enabled: true },
];

let cache = { at: 0, items: null };

export async function getBackgrounds(env, { fresh = false } = {}) {
  if (!fresh && cache.items && Date.now() - cache.at < CACHE_MS) return cache.items;
  const saved = await kvGet(env, KEY);
  cache = { at: Date.now(), items: saved?.value ?? DEFAULT_BACKGROUNDS };
  return cache.items;
}

const HEX = /^#[0-9a-f]{6}$/i;

// WCAG relative luminance and contrast against black text.
function luminance(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export const contrastWithBlack = (hex) => (luminance(hex) + 0.05) / 0.05;

export function validateBackgrounds(input) {
  if (!Array.isArray(input)) return { ok: false, error: "Backgrounds must be a list." };
  const out = [];
  for (const b of input) {
    const id = String(b?.id || "").slice(0, 64);
    if (!/^[a-z0-9-]+$/i.test(id)) return { ok: false, error: "Each background needs an id." };
    const enabled = b.enabled !== false;
    if (b.kind === "color") {
      if (!HEX.test(b.color || "")) return { ok: false, error: `"${b.color}" isn't a colour like #e2ebe6.` };
      // Text on the site is black; below 7:1 it gets hard to read.
      if (contrastWithBlack(b.color) < 7) return { ok: false, error: `${b.color} is too dark for the black text. Pick a lighter colour.` };
      out.push({ id, kind: "color", color: b.color.toLowerCase(), enabled });
    } else if (b.kind === "image") {
      if (!/^img-[0-9a-f]{8}$/.test(id)) return { ok: false, error: "That photo isn't one uploaded here." };
      const tint = HEX.test(b.tint || "") ? b.tint.toLowerCase() : "#ececec";
      // The text sits on a panel of this colour, so it needs the same contrast.
      if (contrastWithBlack(tint) < 7) return { ok: false, error: `The tint ${tint} is too dark for the black text. Pick a lighter colour.` };
      out.push({ id, kind: "image", tint, enabled });
    } else {
      return { ok: false, error: "Unknown background type." };
    }
  }
  return { ok: true, value: out };
}

export async function saveBackgrounds(env, items) {
  await kvPut(env, KEY, items);
  cache.at = 0;
}

export const bgImagePath = (id) => `/bg/${id}.jpg`;
const bgKey = (id) => `bg/${id}.jpg`;

export async function storeBackgroundImage(env, bytes) {
  const id = `img-${crypto.randomUUID().slice(0, 8)}`;
  await env.PHOTOS.put(bgKey(id), bytes, { httpMetadata: { contentType: "image/jpeg" } });
  return id;
}

export async function deleteBackgroundImage(env, id) {
  await env.PHOTOS.delete(bgKey(id));
}

export async function serveBackground(request, env) {
  const m = new URL(request.url).pathname.match(/^\/bg\/(img-[0-9a-f]{8})\.jpg$/);
  if (!m) return null;
  const obj = await env.PHOTOS.get(bgKey(m[1]));
  if (!obj) return new Response("Not found", { status: 404 });
  return new Response(obj.body, {
    headers: { "content-type": "image/jpeg", "cache-control": "public, max-age=31536000, immutable", etag: obj.httpEtag },
  });
}

// Darker shade for cards and placeholders that sit on the background.
const shade = (hex) => `color-mix(in srgb, ${hex} 93%, black)`;

export function backgroundCss(bg) {
  if (!bg) return "";
  if (bg.kind === "color") {
    return `:root,html.light-mode{--primary-bg-color:${bg.color}!important;--secondary-bg-color:${shade(bg.color)}!important}`;
  }
  // Image: full-bleed, with each block of text on its own frosted panel so
  // the photo shows between them. Page roots: #home (home), .center-container
  // (favorites, posts), .photos-page (photos).
  const img = `/cdn-cgi/image/width=2400,fit=scale-down,quality=82,format=auto${bgImagePath(bg.id)}`;
  const panel = `background:color-mix(in srgb,${bg.tint} 88%,transparent);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border-radius:14px`;
  return [
    `:root,html.light-mode{--primary-bg-color:${bg.tint}!important;--secondary-bg-color:${shade(bg.tint)}!important}`,
    // A fixed layer rather than background-attachment:fixed, which iPhones ignore.
    `html{background:${bg.tint}!important}`,
    `html::before{content:"";position:fixed;inset:0;z-index:-1;background:${bg.tint} url("${img}") center/cover no-repeat}`,
    `body,#__nuxt,#__nuxt>div,#__nuxt>div>div{background:transparent!important}`,
    `#home>*,.center-container,.photos-page>*{${panel};padding:1rem 1.25rem!important;margin-bottom:1.25rem!important;box-sizing:border-box}`,
    `#home>:first-child{padding-left:0!important;padding-right:0!important}`,
    `@media(max-width:600px){#home>*,.center-container,.photos-page>*{padding:.9rem .8rem!important}}`,
    `.site-nav li{${panel};padding:0 .6rem;width:fit-content}`,
  ].join("");
}

export function pickBackground(items, rand = Math.random) {
  const on = items.filter((b) => b.enabled !== false);
  return on.length ? on[Math.floor(rand() * on.length)] : null;
}

// Adds the chosen background to an HTML response.
export async function withBackground(response, env) {
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return response;
  const bg = pickBackground(await getBackgrounds(env));
  if (!bg) return response;
  const css = backgroundCss(bg);
  const rewritten = new HTMLRewriter()
    .on("head", { element: (el) => el.append(`<style id="random-bg">${css}</style>`, { html: true }) })
    .transform(response);
  const headers = new Headers(rewritten.headers);
  headers.set("cache-control", "no-store"); // a new background on every visit
  headers.delete("etag");
  return new Response(rewritten.body, { status: rewritten.status, statusText: rewritten.statusText, headers });
}
