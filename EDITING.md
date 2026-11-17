# Editing the site

Every change below goes live by itself about 2 minutes after you commit it:
Cloudflare rebuilds the site from the `nuxt3` branch.

## Short links (`sunken.fyi/<name>`)

Edit [`links.json`](https://github.com/nomppy/nomppy.github.io/edit/nuxt3/links.json)
on GitHub, then **Commit changes**. Each line is `"name": "where it goes"`:

```json
{
  "cv": "https://example.com/my-cv.pdf",
  "ig": "https://www.instagram.com/sunk.photos"
}
```

- Names are case-insensitive: `sunken.fyi/CV` works too.
- Don't reuse a page name: `favorites`, `photos`, `posts`, `news`, `drafts`,
  `friend`.
- Remember the comma between lines, and none after the last one. If the JSON is
  broken the build fails and the live site simply stays as it was.

## Friends (`sunken.fyi/friend`)

Edit [`friends.json`](https://github.com/nomppy/nomppy.github.io/edit/nuxt3/friends.json)
and add a line in the same shape as the others:

```json
  { "name": "Name", "url": "https://their-site.com" }
```

The home page button sends visitors to one of these at random.

## Home page text

Edit [`content/index.md`](https://github.com/nomppy/nomppy.github.io/edit/nuxt3/content/index.md).
The `::lately` line is where the films, books, playlist and latest post appear;
move it or delete it to change that.

## Feeds that update themselves

Every 3 hours the site refreshes Letterboxd (films rated 4+ or hearted), Goodreads
(currently reading and recently finished), Spotify (the playlist you most recently
added to) and Substack (latest post). Nothing to do. The usernames are in
`wrangler.jsonc` under `vars`.

Photos: see `PHOTOS.md`.
