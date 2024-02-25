<template>
  <div 
    class="bg" 
    :style="{'background-image': `url(${this.full})`}" 
    loading="lazy"
  >
    <div
      class="preview"
      :style="{'background-image': `url(${this.preview})`}"
      loading="lazy"
    />
  </div>
</template>
<script>
export default {
  name: 'HobbyBackground',
  props: [
    'item',
  ],
  data() {
    return {
      full: null,
      preview: null,
    };
  },
  mounted() {
    this.full = require(`~/assets/hobbies/${this.item.name}.jpg`);
    this.preview = require(`~/assets/hobbies/${this.item.name}-preview.jpg`);
  }
};
</script>

<style lang="scss" scoped>

</style>
