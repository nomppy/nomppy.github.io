// Minimal Instagram Graph API client for one professional account.
// Uses the system-user token from the app's "Unified login" configuration.

function base(env) {
  return `https://graph.facebook.com/${env.GRAPH_VERSION || "v25.0"}`;
}

async function call(env, path, { method = "GET", params = {} } = {}) {
  const url = new URL(`${base(env)}/${path}`);
  const body = new URLSearchParams({ ...params, access_token: env.IG_TOKEN });
  let res;
  if (method === "GET") {
    for (const [k, v] of body) url.searchParams.set(k, v);
    res = await fetch(url);
  } else {
    res = await fetch(url, { method, body });
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    const msg = data.error?.message || `HTTP ${res.status}`;
    throw new Error(`Instagram ${path}: ${msg}`);
  }
  return data;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Posts one image. imageUrl must be a public JPEG URL.
export async function postImage(env, { imageUrl, caption }) {
  const container = await call(env, `${env.IG_USER_ID}/media`, {
    method: "POST",
    params: { image_url: imageUrl, caption: caption || "" },
  });
  // Wait for Instagram to fetch and process the image.
  for (let i = 0; i < 10; i++) {
    const s = await call(env, container.id, { params: { fields: "status_code" } });
    if (s.status_code === "FINISHED") break;
    if (s.status_code === "ERROR" || s.status_code === "EXPIRED") {
      throw new Error(`Instagram container ${s.status_code}`);
    }
    await sleep(2000);
  }
  const published = await call(env, `${env.IG_USER_ID}/media_publish`, {
    method: "POST",
    params: { creation_id: container.id },
  });
  return published.id;
}

// Lists the account's posts, newest first, following pagination.
export async function listMedia(env) {
  const fields = "id,caption,media_type,media_url,timestamp,children{id,media_type,media_url}";
  const out = [];
  let page = await call(env, `${env.IG_USER_ID}/media`, { params: { fields, limit: "50" } });
  for (;;) {
    out.push(...(page.data || []));
    const next = page.paging?.next;
    if (!next) break;
    const res = await fetch(next);
    page = await res.json();
    if (!res.ok || page.error) throw new Error(`Instagram paging: ${page.error?.message || res.status}`);
  }
  return out;
}

// Flattens posts into individual images (carousels become several images).
export function imagesFromMedia(posts) {
  const images = [];
  for (const p of posts) {
    if (p.media_type === "IMAGE") {
      images.push({ igId: p.id, url: p.media_url, caption: p.caption || "", takenAt: p.timestamp });
    } else if (p.media_type === "CAROUSEL_ALBUM") {
      for (const c of p.children?.data || []) {
        if (c.media_type === "IMAGE") {
          images.push({ igId: c.id, url: c.media_url, caption: p.caption || "", takenAt: p.timestamp });
        }
      }
    }
  }
  return images;
}
