<template>
  <div class="center-container post-categories nuxt-content">

    <p style="grid-column: span 2; font-size: 0.8em;">
      Drafts, not public yet. Thank you for reading them and your feedback will be appreciated :)
    </p>
      
    <!-- create a section for each category-->
    <section 
    :style="'grid-row: span ' + (1+posts.length)"
    class="post-category"
    v-for="(posts, name) in grouped" :key="name">
      <h2>{{ name }}</h2>
      <ul>
        <li v-for="post in posts" :key="post.slug">
          <nuxt-link :to="'/drafts/' + post.slug">{{ post.title }}</nuxt-link>
        </li>
      </ul>
    </section>
  </div>
</template>

<script>
export default {
  async asyncData({ $content }) {

    let posts = await $content('drafts')
      .only(['title', 'slug', 'category', 'updatedAt', 'end'])
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
      title: 'Drafts | Kenneth Sun',
      meta: [
        { hid: 'og:title', property: 'og:title', content: 'Drafts' },
      ],
    };
  },
};
</script>
