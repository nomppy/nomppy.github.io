// Short links: sunken.site/<name> redirects to the URL listed in links.json.
// Anything that is not a short link is served from the static site.
import links from "../links.json";

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
    const target = resolveLink(url.pathname);
    if (target) return Response.redirect(target, 302);
    return env.ASSETS.fetch(request);
  },
};
