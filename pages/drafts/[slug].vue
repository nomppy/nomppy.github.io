<template>
  <div>
    <div class="center-container">
      <div class="meta-block">
        <h1 class="title">
          {{ data?.title }}
        </h1>

        <div class="meta-tags-block">
          <span class="meta-tags">
            {{ data?.category }}
          </span>
          <span v-for="tag in data?.tags" :key="tag" class="meta-tags">
            {{ tag }}
          </span>
          <span 
          title="When this data was created, followed by when it was last updated."
          class="meta-tags">
            {{ (data?.start || data?.createdAt).slice(0, 10) }}&ndash;{{ (data?.end || data?.updatedAt).slice(0, 10) }}
          </span>
          <span 
          v-if="data?.status"
          title="Completion status. Ranges 'notes', 'draft', 'in-progress', 'finished'."
          class="meta-tags">
            {{ data.status }}
          </span>
          <span
          v-if="data?.confidence"
          title=
          "How confident I am in what I've written. Ranges 'log', 'fiction', '0', 'impossible', 'not believed', 'speculation', 'believed', 'certain'."
          class="meta-tags">
            {{ data.confidence }}
          </span>
        </div>

        <div v-if="data?.description" class="description">
          {{ data?.description }}
        </div>
      </div>

      <!-- <nuxt-content :document="data" /> -->
      <ContentRenderer :valu="data" />
      <!-- <div class="hover-footnote" v-html="currentFootnote" v-show="showingFootnote" /> -->
    </div>
  </div>
</template>

<script setup lang="ts">
const { data } = await useAsyncData('datas', () => queryContent('/datas')
  .only(['title', 'id', 'category', 'tags', 'start', 'end', 'status', 'confidence', 'description', 'createdAt', 'updatedAt'])
  .sort({ createdAt: 1 })
  .findOne())
// import type { ContentDoc } from '#build/components';

// import $ from 'jquery';

// export default {
//   async asyncData({ $content, params, error }) {

//     const data = await $content('drafts', params.id)
//       .fetch()
//       .catch(() => {
//         error({ statusCode: 404 });
//       });
      
//     return { data };
//   },
//   head() {
//     return {
//       title: this.data.title,
//       meta: [
//         { hid: 'description', name: 'description', content: this.data.description },
//         // Open Graph
//         { hid: 'og:title', property: 'og:title', content: this.data.title },
//         { hid: 'og:description', property: 'og:description', content: this.data.description },
//         // Twitter Card
//         { hid: 'twitter:title', name: 'twitter:title', content: this.data.title },
//         { hid: 'twitter:description', name: 'twitter:description', content: this.data.description }
//       ],
//     };
//   },
//   data() {
//     return {
//       footnotes: {},
//       currentFootnoteId: null,
//       showingFootnote: false
//     };
//   },
//   computed: {
//     currentFootnote() {
//       if (this.currentFootnoteId && this.footnotes[this.currentFootnoteId]) {
//         return this.footnotes[this.currentFootnoteId];
//       } else {
//         return '';
//       }
//     }
//   },
//   mounted() {
//     // Find all footnote references and attach hover events
//     $('sup[id^="fnref"]').on('mouseenter', this.showFootnote.bind(this));
//     window.addEventListener('scroll', this.hideFootnote);

//     // Extract footnotes from content and add to footnotes object
//     const footnoteElements = $('.footnotes li');
//     footnoteElements.each((index, element) => {
//       const id = $(element).attr('id');
//       const content = $(element).html();
//       this.footnotes[id] = content;
//     });

//     setTimeout(() => {
//       window.Nutshell.start(
//         document.getElementsByClassName('nuxt-content')[0],
//       );
//     });
//   },
//   beforeDestroy () {
//     window.removeEventListener('scroll', this.hideFootnote);
//   },
//   methods: {
//     showFootnote(event) {
//       const footnoteId = $(event.target).attr('href').substring(1);

//       if (!this.footnotes[footnoteId]) {
//         return;
//       }

//       this.currentFootnoteId = footnoteId;
//       this.showingFootnote = true;
//     },
//     hideFootnote() {
//       this.currentFootnoteId = null;
//       this.showingFootnote = false;
//     }
//   },
// };
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
