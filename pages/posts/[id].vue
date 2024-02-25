<template>
  <main class="center-container">
    <ContentDoc class="center-container">
      <template #not-found>
        <not-found />
      </template>
      
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
          <div class="hover-footnote" v-html="currentFootnote" v-show="showingFootnote" />
      </template>
    </ContentDoc>
  </main>
</template>

<script>
import $ from 'jquery';

export default {
  data() {
    return {
      footnotes: {},
      currentFootnoteId: null,
      showingFootnote: false
    };
  },
  computed: {
    currentFootnote() {
      if (this.currentFootnoteId > -1 && this.footnotes[this.currentFootnoteId] != undefined) {
        return this.footnotes[this.currentFootnoteId];
      } else {
        return '';
      }
    }
  },
  mounted() {
    // Find all footnote references and attach hover events
    $('a[id^="user-content-fnref"]').on('mouseenter', this.showFootnote.bind(this));
    // $('sup[id^="fnref"]').on('mouseenter', showFootnote.bind(this));
    window.addEventListener('scroll', this.hideFootnote);

    // Extract footnotes from content and add to footnotes object
    const footnoteElements = $('.footnotes li');
    // footnoteElements.on('mouseenter', this.showFootnote.bind(this));
    footnoteElements.each((index, element) => {
      console.log('adding fn to object: ' + index);
      const id = $(element).attr('id').split('-').pop();
      const content = $(element).html();
      this.footnotes[id] = content;
    }); 
    
    setTimeout(() => {
      window.Nutshell.start(
        document.getElementsByClassName('nuxt-content')[0],
      );
    });
  },
  beforeDestroy () {
    window.removeEventListener('scroll', this.hideFootnote);
  },
  methods: {
    showFootnote(event) {
      const footnoteId = $(event.target).attr('id').split('-').pop();

      console.log(footnoteId);
      console.log(this.footnotes[footnoteId])
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
<!-- 
<script setup>
import $ from 'jquery';
import { ref } from 'vue';

const { path } = useRoute(); 
const cleanPath = path.replace(/\/+$/, ''); 
const { data, error } = await useAsyncData(`content-${cleanPath}`, async () => {
    // Remove a trailing slash in case the browser adds it, it might break the routing   
    // fetch document where the document path matches with the cuurent route    
  let post = await queryContent('/posts').where({ _path: cleanPath }).findOne();    
  // get the surround information,    
  // which is an array of documeents that come before and after the current document    
  return {        post: post,        };
});

if (data.value) {
  useContentHead(data.value.post);
}
else {
  navigateTo('/404');
}

useHead({
  script: [
    {src: '/js/nutshell.js'},
  ],
});

onMounted(() => {
  console.log('attaching mouse events to fn');
    // Find all footnote references and attach hover events
    $('sup[id^="fnref"]').on('mouseenter', showFootnote.bind(this));
    window.addEventListener('scroll', hideFootnote);
    $('sup[id^="fnref"]').on('mouseleave', hideFootnote.bind(this));

    // Extract footnotes from content and add to footnotes object
    const footnoteElements = $('.footnotes li');
    footnoteElements.each((index, element) => {
      const id = $(element).attr('id');
      const content = $(element).html();
      this.footnotes[id] = content;
    }); 
    
    setTimeout(() => {
      window.Nutshell.start(
        document.getElementsByClassName('nuxt-content')[0],
      );
    });
});

const footnotes = ref({});
const currentFootnoteId = ref(null);
const showingFootnote = ref(false);

const currentFootnote = computed(() => {
  if (currentFootnoteId.value && footnotes.value[currentFootnoteId.value]) {
    return footnotes.value[currentFootnoteId.value];
  } else {
    return '';
  }
});

onBeforeUnmount (() => {
  window.removeEventListener('scroll', this.hideFootnote);
});

function showFootnote(event) {
  const footnoteId = $(event.target).attr('href').substring(1);

  if (!this.footnotes[footnoteId]) {
    return;
  }

  this.currentFootnoteId = footnoteId;
  this.showingFootnote = true;
  console.log('showing footnote');
}

function hideFootnote() {
  this.currentFootnoteId = null;
  this.showingFootnote = false;
  console.log('hiding footnote');
}
</script> -->

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
