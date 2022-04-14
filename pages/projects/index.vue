<template/>

<script>
export default {
  mounted () {
    if (!this.$route.params.category || !this.$route.params.id) {
      this.home();
    }
  },
  methods: {
    home () {
      this.$router.replace('/projects/general/about-this-site');
    },
  }, 
};
</script>