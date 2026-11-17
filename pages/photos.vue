<template>
  <div class="photos-page">
    <header class="center-container intro">
      <h1>photos</h1>
      <p>just the ones i like, and only if i took them</p>
    </header>
    <photo-gallery by-season />
  </div>
</template>

<script setup>
import { useSeoMeta } from '#imports'

useSeoMeta({ title: 'Photos', description: 'photos I took and like' })
</script>

<style lang="scss" scoped>
.photos-page {
  max-width: 1180px;
  margin: 0 auto 4em;
  padding: 0 1.5em;
}

// Leave room for the side navigation, which is fixed on wide screens.
@media (min-width: 1070px) {
  .photos-page {
    padding-left: 190px;
    padding-right: 2.5em;
  }
}

@media (max-width: 380px) {
  .photos-page {
    padding: 0 0.75em;
  }
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
