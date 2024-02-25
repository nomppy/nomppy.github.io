<template>
  <main class="center-container">
    <ContentDoc class="center-container">
      
      <template v-slot="{ doc }">
          <div class="meta-block">
            <h1 class="title">
              {{ doc.title || '' }}
            </h1>
    
            <div class="meta-tags-block">
              <span class="meta-tags">
                {{ doc.category }}
              </span>
              <span v-for="tag in doc.tags" :key="tag" class="meta-tags">
                {{ tag }}
              </span>
              <span 
              title="When this data was created, followed by when it was last updated."
              class="meta-tags">
                {{ (doc.start || "Unknown").slice(0, 10) }}&ndash;{{ (doc.end || doc.updatedAt).slice(0, 10) }}
              </span>
              <span 
              v-if="doc.status"
              title="Completion status. Ranges 'notes', 'draft', 'in-progress', 'finished'."
              class="meta-tags">
                {{ doc.status }}
              </span>
              <span
              v-if="doc.confidence"
              title=
              "How confident I am in what I've written. Ranges 'log', 'fiction', '0', 'impossible', 'not believed', 'speculation', 'believed', 'certain'."
              class="meta-tags">
                {{ doc.confidence }}
              </span>
            </div>
    
            <div v-if="doc.description" class="description">
              {{ doc.description }}
            </div>
          </div>
    
          <ContentRenderer class="nuxt-content" :value="doc" /> 
          <!-- <div class="hover-footnote" v-html="currentFootnote" v-show="showingFootnote" /> -->
      </template>
    </ContentDoc>
  </main>
</template>

<script setup lang="ts">
// import $ from 'jquery';
// const { data } = await useAsyncData('posts', () => queryContent('/posts')
//   .where({ id: route.params.id })
//   .findOne()) 

const { path } = useRoute(); 
const cleanPath = path.replace(/\/+$/, ''); 
const { data, error } = await useAsyncData(`content-${cleanPath}`, async () => {

    // Remove a trailing slash in case the browser adds it, it might break the routing   
    // fetch document where the document path matches with the cuurent route    
  let post = await queryContent('/posts').where({ _path: cleanPath }).findOne();    
  // get the surround information,    
  // which is an array of documeents that come before and after the current document    
  return {        
    post: post,        
  };
});

if (data.value) {
  useContentHead(data.value.post);
}
else {
  navigateTo('/404');
}

</script>

// onMounted(() => {
    // Find all footnote references and attach hover events
    // $('sup[id^="fnref"]').on('mouseenter', this.showFootnote.bind(this));
    // window.addEventListener('scroll', this.hideFootnote);
    // $('sup[id^="fnref"]').on('mouseleave', this.hideFootnote.bind(this));

    // Extract footnotes from content and add to footnotes object
    // const footnoteElements = $('.footnotes li');
    // footnoteElements.each((index, element) => {
    //   const id = $(element).attr('id');
    //   const content = $(element).html();
    //   this.footnotes[id] = content;
    // }); 
    
    // setTimeout(() => {
    //   window.Nutshell.start(
    //     document.getElementsByClassName('nuxt-content')[0],
    //   );
    // });
// });

// export default {
//   async asyncData({ $content, params, error }) {

//     const data = await $content('datas', params.id)
//       .fetch()
//       .catch(() => {
//         error({ statusCode: 404 });
//       });

//     return { data };
//   },
//   head() {
//     return {
//       title: this.doc.title,
//       meta: [
//         { hid: 'description', name: 'description', content: this.doc.description },
//         // Open Graph
//         { hid: 'og:title', property: 'og:title', content: this.doc.title },
//         { hid: 'og:description', property: 'og:description', content: this.doc.description },
//         // Twitter Card
//         { hid: 'twitter:title', name: 'twitter:title', content: this.doc.title },
//         { hid: 'twitter:description', name: 'twitter:description', content: this.doc.description }
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
//     // $('sup[id^="fnref"]').on('mouseleave', this.hideFootnote.bind(this));

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
      margin: 0 0.4em;
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
