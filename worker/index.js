// Routes, in order:
//   /photo-api/*, /photos/img/*   photo queue (photos.js)
//   /feed-api/lately              home page "lately" feeds (feeds.js)
//   /spotify/*                    one-time Spotify connection (spotify.js)
//   /friend                       a random friend's website (friends.json)
//   /<name>                       short links (links.json)
//   anything else                 the static site
import links from "../links.json";
import friends from "../friends.json";
import { handlePhotos, scheduled as photoSchedule, syncInstagram } from "./photos.js";
import { handleFeeds, refreshFeeds } from "./feeds.js";
import { handleSpotify } from "./spotify.js";

const PHOTO_CRON = "7 17 * * *"; // 9:07 Pacific: release a queued photo if one is due

const table = new Map(
  Object.entries(links).map(([name, url]) => [name.toLowerCase(), url]),
);

export function resolveLink(pathname) {
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
  return table.get(name) ?? null;
}

export function randomFriend(list = friends, rand = Math.random) {
  const usable = list.filter((f) => f && /^https?:\/\//.test(f.url));
  return usable.length ? usable[Math.floor(rand() * usable.length)].url : null;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const handled =
      (await handlePhotos(request, env)) ||
      (await handleFeeds(request, env, ctx)) ||
      (await handleSpotify(request, env));
    if (handled) return handled;

    if (/^\/friend\/?$/.test(url.pathname)) {
      const to = randomFriend();
      if (to) return new Response(null, { status: 302, headers: { location: to, "cache-control": "no-store" } });
    }

    const target = resolveLink(url.pathname);
    if (target) return Response.redirect(target, 302);
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
