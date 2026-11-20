<template>
  <div id="home">
    <!-- Name, with the places to find me in a row of icons beneath it -->
    <header class="masthead">
      <hero id="hero" />
      <nav class="elsewhere" aria-label="Elsewhere">
        <a v-for="link in elsewhere" :key="link.url" :href="link.url" :title="link.name" :aria-label="link.name">
          <img :src="logoSrc(link.logo)" alt="" width="48" height="48" loading="eager" @error="logoFallback($event, link.logo)" />
        </a>
      </nav>
    </header>

    <div class="top">
      <div class="intro">
        <ContentDoc :head="false" class="nuxt-content" />
        <p class="friend-line"><a href="/friend">Click here</a> to see a person that I like, or scroll down for not-people things.</p>
        <p class="admonymous-line">Feel free to share any thoughts (for this website or for me) in my <a href="https://www.admonymous.co/sunk">Admonymous</a>.</p>
      </div>
    </div>

    <lately />

    <section class="photos" aria-labelledby="recent-photos">
      <p id="recent-photos" class="lead">Recent photos · also on <a href="https://www.instagram.com/sunk.photos/">instagram</a></p>
      <photo-gallery :limit="8">
        <template #after="{ total, shown }">
          <a v-if="total > shown" href="/photos/" class="see-more">See all {{ total }} photos</a>
        </template>
      </photo-gallery>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: '',
});

// Each site's own app icon, served from /logos/<name> (worker/logos.js keeps
// a copy in R2). Shown through Cloudflare's resizer at 96px; if that fails
// (an .ico, say) the original is used. Admonymous has a line in the intro.
const elsewhere = [
  { name: 'Twitter', url: 'https://x.com/sunkht', logo: 'x' },
  { name: 'Curius', url: 'https://curius.app/kenneth-sun', logo: 'curius' },
  { name: 'GitHub', url: 'https://github.com/nomppy', logo: 'github' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/sunkht/', logo: 'linkedin' },
  { name: 'Substack', url: 'https://sunkht.substack.com/', logo: 'substack' },
  { name: 'Instagram', url: 'https://www.instagram.com/sunk.photos/', logo: 'instagram' },
  { name: 'Goodreads', url: 'https://www.goodreads.com/user/show/140748369-kenneth', logo: 'goodreads' },
  { name: 'Letterboxd', url: 'https://letterboxd.com/sunkht/', logo: 'letterboxd' },
  { name: 'Spotify', url: 'https://open.spotify.com/user/tbkwdf650gvc7vlikkdmoj1k1', logo: 'spotify' },
];

const logoSrc = (name: string) => `/cdn-cgi/image/width=96,format=auto/logos/${name}`;
function logoFallback(e: Event, name: string) {
  const img = e.target as HTMLImageElement;
  if (img.src.includes('/cdn-cgi/')) img.src = `/logos/${name}`; // only once
}
</script>

<style lang="scss" scoped>
#home {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 1.5em;
}

#hero {
  position: relative;
  width: 100%;
}

.top {
  margin: 1em 0 3em;
}

.intro {
  max-width: 34em;
  font-size: 1.1em;

  :deep(.nuxt-content) {
    padding-bottom: 0.4em;
  }
}

.friend-line {
  margin: 0 0 1em;
}

.admonymous-line {
  margin: 0;
}

// A row of icons centred under the name.
.elsewhere {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.3em 1.1em;
  margin: 0.3em 0 0.2em;

  a {
    display: flex;
    padding: 0.2em;
    color: var(--primary-text-color);
    border-radius: 6px;
    transition: color 0.15s, transform 0.15s;

    &:hover,
    &:focus-visible {
      color: var(--link-hover-color);
      transform: translateY(-2px);
    }

    &:focus-visible {
      outline: 2px solid var(--accent-text-color);
      outline-offset: 2px;
    }
  }

  img {
    width: 1.08em;
    height: 1.08em;
    display: block;
    border-radius: 22%; // app-icon corners
    object-fit: contain;
  }
}

.photos {
  margin: 3.5em 0 4em;
}

// Section intros read as ordinary sentences, slightly emphasised.
.lead {
  margin: 0 0 0.7em;
  font-size: 1.05em;
}

.see-more {
  display: inline-block;
  margin-top: 1em;
  padding: 0.35em 1em;
  border: 2px solid var(--accent-text-color);
  border-radius: 999px;
  font-weight: bold;
  text-decoration: none;
  color: var(--primary-text-color);

  &:hover,
  &:focus-visible {
    background: var(--accent-text-color);
    color: var(--white);
  }
}

// Leave room for the side navigation, which is fixed on wide screens.
@media (min-width: 1070px) {
  #home {
    padding-left: 190px;
    padding-right: 2.5em;
  }
}

@media (max-width: 700px) {
  // Nine logos fit on one line on a phone.
  .elsewhere {
    gap: 0.3em 0.35em;

    a {
      padding: 0.15em;
    }

    img {
      width: 0.96em;
      height: 0.96em;
    }
  }

  .top {
    margin-bottom: 2.2em;
  }

  .intro {
    font-size: 1em;
  }
}

@media (max-width: 380px) {
  #home {
    padding: 0 0.75em;
  }
}
</style>
