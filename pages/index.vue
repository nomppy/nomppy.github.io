<template>
  <div id="home">
    <!-- Name, with the places to find me in a row of icons beneath it -->
    <header class="masthead">
      <hero id="hero" />
      <nav class="elsewhere" aria-label="Elsewhere">
        <a v-for="link in elsewhere" :key="link.url" :href="link.url" :title="link.name" :aria-label="link.name">
          <img v-if="link.image" :src="link.image" alt="" />
          <svg v-else viewBox="0 0 24 24" aria-hidden="true" v-html="link.icon" />
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

// Logos are Simple Icons (CC0), except Curius, which isn't in it: its own
// favicon, kept in public/icons/curius.png. Admonymous has a line in the intro.
const elsewhere = [
  { name: 'Twitter', url: 'https://x.com/sunkht', icon: "<path fill=\"currentColor\" d=\"M14.234 10.162L22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299l-.929-1.329L3.076 1.56h3.182l5.965 8.532l.929 1.329l7.754 11.09h-3.182z\"/>" },
  { name: 'Curius', url: 'https://curius.app/kenneth-sun', image: '/icons/curius.png' },
  { name: 'GitHub', url: 'https://github.com/nomppy', icon: "<path fill=\"currentColor\" d=\"M12 .297c-6.63 0-12 5.373-12 12c0 5.303 3.438 9.8 8.205 11.385c.6.113.82-.258.82-.577c0-.285-.01-1.04-.015-2.04c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729c1.205.084 1.838 1.236 1.838 1.236c1.07 1.835 2.809 1.305 3.495.998c.108-.776.417-1.305.76-1.605c-2.665-.3-5.466-1.332-5.466-5.93c0-1.31.465-2.38 1.235-3.22c-.135-.303-.54-1.523.105-3.176c0 0 1.005-.322 3.3 1.23c.96-.267 1.98-.399 3-.405c1.02.006 2.04.138 3 .405c2.28-1.552 3.285-1.23 3.285-1.23c.645 1.653.24 2.873.12 3.176c.765.84 1.23 1.91 1.23 3.22c0 4.61-2.805 5.625-5.475 5.92c.42.36.81 1.096.81 2.22c0 1.606-.015 2.896-.015 3.286c0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12\"/>" },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/sunkht/', icon: "<path fill=\"currentColor\" d=\"M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037c-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85c3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.06 2.06 0 0 1-2.063-2.065a2.064 2.064 0 1 1 2.063 2.065m1.782 13.019H3.555V9h3.564zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z\"/>" },
  { name: 'Substack', url: 'https://sunkht.substack.com/', icon: "<path fill=\"currentColor\" d=\"M22.539 8.242H1.46V5.406h21.08zM1.46 10.812V24L12 18.11L22.54 24V10.812zM22.54 0H1.46v2.836h21.08z\"/>" },
  { name: 'Instagram', url: 'https://www.instagram.com/sunk.photos/', icon: "<path fill=\"currentColor\" d=\"M7.03.084c-1.277.06-2.149.264-2.91.563a5.9 5.9 0 0 0-2.124 1.388a5.9 5.9 0 0 0-1.38 2.127C.321 4.926.12 5.8.064 7.076s-.069 1.688-.063 4.947s.021 3.667.083 4.947c.061 1.277.264 2.149.563 2.911c.308.789.72 1.457 1.388 2.123a5.9 5.9 0 0 0 2.129 1.38c.763.295 1.636.496 2.913.552c1.278.056 1.689.069 4.947.063s3.668-.021 4.947-.082c1.28-.06 2.147-.265 2.91-.563a5.9 5.9 0 0 0 2.123-1.388a5.9 5.9 0 0 0 1.38-2.129c.295-.763.496-1.636.551-2.912c.056-1.28.07-1.69.063-4.948c-.006-3.258-.02-3.667-.081-4.947c-.06-1.28-.264-2.148-.564-2.911a5.9 5.9 0 0 0-1.387-2.123a5.9 5.9 0 0 0-2.128-1.38c-.764-.294-1.636-.496-2.914-.55C15.647.009 15.236-.006 11.977 0S8.31.021 7.03.084m.14 21.693c-1.17-.05-1.805-.245-2.228-.408a3.7 3.7 0 0 1-1.382-.895a3.7 3.7 0 0 1-.9-1.378c-.165-.423-.363-1.058-.417-2.228c-.06-1.264-.072-1.644-.08-4.848c-.006-3.204.006-3.583.061-4.848c.05-1.169.246-1.805.408-2.228c.216-.561.477-.96.895-1.382a3.7 3.7 0 0 1 1.379-.9c.423-.165 1.057-.361 2.227-.417c1.265-.06 1.644-.072 4.848-.08c3.203-.006 3.583.006 4.85.062c1.168.05 1.804.244 2.227.408c.56.216.96.475 1.382.895s.681.817.9 1.378c.165.422.362 1.056.417 2.227c.06 1.265.074 1.645.08 4.848c.005 3.203-.006 3.583-.061 4.848c-.051 1.17-.245 1.805-.408 2.23c-.216.56-.477.96-.896 1.38a3.7 3.7 0 0 1-1.378.9c-.422.165-1.058.362-2.226.418c-1.266.06-1.645.072-4.85.079s-3.582-.006-4.848-.06m9.783-16.192a1.44 1.44 0 1 0 1.437-1.442a1.44 1.44 0 0 0-1.437 1.442M5.839 12.012a6.161 6.161 0 1 0 12.323-.024a6.162 6.162 0 0 0-12.323.024M8 12.008A4 4 0 1 1 12.008 16A4 4 0 0 1 8 12.008\"/>" },
  { name: 'Goodreads', url: 'https://www.goodreads.com/user/show/140748369-kenneth', icon: "<path fill=\"currentColor\" d=\"M17.346.026c.422-.083.859.037 1.179.325c.346.284.55.705.557 1.153c-.023.457-.247.88-.612 1.156l-2.182 1.748a.6.6 0 0 0-.255.43a.52.52 0 0 0 .11.424a5.89 5.89 0 0 1 .832 6.58c-1.394 2.79-4.503 3.99-7.501 2.927a.8.8 0 0 0-.499-.01c-.224.07-.303.18-.453.383l-.014.02l-.941 1.254s-.792.985.457.935c3.027-.119 3.817-.119 5.439-.01c2.641.18 3.806 1.903 3.806 3.275c0 1.623-1.036 3.383-3.809 3.383a118 118 0 0 0-5.517-.03c-.31.005-.597.013-.835.02c-.228.006-.41.011-.52.011c-.712 0-1.648-.186-1.66-1.068c-.008-.729.624-1.12 1.11-1.172c.43-.045.815.007 1.24.064c.252.034.518.07.815.088c.185.011.366.025.552.038c.53.038 1.102.08 1.926.087c.427.005.759.01 1.025.015c.695.012.941.016 1.28-.015c1.248-.112 1.832-.61 1.832-1.376c0-.805-.584-1.264-1.698-1.414c-1.564-.213-2.33-.163-3.72-.074a88 88 0 0 1-1.669.095c-.608.029-2.449.026-2.682-1.492c-.053-.416-.073-1.116.807-2.325l.75-1.003c.36-.49.582-.898.053-1.559c0 0-.39-.468-.52-.638c-1.215-1.587-1.512-4.08-.448-6.114c1.577-3.011 5.4-4.26 8.37-2.581c.253.143.438.203.655.163c.201-.032.27-.167.363-.344q.03-.06.067-.126c.004-.01.241-.465.535-1.028l.734-1.41a1.5 1.5 0 0 1 1.041-.785M9.193 13.243c1.854.903 3.912.208 5.254-2.47c1.352-2.699.827-5.11-1.041-6.023c-2.488-1.213-4.596 1.081-5.389 2.66c-1.355 2.698-.717 4.886 1.147 5.818Z\"/>" },
  { name: 'Letterboxd', url: 'https://letterboxd.com/sunkht/', icon: "<path fill=\"currentColor\" d=\"M8.224 14.352a4.45 4.45 0 0 1-3.775 2.092C1.992 16.444 0 14.454 0 12s1.992-4.444 4.45-4.444c1.592 0 2.988.836 3.774 2.092c-.427.682-.673 1.488-.673 2.352s.246 1.67.673 2.352M15.101 12c0-.864.247-1.67.674-2.352c-.786-1.256-2.183-2.092-3.775-2.092s-2.989.836-3.775 2.092c.427.682.674 1.488.674 2.352s-.247 1.67-.674 2.352c.786 1.256 2.183 2.092 3.775 2.092s2.989-.836 3.775-2.092A4.4 4.4 0 0 1 15.1 12zm4.45-4.444a4.45 4.45 0 0 0-3.775 2.092c.427.682.673 1.488.673 2.352s-.246 1.67-.673 2.352a4.45 4.45 0 0 0 3.775 2.092C22.008 16.444 24 14.454 24 12s-1.992-4.444-4.45-4.444z\"/>" },
  { name: 'Spotify', url: 'https://open.spotify.com/user/tbkwdf650gvc7vlikkdmoj1k1', icon: "<path fill=\"currentColor\" d=\"M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12s12-5.4 12-12S18.66 0 12 0m5.521 17.34c-.24.359-.66.48-1.021.24c-2.82-1.74-6.36-2.101-10.561-1.141c-.418.122-.779-.179-.899-.539c-.12-.421.18-.78.54-.9c4.56-1.021 8.52-.6 11.64 1.32c.42.18.479.659.301 1.02m1.44-3.3c-.301.42-.841.6-1.262.3c-3.239-1.98-8.159-2.58-11.939-1.38c-.479.12-1.02-.12-1.14-.6s.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2m.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721c-.18-.601.18-1.2.72-1.381c4.26-1.26 11.28-1.02 15.721 1.621c.539.3.719 1.02.419 1.56c-.299.421-1.02.599-1.559.3\"/>" },
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

  svg,
  img {
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
  // Nine icons fit on one line on a phone.
  .elsewhere {
    gap: 0.3em 0.35em;

    a {
      padding: 0.15em;
    }

    svg,
    img {
      width: 1.2em;
      height: 1.2em;
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
