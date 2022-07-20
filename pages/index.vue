<template>
  <div id="home">

    <div class="center-container">
      <hero id="hero" />

      <nuxt-content :document="page" />
    </div>
  </div>
</template>

<script>

export default {
  layout: 'rain',
  async asyncData({ $content }) {
    const page = await $content('about').fetch();
    return { page };
  },
  head() {
    return {
      title: 'Kenneth Sun',
      meta: [
        { hid: 'og:title', property: 'og:title', content: 'Welcome' },
      ],
    };
  },
};
</script>

<style lang="scss" scoped>

#hero {
	position: relative;
	width: 100%;
}

</style>
