<template>
  <div id="home">
    <hero id="hero" />

    <!-- Intro beside a short list of places not already shown below -->
    <div class="top">
      <div class="intro">
        <ContentDoc :head="false" class="nuxt-content" />
        <p class="friend-line"><a href="/friend">Click here</a> to go to the website of someone who I like.</p>
      </div>

      <nav class="elsewhere" aria-label="Elsewhere">
        <a v-for="link in elsewhere" :key="link.url" :href="link.url">{{ link.name }}</a>
      </nav>
    </div>

    <lately />

    <section class="photos" aria-labelledby="recent-photos">
      <p id="recent-photos" class="lead">Recent photos</p>
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

// Letterboxd, Goodreads, Spotify, Substack and Instagram are linked from the
// sections below, so they are not repeated here.
const elsewhere = [
  { name: 'Twitter', url: 'https://x.com/sunkht' },
  { name: 'Curius', url: 'https://curius.app/kenneth-sun' },
  { name: 'GitHub', url: 'https://github.com/nomppy' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/sunkht/' },
  { name: 'Admonymous', url: 'https://www.admonymous.co/sunk' },
];
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
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 2em 4em;
  align-items: start;
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
  margin: 0;
}

.elsewhere {
  display: flex;
  flex-direction: column;
  gap: 0.15em;
  padding-left: 1.2em;
  border-left: 2px solid var(--tertiary-text-color);
  font-variant: small-caps;
  letter-spacing: 0.04em;

  a {
    color: var(--primary-text-color);
    text-decoration: none;

    &:hover,
    &:focus-visible {
      color: var(--link-hover-color);
      text-decoration: underline;
      text-decoration-color: var(--accent-text-color);
      text-decoration-thickness: 2px;
    }
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
  .top {
    grid-template-columns: 1fr;
    margin-bottom: 2.2em;
  }

  .intro {
    font-size: 1em;
  }

  // The list becomes one wrapping line of links.
  .elsewhere {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.2em 1.1em;
    padding: 0.6em 0 0;
    border-left: 0;
    border-top: 2px solid var(--tertiary-text-color);
  }
}

@media (max-width: 380px) {
  #home {
    padding: 0 0.75em;
  }
}
</style>
