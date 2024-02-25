<template>
  <div id="home">

    <div class="center-container">
      <hero id="hero" />

      <ContentDoc 
      :head="false"
      class="nuxt-content"/>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: '',
});

</script>

<style lang="scss" scoped>

#hero {
	position: relative;
	width: 100%;
}

</style>
