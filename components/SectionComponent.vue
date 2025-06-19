<template>
  <details class="section-details">
    <summary class="section-summary">{{ section.title }}</summary>
    <div class="section-content">
      <div v-if="section.content" class="content" v-html="section.content"></div>
      <SectionComponent 
        v-for="subsection in section.subsections" 
        :key="subsection.title" 
        :section="subsection" 
      />
    </div>
  </details>
</template>

<script setup>
defineProps({
  section: {
    type: Object,
    required: true
  }
})
</script>

<style scoped lang="scss">
.section-details {
  .section-summary {
    font-weight: bold;
    cursor: pointer;
  }
  
  .section-content {
    .content {
      margin-bottom: 0.5rem;
      padding-left: 0.8em;
      
      :deep(ul) {
        margin: 0;
        padding-left: 0;
        list-style-position: outside;
      }
      
      :deep(li) {
        margin-left: 1em;
      }
    }
    
    .section-details {
      margin-left: 1em;
    }
  }
}
</style>
