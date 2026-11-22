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
2. **Image transformations** (Images → Transformations → `sunken.fyi` →
   Enable). Already on. The gallery and Instagram use resized copies made this
   way; turning it off breaks both.

## Apple Shortcut: "Queue for site"

Build it once on the Mac; it syncs to the iPhone through iCloud.

1. New Shortcut, named **Queue for site**. In its details, turn on
   **Show in Share Sheet** and accept **Images** only.
2. **Repeat with Each** item in *Shortcut Input*:
   1. **Convert Image** to **JPEG**, quality 100%, *Preserve Metadata* **on**.
      No resizing: the original resolution is kept. Keeping metadata keeps the
      photo's orientation; the site removes location data itself.
   2. **Get Contents of URL**: `https://sunken.fyi/photo-api/upload`
      - Method **POST**
      - Header `Authorization` = `Bearer <your UPLOAD_KEY>`
      - Request Body **File** → *Converted Image*
3. **Show Notification**: "Queued".

Optional caption: before *Get Contents of URL*, add **Ask for Input** (text),
then **URL Encode** it and append `?caption=<Encoded Text>` to the URL.

Optional date (recommended): before *Get Contents of URL*, add **Get Details
of Images** → *Date Taken* of *Repeat Item*, then **Format Date** → *ISO 8601*.
In *Get Contents of URL* add a header `X-Taken-At` = *Formatted Date*. Without
it the site still reads the date the camera wrote into the photo, so this only
matters for screenshots and photos saved from other apps.

## Dates

The photos page groups by season of the date a photo was **taken**. The site
picks the first date it has, in this order:

1. A date you set in the admin page ("Date set by you").
2. The Shortcut's `X-Taken-At` header ("Date from your Photos app").
3. The camera's own date inside the photo ("Date from the camera").
4. A date in the caption ("Date read from the caption"): `25.05.14`,
   `2025-05-14`, or a season like `fall '25` (counted as the middle of it).

Photos with none of these are grouped by the day they were posted, and the
admin page lists them under *Only photos without a date*. Instagram posts made
in the app carry no taken date, so they use the caption or need one set.

## Admin page: sunken.fyi/admin → Photos

Everything below can also be done there without the command line: add photos
(any format; the browser converts them to JPEG) with a caption and date, edit
the caption or date of any photo, set one date on several photos at once,
delete, release the next queued photo, and check Instagram for new posts.

The Worker removes GPS location (EXIF, XMP and IPTC) on upload and keeps
everything else, so photos stay full resolution and upright. Instagram gets a
resized copy, since it caps images at 8 MB.

## Day-to-day commands (optional)

Replace `KEY` with your `UPLOAD_KEY`.

```sh
# What's waiting, and any Instagram posts that failed
curl -H "Authorization: Bearer KEY" https://sunken.fyi/photo-api/queue

# Release the next photo now instead of waiting
curl -X POST -H "Authorization: Bearer KEY" https://sunken.fyi/photo-api/publish-now

# Remove a photo (queued or published) by id
curl -X DELETE -H "Authorization: Bearer KEY" https://sunken.fyi/photo-api/photos/<id>
```

## Instagram posts made directly in the app

Every 3 hours the site picks up new posts from `sunk.photos` (up to 15 images
per run; videos are skipped), so posting straight to Instagram also works.
A photo deleted on the site stays deleted: the import remembers its post
(in the `deleted_ig` table) and skips it, even though it's still on Instagram.
To pull them in immediately:

```sh
while true; do
  r=$(curl -s -X POST -H "Authorization: Bearer KEY" https://sunken.fyi/photo-api/import-instagram)
  echo "$r"
  echo "$r" | grep -q '"remaining":0' && break
done
```

## Settings (wrangler.jsonc → vars)

- `PUBLISH_EVERY_DAYS`: days between releases (default 2).
- Photos outside 4:5 to 1.91:1 (the Instagram API's range) are not posted automatically: they get `ig_status = manual` and show "post to Instagram by hand" in the admin panel. When the hand-made post shows up in the Instagram import with the same caption, it is linked to the photo instead of imported again.
- The daily check runs at 17:07 UTC (9:07 Pacific): `triggers.crons`.
