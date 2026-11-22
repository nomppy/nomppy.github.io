// /admin: photos, short links, friends, backgrounds and feeds.
// Unlocked with the same password the photo Shortcut uses (UPLOAD_KEY).
import { authorized, adminRow, ensureSchema, publishNext, importInstagram, backfillDates, deletePhoto } from "./photos.js";
import { getLists, saveLists, validateLinks, validateFriends } from "./lists.js";
import {
  getBackgroundSettings, saveBackgroundSettings, validateBackgrounds, validateModes, storeBackgroundImage, deleteBackgroundImage,
} from "./backgrounds.js";
import { refreshFeeds } from "./feeds.js";
import { kvGet } from "./kv.js";
import { parseDateInput } from "./dates.js";
import { jpegSize } from "./jpeg.js";
import { PAGE } from "./admin-page.js";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

async function body(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

const ID = /^[0-9a-f-]{36}$/;

export async function handleAdmin(request, env) {
  const { pathname } = new URL(request.url);

  if (pathname === "/admin" || pathname === "/admin/") {
    return new Response(PAGE, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        "x-robots-tag": "noindex",
        "content-security-policy":
          "default-src 'self'; img-src 'self' blob: data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'",
      },
    });
  }

  if (!pathname.startsWith("/admin-api/")) return null;
  if (!(await authorized(request, env))) return json({ error: "That password isn't right." }, 401);
  const route = `${request.method} ${pathname.replace(/\/$/, "")}`;

  // --- short links and friends
  if (route === "GET /admin-api/lists") {
    const { links, friends } = await getLists(env, { fresh: true });
    return json({ links, friends });
  }
  if (route === "PUT /admin-api/lists") {
    const b = await body(request);
    if (!b) return json({ error: "Couldn't read that change. Reload the page and try again." }, 400);
    const update = {};
    if ("links" in b) {
      const v = validateLinks(b.links);
      if (!v.ok) return json({ error: v.error }, 400);
      update.links = v.value;
    }
    if ("friends" in b) {
      const v = validateFriends(b.friends);
      if (!v.ok) return json({ error: v.error }, 400);
      update.friends = v.value;
    }
    const { links, friends } = await saveLists(env, update);
    return json({ links, friends });
  }

  // --- photos
  if (route === "GET /admin-api/photos") {
    await ensureSchema(env);
    await backfillDates(env);
    const { results } = await env.DB.prepare(
      "SELECT * FROM photos ORDER BY CASE status WHEN 'queued' THEN 0 ELSE 1 END, COALESCE(published_at, created_at) DESC",
    ).all();
    return json({ photos: results.map(adminRow), publishEveryDays: Number(env.PUBLISH_EVERY_DAYS || 2) });
  }
  if (route === "PATCH /admin-api/photos") {
    const b = await body(request);
    const ids = Array.isArray(b?.ids) ? b.ids.filter((id) => ID.test(id)) : [];
    if (!ids.length) return json({ error: "No photos selected." }, 400);
    await ensureSchema(env);
    if ("takenAt" in b) {
      const t = b.takenAt === null ? null : parseDateInput(b.takenAt);
      if (b.takenAt !== null && t === null) return json({ error: "That date isn't valid." }, 400);
      for (const id of ids) {
        await env.DB.prepare("UPDATE photos SET taken_at = ?, date_source = ? WHERE id = ?")
          .bind(t, t === null ? null : "manual", id)
          .run();
      }
    }
    if ("background" in b) {
      for (const id of ids) {
        await env.DB.prepare("UPDATE photos SET bg_use = ? WHERE id = ?").bind(b.background ? 1 : 0, id).run();
      }
    }
    if ("caption" in b) {
      if (ids.length !== 1) return json({ error: "Edit captions one photo at a time." }, 400);
      await env.DB.prepare("UPDATE photos SET caption = ? WHERE id = ?").bind(String(b.caption).slice(0, 2200), ids[0]).run();
    }
    const placeholders = ids.map(() => "?").join(",");
    const { results } = await env.DB.prepare(`SELECT * FROM photos WHERE id IN (${placeholders})`).bind(...ids).all();
    return json({ photos: results.map(adminRow) });
  }
  const del = route.match(/^DELETE \/admin-api\/photos\/([0-9a-f-]{36})$/);
  if (del) {
    await deletePhoto(env, del[1]);
    return json({ deleted: del[1] });
  }
  if (route === "POST /admin-api/photos/publish-next") return json(await publishNext(env, { force: true }));
  if (route === "POST /admin-api/photos/import") {
    if (!env.IG_TOKEN || !env.IG_USER_ID) return json({ error: "Instagram isn't connected." }, 400);
    await ensureSchema(env);
    const r = await importInstagram(env);
    await backfillDates(env);
    return json(r);
  }

  // --- backgrounds
  const bgView = async (v) => {
    await ensureSchema(env);
    const n = await env.DB.prepare("SELECT COUNT(*) AS n FROM photos WHERE status = 'published' AND bg_use != 0").first();
    return { backgrounds: v.items, modes: v.modes, photoCount: n?.n ?? 0 };
  };
  if (route === "GET /admin-api/backgrounds") return json(await bgView(await getBackgroundSettings(env, { fresh: true })));
  if (route === "PUT /admin-api/backgrounds") {
    const b = await body(request);
    const before = await getBackgroundSettings(env, { fresh: true });
    const next = { ...before };
    if ("backgrounds" in (b || {})) {
      const v = validateBackgrounds(b.backgrounds);
      if (!v.ok) return json({ error: v.error }, 400);
      const kept = new Set(v.value.map((x) => x.id));
      for (const old of before.items) if (old.kind === "image" && !kept.has(old.id)) await deleteBackgroundImage(env, old.id);
      next.items = v.value;
    }
    if ("modes" in (b || {})) {
      const v = validateModes(b.modes);
      if (!v.ok) return json({ error: v.error }, 400);
      next.modes = v.value;
    }
    await saveBackgroundSettings(env, { items: next.items, modes: next.modes });
    return json(await bgView(next));
  }
  if (route === "POST /admin-api/backgrounds/image") {
    const bytes = new Uint8Array(await request.arrayBuffer());
    if (!jpegSize(bytes)) return json({ error: "Send a JPEG image." }, 415);
    if (bytes.byteLength > 30 * 1024 * 1024) return json({ error: "That image is too large (30 MB max)." }, 413);
    const size = jpegSize(bytes);
    return json({ id: await storeBackgroundImage(env, bytes), w: size.width, h: size.height }, 201);
  }

  // --- feeds
  if (route === "GET /admin-api/feeds") {
    const cached = await kvGet(env, "lately");
    const spotify = await kvGet(env, "spotify-refresh");
    return json({ lately: cached?.value || null, spotifyConnected: !!spotify });
  }
  if (route === "POST /admin-api/feeds/refresh") return json({ lately: await refreshFeeds(env) });

  return json({ error: "Not found." }, 404);
}
