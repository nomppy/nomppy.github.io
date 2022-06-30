<template>
  <div>
    <div class="center-container">
      <home />

      <nuxt-content :document="about" />
    </div>
  </div>
</template>

<script>

export default {
  async asyncData({ $content, redirect }) {
    const about = await $content('about')
      .fetch()
      .catch(() => {
        return redirect('/');
      });
    return { about };
  },
};

</script>

<style lang='scss' scoped>
.title {
  color: var(--white);
  text-align: center;
  font-family: var(--serif-font-stack);
  font-weight: 600;
  font-size: 3em;
  font-variant: petite-caps;
  line-height: 1.15;
  margin-bottom: 20px;
}
</style>
