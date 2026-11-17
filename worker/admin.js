// /admin: a small page for editing short links and friends.
// Unlocked with the same password the photo Shortcut uses (UPLOAD_KEY).
import { authorized } from "./photos.js";
import { getLists, saveLists, validateLinks, validateFriends } from "./lists.js";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

export async function handleAdmin(request, env) {
  const { pathname } = new URL(request.url);

  if (pathname === "/admin" || pathname === "/admin/") {
    return new Response(PAGE, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        "x-robots-tag": "noindex",
        "content-security-policy":
          "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'",
      },
    });
  }

  if (pathname !== "/admin-api/lists") return null;
  if (!(await authorized(request, env))) return json({ error: "That password isn't right." }, 401);

  if (request.method === "GET") {
    const { links, friends } = await getLists(env, { fresh: true });
    return json({ links, friends });
  }

  if (request.method === "PUT") {
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Couldn't read that change. Reload the page and try again." }, 400);
    }
    const update = {};
    if ("links" in body) {
      const v = validateLinks(body.links);
      if (!v.ok) return json({ error: v.error }, 400);
      update.links = v.value;
    }
    if ("friends" in body) {
      const v = validateFriends(body.friends);
      if (!v.ok) return json({ error: v.error }, 400);
      update.friends = v.value;
    }
    const { links, friends } = await saveLists(env, update);
    return json({ links, friends });
  }

  return json({ error: "Not allowed." }, 405);
}

const PAGE = /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Edit sunken.fyi</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@400;600;700&display=swap">
<style>
  :root {
    --bg: #ececec; --panel: #f7f7f5; --text: #111; --muted: #684135; --line: #d3d0c8;
    --accent: #1998db; --link: #0785ac; --danger: #b3261e;
    color-scheme: light;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--bg); color: var(--text);
    font: 18px/1.5 "Zilla Slab", Georgia, serif;
    -webkit-font-smoothing: antialiased;
  }
  main { max-width: 42rem; margin: 0 auto; padding: 2.5rem 1.25rem 5rem; }
  h1 { font-variant: small-caps; letter-spacing: .04em; font-size: 2rem; margin: 0 0 .25rem; }
  h2 { font-variant: small-caps; letter-spacing: .03em; font-size: 1.35rem; margin: 2.5rem 0 .3rem;
       border-bottom: 2px solid var(--muted); }
  p.lede, p.hint { color: var(--muted); margin: 0 0 1rem; }
  p.hint { font-size: .85rem; }
  a { color: var(--link); }

  ul.rows { list-style: none; padding: 0; margin: 0 0 1rem; }
  ul.rows li {
    display: grid; grid-template-columns: minmax(0, 11rem) minmax(0, 1fr) auto; gap: .75rem;
    align-items: baseline; padding: .55rem 0; border-bottom: 1px solid var(--line);
  }
  .key { font-weight: 700; overflow-wrap: anywhere; }
  .key small { font-weight: 400; color: var(--muted); }
  .val { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .9rem; }
  .empty { color: var(--muted); padding: .5rem 0; }

  form.add { display: grid; grid-template-columns: minmax(0, 11rem) minmax(0, 1fr) auto; gap: .75rem; align-items: end; }
  label { display: block; font-size: .8rem; color: var(--muted); margin-bottom: .2rem; }
  .prefix { display: flex; align-items: center; border: 1px solid var(--line); border-radius: 6px; background: var(--panel); }
  .prefix span { padding-left: .6rem; color: var(--muted); font-size: .85rem; white-space: nowrap; }
  .prefix input { border: 0; padding-left: .1rem; }
  input {
    width: 100%; font: inherit; font-size: 1rem; color: var(--text); background: var(--panel);
    border: 1px solid var(--line); border-radius: 6px; padding: .5rem .6rem;
  }
  input:focus-visible, button:focus-visible { outline: 3px solid var(--accent); outline-offset: 1px; }
  button {
    font: inherit; font-weight: 700; font-size: .95rem; cursor: pointer; border-radius: 999px;
    padding: .45rem 1.1rem; border: 2px solid var(--accent); background: var(--accent); color: #fff;
  }
  button.quiet { background: transparent; color: var(--danger); border-color: transparent; padding: .2rem .5rem; font-weight: 600; }
  button.quiet:hover { border-color: var(--danger); }
  button:disabled { opacity: .5; cursor: default; }

  .status { min-height: 1.5rem; font-size: .9rem; margin-top: .6rem; }
  .status.error { color: var(--danger); }
  .status.ok { color: var(--muted); }

  #lock { margin-top: 2rem; display: grid; gap: .75rem; max-width: 22rem; }
  .check { display: flex; gap: .5rem; align-items: center; font-size: .9rem; color: var(--muted); }
  .check input { width: auto; }
  #signout { margin-top: 3rem; }

  @media (max-width: 560px) {
    ul.rows li { grid-template-columns: minmax(0, 1fr) auto; }
    ul.rows li .val { grid-column: 1; grid-row: 2; }
    ul.rows li button { grid-row: 1 / span 2; grid-column: 2; align-self: center; }
    form.add { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>
<main>
  <h1>edit sunken.fyi</h1>
  <p class="lede">Short links and friends. Changes are live within a minute.</p>

  <form id="lock" hidden>
    <div>
      <label for="pw">Password (the same one your photo Shortcut uses)</label>
      <input id="pw" type="password" autocomplete="current-password" required>
    </div>
    <label class="check"><input id="remember" type="checkbox" checked> Stay signed in on this device</label>
    <button type="submit">Unlock</button>
    <p class="status" id="lock-status" role="status"></p>
  </form>

  <div id="editor" hidden>
    <h2>short links</h2>
    <p class="hint">sunken.fyi/<em>name</em> sends people to the address you give it.</p>
    <ul class="rows" id="links"></ul>
    <form class="add" id="add-link">
      <div>
        <label for="link-name">Name</label>
        <div class="prefix"><span>sunken.fyi/</span><input id="link-name" required autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="cv"></div>
      </div>
      <div>
        <label for="link-url">Goes to</label>
        <input id="link-url" type="url" required placeholder="https://" autocapitalize="off" spellcheck="false">
      </div>
      <button type="submit">Add link</button>
    </form>
    <p class="status" id="links-status" role="status"></p>

    <h2>friends</h2>
    <p class="hint">The home page button sends visitors to one of these at random.</p>
    <ul class="rows" id="friends"></ul>
    <form class="add" id="add-friend">
      <div>
        <label for="friend-name">Name</label>
        <input id="friend-name" required placeholder="Aidan">
      </div>
      <div>
        <label for="friend-url">Website</label>
        <input id="friend-url" type="url" required placeholder="https://" autocapitalize="off" spellcheck="false">
      </div>
      <button type="submit">Add friend</button>
    </form>
    <p class="status" id="friends-status" role="status"></p>

    <button id="signout" class="quiet" type="button">Sign out on this device</button>
  </div>
</main>
<script>
(() => {
  const $ = (id) => document.getElementById(id);
  let key = null;
  let data = { links: {}, friends: [] };

  const store = {
    get() { try { return localStorage.getItem("sunken-admin-key"); } catch { return null; } },
    set(v) { try { localStorage.setItem("sunken-admin-key", v); } catch {} },
    clear() { try { localStorage.removeItem("sunken-admin-key"); } catch {} },
  };

  async function api(method, body) {
    const res = await fetch("/admin-api/lists", {
      method,
      headers: { authorization: "Bearer " + key, "content-type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) { const e = new Error(out.error || "Something went wrong (" + res.status + ")."); e.status = res.status; throw e; }
    return out;
  }

  function status(id, msg, kind) {
    const el = $(id);
    el.textContent = msg;
    el.className = "status " + (kind || "");
  }

  function row(keyText, keySmall, href, onDelete, label) {
    const li = document.createElement("li");
    const k = document.createElement("span");
    k.className = "key";
    if (keySmall) { const s = document.createElement("small"); s.textContent = keySmall; k.append(s); }
    k.append(keyText);
    const v = document.createElement("a");
    v.className = "val"; v.href = href; v.textContent = href; v.target = "_blank"; v.rel = "noopener";
    const b = document.createElement("button");
    b.className = "quiet"; b.type = "button"; b.textContent = "Delete";
    b.setAttribute("aria-label", "Delete " + label);
    b.addEventListener("click", onDelete);
    li.append(k, v, b);
    return li;
  }

  function render() {
    const links = $("links"); links.replaceChildren();
    const names = Object.keys(data.links).sort();
    if (!names.length) links.innerHTML = '<li class="empty">No short links yet.</li>';
    for (const name of names) {
      links.append(row(name, "/", data.links[name], () => removeLink(name), "short link " + name));
    }
    const friends = $("friends"); friends.replaceChildren();
    if (!data.friends.length) friends.innerHTML = '<li class="empty">No friends listed yet.</li>';
    data.friends.forEach((f, i) => friends.append(row(f.name, "", f.url, () => removeFriend(i), f.name)));
  }

  async function save(part, value, statusId, done) {
    try {
      data = await api("PUT", { [part]: value });
      render();
      status(statusId, done, "ok");
      return true;
    } catch (e) {
      status(statusId, e.message, "error");
      if (e.status === 401) lock();
      return false;
    }
  }

  async function removeLink(name) {
    if (!confirm("Delete sunken.fyi/" + name + "?")) return;
    const next = { ...data.links }; delete next[name];
    await save("links", next, "links-status", "Deleted sunken.fyi/" + name + ".");
  }

  async function removeFriend(i) {
    const f = data.friends[i];
    if (!confirm("Remove " + f.name + "?")) return;
    const next = data.friends.filter((_, j) => j !== i);
    await save("friends", next, "friends-status", "Removed " + f.name + ".");
  }

  $("add-link").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = $("link-name").value.trim().toLowerCase().replace(/^\\/+|\\/+$/g, "");
    const url = $("link-url").value.trim();
    if (data.links[name] && !confirm("sunken.fyi/" + name + " already exists. Replace it?")) return;
    const ok = await save("links", { ...data.links, [name]: url }, "links-status", "Added sunken.fyi/" + name + ".");
    if (ok) { $("link-name").value = ""; $("link-url").value = ""; $("link-name").focus(); }
  });

  $("add-friend").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = $("friend-name").value.trim();
    const url = $("friend-url").value.trim();
    const ok = await save("friends", [...data.friends, { name, url }], "friends-status", "Added " + name + ".");
    if (ok) { $("friend-name").value = ""; $("friend-url").value = ""; $("friend-name").focus(); }
  });

  function lock(msg) {
    key = null; store.clear();
    $("editor").hidden = true; $("lock").hidden = false;
    if (msg) status("lock-status", msg, "error");
    $("pw").focus();
  }

  async function unlock(candidate, remember) {
    key = candidate;
    try {
      data = await api("GET");
      if (remember) store.set(candidate);
      $("lock").hidden = true; $("editor").hidden = false;
      render();
    } catch (e) {
      lock(e.status === 401 ? "That password isn't right." : e.message);
    }
  }

  $("lock").addEventListener("submit", (e) => {
    e.preventDefault();
    unlock($("pw").value, $("remember").checked);
    $("pw").value = "";
  });
  $("signout").addEventListener("click", () => lock());

  const saved = store.get();
  if (saved) unlock(saved, true); else lock();
})();
</script>
</body>
</html>`;
