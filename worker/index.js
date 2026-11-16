// Short links: <site>/<name> redirects to the URL listed in links.json.
// Photo queue: /photo-api/* and /photos/img/* (see photos.js).
// Anything else is served from the static site.
import links from "../links.json";
import { handlePhotos, scheduled } from "./photos.js";

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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const photos = await handlePhotos(request, env);
    if (photos) return photos;
    const target = resolveLink(url.pathname);
    if (target) return Response.redirect(target, 302);
    return env.ASSETS.fetch(request);
  },

  async scheduled(controller, env, ctx) {
    ctx.waitUntil(scheduled(env));
  },
};
