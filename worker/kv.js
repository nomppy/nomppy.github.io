// Small key/value store in D1, shared by the feeds and Spotify.

async function ensureTable(env) {
  await env.DB.prepare(
    "CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at INTEGER NOT NULL)",
  ).run();
}

export async function kvGet(env, key) {
  await ensureTable(env);
  const row = await env.DB.prepare("SELECT value, updated_at FROM kv WHERE key = ?").bind(key).first();
  return row ? { value: JSON.parse(row.value), updatedAt: row.updated_at } : null;
}

export async function kvPut(env, key, value) {
  await ensureTable(env);
  await env.DB.prepare(
    "INSERT INTO kv (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
  )
    .bind(key, JSON.stringify(value), Date.now())
    .run();
}
