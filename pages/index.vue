<template>
  <div id="home">

    <div class="center-container">
      <hero id="hero" />

      <ContentDoc class="nuxt-content"/>
    </div>
  </div>
</template>

<script setup lang="ts">


// definePageMeta({
//   title: 'Welcome',
//   meta: [
//     { hid: 'og:title', property: 'og:title', content: 'Welcome' },
//   ],
// });

// export default {
//   layout: 'default',
//   async asyncData({ $content }) {
//     const page = await $content('about').fetch();
//     return { page };
//   },
//   head() {
//     return {
//       title: 'Kenneth Sun',
//       meta: [
//         { hid: 'og:title', property: 'og:title', content: 'Welcome' },
//       ],
//     };
//   },
// };
</script>

<style lang="scss" scoped>

#hero {
	position: relative;
	width: 100%;
}

</style>
