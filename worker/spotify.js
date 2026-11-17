// Spotify: the playlist currently being built.
// Uses Authorization Code with PKCE, so no client secret is stored anywhere.
// Connect once by visiting /spotify/login; the refresh token is kept in D1.
import { kvGet, kvPut } from "./kv.js";

const SCOPES = "playlist-read-private playlist-read-collaborative";
const API = "https://api.spotify.com/v1";

const b64url = (bytes) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

function redirectUri(env) {
  return `${env.SITE_URL.replace(/\/$/, "")}/spotify/callback`;
}

function cookie(request, name) {
  const m = (request.headers.get("cookie") || "").match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

const page = (msg, status = 200) =>
  new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width">` +
      `<title>Spotify</title><body style="font:18px/1.5 Georgia,serif;max-width:32em;margin:4em auto;padding:0 1em">` +
      `<p>${msg}</p><p><a href="/">Back to the site</a></p>`,
    { status, headers: { "content-type": "text/html; charset=utf-8", "set-cookie": "sp_pkce=; Path=/spotify; Max-Age=0; HttpOnly; Secure; SameSite=Lax" } },
  );

async function token(env, params) {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: env.SPOTIFY_CLIENT_ID, ...params }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Spotify token: ${data.error_description || data.error || res.status}`);
  return data;
}

async function api(path, accessToken) {
  const res = await fetch(path.startsWith("http") ? path : API + path, {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Spotify ${path}: ${data.error?.message || res.status}`);
  return data;
}

export async function handleSpotify(request, env) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/spotify/")) return null;
  if (!env.SPOTIFY_CLIENT_ID) return page("Spotify isn't set up on this site yet.", 503);

  if (url.pathname === "/spotify/login") {
    const verifier = b64url(crypto.getRandomValues(new Uint8Array(48)));
    const state = b64url(crypto.getRandomValues(new Uint8Array(16)));
    const challenge = b64url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
    const auth = new URL("https://accounts.spotify.com/authorize");
    auth.search = new URLSearchParams({
      client_id: env.SPOTIFY_CLIENT_ID,
      response_type: "code",
      redirect_uri: redirectUri(env),
      code_challenge_method: "S256",
      code_challenge: challenge,
      state,
      scope: SCOPES,
    });
    return new Response(null, {
      status: 302,
      headers: {
        location: auth.toString(),
        "set-cookie": `sp_pkce=${encodeURIComponent(`${state}.${verifier}`)}; Path=/spotify; Max-Age=600; HttpOnly; Secure; SameSite=Lax`,
      },
    });
  }

  if (url.pathname === "/spotify/callback") {
    const saved = cookie(request, "sp_pkce");
    const [state, verifier] = (saved || "").split(".");
    if (url.searchParams.get("error")) return page("Spotify sign-in was cancelled.", 400);
    if (!state || state !== url.searchParams.get("state")) return page("That sign-in link expired. Start again from /spotify/login.", 400);
    try {
      const tok = await token(env, {
        grant_type: "authorization_code",
        code: url.searchParams.get("code") || "",
        redirect_uri: redirectUri(env),
        code_verifier: verifier,
      });
      const me = await api("/me", tok.access_token);
      if (env.SPOTIFY_USER_ID && me.id !== env.SPOTIFY_USER_ID) {
        return page("That Spotify account isn't the one this site shows.", 403);
      }
      await kvPut(env, "spotify-refresh", tok.refresh_token);
      await kvPut(env, "lately-refreshing", false); // let the next visit refresh right away
      return page("Spotify is connected. Your playlist will show on the home page shortly.");
    } catch (err) {
      return page(`Spotify sign-in failed: ${String(err.message || err)}`, 502);
    }
  }
  return page("Not found.", 404);
}

async function accessToken(env) {
  const stored = await kvGet(env, "spotify-refresh");
  if (!stored) return null;
  const tok = await token(env, { grant_type: "refresh_token", refresh_token: stored.value });
  if (tok.refresh_token && tok.refresh_token !== stored.value) await kvPut(env, "spotify-refresh", tok.refresh_token);
  return tok.access_token;
}

// After Spotify's February 2026 changes playlist tracks moved from
// `tracks`/`track` to `items`/`item`; accept either shape.
const totalOf = (p) => p.items?.total ?? p.tracks?.total ?? 0;
const trackOf = (e) => e.item ?? e.track ?? null;

async function recentItems(id, total, at) {
  const offset = Math.max(0, total - 50);
  const page = await api(`/playlists/${id}/items?limit=50&offset=${offset}`, at);
  return (page.items || [])
    .map((e) => ({ e, t: trackOf(e) }))
    .filter(({ t }) => t && t.name)
    .map(({ e, t }) => ({
      name: t.name,
      artists: (t.artists || []).map((a) => a.name).join(", "),
      url: t.external_urls?.spotify || null,
      addedAt: e.added_at || null,
    }));
}

async function ownedPlaylists(env, at) {
  const me = env.SPOTIFY_USER_ID;
  const owned = [];
  let next = "/me/playlists?limit=50";
  for (let page = 0; next && page < 10; page++) {
    const list = await api(next, at);
    owned.push(...(list.items || []).filter((p) => p && (!me || p.owner?.id === me)));
    next = list.next;
  }
  return owned; // library order: newest first unless the library is re-sorted
}

// When a playlist was started: the date its first song was added.
async function startedAt(p, at) {
  if (!totalOf(p)) return null;
  const page = await api(`/playlists/${p.id}/items?limit=1&offset=0&fields=items(added_at)`, at);
  const d = page.items?.[0]?.added_at;
  return d ? Date.parse(d) : null;
}

// The playlist most recently created. Spotify doesn't expose a creation date,
// so among the newest few in the library this picks the one whose first song
// was added most recently. "number" is how many playlists you own.
export async function playlistNow(env) {
  if (!env.SPOTIFY_CLIENT_ID) return undefined;
  const at = await accessToken(env);
  if (!at) return undefined; // not connected yet: leave this section out
  const owned = await ownedPlaylists(env, at);
  if (!owned.length) return null;
  const candidates = owned.slice(0, 8);
  const starts = await Promise.all(candidates.map((p) => startedAt(p, at).catch(() => null)));
  // A brand-new empty playlist at the top of the library counts as newest.
  let pick = candidates[0];
  if (totalOf(pick) > 0) {
    let best = -1;
    candidates.forEach((p, i) => {
      if (starts[i] !== null && starts[i] > best) {
        best = starts[i];
        pick = p;
      }
    });
  }
  const tracks = totalOf(pick) ? await recentItems(pick.id, totalOf(pick), at) : [];
  tracks.sort((a, b) => Date.parse(b.addedAt || 0) - Date.parse(a.addedAt || 0));
  const i = candidates.indexOf(pick);
  return {
    name: pick.name,
    url: pick.external_urls?.spotify || null,
    cover: pick.images?.[0]?.url || null,
    total: totalOf(pick),
    number: owned.length,
    startedAt: starts[i] ? new Date(starts[i]).toISOString() : null,
    lastAdded: tracks[0]?.addedAt || null,
    tracks: tracks.slice(0, 4),
  };
}
