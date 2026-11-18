# Editing the site

Photos, short links, friends, backgrounds and feeds are edited on the site itself. Everything else lives in
this repo, and goes live by itself about 2 minutes after a commit to `nuxt3`.

## sunken.fyi/admin

Open **https://sunken.fyi/admin** on your phone or computer and enter the same
password your photo Shortcut uses (`UPLOAD_KEY`). The tabs:

- **Photos**: add, caption, date, delete; see `PHOTOS.md`.
- **Short links**: `sunken.fyi/cv` → any address.
- **Friends**: the websites "Click here" on the home page picks from.
- **Backgrounds**: which modes a visit can land on (Colour or Photo, picked
  at random each visit), the colours, and extra photos used only as
  backgrounds. Every posted photo is a background too unless you untick "Use
  as a background" on it in the Photos tab. On a photo, the text sits on
  frosted glass tinted with the photo's own colour.
- **Feeds**: see what Letterboxd, Goodreads, Spotify and Substack last
  returned, refresh now, or reconnect Spotify.

Changes are live within a minute.

- Link names can use letters, numbers, dashes and underscores; capitals don't
  matter (`sunken.fyi/CV` works too).
- Names already used by the site (`photos`, `favorites`, `friend`, `admin`, …)
  are refused.
- `links.json` and `friends.json` in the repo were only the starting lists;
  editing them now changes nothing.

## Home page text

Edit [`content/index.md`](https://github.com/nomppy/nomppy.github.io/edit/nuxt3/content/index.md)
for the introduction. The short list of links beside it (Twitter, Curius, …)
is the `elsewhere` list near the top of `pages/index.vue`.

## Feeds that update themselves

Every 3 hours the site refreshes Letterboxd (films rated 4+ or hearted), Goodreads
(currently reading and recently finished, through its public shelf widgets), Spotify (playlists started in the last 3 weeks, up to 3, otherwise the latest 2; numbered in the order you started them)
and Substack (latest post). A feed that fails is retried about every 10 minutes
and the last good version stays up meanwhile. Nothing to do. The usernames are in
`wrangler.jsonc` under `vars`.

Photos: see `PHOTOS.md`.
