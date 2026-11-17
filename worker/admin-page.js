// The /admin page: one self-contained HTML document.
export const PAGE = /* html */ `<!doctype html>
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
    --accent: #1998db; --link: #0785ac; --danger: #b3261e; --ok: #2e7d32; --warn: #a15c00;
    color-scheme: light;
  }
  * { box-sizing: border-box; }
  [hidden] { display: none !important; }
  body { margin: 0; background: var(--bg); color: var(--text); font: 17px/1.5 "Zilla Slab", Georgia, serif; -webkit-font-smoothing: antialiased; }
  main { max-width: 64rem; margin: 0 auto; padding: 2rem 1.25rem 5rem; }
  h1 { font-variant: small-caps; letter-spacing: .04em; font-size: 2rem; margin: 0 0 .25rem; }
  h2 { font-variant: small-caps; letter-spacing: .03em; font-size: 1.3rem; margin: 2rem 0 .3rem; border-bottom: 2px solid var(--muted); }
  p.hint { color: var(--muted); margin: 0 0 1rem; font-size: .9rem; }
  a { color: var(--link); }
  input, textarea, select {
    font: inherit; font-size: .95rem; color: var(--text); background: var(--panel);
    border: 1px solid var(--line); border-radius: 6px; padding: .4rem .55rem; width: 100%;
  }
  textarea { resize: vertical; min-height: 2.4rem; }
  input:focus-visible, textarea:focus-visible, button:focus-visible, select:focus-visible { outline: 3px solid var(--accent); outline-offset: 1px; }
  label { display: block; font-size: .8rem; color: var(--muted); margin-bottom: .2rem; }
  button {
    font: inherit; font-weight: 700; font-size: .9rem; cursor: pointer; border-radius: 999px;
    padding: .4rem 1rem; border: 2px solid var(--accent); background: var(--accent); color: #fff; white-space: nowrap;
  }
  button.ghost { background: transparent; color: var(--text); }
  button.quiet { background: transparent; color: var(--danger); border-color: transparent; padding: .2rem .5rem; font-weight: 600; }
  button.quiet:hover { border-color: var(--danger); }
  button:disabled { opacity: .5; cursor: default; }
  .status { min-height: 1.4rem; font-size: .9rem; margin: .5rem 0; }
  .status.error { color: var(--danger); } .status.ok { color: var(--muted); }

  nav.tabs { display: flex; gap: .4rem; flex-wrap: wrap; margin: 1.2rem 0 .5rem; }
  nav.tabs button { background: transparent; color: var(--text); border-color: var(--line); }
  nav.tabs button[aria-selected="true"] { background: var(--text); color: var(--bg); border-color: var(--text); }

  /* rows (links, friends) */
  ul.rows { list-style: none; padding: 0; margin: 0 0 1rem; }
  ul.rows li { display: grid; grid-template-columns: minmax(0, 11rem) minmax(0, 1fr) auto; gap: .75rem; align-items: baseline; padding: .5rem 0; border-bottom: 1px solid var(--line); }
  .key { font-weight: 700; overflow-wrap: anywhere; } .key small { font-weight: 400; color: var(--muted); }
  .val { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .9rem; }
  form.add { display: grid; grid-template-columns: minmax(0, 11rem) minmax(0, 1fr) auto; gap: .75rem; align-items: end; }
  .prefix { display: flex; align-items: center; border: 1px solid var(--line); border-radius: 6px; background: var(--panel); }
  .prefix span { padding-left: .55rem; color: var(--muted); font-size: .85rem; white-space: nowrap; }
  .prefix input { border: 0; padding-left: .1rem; }

  /* photos */
  .toolbar { display: flex; flex-wrap: wrap; gap: .6rem; align-items: end; padding: .8rem; background: var(--panel); border: 1px solid var(--line); border-radius: 10px; margin-bottom: 1rem; }
  .toolbar > div { min-width: 9rem; }
  .toolbar .grow { flex: 1 1 14rem; }
  .filters { display: flex; gap: 1rem; flex-wrap: wrap; font-size: .9rem; margin: .4rem 0 .8rem; }
  .filters label { display: inline-flex; gap: .35rem; align-items: center; color: var(--text); font-size: .9rem; margin: 0; }
  .filters input { width: auto; }
  .photos { display: grid; grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); gap: 1rem; }
  .photo { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; }
  .photo.selected { outline: 3px solid var(--accent); }
  .thumb { position: relative; aspect-ratio: 4/3; background: #ddd; }
  .thumb img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
  .thumb .pick { position: absolute; top: .5rem; left: .5rem; width: 1.3rem; height: 1.3rem; }
  .thumb .badge { position: absolute; top: .5rem; right: .5rem; background: rgba(0,0,0,.65); color: #fff; font-size: .75rem; padding: .1rem .5rem; border-radius: 999px; }
  .photo .body { padding: .6rem .7rem .7rem; display: grid; gap: .45rem; }
  .src { font-size: .78rem; color: var(--muted); }
  .src.none { color: var(--warn); font-weight: 600; }
  .photo .foot { display: flex; justify-content: space-between; align-items: center; font-size: .8rem; color: var(--muted); }
  .saving { color: var(--muted); font-size: .78rem; min-height: 1rem; }

  /* backgrounds */
  .bgs { display: grid; grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr)); gap: 1rem; margin-bottom: 1rem; }
  .bg { border: 1px solid var(--line); border-radius: 10px; overflow: hidden; background: var(--panel); }
  .bg .sw { height: 6rem; background-size: cover; background-position: center; position: relative; }
  .bg .sw .sample { position: absolute; left: .5rem; bottom: .4rem; font-size: .85rem; padding: .1rem .4rem; border-radius: 4px; }
  .bg .meta { display: flex; justify-content: space-between; align-items: center; padding: .4rem .5rem; font-size: .85rem; }
  .bg .meta label { display: inline-flex; gap: .3rem; align-items: center; color: var(--text); margin: 0; font-size: .85rem; }
  .bg .meta input { width: auto; }
  .bg.off { opacity: .5; }
  .addbg { display: grid; grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); gap: 1rem; }
  .card { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: .8rem; display: grid; gap: .5rem; align-content: start; }
  input[type=color] { width: 5rem; height: 2.6rem; padding: .2rem; cursor: pointer; }

  #lock { margin-top: 2rem; display: grid; gap: .75rem; max-width: 22rem; }
  .check { display: flex; gap: .5rem; align-items: center; font-size: .9rem; color: var(--muted); }
  .check input { width: auto; }
  pre.feed { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: .8rem; font-size: .8rem; white-space: pre-wrap; max-height: 24rem; overflow: auto; }

  @media (max-width: 600px) {
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

  <form id="lock" hidden>
    <div><label for="pw">Password (the same one your photo Shortcut uses)</label><input id="pw" type="password" autocomplete="current-password" required></div>
    <label class="check"><input id="remember" type="checkbox" checked> Stay signed in on this device</label>
    <button type="submit">Unlock</button>
    <p class="status" id="lock-status" role="status"></p>
  </form>

  <div id="app" hidden>
    <nav class="tabs" role="tablist">
      <button role="tab" data-tab="photos">Photos</button>
      <button role="tab" data-tab="links">Short links</button>
      <button role="tab" data-tab="friends">Friends</button>
      <button role="tab" data-tab="backgrounds">Backgrounds</button>
      <button role="tab" data-tab="feeds">Feeds</button>
    </nav>

    <!-- PHOTOS -->
    <section data-panel="photos" hidden>
      <h2>add photos</h2>
      <p class="hint">Photos go into the queue and are released one at a time, to the site and to Instagram. Leave the date empty to use the photo's own data or a date in the caption.</p>
      <form class="toolbar" id="upload">
        <div class="grow"><label for="files">Photos</label><input id="files" type="file" accept="image/*" multiple required></div>
        <div class="grow"><label for="up-caption">Caption (all selected)</label><input id="up-caption" placeholder="tokyo 25.05.14"></div>
        <div><label for="up-date">Taken on</label><input id="up-date" type="date"></div>
        <button type="submit">Add to queue</button>
      </form>
      <p class="status" id="upload-status" role="status"></p>

      <h2>all photos</h2>
      <div class="filters">
        <label><input type="checkbox" id="f-undated"> Only photos without a date</label>
        <label><input type="checkbox" id="f-queued"> Only the queue</label>
        <span id="counts"></span>
      </div>
      <div class="toolbar" id="bulk">
        <div><label for="bulk-date">Set the date of selected photos</label><input id="bulk-date" type="date"></div>
        <button type="button" id="bulk-apply" disabled>Set date</button>
        <button type="button" class="ghost" id="bulk-clear" disabled>Clear selection</button>
        <span class="status" id="bulk-status"></span>
        <span style="flex:1"></span>
        <button type="button" class="ghost" id="publish-next">Publish next queued photo now</button>
        <button type="button" class="ghost" id="ig-import">Check Instagram for new posts</button>
      </div>
      <p class="status" id="photos-status" role="status"></p>
      <div class="photos" id="photos"></div>
    </section>

    <!-- LINKS -->
    <section data-panel="links" hidden>
      <h2>short links</h2>
      <p class="hint">sunken.fyi/<em>name</em> sends people to the address you give it.</p>
      <ul class="rows" id="links"></ul>
      <form class="add" id="add-link">
        <div><label for="link-name">Name</label><div class="prefix"><span>sunken.fyi/</span><input id="link-name" required autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="cv"></div></div>
        <div><label for="link-url">Goes to</label><input id="link-url" type="url" required placeholder="https://" autocapitalize="off" spellcheck="false"></div>
        <button type="submit">Add link</button>
      </form>
      <p class="status" id="links-status" role="status"></p>
    </section>

    <!-- FRIENDS -->
    <section data-panel="friends" hidden>
      <h2>friends</h2>
      <p class="hint">"Click here" on the home page sends visitors to one of these, going through everyone before repeating.</p>
      <ul class="rows" id="friends"></ul>
      <form class="add" id="add-friend">
        <div><label for="friend-name">Name</label><input id="friend-name" required placeholder="Aidan"></div>
        <div><label for="friend-url">Website</label><input id="friend-url" type="url" required placeholder="https://" autocapitalize="off" spellcheck="false"></div>
        <button type="submit">Add friend</button>
      </form>
      <p class="status" id="friends-status" role="status"></p>
    </section>

    <!-- BACKGROUNDS -->
    <section data-panel="backgrounds" hidden>
      <h2>backgrounds</h2>
      <p class="hint">Each visit gets one of the switched-on backgrounds at random. Over a photo, the page sits on a frosted panel in the photo's tint colour so text stays readable.</p>
      <div class="bgs" id="bgs"></div>
      <div class="addbg">
        <form class="card" id="add-color">
          <strong>Add a colour</strong>
          <input type="color" id="new-color" value="#e8eef0">
          <span class="src" id="color-check"></span>
          <button type="submit">Add colour</button>
        </form>
        <form class="card" id="add-image">
          <strong>Add a photo</strong>
          <input type="file" id="bg-file" accept="image/*" required>
          <div><label for="bg-tint">Panel tint (a light colour from the photo)</label><input type="color" id="bg-tint" value="#ececec"></div>
          <span class="src" id="tint-check"></span>
          <button type="submit">Add photo</button>
        </form>
      </div>
      <p class="status" id="bg-status" role="status"></p>
    </section>

    <!-- FEEDS -->
    <section data-panel="feeds" hidden>
      <h2>feeds</h2>
      <p class="hint">Letterboxd, Goodreads, Spotify and Substack refresh by themselves every 3 hours. Refresh now after you add something.</p>
      <div class="toolbar">
        <button type="button" id="refresh">Refresh now</button>
        <a href="/spotify/login" id="spotify-link">Connect Spotify</a>
        <span class="status" id="feeds-status"></span>
      </div>
      <pre class="feed" id="feed-summary"></pre>
    </section>

    <button id="signout" class="quiet" type="button" style="margin-top:3rem">Sign out on this device</button>
  </div>
</main>
<script>
(() => {
  const $ = (id) => document.getElementById(id);
  let key = null;
  const state = { links: {}, friends: [], photos: [], bgs: [], selected: new Set() };

  const store = {
    get() { try { return localStorage.getItem("sunken-admin-key"); } catch { return null; } },
    set(v) { try { localStorage.setItem("sunken-admin-key", v); } catch {} },
    clear() { try { localStorage.removeItem("sunken-admin-key"); } catch {} },
  };

  async function api(method, path, body, raw) {
    const headers = { authorization: "Bearer " + key };
    if (body !== undefined && !raw) headers["content-type"] = "application/json";
    const res = await fetch(path, { method, headers, body: raw ? body : body === undefined ? undefined : JSON.stringify(body) });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) { const e = new Error(out.error || "Something went wrong (" + res.status + ")."); e.status = res.status; throw e; }
    return out;
  }
  function status(id, msg, kind) { const el = $(id); el.textContent = msg; el.className = "status " + (kind || ""); }
  const fail = (id) => (e) => { status(id, e.message, "error"); if (e.status === 401) lock(); };
  const el = (tag, props = {}, ...kids) => { const n = Object.assign(document.createElement(tag), props); n.append(...kids); return n; };

  // ---------- tabs
  function show(tab) {
    document.querySelectorAll("nav.tabs button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === tab)));
    document.querySelectorAll("[data-panel]").forEach((p) => (p.hidden = p.dataset.panel !== tab));
    try { sessionStorage.setItem("sunken-admin-tab", tab); } catch {}
    ({ photos: loadPhotos, links: loadLists, friends: loadLists, backgrounds: loadBgs, feeds: loadFeeds })[tab]();
  }
  document.querySelectorAll("nav.tabs button").forEach((b) => b.addEventListener("click", () => show(b.dataset.tab)));

  // ---------- photos
  const SOURCE = {
    manual: "Date set by you",
    shortcut: "Date from your Photos app",
    camera: "Date from the camera",
    caption: "Date read from the caption",
  };
  const isoDay = (t) => (t ? new Date(t).toISOString().slice(0, 10) : "");
  const thumb = (url) => "/cdn-cgi/image/width=480,fit=scale-down,quality=75,format=auto" + url;

  async function loadPhotos() {
    try {
      const r = await api("GET", "/admin-api/photos");
      state.photos = r.photos;
      renderPhotos();
    } catch (e) { fail("photos-status")(e); }
  }

  function renderPhotos() {
    const onlyUndated = $("f-undated").checked, onlyQueued = $("f-queued").checked;
    const list = state.photos.filter((p) => (!onlyUndated || !p.takenAt) && (!onlyQueued || p.status === "queued"));
    const undated = state.photos.filter((p) => !p.takenAt).length;
    const queued = state.photos.filter((p) => p.status === "queued").length;
    $("counts").textContent = state.photos.length + " photos, " + queued + " queued, " + undated + " without a date";
    const grid = $("photos"); grid.replaceChildren();
    for (const p of list) grid.append(photoCard(p));
    if (!list.length) grid.append(el("p", { className: "hint", textContent: "No photos match." }));
    updateBulk();
  }

  function photoCard(p) {
    const card = el("div", { className: "photo" + (state.selected.has(p.id) ? " selected" : "") });
    const pick = el("input", { type: "checkbox", className: "pick", checked: state.selected.has(p.id), title: "Select" });
    pick.setAttribute("aria-label", "Select photo");
    pick.addEventListener("change", () => {
      pick.checked ? state.selected.add(p.id) : state.selected.delete(p.id);
      card.classList.toggle("selected", pick.checked); updateBulk();
    });
    const img = el("img", { src: thumb(p.url), alt: p.caption || "Photo", loading: "lazy" });
    img.addEventListener("error", () => { if (!img.dataset.f) { img.dataset.f = 1; img.src = p.url; } });
    const t = el("div", { className: "thumb" }, img, pick);
    if (p.status === "queued") t.append(el("span", { className: "badge", textContent: "In queue" }));

    const saving = el("span", { className: "saving" });
    const cap = el("textarea", { value: p.caption || "", rows: 2, placeholder: "Caption" });
    cap.setAttribute("aria-label", "Caption");
    cap.addEventListener("change", () => patch([p.id], { caption: cap.value }, saving));
    const date = el("input", { type: "date", value: isoDay(p.takenAt) });
    date.setAttribute("aria-label", "Date taken");
    date.addEventListener("change", () => patch([p.id], { takenAt: date.value || null }, saving));
    const src = el("span", {
      className: "src" + (p.takenAt ? "" : " none"),
      textContent: p.takenAt ? SOURCE[p.dateSource] || "Date set" : "No date: grouped by when it was posted",
    });
    const del = el("button", { className: "quiet", type: "button", textContent: "Delete" });
    del.addEventListener("click", async () => {
      if (!confirm("Delete this photo from the site? It stays on Instagram.")) return;
      try { await api("DELETE", "/admin-api/photos/" + p.id); state.photos = state.photos.filter((x) => x.id !== p.id); state.selected.delete(p.id); renderPhotos(); }
      catch (e) { fail("photos-status")(e); }
    });
    const posted = p.publishedAt ? "Posted " + new Date(p.publishedAt).toLocaleDateString() : "Not posted yet";
    const foot = el("div", { className: "foot" }, el("span", { textContent: posted + (p.igStatus === "failed" ? " · Instagram failed" : "") }), del);
    card.append(t, el("div", { className: "body" }, cap, date, src, saving, foot));
    return card;
  }

  async function patch(ids, change, savingEl) {
    if (savingEl) savingEl.textContent = "Saving…";
    try {
      const r = await api("PATCH", "/admin-api/photos", { ids, ...change });
      for (const n of r.photos) { const i = state.photos.findIndex((x) => x.id === n.id); if (i >= 0) state.photos[i] = n; }
      if (savingEl) savingEl.textContent = "Saved";
      if ("takenAt" in change) renderPhotos();
      return true;
    } catch (e) { if (savingEl) savingEl.textContent = e.message; else fail("bulk-status")(e); return false; }
  }

  function updateBulk() {
    const n = state.selected.size;
    $("bulk-apply").disabled = !n || !$("bulk-date").value;
    $("bulk-clear").disabled = !n;
    $("bulk-apply").textContent = n ? "Set date for " + n + " photo" + (n > 1 ? "s" : "") : "Set date";
  }
  $("bulk-date").addEventListener("input", updateBulk);
  $("bulk-clear").addEventListener("click", () => { state.selected.clear(); renderPhotos(); });
  $("bulk-apply").addEventListener("click", async () => {
    const ids = [...state.selected];
    if (await patch(ids, { takenAt: $("bulk-date").value })) { status("bulk-status", "Updated " + ids.length + ".", "ok"); state.selected.clear(); renderPhotos(); }
  });
  $("f-undated").addEventListener("change", renderPhotos);
  $("f-queued").addEventListener("change", renderPhotos);
  $("publish-next").addEventListener("click", async () => {
    try { const r = await api("POST", "/admin-api/photos/publish-next"); status("photos-status", r.published ? "Published the next photo." : "The queue is empty.", "ok"); loadPhotos(); }
    catch (e) { fail("photos-status")(e); }
  });
  $("ig-import").addEventListener("click", async () => {
    status("photos-status", "Checking Instagram…");
    try { const r = await api("POST", "/admin-api/photos/import"); status("photos-status", "Added " + r.imported + " photo" + (r.imported === 1 ? "" : "s") + " from Instagram.", "ok"); loadPhotos(); }
    catch (e) { fail("photos-status")(e); }
  });

  // Converts any image the browser can open (HEIC on Safari, PNG) to a full-size JPEG.
  async function asJpeg(file) {
    if (file.type === "image/jpeg") return file;
    const bmp = await createImageBitmap(file);
    const c = Object.assign(document.createElement("canvas"), { width: bmp.width, height: bmp.height });
    c.getContext("2d").drawImage(bmp, 0, 0);
    return await new Promise((ok, no) => c.toBlob((b) => (b ? ok(b) : no(new Error("Couldn't convert " + file.name))), "image/jpeg", 0.95));
  }

  $("upload").addEventListener("submit", async (e) => {
    e.preventDefault();
    const files = [...$("files").files];
    const q = new URLSearchParams();
    if ($("up-caption").value.trim()) q.set("caption", $("up-caption").value.trim());
    if ($("up-date").value) { q.set("taken", $("up-date").value); q.set("source", "admin"); }
    let done = 0;
    for (const f of files) {
      status("upload-status", "Uploading " + (done + 1) + " of " + files.length + "…");
      try {
        const blob = await asJpeg(f);
        await api("POST", "/photo-api/upload?" + q, blob, true);
        done++;
      } catch (err) { status("upload-status", f.name + ": " + err.message, "error"); return; }
    }
    status("upload-status", "Added " + done + " photo" + (done === 1 ? "" : "s") + " to the queue.", "ok");
    $("upload").reset(); loadPhotos();
  });

  // ---------- links and friends
  async function loadLists() {
    try { const r = await api("GET", "/admin-api/lists"); state.links = r.links; state.friends = r.friends; renderLists(); }
    catch (e) { fail("links-status")(e); }
  }
  function row(keyText, keySmall, href, onDelete, label) {
    const k = el("span", { className: "key" }); if (keySmall) k.append(el("small", { textContent: keySmall })); k.append(keyText);
    const v = el("a", { className: "val", href, textContent: href, target: "_blank", rel: "noopener" });
    const b = el("button", { className: "quiet", type: "button", textContent: "Delete" }); b.setAttribute("aria-label", "Delete " + label); b.addEventListener("click", onDelete);
    return el("li", {}, k, v, b);
  }
  function renderLists() {
    const links = $("links"); links.replaceChildren();
    const names = Object.keys(state.links).sort();
    if (!names.length) links.append(el("li", { className: "hint", textContent: "No short links yet." }));
    for (const n of names) links.append(row(n, "/", state.links[n], () => removeLink(n), "short link " + n));
    const friends = $("friends"); friends.replaceChildren();
    if (!state.friends.length) friends.append(el("li", { className: "hint", textContent: "No friends listed yet." }));
    state.friends.forEach((f, i) => friends.append(row(f.name, "", f.url, () => removeFriend(i), f.name)));
  }
  async function saveLists(part, value, statusId, done) {
    try { const r = await api("PUT", "/admin-api/lists", { [part]: value }); state.links = r.links; state.friends = r.friends; renderLists(); status(statusId, done, "ok"); return true; }
    catch (e) { fail(statusId)(e); return false; }
  }
  async function removeLink(n) { if (!confirm("Delete sunken.fyi/" + n + "?")) return; const next = { ...state.links }; delete next[n]; await saveLists("links", next, "links-status", "Deleted sunken.fyi/" + n + "."); }
  async function removeFriend(i) { const f = state.friends[i]; if (!confirm("Remove " + f.name + "?")) return; await saveLists("friends", state.friends.filter((_, j) => j !== i), "friends-status", "Removed " + f.name + "."); }
  $("add-link").addEventListener("submit", async (e) => {
    e.preventDefault();
    const n = $("link-name").value.trim().toLowerCase().replace(/^\\/+|\\/+$/g, ""), url = $("link-url").value.trim();
    if (state.links[n] && !confirm("sunken.fyi/" + n + " already exists. Replace it?")) return;
    if (await saveLists("links", { ...state.links, [n]: url }, "links-status", "Added sunken.fyi/" + n + ".")) { $("add-link").reset(); $("link-name").focus(); }
  });
  $("add-friend").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = $("friend-name").value.trim(), url = $("friend-url").value.trim();
    if (await saveLists("friends", [...state.friends, { name, url }], "friends-status", "Added " + name + ".")) { $("add-friend").reset(); $("friend-name").focus(); }
  });

  // ---------- backgrounds
  function contrast(hex) {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] + 0.05) / 0.05;
  }
  async function loadBgs() { try { state.bgs = (await api("GET", "/admin-api/backgrounds")).backgrounds; renderBgs(); } catch (e) { fail("bg-status")(e); } }
  function renderBgs() {
    const box = $("bgs"); box.replaceChildren();
    if (!state.bgs.length) box.append(el("p", { className: "hint", textContent: "No backgrounds: the site uses plain grey." }));
    state.bgs.forEach((b, i) => {
      const sw = el("div", { className: "sw" });
      if (b.kind === "color") sw.style.background = b.color;
      else sw.style.backgroundImage = "url(/cdn-cgi/image/width=400,fit=scale-down,format=auto/bg/" + b.id + ".jpg)";
      const sample = el("span", { className: "sample", textContent: "Sample text" });
      sample.style.background = b.kind === "image" ? b.tint + "dd" : "transparent";
      sw.append(sample);
      const on = el("input", { type: "checkbox", checked: b.enabled !== false });
      on.addEventListener("change", () => saveBgs(state.bgs.map((x, j) => (j === i ? { ...x, enabled: on.checked } : x)), on.checked ? "Switched on." : "Switched off."));
      const del = el("button", { className: "quiet", type: "button", textContent: "Delete" });
      del.addEventListener("click", () => { if (confirm("Delete this background?")) saveBgs(state.bgs.filter((_, j) => j !== i), "Deleted."); });
      const label = el("label", {}, on, b.kind === "color" ? b.color : "Photo");
      box.append(el("div", { className: "bg" + (b.enabled === false ? " off" : "") }, sw, el("div", { className: "meta" }, label, del)));
    });
  }
  async function saveBgs(next, msg) {
    try { state.bgs = (await api("PUT", "/admin-api/backgrounds", { backgrounds: next })).backgrounds; renderBgs(); status("bg-status", msg, "ok"); return true; }
    catch (e) { fail("bg-status")(e); return false; }
  }
  function checkColor() {
    const c = contrast($("new-color").value);
    $("color-check").textContent = c >= 7 ? "Text will be easy to read." : "Too dark for the black text; pick something lighter.";
    $("color-check").className = "src" + (c >= 7 ? "" : " none");
  }
  $("new-color").addEventListener("input", checkColor); checkColor();
  function checkTint() {
    const ok = contrast($("bg-tint").value) >= 7;
    $("tint-check").textContent = ok ? "" : "Too dark for the black text; pick something lighter.";
    $("tint-check").className = "src" + (ok ? "" : " none");
  }
  $("bg-tint").addEventListener("input", checkTint);
  $("add-color").addEventListener("submit", (e) => {
    e.preventDefault();
    saveBgs([...state.bgs, { id: "c-" + Math.random().toString(36).slice(2, 8), kind: "color", color: $("new-color").value, enabled: true }], "Added colour.");
  });
  $("add-image").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = $("bg-file").files[0]; if (!f) return;
    status("bg-status", "Uploading…");
    try {
      const { id } = await api("POST", "/admin-api/backgrounds/image", await asJpeg(f), true);
      if (await saveBgs([...state.bgs, { id, kind: "image", tint: $("bg-tint").value, enabled: true }], "Added photo.")) $("add-image").reset();
    } catch (err) { fail("bg-status")(err); }
  });

  // ---------- feeds
  function summary(l, connected) {
    if (!l) return "Not fetched yet.";
    const lines = ["Last refreshed: " + new Date(l.refreshedAt).toLocaleString()];
    lines.push("Films: " + (l.films || []).map((f) => f.title).join(", "));
    lines.push("Reading: " + ((l.books && l.books.reading) || []).map((b) => b.title).join(", "));
    const pl = l.playlist;
    lines.push("Spotify: " + (!connected ? "not connected" : pl && pl.playlists ? (pl.mode === "building" ? "building " : "latest ") + pl.playlists.map((p) => "#" + p.number + " " + p.name).join(", ") + (pl.complete ? "" : " (still scanning older playlists, refresh again)") : "nothing yet"));
    lines.push("Latest post: " + (l.post ? l.post.title + (l.post.excerpt ? " (with excerpt)" : " (no excerpt)") : "none"));
    const errs = Object.entries(l.errors || {});
    if (errs.length) lines.push("", "Problems:", ...errs.map(([k, v]) => "  " + k + ": " + v));
    return lines.join("\\n");
  }
  async function loadFeeds() {
    try { const r = await api("GET", "/admin-api/feeds"); $("feed-summary").textContent = summary(r.lately, r.spotifyConnected); $("spotify-link").textContent = r.spotifyConnected ? "Reconnect Spotify" : "Connect Spotify"; }
    catch (e) { fail("feeds-status")(e); }
  }
  $("refresh").addEventListener("click", async () => {
    status("feeds-status", "Refreshing…"); $("refresh").disabled = true;
    try { const r = await api("POST", "/admin-api/feeds/refresh"); $("feed-summary").textContent = summary(r.lately, true); status("feeds-status", "Done.", "ok"); loadFeeds(); }
    catch (e) { fail("feeds-status")(e); }
    $("refresh").disabled = false;
  });

  // ---------- sign in
  function lock(msg) {
    key = null; store.clear();
    $("app").hidden = true; $("lock").hidden = false;
    if (msg) status("lock-status", msg, "error");
    $("pw").focus();
  }
  async function unlock(candidate, remember) {
    key = candidate;
    try {
      await api("GET", "/admin-api/lists");
      if (remember) store.set(candidate);
      $("lock").hidden = true; $("app").hidden = false;
      let tab = "photos"; try { tab = sessionStorage.getItem("sunken-admin-tab") || tab; } catch {}
      show(tab);
    } catch (e) { lock(e.status === 401 ? "That password isn't right." : e.message); }
  }
  $("lock").addEventListener("submit", (e) => { e.preventDefault(); unlock($("pw").value, $("remember").checked); $("pw").value = ""; });
  $("signout").addEventListener("click", () => lock());
  const saved = store.get();
  if (saved) unlock(saved, true); else lock();
})();
</script>
</body>
</html>`;
