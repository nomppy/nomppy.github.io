<template>
  <div class="center-container">
    {{ posts }}
  </div>
</template>

<script>
export default {
  async asyncData({ $content }) {

    const posts = await $content('posts')
      .only(['title', 'slug', 'category'])
      .sortBy('updatedAt', 'asc')
      .fetch();

    return { posts };
  },
};
</script>

<style lang='scss' scoped>

</style>