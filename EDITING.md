# Editing the site

Short links and friends are edited on the site itself. Everything else lives in
this repo, and goes live by itself about 2 minutes after a commit to `nuxt3`.

## Short links and friends: sunken.fyi/admin

Open **https://sunken.fyi/admin** on your phone or computer and enter the same
password your photo Shortcut uses (`UPLOAD_KEY`). From there you can add or
delete short links (`sunken.fyi/cv` → any address) and the friends the home
page button picks from. Changes are live within a minute.

- Link names can use letters, numbers, dashes and underscores; capitals don't
  matter (`sunken.fyi/CV` works too).
- Names already used by the site (`photos`, `favorites`, `friend`, `admin`, …)
  are refused.
- `links.json` and `friends.json` in the repo were only the starting lists;
  editing them now changes nothing.

## Home page text

Edit [`content/index.md`](https://github.com/nomppy/nomppy.github.io/edit/nuxt3/content/index.md).
The `::lately` line is where the films, books, playlist and latest post appear;
move it or delete it to change that.

## Feeds that update themselves

Every 3 hours the site refreshes Letterboxd (films rated 4+ or hearted), Goodreads
(currently reading, from the public profile: Goodreads only shows finished
books to signed-in visitors), Spotify (the playlist you most recently added to)
and Substack (latest post). A feed that fails is retried about every 10 minutes
and the last good version stays up meanwhile. Nothing to do. The usernames are in
`wrangler.jsonc` under `vars`.

Photos: see `PHOTOS.md`.
