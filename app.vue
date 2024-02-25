<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
const title = "Kenneth Sun"
const desc = "Personal website of Kenneth Sun"
 
useHead({
    titleTemplate: (titleChunk) => {
      return titleChunk ? `${titleChunk} | ${title}` : title;
    },
    // titleTemplate: '%s | Kenneth Sun',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      // { name: 'description', content: 'Personal website of Kenneth Sun' },
      // { property: 'og:description', content: 'Personal website of Kenneth Sun' },
      // { name: 'apple-mobile-web-app-title', content: 'Kenneth Sun' },
      // { property: 'og:site_name', content: 'kennethsun.net' },
    ],
    script: [
      {src: '/js/nutshell.js'},
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Average&family=Libre+Baskerville&family=Montserrat&family=Roboto&family=Source+Sans+Pro&family=Zilla+Slab&display=swap' }
    ],
    htmlAttrs: {
      lang: 'en'
    },
})
// useSeoMeta({
//   ogImage: '[og:image]',
//   ogUrl: '[og:url]',
//   twitterImage: '[twitter:image]',
// })
useSeoMeta({
  title: title,
  ogTitle: title,
  twitterTitle: title,
  description: desc,
  ogDescription: desc,
  twitterDescription: desc,
  ogUrl: 'https://kennethsun.net',
  // ogImage: 'https://example.com/image.png',
  // twitterCard: 'summary_large_image',
})
</script>

