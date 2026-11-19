<template>
  <div id="home">
    <!-- Name, with the places to find me in a row of icons beneath it -->
    <header class="masthead">
      <hero id="hero" />
      <nav class="elsewhere" aria-label="Elsewhere">
        <a v-for="link in elsewhere" :key="link.url" :href="link.url" :title="link.name" :aria-label="link.name">
          <svg viewBox="0 0 24 24" aria-hidden="true" v-html="link.icon" />
        </a>
      </nav>
    </header>

    <div class="top">
      <div class="intro">
        <ContentDoc :head="false" class="nuxt-content" />
        <p class="friend-line"><a href="/friend">Click here</a> to see a person that I like. Scroll down for not-people things.</p>
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

// Letterboxd, Goodreads, Spotify, Substack and Instagram are linked from the
// sections below, so they are not repeated here.
// Icons are Remix Icon (Apache 2.0): ri:twitter-x-fill, ri:mark-pen-fill
// (Curius has no icon of its own; a highlighter, since it's for highlights),
// ri:github-fill and ri:linkedin-box-fill. Admonymous has a line in the intro.
const elsewhere = [
  { name: 'Twitter', url: 'https://x.com/sunkht', icon: "<path fill=\"currentColor\" d=\"M18.205 2.25h3.308l-7.227 8.26l8.502 11.24H16.13l-5.214-6.817L4.95 21.75H1.64l7.73-8.835L1.215 2.25H8.04l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z\"/>" },
  { name: 'Curius', url: 'https://curius.app/kenneth-sun', icon: "<path fill=\"currentColor\" d=\"m15.95 2.39l5.657 5.657a1 1 0 0 1 0 1.414l-7.778 7.778l-2.122.707l-1.414 1.415a1 1 0 0 1-1.414 0l-4.243-4.243a1 1 0 0 1 0-1.414L6.05 12.29l.707-2.122l7.779-7.778a1 1 0 0 1 1.414 0m.707 3.536l-6.364 6.364l1.414 1.414l6.364-6.364zM4.283 16.886l2.828 2.828l-1.414 1.415l-4.243-1.415z\"/>" },
  { name: 'GitHub', url: 'https://github.com/nomppy', icon: "<path fill=\"currentColor\" d=\"M12.001 2c-5.525 0-10 4.475-10 10a9.994 9.994 0 0 0 6.837 9.488c.5.087.688-.213.688-.476c0-.237-.013-1.024-.013-1.862c-2.512.463-3.162-.612-3.362-1.175c-.113-.288-.6-1.175-1.025-1.413c-.35-.187-.85-.65-.013-.662c.788-.013 1.35.725 1.538 1.025c.9 1.512 2.337 1.087 2.912.825c.088-.65.35-1.087.638-1.337c-2.225-.25-4.55-1.113-4.55-4.938c0-1.088.387-1.987 1.025-2.687c-.1-.25-.45-1.275.1-2.65c0 0 .837-.263 2.75 1.024a9.28 9.28 0 0 1 2.5-.337c.85 0 1.7.112 2.5.337c1.913-1.3 2.75-1.024 2.75-1.024c.55 1.375.2 2.4.1 2.65c.637.7 1.025 1.587 1.025 2.687c0 3.838-2.337 4.688-4.562 4.938c.362.312.675.912.675 1.85c0 1.337-.013 2.412-.013 2.75c0 .262.188.574.688.474A10.016 10.016 0 0 0 22 12c0-5.525-4.475-10-10-10\"/>" },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/sunkht/', icon: "<path fill=\"currentColor\" d=\"M18.336 18.339h-2.665v-4.177c0-.996-.02-2.278-1.39-2.278c-1.389 0-1.601 1.084-1.601 2.205v4.25h-2.666V9.75h2.56v1.17h.035c.358-.674 1.228-1.387 2.528-1.387c2.7 0 3.2 1.778 3.2 4.092v4.714zM7.004 8.575a1.546 1.546 0 0 1-1.548-1.549a1.548 1.548 0 1 1 1.547 1.549m1.336 9.764H5.667V9.75H8.34zM19.67 3H4.33C3.594 3 3 3.58 3 4.297v15.406C3 20.42 3.594 21 4.328 21h15.339C20.4 21 21 20.42 21 19.703V4.297C21 3.581 20.4 3 19.666 3z\"/>" },
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

  svg {
    width: 1.35em;
    height: 1.35em;
    display: block;
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
