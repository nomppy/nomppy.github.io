<template>
  <div class="photos-page">
    <header class="center-container intro">
      <h1>photos</h1>
      <p>just the ones i like, and only if i took them</p>
    </header>
    <photo-gallery />
  </div>
</template>

<script setup>
import { useSeoMeta } from '#imports'

useSeoMeta({ title: 'Photos', description: 'photos I took and like' })
</script>

<style lang="scss" scoped>
.photos-page {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 12px;
}

.intro {
  text-align: center;
  margin-bottom: 1.5em;

  h1 {
    font-variant: small-caps;
    letter-spacing: 0.04em;
    font-size: 2.2em;
  }

  p {
    color: var(--tertiary-text-color);
  }
}
</style>
