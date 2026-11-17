// Routes, in order:
//   /photo-api/*, /photos/img/*   photo queue (photos.js)
//   /feed-api/lately              home page "lately" feeds (feeds.js)
//   /spotify/*                    one-time Spotify connection (spotify.js)
//   /admin, /admin-api/*          editing page for short links and friends (admin.js)
//   /friend                       a random friend's website
//   /<name>                       short links
//   anything else                 the static site
// Short links and friends live in D1 (lists.js); links.json and friends.json
// are only the starting values.
import { handlePhotos, scheduled as photoSchedule, syncInstagram } from "./photos.js";
import { handleFeeds, refreshFeeds } from "./feeds.js";
import { handleSpotify } from "./spotify.js";
import { handleAdmin } from "./admin.js";
import { getLists } from "./lists.js";

const PHOTO_CRON = "7 17 * * *"; // 9:07 Pacific: release a queued photo if one is due

export function resolveLink(pathname, links) {
  // Only single-segment paths ("/cv", "/cv/") can be short links, so real
  // pages such as /posts/some-title are never shadowed.
  const match = pathname.match(/^\/([^/]+)\/?$/);
  if (!match) return null;
  let name;
  try {
    name = decodeURIComponent(match[1]).toLowerCase();
  } catch {
    return null;
  }
  return Object.prototype.hasOwnProperty.call(links, name) ? links[name] : null;
}

export function randomFriend(list, rand = Math.random) {
  const usable = list.filter((f) => f && /^https?:\/\//.test(f.url));
  return usable.length ? usable[Math.floor(rand() * usable.length)].url : null;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const handled =
      (await handlePhotos(request, env)) ||
      (await handleFeeds(request, env, ctx)) ||
      (await handleSpotify(request, env)) ||
      (await handleAdmin(request, env));
    if (handled) return handled;

    // Only single-segment paths can be short links or /friend; skip the
    // lookup for everything else (assets, posts, images).
    if (/^\/[^/]+\/?$/.test(url.pathname) && !/\.[a-z0-9]+$/i.test(url.pathname)) {
      const { links, friends } = await getLists(env);
      if (/^\/friend\/?$/.test(url.pathname)) {
        const to = randomFriend(friends);
        if (to) return new Response(null, { status: 302, headers: { location: to, "cache-control": "no-store" } });
      }
      const target = resolveLink(url.pathname, links);
      if (target) return new Response(null, { status: 302, headers: { location: target, "cache-control": "no-store" } });
    }
    return env.ASSETS.fetch(request);
  },

  async scheduled(controller, env, ctx) {
    if (controller.cron === PHOTO_CRON) {
      ctx.waitUntil(photoSchedule(env));
    } else {
      ctx.waitUntil(Promise.allSettled([refreshFeeds(env), syncInstagram(env)]));
    }
  },
};
