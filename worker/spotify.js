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
  return owned;
}

// When a playlist was started: the earliest "added" date among its first 50
// songs. Spotify has no creation date, and the library order is not reliable.
async function startedAt(p, at) {
  const page = await api(`/playlists/${p.id}/items?limit=50&offset=0&fields=items(added_at)`, at);
  const times = (page.items || []).map((e) => Date.parse(e.added_at || "")).filter(Number.isFinite);
  return times.length ? Math.min(...times) : null;
}

const STARTS_KEY = "spotify-starts";
const STARTS_PER_RUN = 20; // keeps each refresh well under Cloudflare's subrequest limit
const RECENT_MS = 21 * 86_400_000; // "currently building" = started in the last 3 weeks
const MAX_SHOWN = 3;

// Start dates are remembered per playlist, so each refresh only looks up
// playlists it hasn't seen before (or that went from empty to non-empty).
async function knownStarts(env, owned, at) {
  const saved = (await kvGet(env, STARTS_KEY))?.value || {};
  const starts = {};
  const todo = [];
  for (const p of owned) {
    const prev = saved[p.id];
    if (prev && (prev.startedAt !== null || totalOf(p) === 0)) starts[p.id] = prev;
    else if (totalOf(p) > 0) todo.push(p);
    else starts[p.id] = { startedAt: null };
  }
  for (const p of todo.slice(0, STARTS_PER_RUN)) {
    try {
      starts[p.id] = { startedAt: await startedAt(p, at) };
    } catch {
      // try again next refresh
    }
  }
  await kvPut(env, STARTS_KEY, starts);
  return { starts, complete: todo.length <= STARTS_PER_RUN };
}

export function choosePlaylists(owned, starts, now = Date.now()) {
  const dated = owned
    .filter((p) => starts[p.id]?.startedAt)
    .map((p) => ({ p, startedAt: starts[p.id].startedAt }))
    .sort((a, b) => a.startedAt - b.startedAt);
  // Number = position in the order you started them (first playlist = #1).
  dated.forEach((d, i) => (d.number = i + 1));
  const newestFirst = [...dated].reverse();
  const recent = newestFirst.filter((d) => now - d.startedAt <= RECENT_MS).slice(0, MAX_SHOWN);
  if (recent.length) return { mode: "building", picks: recent.reverse() };
  return { mode: "latest", picks: newestFirst.slice(0, 2).reverse() };
}

export async function playlistNow(env) {
  if (!env.SPOTIFY_CLIENT_ID) return undefined;
  const at = await accessToken(env);
  if (!at) return undefined; // not connected yet: leave this section out
  const owned = await ownedPlaylists(env, at);
  if (!owned.length) return null;
  const { starts, complete } = await knownStarts(env, owned, at);
  const { mode, picks } = choosePlaylists(owned, starts);
  const playlists = [];
  for (const { p, number, startedAt: started } of picks) {
    const tracks = await recentItems(p.id, totalOf(p), at);
    tracks.sort((a, b) => Date.parse(b.addedAt || 0) - Date.parse(a.addedAt || 0));
    playlists.push({
      name: p.name,
      url: p.external_urls?.spotify || null,
      cover: p.images?.[0]?.url || null,
      total: totalOf(p),
      number,
      startedAt: new Date(started).toISOString(),
      lastAdded: tracks[0]?.addedAt || null,
      tracks: tracks.slice(0, 3),
    });
  }
  return { mode, playlists, complete };
}
