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
      <div class="hover-footnote" v-html="currentFootnote" v-show="showingFootnote" />
    </div>
  </div>
</template>

<script>
import $ from 'jquery';

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
  data() {
    return {
      footnotes: {},
      currentFootnoteId: null,
      showingFootnote: false
    };
  },
  computed: {
    currentFootnote() {
      if (this.currentFootnoteId && this.footnotes[this.currentFootnoteId]) {
        return this.footnotes[this.currentFootnoteId];
      } else {
        return '';
      }
    }
  },
  mounted() {
    // Find all footnote references and attach hover events
    $('sup[id^="fnref"]').on('mouseenter', this.showFootnote.bind(this));
    $('sup[id^="fnref"]').on('mouseleave', this.hideFootnote.bind(this));

    // Extract footnotes from content and add to footnotes object
    const footnoteElements = $('.footnotes li');
    console.log(footnoteElements);
    footnoteElements.each((index, element) => {
      const id = $(element).attr('id');
      const content = $(element).html();
      this.footnotes[id] = content;
    });
  },
  methods: {
    showFootnote(event) {
      const footnoteId = $(event.target).attr('href').substring(1);

      if (!this.footnotes[footnoteId]) {
        return;
      }

      this.currentFootnoteId = footnoteId;
      this.showingFootnote = true;
    },
    hideFootnote() {
      this.currentFootnoteId = null;
      this.showingFootnote = false;
    }
  },
};
</script>

<style src="~/assets/styles/avenir-white.css" />
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