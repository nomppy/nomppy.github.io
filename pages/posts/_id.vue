<template>
  <div>
    <div class="center-container">
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
            {{ (post.start || post.createdAt).slice(0, 10) }}&ndash;{{ (post.end || post.updatedAt).slice(0, 10) }}
          </span>
          <span 
          v-if="post.status"
          title="Completion status. Ranges 'notes', 'draft', 'in-progress', 'finished'."
          class="meta-tags">
            {{ post.status }}
          </span>
          <span
          v-if="post.confidence"
          title=
          "How confident I am in what I've written. Ranges 'log', 'fiction', '0', 'impossible', 'not believed', 'speculation', 'believed', 'certain'."
          class="meta-tags">
            {{ post.confidence }}
          </span>
        </div>

        <div v-if="post.description" class="description">
          {{ post.description }}
        </div>
      </div>

      <nuxt-content :document="post" />
    </div>
  </div>
</template>

<script>

export default {
  async asyncData({ $content, params, error }) {

    const post = await $content('posts', params.id)
      .fetch()
      .catch(() => {
        error({ statusCode: 404 });
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
      ],
      link: [
        { rel: 'stylesheet', href: '~/assets/styles/avenir-white.css' },
      ],
    };
  },
  css: [
  ]
};
</script>
<style lang='scss' scoped>
.meta-block {
  box-sizing: border-box;
  font-family: var(--sans-serif-font-stack);
  line-height: 1.5;
  color: var(--secondary-text-color);
  margin-bottom: 3em;

  .meta-tags {
    font-style: italic;
    white-space: nowrap;
    font-size: 0.9em;

    &:not(:last-of-type)::after {
      content: '\00B7';
      font-weight: bold;
      margin: 0 0.3em;
    }
  }

  .description {
    font-size: 0.9em;
    margin-top: 1em;
    margin-bottom: 3em;
    font-style: italic;
    text-align: justify;
  }
}
</style>