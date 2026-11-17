// "Lately" feeds for the home page: films (Letterboxd), books (Goodreads),
// the latest Substack post and the playlist being built (Spotify).
// Results are cached in D1 and refreshed by the cron and, lazily, on read.
import { playlistNow } from "./spotify.js";
import { kvGet, kvPut } from "./kv.js";

const STALE_AFTER_MS = 3 * 60 * 60 * 1000; // refresh at most every 3 hours on read
const RETRY_GAP_MS = 10 * 60 * 1000; // don't start another refresh within 10 minutes
const UA = "sunken.fyi feed reader (+https://sunken.fyi)";

// --- tiny XML helpers (RSS only, no DOM in Workers) -------------------------

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
export function decode(s) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
      if (e[0] === "#") {
        const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : m;
      }
      return ENTITIES[e.toLowerCase()] ?? m;
    })
    .trim();
}

export function tag(xml, name) {
  const esc = name.replace(":", "\\:");
  const m = xml.match(new RegExp(`<${esc}(?:\\s[^>]*)?>([\\s\\S]*?)</${esc}>`));
  return m ? decode(m[1]) : "";
}

export function items(xml) {
  return [...xml.matchAll(/<item[\s>][\s\S]*?<\/item>/g)].map((m) => m[0]);
}

const stripHtml = (s) => decode(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

const BROWSER_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15";

async function getText(url, { browser = false } = {}) {
  const res = await fetch(url, {
    headers: {
      "user-agent": browser ? BROWSER_UA : UA,
      accept: "application/rss+xml, application/xml, text/xml, text/html, application/json;q=0.9",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${new URL(url).host}`);
  return res.text();
}

// --- parsers (exported for tests) ---------------------------------------------

export function parseLetterboxd(xml) {
  return items(xml)
    .filter((it) => tag(it, "letterboxd:filmTitle")) // skip list entries
    .map((it) => {
      const rating = parseFloat(tag(it, "letterboxd:memberRating"));
      const poster = (tag(it, "description").match(/<img[^>]+src="([^"]+)"/) || [])[1] || null;
      return {
        title: tag(it, "letterboxd:filmTitle"),
        year: tag(it, "letterboxd:filmYear"),
        rating: Number.isFinite(rating) ? rating : null,
        liked: tag(it, "letterboxd:memberLike") === "Yes",
        rewatch: tag(it, "letterboxd:rewatch") === "Yes",
        watched: tag(it, "letterboxd:watchedDate") || null,
        url: tag(it, "link"),
        poster,
      };
    });
}

// Films liked recently: hearted or rated 4+, newest first.
export function pickFilms(films, n = 5) {
  return films.filter((f) => f.liked || (f.rating ?? 0) >= 4).slice(0, n);
}

// Goodreads has no public API or RSS any more, and shelf pages need a sign-in.
// Its embeddable shelf widgets are public: they return JavaScript that writes
// HTML, which is parsed here.
export function parseGoodreadsWidget(js) {
  const html = js.replace(/\\n/g, " ").replace(/\\"/g, '"').replace(/\\\//g, "/").replace(/\\'/g, "'");
  return html
    .split(/class="gr_custom_each_container[^"]*"/)
    .slice(1)
    .map((c) => {
      const t = c.match(/class="gr_custom_title[^"]*"[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>([^<]*)<\/a>/);
      if (!t) return null;
      const a = c.match(/class="gr_custom_author[^"]*"[^>]*>[\s\S]*?<a[^>]*>([^<]*)<\/a>/);
      const img = c.match(/<img[^>]*src="(https:\/\/i\.gr-assets\.com\/[^"]+)"/);
      return {
        title: decode(t[2]),
        author: a ? decode(a[1]) : "",
        url: t[1].split("?")[0],
        // Ask for a larger cover than the widget's thumbnail.
        cover: img ? img[1].replace(/\._S[XY]\d+_/, "._SY475_") : null,
      };
    })
    .filter(Boolean);
}

async function goodreadsShelf(env, shelf, sort, widgetId) {
  // Goodreads caches widget output per widget_id, so each shelf needs its own.
  const q = new URLSearchParams({
    num_books: "6", shelf, sort, order: "d", show_cover: "1", show_author: "1", show_title: "1",
    cover_size: "medium", widget_id: widgetId,
  });
  const js = await getText(`https://www.goodreads.com/review/custom_widget/${env.GOODREADS_USER_ID}.sunken?${q}`, { browser: true });
  if (!/gr_custom/.test(js)) throw new Error("Goodreads widget returned no shelf");
  return parseGoodreadsWidget(js);
}

// The opening of a post, as plain text, cut at a word boundary.
export function excerpt(html, max = 320) {
  const paras = [...(html || "").matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => stripHtml(m[1])).filter((t) => t.length > 1);
  let text = (paras.length ? paras.join(" ") : stripHtml(html || "")).trim();
  if (text.length <= max) return text;
  text = text.slice(0, max);
  return text.slice(0, Math.max(text.lastIndexOf(" "), max - 40)).replace(/[\s,;:.—-]+$/, "") + "…";
}

export function parseSubstack(xml) {
  const it = items(xml)[0];
  if (!it) return null;
  const image = (it.match(/<enclosure[^>]+url="([^"]+)"/) || [])[1] || null;
  const body = (it.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/) || [])[1] || "";
  return {
    title: tag(it, "title"),
    subtitle: stripHtml(tag(it, "description")).slice(0, 280),
    excerpt: excerpt(decode(body)),
    url: tag(it, "link"),
    date: tag(it, "pubDate") || null,
    image,
  };
}

export function parseSubstackApi(data) {
  const p = (Array.isArray(data) ? data : data?.posts || [])[0];
  if (!p) return null;
  return {
    title: (p.title || "").trim(),
    subtitle: (p.subtitle || p.description || "").trim().slice(0, 280),
    excerpt: excerpt(p.body_html || p.truncated_body_text || ""),
    url: p.canonical_url,
    date: p.post_date || null,
    image: p.cover_image || null,
  };
}

// --- refresh ------------------------------------------------------------------

const SOURCES = {
  films: async (env) => pickFilms(parseLetterboxd(await getText(`https://letterboxd.com/${env.LETTERBOXD_USER}/rss/`))),
  books: async (env) => {
    const reading = await goodreadsShelf(env, "currently-reading", "date_added", "1794800001");
    const read = await goodreadsShelf(env, "read", "date_read", "1794800002");
    const current = new Set(reading.map((b) => b.url));
    return { reading: reading.slice(0, 4), read: read.filter((b) => !current.has(b.url)).slice(0, 5) };
  },
  post: async (env) => {
    try {
      return parseSubstack(await getText(`https://${env.SUBSTACK_HOST}/feed`, { browser: true }));
    } catch (first) {
      // Substack sometimes refuses requests from cloud servers on one address
      // but not the other; fall back to its public JSON API.
      try {
        const data = JSON.parse(await getText(`https://${env.SUBSTACK_HOST}/api/v1/archive?sort=new&limit=1`, { browser: true }));
        return parseSubstackApi(data);
      } catch {
        throw first;
      }
    }
  },
  playlist: async (env) => playlistNow(env),
};

// Refreshes every source; a source that fails keeps its last good value.
export async function refreshFeeds(env) {
  const prev = (await kvGet(env, "lately"))?.value || {};
  const next = { ...prev, errors: {} };
  await Promise.all(
    Object.entries(SOURCES).map(async ([name, load]) => {
      try {
        const value = await load(env);
        if (value !== undefined) next[name] = value;
      } catch (err) {
        next.errors[name] = String(err.message || err).slice(0, 200);
      }
    }),
  );
  next.refreshedAt = Date.now();
  await kvPut(env, "lately", next);
  return next;
}

async function maybeRefresh(env, cached) {
  const lock = await kvGet(env, "lately-refreshing");
  if (lock && lock.value && Date.now() - lock.updatedAt < RETRY_GAP_MS) return null;
  await kvPut(env, "lately-refreshing", true);
  return refreshFeeds(env);
}

const json = (data, extra = {}) =>
  new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json; charset=utf-8", ...extra },
  });

export async function handleFeeds(request, env, ctx) {
  const url = new URL(request.url);
  if (url.pathname !== "/feed-api/lately") return null;
  const cached = await kvGet(env, "lately");
  if (!cached) {
    const fresh = (await maybeRefresh(env, null)) || {};
    return json(fresh, { "cache-control": "no-store" });
  }
  const hadErrors = Object.keys(cached.value?.errors || {}).length > 0;
  if (hadErrors || Date.now() - cached.updatedAt > STALE_AFTER_MS) ctx.waitUntil(maybeRefresh(env, cached));
  return json(cached.value, { "cache-control": "no-store" });
}
