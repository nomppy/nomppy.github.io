// Short links and friends, editable from /admin. Stored in D1; the JSON files
// in the repo are only the starting values used the first time.
import defaultLinks from "../links.json";
import defaultFriends from "../friends.json";
import { kvGet, kvPut } from "./kv.js";

// Paths the site already uses, so they can't become short links.
export const RESERVED = new Set([
  "admin", "admin-api", "api", "cdn-cgi", "drafts", "favorites", "feed-api", "friend",
  "news", "photo-api", "photos", "posts", "spotify", "_nuxt", "robots.txt", "sitemap.xml",
  "favicon.ico", "rss.xml", "feed.xml",
]);

const CACHE_MS = 60_000;
let cache = { at: 0, links: null, friends: null };

export async function getLists(env, { fresh = false } = {}) {
  if (!fresh && cache.links && Date.now() - cache.at < CACHE_MS) return cache;
  const [l, f] = await Promise.all([kvGet(env, "links"), kvGet(env, "friends")]);
  cache = { at: Date.now(), links: l?.value ?? defaultLinks, friends: f?.value ?? defaultFriends };
  return cache;
}

const isUrl = (u) => {
  try {
    const p = new URL(u);
    return p.protocol === "https:" || p.protocol === "http:";
  } catch {
    return false;
  }
};

// Returns { ok, value } or { ok: false, error } with a message for the page.
export function validateLinks(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, error: "Links must be a list of name and URL pairs." };
  const out = {};
  for (const [rawName, url] of Object.entries(input)) {
    const name = String(rawName).trim().toLowerCase().replace(/^\/+|\/+$/g, "");
    if (!/^[a-z0-9][a-z0-9_-]{0,63}$/.test(name)) return { ok: false, error: `"${rawName}" can only use letters, numbers, dashes and underscores.` };
    if (RESERVED.has(name)) return { ok: false, error: `"${name}" is already a page on the site. Pick another name.` };
    if (!isUrl(url)) return { ok: false, error: `The link for "${name}" needs to start with https://` };
    out[name] = String(url).trim();
  }
  return { ok: true, value: out };
}

export function validateFriends(input) {
  if (!Array.isArray(input)) return { ok: false, error: "Friends must be a list." };
  const out = [];
  for (const f of input) {
    const name = String(f?.name ?? "").trim();
    const url = String(f?.url ?? "").trim();
    if (!name) return { ok: false, error: "Every friend needs a name." };
    if (!isUrl(url)) return { ok: false, error: `${name}'s website needs to start with https://` };
    out.push({ name: name.slice(0, 80), url });
  }
  return { ok: true, value: out };
}

export async function saveLists(env, { links, friends }) {
  if (links) await kvPut(env, "links", links);
  if (friends) await kvPut(env, "friends", friends);
  cache.at = 0; // next read goes to D1
  return getLists(env, { fresh: true });
}
