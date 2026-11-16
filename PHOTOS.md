# Photo queue

Share a photo to "Queue for site" on your iPhone or Mac. It waits in a queue,
and once a day the Worker checks whether one is due (every 2 days by default).
When one is due it appears on `/photos/` and is posted to Instagram as
`sunk.photos`.

## One-time setup (Cloudflare dashboard → Workers → sunken-site)

1. **Secrets** (Settings → Variables and Secrets → Add, type *Secret*):
   - `IG_TOKEN`: the Instagram system-user token from the Meta app.
   - `UPLOAD_KEY`: any long random password. Generate one in your password
     manager; the Shortcut sends it with every upload.
2. **Image transformations** (on the `sunken.fyi` zone → Images →
   Transformations → enable). Needed only for photos taller than 4:5, such as
   uncropped iPhone portraits: Instagram rejects those, so the Worker sends it
   a padded version. Without this, those photos still appear on the site but
   their Instagram post fails and is listed in the queue view.

## Apple Shortcut: "Queue for site"

Build it once on the Mac; it syncs to the iPhone through iCloud.

1. New Shortcut, named **Queue for site**. In its details, turn on
   **Show in Share Sheet** and accept **Images** only.
2. **Repeat with Each** item in *Shortcut Input*:
   1. **Resize Image**: width 2048 (height automatic). This also makes the
      rotation permanent.
   2. **Convert Image** to **JPEG**, quality about 90%, *Preserve Metadata*
      off.
   3. **Get Contents of URL**: `https://sunken.fyi/photo-api/upload`
      - Method **POST**
      - Header `Authorization` = `Bearer <your UPLOAD_KEY>`
      - Request Body **File** → *Converted Image*
3. **Show Notification**: "Queued" (optionally include *Contents of URL*).

Optional caption: before *Get Contents of URL*, add **Ask for Input** (text),
then **URL Encode** it and append `?caption=<Encoded Text>` to the URL.

The Worker also strips EXIF/GPS data on upload, as a safety net.

## Day-to-day commands

Replace `KEY` with your `UPLOAD_KEY`.

```sh
# What's waiting, and any Instagram posts that failed
curl -H "Authorization: Bearer KEY" https://sunken.fyi/photo-api/queue

# Release the next photo now instead of waiting
curl -X POST -H "Authorization: Bearer KEY" https://sunken.fyi/photo-api/publish-now

# Remove a photo (queued or published) by id
curl -X DELETE -H "Authorization: Bearer KEY" https://sunken.fyi/photo-api/photos/<id>
```

## One-time import of existing Instagram posts

Imports up to 15 images per call (carousels count each image). Repeat until
`remaining` is 0. Videos are skipped.

```sh
while true; do
  r=$(curl -s -X POST -H "Authorization: Bearer KEY" https://sunken.fyi/photo-api/import-instagram)
  echo "$r"
  echo "$r" | grep -q '"remaining":0' && break
done
```

## Settings (wrangler.jsonc → vars)

- `PUBLISH_EVERY_DAYS`: days between releases (default 2).
- `IG_PAD_COLOR`: border colour for padded tall photos (default white).
- The daily check runs at 17:07 UTC (9:07 Pacific): `triggers.crons`.
