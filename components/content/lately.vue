<template>
  <section v-if="hasAny" class="lately" aria-labelledby="lately-title">
    <h2 id="lately-title">lately</h2>

    <dl>
      <div v-if="films.length" class="row">
        <dt>watching</dt>
        <dd>
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
        </dd>
      </div>

      <div v-if="books.reading.length || books.read.length" class="row">
        <dt>reading</dt>
        <dd>
          <a v-for="b in books.reading" :key="b.url" :href="b.url" class="book">
            <img v-if="b.cover" :src="b.cover" alt="" loading="lazy" />
            <span>
              <span class="book-title">{{ b.title }}</span>
              <span class="byline">{{ b.author }}</span>
            </span>
          </a>
          <p v-if="books.read.length" class="aside">
            Finished lately:
            <template v-for="(b, i) in books.read" :key="b.url">
              <a :href="b.url">{{ shortTitle(b.title) }}</a><span v-if="b.rating" class="stars small"> {{ stars(b.rating) }}</span><span v-if="i < books.read.length - 1">, </span>
            </template>
          </p>
        </dd>
      </div>

      <div v-if="playlist" class="row">
        <dt>listening</dt>
        <dd class="playlist">
          <a :href="playlist.url" class="cover">
            <img v-if="playlist.cover" :src="playlist.cover" alt="" loading="lazy" />
          </a>
          <div>
            <a :href="playlist.url" class="playlist-name">{{ playlist.name }}</a>
            <p class="aside">
              {{ playlist.total }} songs<span v-if="playlist.lastAdded">, last added {{ day(playlist.lastAdded) }}</span>
            </p>
            <ol class="tracks">
              <li v-for="t in playlist.tracks" :key="t.url || t.name">
                <a :href="t.url">{{ t.name }}</a> <span class="byline">{{ t.artists }}</span>
              </li>
            </ol>
          </div>
        </dd>
      </div>

      <div v-if="post" class="row">
        <dt>writing</dt>
        <dd>
          <a :href="post.url" class="post-title">{{ post.title }}</a>
          <p v-if="post.subtitle" class="post-sub">{{ post.subtitle }}</p>
          <p class="aside">{{ day(post.date) }} on <a href="https://sunkht.substack.com">Substack</a></p>
        </dd>
      </div>
    </dl>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const data = ref(null)

onMounted(async () => {
  try {
    const res = await fetch('/feed-api/lately')
    if (res.ok) data.value = await res.json()
  } catch {
    // The section simply stays hidden if the feeds can't be reached.
  }
})

const films = computed(() => data.value?.films || [])
const books = computed(() => data.value?.books || { reading: [], read: [] })
const playlist = computed(() => data.value?.playlist || null)
const post = computed(() => data.value?.post || null)
const hasAny = computed(
  () => films.value.length || books.value.reading.length || books.value.read.length || playlist.value || post.value,
)

const stars = (r) => '★'.repeat(Math.floor(r)) + (r % 1 ? '½' : '')
const verdictLabel = (f) => [f.rating ? `${f.rating} stars` : null, f.liked ? 'liked' : null].filter(Boolean).join(', ')
const shortTitle = (t) => t.replace(/\s*[:(].*$/, '')
const day = (d) =>
  d
    ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'America/Los_Angeles' }).format(new Date(d))
    : ''
</script>

<style lang="scss" scoped>
.lately {
  margin: 1.5em 0 1em;

  // Undo the general Markdown image rules this component sits inside.
  img {
    max-width: none;
    margin: 0;
    position: static;
  }

  font-family: var(--serif-font-stack);

  h2 {
    font-variant: small-caps;
    font-size: 1.5em;
    letter-spacing: 0.04em;
    border-bottom: 2px solid var(--tertiary-text-color);
    margin-bottom: 0.9em;
  }
}

dl {
  display: grid;
  gap: 1.6em;
}

// Label in the margin, content beside it; stacked on narrow screens.
.row {
  display: grid;
  grid-template-columns: 6.5em 1fr;
  column-gap: 1em;
  align-items: start;
}

dt {
  font-variant: small-caps;
  font-weight: bold;
  color: var(--tertiary-text-color);
  letter-spacing: 0.03em;
  padding-top: 0.05em;
}

dd {
  margin: 0;
  min-width: 0;
}

a {
  color: var(--link-color);
}

.aside {
  font-size: 0.8em;
  color: var(--tertiary-text-color);
  margin: 0.35em 0 0;
}

.byline {
  color: var(--tertiary-text-color);
  font-size: 0.85em;
}

.stars {
  color: var(--accent-text-color);
  letter-spacing: -0.05em;

  &.small {
    font-size: 0.85em;
  }
}

// Films: posters at their real 2:3 shape, verdict underneath.
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
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
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

  .verdict {
    display: flex;
    justify-content: space-between;
    font-size: 0.7em;
    margin-top: 0.25em;
    min-height: 1.3em;
  }

  .heart {
    color: #e0617a;
  }
}

// Books: cover beside title and author.
.book {
  display: flex;
  gap: 0.8em;
  align-items: center;
  text-decoration: none;
  margin-bottom: 0.6em;

  img {
    width: 3.2em;
    border-radius: 2px;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
  }

  > span {
    display: flex;
    flex-direction: column;
  }

  .book-title {
    color: var(--primary-text-color);
    font-weight: bold;
    line-height: 1.25;
  }

  &:hover .book-title {
    color: var(--link-hover-color);
  }
}

// Playlist: square cover, name, most recent additions.
.playlist {
  display: flex;
  gap: 1em;
  align-items: flex-start;

  .cover {
    flex: 0 0 6em;
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

  > div {
    min-width: 0;
  }
}

.playlist-name {
  font-weight: bold;
  font-size: 1.1em;
  color: var(--primary-text-color);
  text-decoration: none;

  &:hover {
    color: var(--link-hover-color);
  }
}

.tracks {
  list-style: none;
  padding: 0;
  margin: 0.5em 0 0;
  font-size: 0.85em;

  li {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.post-title {
  font-size: 1.2em;
  font-weight: bold;
  line-height: 1.25;
  color: var(--primary-text-color);
  text-decoration-color: var(--accent-text-color);
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;

  &:hover {
    color: var(--link-hover-color);
  }
}

.post-sub {
  margin: 0.3em 0 0;
  color: var(--secondary-text-color);
  font-size: 0.9em;
}

a:focus-visible {
  outline: 2px solid var(--accent-text-color);
  outline-offset: 2px;
}

@media (max-width: 560px) {
  .row {
    grid-template-columns: 1fr;
    row-gap: 0.4em;
  }

  .posters {
    grid-template-columns: repeat(4, minmax(0, 1fr));

    li:nth-child(5) {
      display: none;
    }
  }
}
</style>
