<template>
  <div class="center-container">
    <div class="introduction-spiel">
      <h1>photos</h1>
      <p>just the ones i like, and only if i took them</p>
    </div>

    <p v-if="state === 'loading'" class="status">loading…</p>
    <p v-else-if="state === 'error'" class="status">couldn't load photos right now.</p>
    <p v-else-if="!photos.length" class="status">nothing here yet.</p>

    <div v-else class="photo-grid">
      <a
        v-for="photo in photos"
        :key="photo.id"
        :href="photo.url"
        class="photo"
        :title="photo.caption"
      >
        <img
          :src="photo.url"
          :alt="photo.caption || 'photo'"
          :width="photo.width"
          :height="photo.height"
          loading="lazy"
        />
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSeoMeta } from '#imports'

useSeoMeta({
  title: 'Photos',
  description: 'photos I took and like',
})

const photos = ref([])
const state = ref('loading')

// Fetched in the browser: the list lives in the Worker, not in the static build.
onMounted(async () => {
  try {
    const res = await fetch('/photo-api/photos')
    if (!res.ok) throw new Error(res.status)
    photos.value = await res.json()
    state.value = 'ready'
  } catch {
    state.value = 'error'
  }
})
</script>

<style lang="scss" scoped>
.status {
  text-align: center;
  opacity: 0.7;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 8px;
  max-width: 1100px;
  margin: 1.5em auto;
  padding: 0 12px;
}

.photo img {
  display: block;
  width: 100%;
  height: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
}
</style>
