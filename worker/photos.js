// Photo queue: uploads go into a queue, a scheduled job releases them one at a
// time to the site's /photos page and to Instagram.
import { jpegSize, fitsInstagram, scrubJpeg, displaySize } from "./jpeg.js";
import { shouldPublish } from "./schedule.js";
import { postImage, listMedia, imagesFromMedia } from "./instagram.js";
import { dateFromCaption, parseDateInput } from "./dates.js";

const MAX_UPLOAD_BYTES = 60 * 1024 * 1024;
const IMPORT_BATCH = 15;
const MAX_IG_ATTEMPTS = 3;

let schemaReady = false;
async function ensureSchema(env) {
  if (schemaReady) return;
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY,
      caption TEXT NOT NULL DEFAULT '',
      width INTEGER,
      height INTEGER,
      status TEXT NOT NULL,
      source TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      published_at INTEGER,
      ig_media_id TEXT UNIQUE,
      ig_status TEXT,
      ig_attempts INTEGER NOT NULL DEFAULT 0,
      ig_error TEXT
    )`,
  ).run();
  // Added later: when the photo was taken, and where that date came from
  // (manual, shortcut, camera or caption; see dates.js).
  for (const col of ["taken_at INTEGER", "date_source TEXT"]) {
    try {
      await env.DB.prepare(`ALTER TABLE photos ADD COLUMN ${col}`).run();
    } catch {
      // column already exists
    }
  }
  schemaReady = true;
}

// Fills in dates written in captions for photos that have none yet.
export async function backfillDates(env) {
  await ensureSchema(env);
  const { results } = await env.DB.prepare("SELECT id, caption FROM photos WHERE taken_at IS NULL AND caption != ''").all();
  let filled = 0;
  for (const r of results) {
    const found = dateFromCaption(r.caption);
    if (!found) continue;
    await env.DB.prepare("UPDATE photos SET taken_at = ?, date_source = 'caption' WHERE id = ? AND taken_at IS NULL")
      .bind(found.takenAt, r.id)
      .run();
    filled++;
  }
  return filled;
}

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

export { ensureSchema };

export async function authorized(request, env) {
  if (!env.UPLOAD_KEY) return false;
  const header = request.headers.get("authorization") || "";
  const given = header.startsWith("Bearer ") ? header.slice(7) : "";
  const enc = new TextEncoder();
  const a = enc.encode(given);
  const b = enc.encode(env.UPLOAD_KEY);
  if (a.byteLength !== b.byteLength) return false;
  return crypto.subtle.timingSafeEqual(a, b);
}

const imagePath = (id) => `/photos/img/${id}.jpg`;
const objectKey = (id) => `photos/${id}.jpg`;

function publicRow(r) {
  return {
    id: r.id,
    url: imagePath(r.id),
    width: r.width,
    height: r.height,
    caption: r.caption,
    publishedAt: r.published_at,
    takenAt: r.taken_at ?? null,
  };
}

// Everything the admin panel shows about a photo.
export function adminRow(r) {
  return {
    ...publicRow(r),
    status: r.status,
    source: r.source,
    createdAt: r.created_at,
    dateSource: r.date_source ?? null,
    igStatus: r.ig_status ?? null,
    igError: r.ig_error ?? null,
  };
}

// The URL Instagram fetches. Originals are full resolution, so Instagram always
// gets a resized JPEG (it caps images at 8 MB and 1440 px wide). Photos outside
// its 4:5..1.91:1 range are padded to fit rather than cropped.
export function instagramImageUrl(env, row) {
  const site = env.SITE_URL.replace(/\/$/, "");
  const src = imagePath(row.id);
  const bg = env.IG_PAD_COLOR || "white";
  let opts = "width=1440,fit=scale-down";
  if (!fitsInstagram(row.width, row.height)) {
    const tall = row.width / row.height < 0.8;
    opts = tall ? `width=1080,height=1350,fit=pad,background=${bg}` : `width=1440,height=754,fit=pad,background=${bg}`;
  }
  return `${site}/cdn-cgi/image/${opts},quality=90,format=jpeg${src}`;
}

async function publishToInstagram(env, row) {
  if (!env.IG_TOKEN || !env.IG_USER_ID) {
    await env.DB.prepare("UPDATE photos SET ig_status = 'skipped', ig_error = 'Instagram not configured' WHERE id = ?")
      .bind(row.id)
      .run();
    return;
  }
  try {
    const mediaId = await postImage(env, { imageUrl: instagramImageUrl(env, row), caption: row.caption });
    await env.DB.prepare("UPDATE photos SET ig_status = 'done', ig_media_id = ?, ig_error = NULL WHERE id = ?")
      .bind(mediaId, row.id)
      .run();
  } catch (err) {
    await env.DB.prepare(
      "UPDATE photos SET ig_status = 'failed', ig_attempts = ig_attempts + 1, ig_error = ? WHERE id = ?",
    )
      .bind(String(err.message || err).slice(0, 500), row.id)
      .run();
  }
}

// Releases the oldest queued photo if enough time has passed (or if forced).
export async function publishNext(env, { force = false } = {}) {
  await ensureSchema(env);
  const last = await env.DB.prepare("SELECT MAX(published_at) AS t FROM photos WHERE status = 'published'").first();
  const next = await env.DB.prepare(
    "SELECT * FROM photos WHERE status = 'queued' ORDER BY created_at LIMIT 1",
  ).first();
  const now = Date.now();
  if (!next) return { published: null, reason: "queue empty" };
  if (!force && !shouldPublish({ lastPublishedAt: last?.t ?? null, now, everyDays: env.PUBLISH_EVERY_DAYS || 2, queued: 1 })) {
    return { published: null, reason: "not due yet" };
  }
  await env.DB.prepare(
    "UPDATE photos SET status = 'published', published_at = ?, ig_status = 'pending' WHERE id = ?",
  )
    .bind(now, next.id)
    .run();
  await publishToInstagram(env, next);
  return { published: next.id };
}

// Scheduled job: retry any failed Instagram post, then maybe release a photo.
export async function scheduled(env) {
  await ensureSchema(env);
  const retry = await env.DB.prepare(
    `SELECT * FROM photos WHERE status = 'published' AND source = 'upload'
       AND ig_status IN ('pending', 'failed') AND ig_attempts < ?
     ORDER BY published_at LIMIT 1`,
  )
    .bind(MAX_IG_ATTEMPTS)
    .first();
  if (retry) await publishToInstagram(env, retry);
  return publishNext(env);
}

// Pulls in posts made directly on Instagram (posts from the queue are skipped,
// since they are already recorded). Runs on the feeds schedule.
export async function syncInstagram(env) {
  await ensureSchema(env);
  const result = env.IG_TOKEN && env.IG_USER_ID ? await importInstagram(env) : null;
  await backfillDates(env);
  return result;
}

export async function importInstagram(env) {
  const images = imagesFromMedia(await listMedia(env));
  const known = new Set(
    (await env.DB.prepare("SELECT ig_media_id FROM photos WHERE ig_media_id IS NOT NULL").all()).results.map(
      (r) => r.ig_media_id,
    ),
  );
  const fresh = images.filter((i) => !known.has(i.igId));
  const batch = fresh.slice(0, IMPORT_BATCH);
  let imported = 0;
  const errors = [];
  for (const img of batch) {
    try {
      const res = await fetch(img.url);
      if (!res.ok) throw new Error(`download HTTP ${res.status}`);
      const bytes = new Uint8Array(await res.arrayBuffer());
      const size = jpegSize(bytes) || {};
      const id = crypto.randomUUID();
      await env.PHOTOS.put(objectKey(id), bytes, { httpMetadata: { contentType: "image/jpeg" } });
      const postedAt = Date.parse(img.takenAt) || Date.now();
      const captionDate = dateFromCaption(img.caption);
      await env.DB.prepare(
        `INSERT OR IGNORE INTO photos
           (id, caption, width, height, status, source, created_at, published_at, ig_media_id, ig_status, taken_at, date_source)
         VALUES (?, ?, ?, ?, 'published', 'instagram', ?, ?, ?, 'done', ?, ?)`,
      )
        .bind(
          id, img.caption, size.width ?? null, size.height ?? null, postedAt, postedAt, img.igId,
          captionDate?.takenAt ?? null, captionDate ? "caption" : null,
        )
        .run();
      imported++;
    } catch (err) {
      errors.push({ igId: img.igId, error: String(err.message || err) });
    }
  }
  return { imported, remaining: fresh.length - imported - errors.length, errors };
}

// Returns a Response for /photo-api/* and /photos/img/* paths, or null.
export async function handlePhotos(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === "GET" && path.startsWith("/photos/img/")) {
    const id = path.slice("/photos/img/".length).replace(/\.jpg$/, "");
    if (!/^[0-9a-f-]{36}$/.test(id)) return new Response("Not found", { status: 404 });
    const obj = await env.PHOTOS.get(objectKey(id));
    if (!obj) return new Response("Not found", { status: 404 });
    return new Response(obj.body, {
      headers: {
        "content-type": "image/jpeg",
        "cache-control": "public, max-age=31536000, immutable",
        etag: obj.httpEtag,
      },
    });
  }

  if (!path.startsWith("/photo-api/")) return null;
  await ensureSchema(env);
  const route = `${request.method} ${path.replace(/\/$/, "")}`;

  if (route === "GET /photo-api/photos") {
    const { results } = await env.DB.prepare(
      "SELECT * FROM photos WHERE status = 'published' ORDER BY published_at DESC",
    ).all();
    return new Response(JSON.stringify(results.map(publicRow)), {
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=300" },
    });
  }

  if (!(await authorized(request, env))) return json({ error: "unauthorized" }, 401);

  if (route === "POST /photo-api/upload") {
    const raw = new Uint8Array(await request.arrayBuffer());
    if (!raw.byteLength) return json({ error: "empty body" }, 400);
    if (raw.byteLength > MAX_UPLOAD_BYTES) return json({ error: "file too large" }, 413);
    const { bytes, orientation, takenAt: cameraDate } = scrubJpeg(raw);
    const size = displaySize(jpegSize(bytes), orientation);
    if (!size) return json({ error: "send a JPEG image" }, 415);
    const caption = (url.searchParams.get("caption") || request.headers.get("x-caption") || "").slice(0, 2200);
    // Date: the Shortcut's (or admin's) value, else the camera's, else the caption's.
    const given = parseDateInput(url.searchParams.get("taken") || request.headers.get("x-taken-at"));
    const fromCaption = dateFromCaption(caption);
    const [takenAt, dateSource] = given
      ? [given, url.searchParams.get("source") === "admin" ? "manual" : "shortcut"]
      : cameraDate
        ? [cameraDate, "camera"]
        : fromCaption
          ? [fromCaption.takenAt, "caption"]
          : [null, null];
    const id = crypto.randomUUID();
    await env.PHOTOS.put(objectKey(id), bytes, { httpMetadata: { contentType: "image/jpeg" } });
    await env.DB.prepare(
      `INSERT INTO photos (id, caption, width, height, status, source, created_at, taken_at, date_source)
       VALUES (?, ?, ?, ?, 'queued', 'upload', ?, ?, ?)`,
    )
      .bind(id, caption, size.width, size.height, Date.now(), takenAt, dateSource)
      .run();
    const q = await env.DB.prepare("SELECT COUNT(*) AS n FROM photos WHERE status = 'queued'").first();
    return json({ id, queued: q.n, takenAt, dateSource, fitsInstagram: fitsInstagram(size.width, size.height) }, 201);
  }

  if (route === "GET /photo-api/queue") {
    const { results } = await env.DB.prepare(
      "SELECT id, caption, width, height, created_at FROM photos WHERE status = 'queued' ORDER BY created_at",
    ).all();
    const failed = await env.DB.prepare(
      "SELECT id, ig_status, ig_attempts, ig_error FROM photos WHERE ig_status = 'failed'",
    ).all();
    return json({ queued: results, instagramFailures: failed.results });
  }

  const del = route.match(/^DELETE \/photo-api\/photos\/([0-9a-f-]{36})$/);
  if (del) {
    await env.PHOTOS.delete(objectKey(del[1]));
    await env.DB.prepare("DELETE FROM photos WHERE id = ?").bind(del[1]).run();
    return json({ deleted: del[1] });
  }

  if (route === "POST /photo-api/publish-now") return json(await publishNext(env, { force: true }));
  if (route === "POST /photo-api/import-instagram") return json(await importInstagram(env));

  return json({ error: "not found" }, 404);
}
