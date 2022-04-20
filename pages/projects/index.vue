<template>
  <div class='projects'>
    <sidebar id='sidebar' />

    <div class='content-container'>
      <nuxt-content
      :document="about" />

      <contact class='footer' />
    </div>
  </div>
</template>

<script>
export default {
  async asyncData({ $content, redirect }) {

    const about = await $content('projects/about')
      .fetch()
      .catch(() => {
        return redirect('/projects');
      });

    return { about };
  },
};
</script>

<style lang='scss' scoped>
#sidebar {
  position: fixed;
  z-index: 5;
  width: 250px;
  height: 100%;
  left: 0;
}

.content-container {
  position: relative;
  left: 250px;
  width: calc(100% - 250px);
}

.footer {
  z-index: 1;
  margin-top: 70px;
  width: 100%;
  position: relative;
  overflow: hidden;
  height: 70px;
  background-color: white;
}
</style>