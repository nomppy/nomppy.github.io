<template>
  <div>
    <iframe
    class="external-content"
    :src="src"
    ></iframe>
  </div>
</template>

<script lang="ts" setup>
defineProps(['src'])
</script>

<style scoped lang="scss">

.external-content {
  width: 100%;
  height: 100vh;
  border: none;
  margin: 0;
  overflow: hidden;
  z-index: 1;
  position: relative;
  top: 0;
  left: 0;
}


</style>