<template>
  <div id="home">

    <div class="center-container">
      <hero id="hero" />

      <nuxt-content :document="about" />
    </div>
  </div>
</template>

<script>

export default {
  layout: 'rain',
  async asyncData({ $content }) {
    const about = await $content('about')
      .fetch();
    return { about };
  },
};
</script>

<style lang="scss" scoped>

#hero {
	position: relative;
	width: 100%;
}

</style>
