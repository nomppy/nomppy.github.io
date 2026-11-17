<template>
  <div class="photo-gallery">

    <p v-if="state === 'loading'" class="status">Loading photos…</p>
    <p v-else-if="state === 'error'" class="status">Photos didn't load. Refresh the page to try again.</p>
    <p v-else-if="!photos.length" class="status">No photos yet.</p>

    <template v-else>
      <section v-for="group in groups" :key="group.label || 'all'" class="group">
        <h2 v-if="group.label" class="group-label">{{ group.label }}</h2>
        <!-- Justified rows: every photo keeps its own shape; rows share a height. -->
        <div class="gallery">
          <a
            v-for="{ photo: p, index } in group.items"
            :key="p.id"
            :href="p.url"
            class="tile"
            :style="tileStyle(p)"
            @click.prevent="open(index)"
          >
            <img
              :src="sized(p.url, 800)"
              :srcset="srcset(p.url, [400, 800, 1200])"
              sizes="(max-width: 600px) 50vw, 33vw"
              :alt="p.caption || 'Photo'"
              :width="p.width"
              :height="p.height"
              loading="lazy"
              decoding="async"
              @error="fallback($event, p.url)"
            />
          </a>
          <span class="filler" aria-hidden="true"></span>
        </div>
      </section>
      <slot name="after" :total="photos.length" :shown="shown.length" />
    </template>

    <dialog ref="viewer" class="viewer" aria-label="Photo viewer" @click.self="close" @close="current = -1">
      <template v-if="photo">
        <button class="close" type="button" aria-label="Close" @click="close">×</button>
        <button class="nav prev" type="button" aria-label="Previous photo" :disabled="current === 0" @click="step(-1)">‹</button>
        <figure @touchstart.passive="touchStart" @touchend.passive="touchEnd">
          <img
            :key="photo.id"
            :src="sized(photo.url, 2400)"
            :srcset="srcset(photo.url, [1200, 2400, 3600])"
            sizes="100vw"
            :alt="photo.caption || 'Photo'"
            :style="viewerSize(photo)"
            @error="fallback($event, photo.url)"
          />
          <figcaption>
            <span v-if="photo.caption" class="caption">{{ photo.caption }}</span>
            <a :href="photo.url" target="_blank" rel="noopener">Full size</a>
          </figcaption>
        </figure>
        <button class="nav next" type="button" aria-label="Next photo" :disabled="current === shown.length - 1" @click="step(1)">›</button>
      </template>
    </dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  // Show only the newest N photos (0 = all).
  limit: { type: Number, default: 0 },
  // Group photos by season and year, e.g. "Fall 2026".
  bySeason: { type: Boolean, default: false },
})

const photos = ref([])
const state = ref('loading')
const current = ref(-1)
const viewer = ref(null)

const when = (p) => p.takenAt || p.publishedAt || 0
const sorted = computed(() => [...photos.value].sort((a, b) => when(b) - when(a)))
const shown = computed(() => (props.limit ? sorted.value.slice(0, props.limit) : sorted.value))
const photo = computed(() => shown.value[current.value])

// Calendar quarters, named by season.
const SEASONS = ['Winter', 'Spring', 'Summer', 'Fall']
const seasonOf = (t) => {
  const d = new Date(t)
  return `${SEASONS[Math.floor(d.getMonth() / 3)]} ${d.getFullYear()}`
}
const groups = computed(() => {
  const items = shown.value.map((photo, index) => ({ photo, index }))
  if (!props.bySeason) return [{ label: null, items }]
  const out = []
  for (const item of items) {
    const label = when(item.photo) ? seasonOf(when(item.photo)) : 'Undated'
    if (!out.length || out[out.length - 1].label !== label) out.push({ label, items: [] })
    out[out.length - 1].items.push(item)
  }
  return out
})

// Resized copies come from Cloudflare image transformations on this domain.
const sized = (url, width) => `/cdn-cgi/image/width=${width},fit=scale-down,quality=85,format=auto${url}`
const srcset = (url, widths) => widths.map((w) => `${sized(url, w)} ${w}w`).join(', ')
const fallback = (event, url) => {
  const img = event.target
  if (img.dataset.fellBack) return
  img.dataset.fellBack = '1'
  img.removeAttribute('srcset')
  img.src = url
}

// Fit the photo to the screen (upscaling small ones) rather than its own pixel size.
const viewerSize = (p) => ({
  '--r': ratio(p),
  aspectRatio: `${ratio(p)}`,
  width: `min(calc(100vw - 7rem), calc((100vh - 6rem) * ${ratio(p)}))`,
})
const ratio = (p) => (p.width && p.height ? p.width / p.height : 1.5)
const tileStyle = (p) => ({ flexGrow: ratio(p), flexBasis: `calc(var(--row) * ${ratio(p)})`, aspectRatio: `${ratio(p)}` })

function open(i) {
  current.value = i
  viewer.value?.showModal()
}
function close() {
  viewer.value?.close()
}
function step(d) {
  const next = current.value + d
  if (next >= 0 && next < shown.value.length) current.value = next
}

function onKey(e) {
  if (current.value < 0) return
  if (e.key === 'ArrowRight') step(1)
  if (e.key === 'ArrowLeft') step(-1)
}

let touchX = null
const touchStart = (e) => { touchX = e.changedTouches[0].clientX }
const touchEnd = (e) => {
  if (touchX === null) return
  const dx = e.changedTouches[0].clientX - touchX
  if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1)
  touchX = null
}

onMounted(async () => {
  window.addEventListener('keydown', onKey)
  try {
    const res = await fetch('/photo-api/photos')
    if (!res.ok) throw new Error(res.status)
    photos.value = await res.json()
    state.value = 'ready'
  } catch {
    state.value = 'error'
  }
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style lang="scss" scoped>
.group + .group {
  margin-top: 2.2em;
}

.group-label {
  font-size: 1.2em;
  font-weight: bold;
  margin: 0 0 0.5em;
}

.status {
  text-align: center;
  color: var(--tertiary-text-color);
}

.gallery {
  --row: 260px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
}

.tile {
  display: block;
  overflow: hidden;
  background: var(--secondary-bg-color);
  cursor: zoom-in;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover; // the tile already has the photo's own ratio, so nothing is cut
    transition: opacity 0.2s;
  }

  &:hover img {
    opacity: 0.88;
  }

  &:focus-visible {
    outline: 3px solid var(--accent-text-color);
    outline-offset: 2px;
  }
}

// Keeps the last row from stretching a lone photo across the page.
.filler {
  flex-grow: 1000;
  flex-basis: 0;
}

@media (max-width: 600px) {
  .gallery {
    --row: 110px;
    gap: 4px;
  }
}

.viewer {
  width: 100vw;
  height: 100vh;
  max-width: none;
  max-height: none;
  margin: 0;
  padding: 0;
  border: 0;
  background: rgba(0, 0, 0, 0.97);
  color: #e8e8e8;

  &[open] {
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fade 0.18s ease-out;
  }

  &::backdrop {
    background: transparent;
  }

  figure {
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: calc(100vw - 7rem);
  }

  img {
    display: block;
    max-width: calc(100vw - 7rem);
    max-height: calc(100vh - 6rem);
    height: auto;
    object-fit: contain;
  }

  figcaption {
    display: flex;
    gap: 1.2em;
    align-items: baseline;
    justify-content: center;
    flex-wrap: wrap;
    padding-top: 0.7em;
    font-size: 0.75em;
    max-width: 40em;
    text-align: center;

    a {
      color: #9fc9ee;
    }
  }

  button {
    color: #e8e8e8;
    font-family: var(--serif-font-stack);
    cursor: pointer;
    border: 0;

    &:focus-visible {
      outline: 2px solid #9fc9ee;
    }

    &:disabled {
      opacity: 0.2;
      cursor: default;
    }
  }

  .close {
    position: fixed;
    top: 0.4rem;
    right: 0.8rem;
    font-size: 2.2rem;
    line-height: 1;
    padding: 0.2rem 0.5rem;
  }

  .nav {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    font-size: 3rem;
    padding: 1rem 0.9rem;

    &:active {
      transform: translateY(-50%) scale(0.92); // keep centred under the site-wide button press effect
    }
  }

  .prev {
    left: 0.2rem;
  }

  .next {
    right: 0.2rem;
  }
}

@media (max-width: 600px) {
  .viewer {
    figure,
    img {
      max-width: 100vw;
    }

    img {
      width: min(100vw, calc((100vh - 6rem) * var(--r, 1))) !important;
    }

    .nav {
      display: none; // swipe instead
    }
  }
}

@keyframes fade {
  from {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .viewer[open] {
    animation: none;
  }
}
</style>
