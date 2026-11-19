<template>
  <section v-if="hasAny" class="lately" aria-label="Lately">
    <!-- Films: a strip of posters -->
    <div v-if="films.length" class="tile films">
      <p class="lead">Here are the movies <a href="https://letterboxd.com/sunkht/">I've liked recently</a></p>
      <ul class="posters">
        <li v-for="f in films" :key="f.url">
          <a :href="f.url" :title="`${f.title} (${f.year})`">
            <img v-if="f.poster" :src="f.poster" :alt="`${f.title} (${f.year})`" loading="lazy" />
            <span v-else class="no-art">{{ f.title }}</span>
          </a>
          <span class="verdict" :aria-label="verdictLabel(f)">
            <span v-if="f.rating" class="stars">{{ stars(f.rating) }}</span>
            <span v-if="f.liked" class="heart">♥</span>
          </span>
        </li>
      </ul>
    </div>

    <!-- Spotify: playlists started in the last 3 weeks, or the latest 2 -->
    <div v-if="playlists.length" class="tile playlist">
      <p class="lead">
        {{ spotify.mode === 'building' ? "I'm currently building playlist" : playlists.length > 1 ? 'My latest playlists are' : 'My latest playlist is' }}
        <template v-for="(p, i) in playlists" :key="p.url"
          ><a :href="p.url">{{ p.number ? `#${p.number}` : p.name }}</a
          >{{ joiner(i, playlists.length) }}</template
        >
      </p>
      <div v-for="p in playlists" :key="p.url" class="playlist-body">
        <a :href="p.url" class="cover">
          <img v-if="p.cover" :src="p.cover" :alt="`Cover of ${p.name}`" loading="lazy" />
        </a>
        <div class="playlist-text">
          <a :href="p.url" class="playlist-name">{{ p.name }}</a>
          <p class="aside">{{ songs(p) }}</p>
          <ol class="tracks">
            <li v-for="t in p.tracks" :key="t.url || t.name">
              <a :href="t.url">{{ t.name }}</a>
              <span class="byline">{{ t.artists }}</span>
            </li>
          </ol>
        </div>
      </div>
    </div>

    <!-- Goodreads: covers of what's open now, then what was just finished -->
    <div v-if="books.reading.length || books.read.length" class="tile books">
      <p class="lead">I'm <a href="https://www.goodreads.com/user/show/140748369-kenneth">currently reading</a></p>
      <ul class="covers">
        <li v-for="b in books.reading" :key="b.url">
          <a :href="b.url" :title="`${b.title} by ${b.author}`">
            <img v-if="b.cover" :src="b.cover" :alt="`${b.title} by ${b.author}`" loading="lazy" />
            <span v-else class="no-art">{{ b.title }}</span>
          </a>
        </li>
      </ul>
      <template v-if="books.read.length">
        <p class="lead finished-label">Recently read</p>
        <ul class="covers small">
          <li v-for="b in books.read" :key="b.url">
            <a :href="b.url" :title="`${b.title} by ${b.author}`">
              <img v-if="b.cover" :src="b.cover" :alt="`${b.title} by ${b.author}`" loading="lazy" />
              <span v-else class="no-art">{{ b.title }}</span>
            </a>
          </li>
        </ul>
      </template>
    </div>

    <!-- Substack: latest post as a compact card -->
    <div v-if="post" class="tile post">
      <p class="lead">I also write on <a href="https://sunkht.substack.com">Substack</a>, here's the latest post</p>
      <a :href="post.url" class="post-card">
        <img v-if="post.image" :src="post.image" alt="" loading="lazy" />
        <span class="post-text">
          <span class="post-title">{{ post.title }}</span>
          <span v-if="post.subtitle" class="post-sub">{{ post.subtitle }}</span>
          <span v-if="post.excerpt" class="post-excerpt">{{ post.excerpt }}</span>
          <span class="aside">{{ day(post.date) }}</span>
        </span>
      </a>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const data = ref(null)

onMounted(async () => {
  try {
    const res = await fetch('/feed-api/lately', { cache: 'no-store' })
    if (res.ok) data.value = await res.json()
  } catch {
    // The section simply stays hidden if the feeds can't be reached.
  }
})

const films = computed(() => data.value?.films || [])
const books = computed(() => ({ reading: data.value?.books?.reading || [], read: data.value?.books?.read || [] }))
// Older cached feeds held a single playlist object; newer ones hold { mode, playlists }.
const spotify = computed(() => {
  const p = data.value?.playlist
  if (!p) return { mode: 'building', playlists: [] }
  if (Array.isArray(p.playlists)) return p
  return { mode: 'building', playlists: [p] }
})
const playlists = computed(() => spotify.value.playlists.slice(0, 3))
const joiner = (i, n) => (i < n - 2 ? ', ' : i === n - 2 ? ' and ' : '')
const songs = (p) => `${p.total} songs` + (p.lastAdded ? `, last added ${day(p.lastAdded)}` : '')
const post = computed(() => data.value?.post || null)
const hasAny = computed(
  () => films.value.length || books.value.reading.length || books.value.read.length || playlists.value.length || post.value,
)

const stars = (r) => '★'.repeat(Math.floor(r)) + (r % 1 ? '½' : '')
const verdictLabel = (f) => [f.rating ? `${f.rating} stars` : null, f.liked ? 'liked' : null].filter(Boolean).join(', ')
const day = (d) =>
  d
    ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'America/Los_Angeles' }).format(new Date(d))
    : ''
</script>

<style lang="scss" scoped>
// A mosaic: films and playlist on the first row, books and post on the second.
.lately {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 2.4em 2em;
  font-family: var(--serif-font-stack);
}

.films {
  grid-column: span 7;
}

.playlist {
  grid-column: span 5;
}

.books {
  grid-column: span 5;
}

.post {
  grid-column: span 7;
}

.tile {
  min-width: 0;
}

// Each block opens with a plain sentence in the body font.
.lead {
  margin: 0 0 0.7em;
  font-size: 1.05em;
  line-height: 1.4;
}

a {
  color: var(--link-color);
}

a:focus-visible {
  outline: 2px solid var(--accent-text-color);
  outline-offset: 2px;
}

.aside {
  font-size: 0.8em;
  color: var(--tertiary-text-color);
  margin: 0.3em 0 0;
}

.byline {
  color: var(--tertiary-text-color);
  font-size: 0.85em;
}

.no-art {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0.4em;
  font-size: 0.65em;
  text-align: center;
  color: var(--secondary-text-color);
}

// Films
.posters {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.6em;
  list-style: none;
  padding: 0;
  margin: 0;

  a {
    display: block;
    aspect-ratio: 2 / 3;
    background: var(--secondary-bg-color);
    overflow: hidden;
    border-radius: 3px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.25s ease;
  }

  a:hover img {
    transform: scale(1.04);
  }

  .verdict {
    display: flex;
    justify-content: space-between;
    font-size: 0.7em;
    margin-top: 0.3em;
    min-height: 1.3em;
  }

  .stars {
    color: var(--accent-text-color);
    letter-spacing: -0.05em;
  }

  .heart {
    color: #e0617a;
  }
}

// Playlist
.playlist-body {
  display: grid;
  margin-bottom: 1.2em;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: 1em;
  align-items: start;
}

.cover {
  display: block;
  aspect-ratio: 1;
  background: var(--secondary-bg-color);
  border-radius: 3px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.playlist-name {
  display: block;
  overflow-wrap: anywhere; // long one-word names wrap instead of running out of the panel
  font-weight: bold;
  font-size: 1.15em;
  line-height: 1.2;
  color: var(--primary-text-color);
  text-decoration: none;

  &:hover {
    color: var(--link-hover-color);
  }
}

.tracks {
  list-style: none;
  padding: 0;
  margin: 0.6em 0 0;
  font-size: 0.85em;

  li {
    margin-bottom: 0.35em;
    line-height: 1.25;
  }

  a,
  .byline {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  a {
    color: var(--primary-text-color);
    text-decoration: none;

    &:hover {
      color: var(--link-hover-color);
    }
  }
}

// Books
.covers {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.6em;
  list-style: none;
  padding: 0;
  margin: 0;
  align-items: end;

  a {
    display: block;
    background: var(--secondary-bg-color);
    border-radius: 2px;
    overflow: hidden;
    min-height: 3em;
  }

  img {
    width: 100%;
    display: block;
  }

  &.small {
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 0.4em;
  }
}

.finished-label {
  margin: 1em 0 0.5em;
  font-size: 0.95em;
}

// Substack card
.post-card {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
  border: 1px solid var(--tertiary-bg-color);
  border-radius: 6px;
  overflow: hidden;
  background: var(--secondary-bg-color);
  text-decoration: none;
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--accent-text-color);
  }

  img {
    width: 100%;
    height: 100%;
    min-height: 9em;
    object-fit: cover;
    display: block;
  }

  // Without a cover image the text takes the whole card.
  .post-text:first-child {
    grid-column: 1 / -1;
  }
}

.post-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.3em;
  padding: 1em 1.1em;
  min-width: 0;
}

.post-title {
  overflow-wrap: anywhere;
  font-size: 1.2em;
  font-weight: bold;
  line-height: 1.2;
  color: var(--primary-text-color);
}

.post-sub {
  color: var(--secondary-text-color);
  font-size: 0.9em;
  line-height: 1.35;
  font-style: italic;
}

.post-excerpt {
  font-size: 0.85em;
  line-height: 1.45;
  color: var(--primary-text-color);
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 900px) {
  // One column: twelve columns' worth of gaps is wider than a phone.
  .lately {
    grid-template-columns: minmax(0, 1fr);
  }

  .films,
  .playlist,
  .books,
  .post {
    grid-column: 1 / -1;
  }

  .playlist-body {
    grid-template-columns: minmax(0, 9em) minmax(0, 1fr);
  }

  .covers {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  // Posters become a strip you swipe sideways.
  .posters {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    margin-right: -1.5em;
    padding-right: 1.5em;
    scrollbar-width: none;

    li {
      flex: 0 0 30%;
      scroll-snap-align: start;
    }
  }

  // A smaller cover leaves the track list room to breathe on a phone.
  .playlist-body {
    grid-template-columns: minmax(0, 5.5em) minmax(0, 1fr);
    gap: 0.8em;
  }

  .covers {
    grid-template-columns: repeat(4, minmax(0, 1fr));

    &.small {
      grid-template-columns: repeat(5, minmax(0, 1fr));
    }
  }

  .post-card {
    grid-template-columns: 1fr;

    img {
      aspect-ratio: 16 / 9;
      min-height: 0;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .posters img {
    transition: none;
  }
}
</style>
