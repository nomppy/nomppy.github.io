#!/usr/bin/env bash
# Fills the local (not live) photo storage with a few photos so the photo
# backgrounds can be tried with `yarn dev:worker`. Uses any .jpg files in
# dev-photos/ (not committed), or a couple from public/img otherwise.
set -euo pipefail
cd "$(dirname "$0")/.."
shopt -s nullglob
files=(dev-photos/*.jpg)
[ ${#files[@]} -eq 0 ] && files=(public/img/msu_sunrise.jpg public/img/crowdcam.jpg)

sql="CREATE TABLE IF NOT EXISTS photos (id TEXT PRIMARY KEY, caption TEXT NOT NULL DEFAULT '', width INTEGER, height INTEGER, status TEXT NOT NULL, source TEXT NOT NULL, created_at INTEGER NOT NULL, published_at INTEGER, ig_media_id TEXT UNIQUE, ig_status TEXT, ig_attempts INTEGER NOT NULL DEFAULT 0, ig_error TEXT, taken_at INTEGER, date_source TEXT, bg_use INTEGER NOT NULL DEFAULT 1); DELETE FROM photos WHERE source = 'dev';"
now=$(date +%s)000
for f in "${files[@]}"; do
  id=$(python3 -c "import uuid,sys;print(uuid.uuid5(uuid.NAMESPACE_URL,sys.argv[1]))" "$f")
  read -r w h < <(python3 -c "
import struct,sys
b=open(sys.argv[1],'rb').read();i=2
while i<len(b):
  m=b[i+1];l=struct.unpack('>H',b[i+2:i+4])[0]
  if m in(0xC0,0xC1,0xC2):h,w=struct.unpack('>HH',b[i+5:i+9]);print(w,h);break
  i+=2+l" "$f")
  npx wrangler r2 object put "sunken-photos/photos/$id.jpg" --file "$f" --content-type image/jpeg --local >/dev/null
  sql+=" INSERT INTO photos (id, caption, width, height, status, source, created_at, published_at) VALUES ('$id', '$(basename "$f" .jpg)', $w, $h, 'published', 'dev', $now, $now);"
done
npx wrangler d1 execute sunken-photos --local --command "$sql" >/dev/null
echo "Seeded ${#files[@]} photos into local storage."
