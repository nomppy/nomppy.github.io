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

async function getText(url) {
  const res = await fetch(url, { headers: { "user-agent": UA, accept: "application/rss+xml, application/xml, text/xml" } });
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

// Films worth showing: hearted or rated 4+, newest first; topped up with other
// recent watches if there are fewer than `n`.
export function pickFilms(films, n = 5) {
  const good = films.filter((f) => f.liked || (f.rating ?? 0) >= 4);
  const rest = films.filter((f) => !good.includes(f));
  return [...good, ...rest].slice(0, n);
}

export function parseGoodreads(xml) {
  return items(xml).map((it) => {
    const img = tag(it, "book_large_image_url") || tag(it, "book_medium_image_url") || tag(it, "book_image_url");
    const rating = parseInt(tag(it, "user_rating"), 10);
    return {
      title: tag(it, "title"),
      author: tag(it, "author_name"),
      url: tag(it, "link"),
      cover: img && !/nophoto/.test(img) ? img : null,
      rating: rating > 0 ? rating : null,
      readAt: tag(it, "user_read_at") || null,
      addedAt: tag(it, "user_date_added") || null,
    };
  });
}

const time = (s) => (s ? Date.parse(s) || 0 : 0);

export function parseSubstack(xml) {
  const it = items(xml)[0];
  if (!it) return null;
  const image = (it.match(/<enclosure[^>]+url="([^"]+)"/) || [])[1] || null;
  return {
    title: tag(it, "title"),
    subtitle: stripHtml(tag(it, "description")).slice(0, 280),
    url: tag(it, "link"),
    date: tag(it, "pubDate") || null,
    image,
  };
}

// --- refresh ------------------------------------------------------------------

const SOURCES = {
  films: async (env) => pickFilms(parseLetterboxd(await getText(`https://letterboxd.com/${env.LETTERBOXD_USER}/rss/`))),
  books: async (env) => {
    const base = `https://www.goodreads.com/review/list_rss/${env.GOODREADS_USER_ID}`;
    const [reading, read] = await Promise.all([
      getText(`${base}?shelf=currently-reading`).then(parseGoodreads),
      getText(`${base}?shelf=read`).then(parseGoodreads),
    ]);
    read.sort((a, b) => time(b.readAt || b.addedAt) - time(a.readAt || a.addedAt));
    return { reading: reading.slice(0, 3), read: read.slice(0, 4) };
  },
  post: async (env) => parseSubstack(await getText(`https://${env.SUBSTACK_HOST}/feed`)),
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
    return json(fresh, { "cache-control": "public, max-age=300" });
  }
  if (Date.now() - cached.updatedAt > STALE_AFTER_MS) ctx.waitUntil(maybeRefresh(env, cached));
  return json(cached.value, { "cache-control": "public, max-age=300" });
}
