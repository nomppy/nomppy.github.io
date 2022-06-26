<template>
  <div>
    <ul class="site-nav">
      <li>
        <nuxt-link to="/">home</nuxt-link>
      </li>
      <li>
        <nuxt-link to="/about">about</nuxt-link>
      </li>
      <li>
        <nuxt-link to="/contact">contact</nuxt-link>
      </li>
      <li>
        <nuxt-link to="/posts">posts</nuxt-link>
      </li>
    </ul>

    <div class="post-container">
      <div class="meta-block">
        <h1 class="title">
          {{ post.title }}
        </h1>

        <div class="meta-tags-block">
          <span class="meta-tags">
            {{ post.category }}
          </span>
          <span v-for="tag in post.tags" :key="tag" class="meta-tags">
            {{ tag }}
          </span>
          <span 
          title="When this post was created, followed by when it was last updated."
          class="meta-tags">
            {{ (post.start || post.createdAt).slice(0, 10) }}&ndash;{{ (post.end|| post.updatedAt).slice(0, 10) }}
          </span>
          <span 
          title="Completion status. Ranges 'notes', 'draft', 'in-progress', 'finished'."
          class="meta-tags">
            {{ post.status }}
          </span>
          <span
          title=
          "How confident I am that what I've written is correct. Ranges 'log', 'fiction', 'emotional', 'impossible', 'not believed', 'speculation', 'believed', 'certain'."
          class="meta-tags">
            {{ post.confidence }}
          </span>
        </div>

        <div class="description">
          {{ post.description }}
        </div>
      </div>
      {{ post.content }}

      <nuxt-content :document="post" />
      
      <contact class="footer" />
    </div>
  </div>
</template>

<script>

export default {
  async asyncData({ $content, params, redirect }) {

    const post = await $content('posts', params.id)
      .fetch()
      .catch(() => {
        return redirect('/posts');
      });

    return { post };
  },
  head() {
    return {
      title: this.post.title,
      meta: [
        { hid: 'description', name: 'description', content: this.post.description },
        // Open Graph
        { hid: 'og:title', property: 'og:title', content: this.post.title },
        { hid: 'og:description', property: 'og:description', content: this.post.description },
        // Twitter Card
        { hid: 'twitter:title', name: 'twitter:title', content: this.post.title },
        { hid: 'twitter:description', name: 'twitter:description', content: this.post.description }
      ]
    };
  }
};
</script>

<style lang='scss' scoped>
.site-nav {
  padding: 0;
  margin: 20px;
  display: flex;
  justify-content: center;
  font-family: var(--sans-serif-font-stack);

  a {
    text-decoration: none;
    color: var(--primary-text-color);
    font-variant: small-caps;

    &:hover {
      text-decoration-color: var(--link-hover-color);
      text-decoration-line: underline;
      text-decoration-thickness: 3px;
    }
  }

  li {
    margin: 0 5px;
    list-style-type: none;

    &:not(:first-child) a.nuxt-link-active {
      color: var(--accent-text-color);
    }
  }
}

.post-container {
  margin: 0 1.5em;
}
.meta-block {
  box-sizing: border-box;
  font-family: var(--sans-serif-font-stack);
  line-height: 1.5;
  font-size: 0.95;
  color: white;

  .category {
    font-weight: 700;
    color: var(--accent-text-color);
    text-transform: capitalize;
  }

  .meta-tags {
    font-style: italic;
    white-space: nowrap;

    &:not(:last-of-type)::after {
      content: '\00B7';
      font-weight: bold;
      margin: 0 0.3em;
    }
  }

  .description {
    margin-top: 1em;
    margin-bottom: 3em;
    font-style: italic;
    text-align: justify;
  }

  .title {
    text-align: center;
    font-family: var(--serif-font-stack);
    font-weight: 600;
    font-size: 3em;
    font-variant: petite-caps;
    line-height: 1.15;
    margin-bottom: 20px;
  }
}

..footer {
  z-index: 1;
  margin-top: 70px;
  width: 100%;
  position: relative;
  overflow: hidden;
  height: 70px;
  background-color: white;
}

</style>

<style lang='scss'>

.nuxt-content {
    z-index: 2;
    color: var(--primary-text-color);
    font-family: var(--serif-font-stack);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    position: relative;

    p {
      + p {
        text-indent: 2.5em;
      }

      a {
        color: var(--link-color);

        &:hover, &:visited, &:active {
          color: var(--link-hover-color);
        }
      }

      img {
        position: relative;
        max-width: 100%;
        height: auto;
        margin: auto;
        display: block;
      }

      &.img-wrapper {
        width: 140%;
        left: -20%;
        position: relative;
      }
    }

    iframe {
      position: relative;
      height: 30vh;
      width: 100%;
      display: block;
    }

    pre {
      overflow-x: scroll;
    }

    h1, h2 {
      border-bottom: 2px dotted var(--primary-text-color);
      margin-top: 1.5em;
      margin-bottom: 0.8em;

      a::before {
        content: '#';
        cursor: pointer;
        position: absolute;
        left: -25px;
        font-weight: normal;
        color: var(--accent-text-color);
      }
    }

    h3 {
      font-size: 1.2em;
    }
}
</style>
