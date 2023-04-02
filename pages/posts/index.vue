<template>
  <div class="center-container post-categories nuxt-content">
    <!-- create a section for each category-->
    <section 
    class="post-category"
    v-for="(posts, name) in grouped" :key="name">
      <h2 class="category-name">{{ name }}</h2>
      <ul class="category-items">
        <li v-for="post in posts" :key="post.slug">
          <nuxt-link :to="'/posts/' + post.slug">{{ post.title }}</nuxt-link>
          <p class="preview-description">
            {{ post.description }}
          </p>
        </li>
      </ul>
    </section>
  </div>
</template>

<script>
export default {
  async asyncData({ $content }) {

    let posts = await $content('posts')
      .only(['title', 'description', 'slug', 'category', 'updatedAt', 'end'])
      .fetch();
 
    // sort posts in place in descending order by updatedAt, placing posts with no end at the front


    // sort posts in place in descending order by end, placing posts with no end at the front
    posts.sort((a, b) => {
      if (!a.end && !b.end) {
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      } else if (!a.end) {
        return -1;
      } else if (!b.end) {
        return 1;
      } else {
        return new Date(b.end) - new Date(a.end);
      }
    });

    // group posts by category
    const grouped = posts.reduce((acc, post) => {
      if (!acc[post.category]) {
        acc[post.category] = [];
      }
      acc[post.category].push(post);
      return acc;
    }, {});

    return { posts, grouped };
  },
  head() {
    return {
      title: 'Posts | Kenneth Sun',
      meta: [
        { hid: 'og:title', property: 'og:title', content: 'Posts' },
      ],
    };
  },
};
</script>

<style lang='scss' scoped>
.post-category {
  margin-top: 2em;
  margin-bottom: 3em;

  .category-items {
    margin: 1em 0em 0 0;
    padding: 0 0 0 0;
    list-style: none;
  }

  .category-name {
    margin: 0;
    font-size: 1.1em;
    font-variant: small-caps;
    text-transform: capitalize;
  }
  
  .preview-description {
    font-size: 0.75em;
    line-height: 1em;
    color: var(--tertiary-text-color);
  }
}

a {
  color: var(--link-color);

  &:hover, &:visited, &:active {
    color: var(--link-hover-color);
  }
}

@media only screen and (min-width: 961px) {
  .post-categories {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 2em;
    grid-row-gap: 3em;
    padding-top: 2em;

    .post-category {
      margin: 0;
    }
  }

  @media only screen and (max-width: 1040px) {
    .post-categories {
      grid-template-columns: 1fr;
    }
  
    .post-category > ul {
      column-count: 2;
      column-gap: 3em;

      li {
        break-inside: avoid;
      }
    }
  }
}
</style>