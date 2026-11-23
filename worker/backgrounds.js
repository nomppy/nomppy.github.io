// Page backgrounds. Every HTML page gets a small inline script that picks a
// mode at random before the first paint. Modes:
//   color   one of the colours below
//   photo   one of Kenneth's photos (published photos, minus any switched
//           off in admin, plus extra images uploaded on the Backgrounds tab),
//           with the text on frosted glass tinted one of the colours
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

export const MODES = ["color", "photo"];
export const DEFAULT_MODES = { color: true, photo: true };

let cache = { at: 0, value: null };

// Returns { items, modes }. The first version stored a bare list of items.
export async function getBackgroundSettings(env, { fresh = false } = {}) {
  if (!fresh && cache.value && Date.now() - cache.at < CACHE_MS) return cache.value;
  const saved = (await kvGet(env, KEY))?.value;
  const value = Array.isArray(saved)
    ? { items: saved, modes: DEFAULT_MODES }
    : { items: saved?.items ?? DEFAULT_BACKGROUNDS, modes: pickModes(saved?.modes) };
  cache = { at: Date.now(), value };
  return value;
}
// Older settings also held rain and window modes; keep only current ones.
const pickModes = (m) => Object.fromEntries(MODES.map((k) => [k, m?.[k] !== false]));
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

// What the page needs to choose a background: colours, every photo,
// and which modes a new visitor may land on.
export async function pageData(env, rand = Math.random) {
  const { items, modes } = await getBackgroundSettings(env);
  const on = items.filter((b) => b.enabled !== false);
  const extra = on.filter((b) => b.kind === "image").map((b) => ({ u: bgImagePath(b.id), w: b.w || 3, h: b.h || 2, c: "" }));
  const colors = on.filter((b) => b.kind === "color").map((b) => b.color);
  return {
    colors: colors.length ? colors : ["#ececec"],
    photos: sample([...(await backgroundPhotos(env)), ...extra], 1000, rand), // all of them, so an unseen one is always available
    modes: MODES.filter((m) => modes[m]),
  };
}

// Styles for every mode; the inline script sets html[data-bg] and the
// variables. In photo mode the text sits on frosted glass: the photo shows
// through blurred, tinted with one of the background colours (--bg-tint).
// Text panels: #home (home), .center-container (favorites),
// .photos-page (photos), plus the side nav as one pane.
const PANELS = "#home>*,.center-container,.photos-page>*";
const P = "html[data-bg=photo]";
const MONO = `ui-monospace,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace`;
const FROST = [
  // --frost is set per photo by the picker: thin over light photos, thicker
  // over dark ones, always enough for the black text.
  "background:color-mix(in srgb,var(--bg-tint) var(--frost,50%),transparent)",
  "-webkit-backdrop-filter:blur(16px) saturate(1.4)",
  "backdrop-filter:blur(16px) saturate(1.4)",
  // Industrial rather than glossy: square corners, a hard dark rule and a flat
  // offset shadow, like a print block or an old window.
  "border-radius:0",
].join(";");
export const STATIC_CSS = [
  `${P}{background:var(--bg-tint)!important;--primary-bg-color:var(--bg-tint)!important;--secondary-bg-color:color-mix(in srgb,var(--bg-tint) 80%,white)!important;--tertiary-bg-color:color-mix(in srgb,var(--bg-tint) 70%,white)!important}`,
  `${P} :is(body,#__nuxt,#__nuxt>div,#__nuxt>div>div){background:transparent!important}`,
  // Dial-up loading: four layers (.bg-layer, added by the picker) at rising
  // resolutions, each painted in from the top one row of its own pixels at a
  // time. The lower three are drawn as hard blocks.
  `.bg-layer{position:fixed;inset:0;pointer-events:none;background:center/cover no-repeat;clip-path:inset(0 0 100% 0)}`,
  `.bg-layer.blocky{image-rendering:pixelated}`,
  // The photo's caption: plain text, no glass, in front of everything but
  // click-through. The picker moves, scales and fades it.
  `.bg-caption{position:fixed;left:50%;top:100%;transform:translate(-50%,-50%);transform-origin:50% 50%;z-index:3;pointer-events:none;margin:0;color:#fff;font-family:var(--serif-font-stack,serif);font-style:italic;font-size:clamp(1.3rem,4.5vw,2.2rem);line-height:1.25;letter-spacing:.02em;text-align:center;width:max-content;max-width:min(80vw,28em);text-shadow:0 1px 2px rgba(0,0,0,.4),0 0 28px rgba(0,0,0,.35);opacity:0;will-change:top,transform,opacity}`,
  `html:not([data-bg=photo]) .bg-caption{display:none}`,
  `html:not([data-bg=photo]) .bg-layer{display:none}`,
  `${P} :is(${PANELS}){${FROST};padding:1rem 1.25rem!important;margin-bottom:1.25rem!important;box-sizing:border-box}`,
  `${P} #home>:first-child{padding-left:0!important;padding-right:0!important}`,
  // A window of bare photo between the intro and the feeds: scroll past the
  // intro and the background shows through on its own for a moment.
  `${P} #home>.top{margin-bottom:70vh!important;margin-bottom:70svh!important}`,
  `@media(max-width:600px){${P} :is(${PANELS}){padding:.9rem .8rem!important}}`,
  // Industrial, not glossy: square panes with a heavy black frame, a thick
  // band across the top and a hard offset shadow. Season headings and the
  // photo caption are set in monospace capitals.
  `${P} :is(${PANELS},.site-nav){border:2.5px solid #111;border-top-width:9px;box-shadow:8px 8px 0 #111}`,
  `${P} .photos-page h2{font-family:${MONO};text-transform:uppercase;letter-spacing:.14em;font-size:1rem}`,
  `${P} .bg-caption{font-family:${MONO};font-style:normal;font-weight:700;text-transform:uppercase;letter-spacing:.3em;font-size:clamp(.9rem,3vw,1.45rem)}`,
  `@media(max-width:600px){${P} :is(${PANELS},.site-nav){border-top-width:7px;box-shadow:5px 5px 0 #111}}`,
  // The nav: one pane around all the links.
  `${P} .site-nav{${FROST};width:fit-content;margin:14px auto!important;padding:.55rem .4rem!important;box-sizing:border-box}`,
  `@media(min-width:1070px){${P} .site-nav{height:auto!important;top:50%;transform:translateY(-50%);margin:0 18px!important;padding:.8rem .2rem!important}${P} .site-nav li{margin:.15rem 15px}}`,
  `@media(max-width:480px){${P} .site-nav{margin:10px auto!important;padding:.4rem .2rem!important;max-width:calc(100% - 20px)}}`,
].join("");

// Runs in <head> before the page paints.

export const PICKER_JS = `(()=>{try{
var D=JSON.parse(document.getElementById("bg-data").textContent),R=document.documentElement,V=document.getElementById("bg-vars");
var any=function(a){return a[Math.floor(Math.random()*a.length)]};
var ok=function(m){return m==="color"||(m==="photo"&&D.photos.length>0)};
var photo=function(){var tall=matchMedia("(orientation: portrait)").matches,f=D.photos.filter(function(p){return(p.h>p.w)===tall});return any(f.length?f:D.photos)};
var src=function(u,o){return "/cdn-cgi/image/"+o+",fit=scale-down,format=auto"+u};
var url=function(u,o){return 'url("'+src(u,o)+'")'};
// Backgrounds this browser has been shown (colours and photo URLs).
var SEEN=[];try{SEEN=JSON.parse(localStorage.getItem("bg-seen")||"[]")||[]}catch(e){}
var seen=function(k){if(SEEN.indexOf(k)<0)SEEN.push(k);try{localStorage.setItem("bg-seen",JSON.stringify(SEEN.slice(-1000)))}catch(e){}};
var bg={data:D,pick:{}};
// item: a specific colour (mode "color") or photo (mode "photo") to show.
bg.apply=function(mode,item){
 if(!ok(mode))mode="color";
 var p={mode:mode,color:mode==="color"&&item?item:any(D.colors)};
 if(mode==="photo")p.photo=item||photo();
 seen(mode==="photo"?p.photo.u:p.color);
 bg.pick=p;R.setAttribute("data-bg",mode);
 V.textContent=mode==="color"?":root,html.light-mode{--primary-bg-color:"+p.color+"!important;--secondary-bg-color:color-mix(in srgb,"+p.color+" 93%,black)!important}"
  :":root{--bg-tint:"+p.color+"}";
 if(mode==="photo"){dial(p.photo,p.color);caption(p.photo.c)}
};
// The caption, tied to the window of bare photo on the home page (the gap
// under #home>.top). With the gap below the screen it rests small and faint
// at the bottom edge; as the gap scrolls up to the middle it rises to the
// centre, grows to full size and shows fully; as the gap scrolls on past it
// fades out. Off the home page it stays hidden.
var cap=null;
function caption(text){
 if(cap){cap.remove();cap=null}
 // Captions imported from Instagram can be hashtags: show "#chongqing #photos"
 // as "chongqing" (generic tags dropped, "#" removed, lines joined).
 text=(text||"").replace(/#(photos?|photography|photooftheday)(?![\\w-])/gi,"").replace(/#/g,"").replace(/\\s+/g," ").trim();if(!/[\\p{L}\\p{N}]/u.test(text))return;
 cap=document.createElement("p");cap.className="bg-caption";cap.textContent=text;R.appendChild(cap);
 var FAINT=.45,SMALL=.6,queued=false;
 var lerp=function(a,b,f){return a+(b-a)*f},clamp=function(f){return f<0?0:f>1?1:f};
 function place(){
  queued=false;if(!cap)return;
  var top=document.querySelector("#home>.top"),H=innerHeight;
  if(!top){cap.style.opacity=0;return}
  var a=top.getBoundingClientRect().bottom,next=top.nextElementSibling,b=next?next.getBoundingClientRect().top:a+H*.7,c=(a+b)/2;
  // Resting spot: the small caption's centre, just above the bottom edge.
  var rest=H-cap.offsetHeight*SMALL/2-10,f=c>=H?0:clamp((H-c)/(H/2)),y=lerp(rest,H/2,f),k=lerp(SMALL,1,f);
  var o=c>=H/2?lerp(FAINT,1,f):1-clamp((H/2-c)/(H/2));
  cap.style.top=Math.round(y)+"px";cap.style.transform="translate(-50%,-50%) scale("+k.toFixed(3)+")";cap.style.opacity=o.toFixed(3);
 }
 var later=function(){if(!queued){queued=true;requestAnimationFrame(place)}};
 addEventListener("scroll",later,{passive:true,capture:true});addEventListener("resize",later);
 // Catches page changes inside the site, and the home page finishing loading.
 setInterval(later,400);later();
}
// Widths of the four layers; the last is the full photo.
// Milliseconds per row for the three blocky layers (a quarter of the first speed).
var LV=[16,64,256,2000],MS=[280,88,28];
function dial(ph,tint){
 var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches,level=0,t0=0;
 var layers=LV.map(function(w,i){
  var d=document.createElement("div"),im=new Image(),u=src(ph.u,"width="+w+",quality="+(i<3?60:82));
  d.className="bg-layer"+(i<3?" blocky":"");d.style.zIndex=i-5;d.style.backgroundImage='url("'+u+'")';
  R.appendChild(d);im.src=u;return{el:d,im:im,rows:Math.round(Math.min(w,ph.w)*ph.h/ph.w)}});
 var full=layers[3].im;
 var clip=function(k,px){layers[k].el.style.clipPath="inset(0 0 "+px+" 0)"};
 var all=function(){for(var k=0;k<4;k++)clip(k,"0px");level=4};
 // A photo already in the browser's cache shows at once.
 if(full.complete&&full.naturalWidth)return all();
 full.addEventListener("load",function(){var e=performance.getEntriesByName(full.src)[0];if(e&&e.transferSize===0&&e.decodedBodySize>0)all()});
 // Frost thickness from the darker quarter of the smallest layer, so the
 // panels stay readable (about 7:1 for black text).
 layers[0].im.addEventListener("load",function(){try{
  var c=document.createElement("canvas"),x=c.getContext("2d"),im=layers[0].im;c.width=im.naturalWidth;c.height=im.naturalHeight;x.drawImage(im,0,0);
  var px=x.getImageData(0,0,c.width,c.height).data,P=[],lin=function(v){v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)},
  lum=function(r,g,b){return .2126*lin(r)+.7152*lin(g)+.0722*lin(b)};
  for(var j=0;j<px.length;j+=4)P.push([px[j],px[j+1],px[j+2]]);
  P.sort(function(a,b){return lum(a[0],a[1],a[2])-lum(b[0],b[1],b[2])});
  var B=P[Math.floor(P.length/4)],t=parseInt(tint.slice(1),16),T=[t>>16,t>>8&255,t&255],a=.3;
  // color-mix in srgb mixes the encoded values, so test the mix the same way.
  while(a<.85&&lum(a*T[0]+(1-a)*B[0],a*T[1]+(1-a)*B[1],a*T[2]+(1-a)*B[2])<.4)a+=.05;
  R.style.setProperty("--frost",Math.round(a*100)+"%")}catch(e){}});
 if(reduce){layers.forEach(function(l,k){l.im.addEventListener("load",function(){clip(k,"0px")})});return}
 function step(now){
  if(level>3)return;
  var l=layers[level];
  if(!l.im.complete){l.im.addEventListener("load",function(){requestAnimationFrame(step)},{once:true});l.im.addEventListener("error",function(){level++;requestAnimationFrame(step)},{once:true});return}
  if(!l.im.naturalWidth){level++;return requestAnimationFrame(step)}
  if(!t0)t0=now;
  var W=innerWidth,H=innerHeight,sc=Math.max(W/ph.w,H/ph.h),ih=ph.h*sc,top=(H-ih)/2,rh=ih/l.rows;
  var first=Math.max(0,Math.floor(-top/rh)),n=Math.max(1,Math.min(l.rows,Math.ceil((H-top)/rh))-first);
  var dur=level<3?n*MS[level]:4800,f=Math.min(1,(now-t0)/dur);
  // Lower layers: whole rows of their own pixels. The full photo: a smooth sweep.
  var y=level<3?top+(first+Math.min(n,Math.floor(f*n)+1))*rh:f*H;
  clip(level,Math.max(0,Math.round(H-y))+"px");
  if(f>=1){clip(level,"0px");level++;t0=0}
  requestAnimationFrame(step);
 }
 requestAnimationFrame(step);
}
// Each visit shows a colour or photo this browser hasn't been shown yet, if
// there is one; once every background has been seen, any of them again.
var on=D.modes.filter(ok),tall=matchMedia("(orientation: portrait)").matches,fresh=function(k){return SEEN.indexOf(k)<0};
var cs=on.indexOf("color")>=0?D.colors.filter(fresh).map(function(c){return["color",c]}):[];
var ps=on.indexOf("photo")>=0?D.photos.filter(function(p){return fresh(p.u)}):[];
var fit=ps.filter(function(p){return(p.h>p.w)===tall});
var pool=cs.concat((fit.length?fit:ps).map(function(p){return["photo",p]}));
if(pool.length){var c=any(pool);bg.apply(c[0],c[1])}else bg.apply(on.length?any(on):"color");
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
    `<script>${PICKER_JS}</script>`;
  const rewritten = new HTMLRewriter()
    .on("head", { element: (el) => el.append(head, { html: true }) })
    .transform(response);
  const headers = new Headers(rewritten.headers);
  headers.set("cache-control", "no-store"); // a new background on every visit
  headers.delete("etag");
  return new Response(rewritten.body, { status: rewritten.status, statusText: rewritten.statusText, headers });
}
