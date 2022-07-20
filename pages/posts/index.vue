<template>
  <div class="center-container post-categories nuxt-content">
    <!-- create a section for each category-->
    <section 
    class="post-category"
    v-for="(posts, name) in grouped" :key="name">
      <h2>{{ name }}</h2>
      <ul>
        <li v-for="post in posts" :key="post.slug">
          <nuxt-link :to="'/posts/' + post.slug">{{ post.title }}</nuxt-link>
        </li>
      </ul>
    </section>
  </div>
</template>

<script>
export default {
  async asyncData({ $content }) {

    const posts = await $content('posts')
      .only(['title', 'slug', 'category', 'createdAt'])
      .sortBy('updatedAt', 'asc')
      .fetch();
 
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

  > ul {
    margin: 1em 3em 0 0;
    padding: 0 0 0 1.375em;
  }

  > h2 {
    margin: 0;
    font-variant: small-caps;
    text-transform: capitalize;
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