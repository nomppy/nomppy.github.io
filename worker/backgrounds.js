// Page backgrounds. Every HTML page gets a small inline script that picks a
// mode at random before the first paint, plus /bg.js (public/bg.js) which
// draws the rain and adds the switcher in the corner. Modes:
//   color   one of the colours below
//   photo   one of Kenneth's photos (published photos, minus any switched
//           off in admin, plus extra images uploaded on the Backgrounds tab)
//   rain    rain falling behind the page
//   window  a photo seen through a rainy window (by Claude, Nov 2026)
// Settings in kv "backgrounds": { items: [colours and extra images], modes }.
//   { kind: "color", color: "#e2ebe6" }
//   { kind: "image", id, w, h }  stored in R2 at bg/<id>.jpg
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

export const MODES = ["color", "photo", "rain", "window"];
export const DEFAULT_MODES = { color: true, photo: true, rain: true, window: true };

let cache = { at: 0, value: null };

// Returns { items, modes }. The first version stored a bare list of items.
export async function getBackgroundSettings(env, { fresh = false } = {}) {
  if (!fresh && cache.value && Date.now() - cache.at < CACHE_MS) return cache.value;
  const saved = (await kvGet(env, KEY))?.value;
  const value = Array.isArray(saved)
    ? { items: saved, modes: DEFAULT_MODES }
    : { items: saved?.items ?? DEFAULT_BACKGROUNDS, modes: { ...DEFAULT_MODES, ...(saved?.modes || {}) } };
  cache = { at: Date.now(), value };
  return value;
}
export const getBackgrounds = async (env, opts) => (await getBackgroundSettings(env, opts)).items;

export function validateModes(input) {
  const out = {};
  for (const m of MODES) out[m] = input?.[m] !== false;
  if (!MODES.some((m) => out[m])) return { ok: false, error: "Leave at least one mode switched on." };
  return { ok: true, value: out };
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
      const w = Math.max(1, Math.round(+b.w || 3)), h = Math.max(1, Math.round(+b.h || 2));
      out.push({ id, kind: "image", w, h, enabled });
    } else {
      return { ok: false, error: "Unknown background type." };
    }
  }
  return { ok: true, value: out };
}

export async function saveBackgroundSettings(env, value) {
  await kvPut(env, KEY, value);
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

// Published photos that may be used as backgrounds, cached for a minute.
let photoCache = { at: 0, list: [] };
async function backgroundPhotos(env) {
  if (Date.now() - photoCache.at < CACHE_MS) return photoCache.list;
  try {
    const { results } = await env.DB.prepare(
      "SELECT id, width, height, caption FROM photos WHERE status = 'published' AND COALESCE(bg_use, 1) != 0 ORDER BY published_at DESC LIMIT 500",
    ).all();
    photoCache = {
      at: Date.now(),
      list: results.map((r) => ({ u: `/photos/img/${r.id}.jpg`, w: r.width || 3, h: r.height || 2, c: r.caption || "" })),
    };
  } catch {
    photoCache = { at: Date.now(), list: [] }; // bg_use not added yet: the photos API adds it
  }
  return photoCache.list;
}

const sample = (list, n, rand) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
};

// What the page needs to choose a background: colours, a sample of photos,
// and which modes a new visitor may land on.
export async function pageData(env, rand = Math.random) {
  const { items, modes } = await getBackgroundSettings(env);
  const on = items.filter((b) => b.enabled !== false);
  const extra = on.filter((b) => b.kind === "image").map((b) => ({ u: bgImagePath(b.id), w: b.w || 3, h: b.h || 2, c: "" }));
  const colors = on.filter((b) => b.kind === "color").map((b) => b.color);
  return {
    colors: colors.length ? colors : ["#ececec"],
    photos: sample([...(await backgroundPhotos(env)), ...extra], 40, rand),
    modes: MODES.filter((m) => modes[m]),
  };
}

// Styles for every mode; the inline script sets html[data-bg] and the
// variables. Text panels: #home (home), .center-container (favorites),
// .photos-page (photos), plus the side nav.
const PANELS = "#home>*,.center-container,.photos-page>*";
export const STATIC_CSS = [
  `html[data-bg]:not([data-bg=color]){background:var(--bg-tint)!important;--primary-bg-color:var(--bg-tint)!important;--secondary-bg-color:color-mix(in srgb,var(--bg-tint) 92%,black)!important;--bg-panel:color-mix(in srgb,var(--bg-tint) 90%,transparent)}`,
  `html[data-bg]:not([data-bg=color]) :is(body,#__nuxt,#__nuxt>div,#__nuxt>div>div){background:transparent!important}`,
  `html:is([data-bg=photo],[data-bg=window])::before{content:"";position:fixed;inset:0;z-index:-2;background:var(--bg-tint) var(--bg-img) center/cover no-repeat}`,
  // Window: the blurred photo plus a white haze, so wiped lines read as clear glass.
  `html[data-bg=window]::before{background:linear-gradient(rgba(255,255,255,.2),rgba(255,255,255,.2)),var(--bg-img) center/cover no-repeat,var(--bg-tint)}`,
  `html[data-bg=window]{--bg-panel:color-mix(in srgb,var(--bg-tint) 84%,transparent)}`,
  `html:is([data-bg=photo],[data-bg=window]) :is(${PANELS}){background:var(--bg-panel);border-radius:14px;padding:1rem 1.25rem!important;margin-bottom:1.25rem!important;box-sizing:border-box}`,
  `html:is([data-bg=photo],[data-bg=window]) #home>:first-child{padding-left:0!important;padding-right:0!important}`,
  `@media(max-width:600px){html:is([data-bg=photo],[data-bg=window]) :is(${PANELS}){padding:.9rem .8rem!important}}`,
  `html:is([data-bg=photo],[data-bg=window]) .site-nav li{background:var(--bg-panel);border-radius:10px;padding:0 .6rem;width:fit-content}`,
  `#bg-canvas{position:fixed;left:0;top:0;width:100vw;height:100lvh;z-index:-1;pointer-events:none}`,
].join("");

// Runs in <head> before the page paints. Kept small; bg.js does the rest.
// window.__bg.apply(mode, keepPick) is also used by the switcher.
export const PICKER_JS = `(()=>{try{
var D=JSON.parse(document.getElementById("bg-data").textContent),R=document.documentElement,V=document.getElementById("bg-vars");
var RAIN=["#d9dfe4","#dde2df","#dcdce5"];
var any=function(a){return a[Math.floor(Math.random()*a.length)]};
var ok=function(m){return m==="color"||m==="rain"||D.photos.length>0};
var photo=function(){var tall=matchMedia("(orientation: portrait)").matches,f=D.photos.filter(function(p){return(p.h>p.w)===tall});return any(f.length?f:D.photos)};
var url=function(u,o){return 'url("/cdn-cgi/image/'+o+',fit=scale-down,format=auto'+u+'")'};
var bg={data:D,pick:{}};
bg.apply=function(mode,keep){
 if(!ok(mode))mode="color";
 var p=keep&&bg.pick.mode===mode?bg.pick:{mode:mode};
 if(mode==="color")p.color=p.color||any(D.colors);
 if(mode==="rain")p.color=p.color||any(RAIN);
 if(mode==="photo"||mode==="window")p.photo=p.photo||photo();
 bg.pick=p;R.setAttribute("data-bg",mode);
 var c=mode==="color"?":root,html.light-mode{--primary-bg-color:"+p.color+"!important;--secondary-bg-color:color-mix(in srgb,"+p.color+" 93%,black)!important}"
  :":root{--bg-tint:"+(p.tint||p.color||"#eeeeec")+";"+(p.photo?"--bg-img:"+(mode==="window"?url(p.photo.u,"width=900,blur=40,quality=70"):url(p.photo.u,"width=2000,quality=82")):"")+"}";
 V.textContent=c;if(bg.onchange)bg.onchange(p);
};
var saved;try{saved=sessionStorage.getItem("bg-mode")}catch(e){}
var on=D.modes.filter(ok);
bg.apply(saved&&ok(saved)?saved:on.length?any(on):"color");
window.__bg=bg;
}catch(e){}})();`;

const escapeJson = (v) => JSON.stringify(v).replace(/</g, "\\u003c");

// Adds the background picker to an HTML response.
export async function withBackground(response, env) {
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return response;
  const data = await pageData(env);
  const head =
    `<script id="bg-data" type="application/json">${escapeJson(data)}</script>` +
    `<style id="bg-static">${STATIC_CSS}</style><style id="bg-vars"></style>` +
    `<script>${PICKER_JS}</script><script src="/bg.js" defer></script>`;
  const rewritten = new HTMLRewriter()
    .on("head", { element: (el) => el.append(head, { html: true }) })
    .transform(response);
  const headers = new Headers(rewritten.headers);
  headers.set("cache-control", "no-store"); // a new background on every visit
  headers.delete("etag");
  return new Response(rewritten.body, { status: rewritten.status, statusText: rewritten.statusText, headers });
}
