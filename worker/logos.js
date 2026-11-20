// The real logos for the icon row under the name, served from this site.
//
// GET /logos/<name> returns the logo from R2 (logos/<name>). The first time a
// logo is asked for, it is fetched from that site's own app icon (the first
// source that answers with an image), stored in R2 and served from then on,
// so visitors never load anything from those sites and the logos keep
// working if a source address changes later. To refresh one, delete its
// logos/<name> object in R2.

export const LOGO_SOURCES = {
  x: ["https://abs.twimg.com/responsive-web/client-web/icon-ios.77d25eba.png", "https://abs.twimg.com/favicons/twitter.3.ico"],
  github: ["https://github.githubassets.com/apple-touch-icon-180x180.png", "https://github.githubassets.com/favicons/favicon.png"],
  linkedin: ["https://static.licdn.com/aero-v1/sc/h/al2o9zrvru7aqj8e1x2rzsrca", "https://www.linkedin.com/favicon.ico"],
  substack: ["https://substackcdn.com/icons/substack/apple-touch-icon.png", "https://substack.com/favicon.ico"],
  instagram: [
    "https://static.cdninstagram.com/rsrc.php/yr/r/rzWiSjZRxk5.webp",
    "https://static.cdninstagram.com/rsrc.php/yw/r/icwX0xAk0pz.webp",
    "https://www.instagram.com/favicon.ico",
  ],
  goodreads: ["https://www.goodreads.com/apple-touch-icon.png", "https://www.goodreads.com/favicon.ico"],
  letterboxd: ["https://letterboxd.com/apple-touch-icon.png", "https://letterboxd.com/favicon.ico"],
  spotify: ["https://open.spotifycdn.com/cdn/images/icons/Spotify_256.17e41e58.png", "https://www.scdn.co/i/_global/touch-icon-144.png"],
  curius: ["https://curius.app/dist/favicon.ico"],
};

const CACHE = "public, max-age=604800, stale-while-revalidate=86400";

async function fetchLogo(sources) {
  for (const src of sources) {
    try {
      const res = await fetch(src, {
        headers: {
          "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36",
          accept: "image/avif,image/webp,image/png,image/*,*/*;q=0.8",
        },
        cf: { cacheTtl: 86400 },
      });
      if (!res.ok) continue;
      const type = (res.headers.get("content-type") || "").split(";")[0].trim();
      const body = await res.arrayBuffer();
      if (body.byteLength < 100 || body.byteLength > 2_000_000) continue;
      if (!type.startsWith("image/") && !/\.ico$/.test(src)) continue;
      return { body, type: type.startsWith("image/") ? type : "image/x-icon" };
    } catch {
      // try the next source
    }
  }
  return null;
}

export async function handleLogos(request, env) {
  const url = new URL(request.url);
  const m = url.pathname.match(/^\/logos\/([a-z]+)$/);
  if (!m || request.method !== "GET") return null;
  const name = m[1];
  const sources = LOGO_SOURCES[name];
  if (!sources) return new Response("Not found", { status: 404 });

  const key = `logos/${name}`;
  const stored = await env.PHOTOS.get(key);
  if (stored) {
    return new Response(stored.body, {
      headers: { "content-type": stored.httpMetadata?.contentType || "image/png", "cache-control": CACHE },
    });
  }

  const logo = await fetchLogo(sources);
  if (!logo) return new Response("Logo unavailable", { status: 502, headers: { "cache-control": "no-store" } });
  await env.PHOTOS.put(key, logo.body, { httpMetadata: { contentType: logo.type } });
  return new Response(logo.body, { headers: { "content-type": logo.type, "cache-control": CACHE } });
}
