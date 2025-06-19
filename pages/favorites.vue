<template>
  <div class="center-container">
    <div class="introduction-spiel">
     <h1>favorites!</h1><br>

      <p>
      Since I always ask people what their favorite XXX is and blank when they return the question
      </p>

      <p>(updated 2025.05.11)</p>
    </div>

    <div v-if="sections.length" class="favorites-content">
      <SectionComponent 
        v-for="section in sections" 
        :key="section.title" 
        :section="section" 
      />
    </div>
  </div>
</template>

  <script setup>
  import { useSeoMeta } from '#imports'
  import { useAsyncData, queryContent } from '#imports'
  import { ref, computed } from 'vue'

  useSeoMeta({
    title: 'Favorites',
    description: 'some of my favorite things in various categories',
  });

  // Fetch the favorites markdown content
  const { data } = await useAsyncData('favorites', () =>
    queryContent('favorites').findOne()
  )

  // Parse the markdown content into sections
  const sections = computed(() => {
    if (!data.value?.body?.children) return []
    
    const children = data.value.body.children
    const parsedSections = []
    const sectionStack = []
    
    children.forEach(child => {
      if (child.tag && child.tag.match(/^h[1-6]$/)) {
        const level = parseInt(child.tag.replace('h', ''))
        const newSection = {
          title: child.children[0].value,
          level: level,
          subsections: [],
          content: ''
        }
        
        // Pop sections from stack until we find the correct parent level
        while (sectionStack.length > 0 && sectionStack[sectionStack.length - 1].level >= level) {
          sectionStack.pop()
        }
        
        // Add to parent or root
        if (sectionStack.length === 0) {
          parsedSections.push(newSection)
        } else {
          sectionStack[sectionStack.length - 1].subsections.push(newSection)
        }
        
        sectionStack.push(newSection)
      } else if (sectionStack.length > 0) {
        // Add content to the current section
        sectionStack[sectionStack.length - 1].content += renderNode(child)
      }
    })
    
    return parsedSections
  })

  // Helper function to render markdown nodes to HTML
  function renderNode(node) {
    if (node.type === 'text') {
      return node.value
    }
    
    if (node.tag === 'ul') {
      const items = node.children.map(child => renderNode(child)).join('')
      return `<ul>${items}</ul>`
    }
    
    if (node.tag === 'li') {
      const content = node.children.map(child => renderNode(child)).join('')
      return `<li>${content}</li>`
    }
    
    if (node.tag === 'p') {
      const content = node.children.map(child => renderNode(child)).join('')
      return `<p>${content}</p>`
    }
    
    if (node.tag === 'a') {
      const href = node.props?.href || '#'
      const content = node.children.map(child => renderNode(child)).join('')
      return `<a href="${href}" target="_blank" rel="noopener">${content}</a>`
    }
    
    if (node.tag === 'em') {
      const content = node.children.map(child => renderNode(child)).join('')
      return `<em>${content}</em>`
    }
    
    if (node.tag === 'strong') {
      const content = node.children.map(child => renderNode(child)).join('')
      return `<strong>${content}</strong>`
    }
    
    if (node.tag === 'code') {
      const content = node.children.map(child => renderNode(child)).join('')
      return `<code>${content}</code>`
    }
    
    // Fallback for other elements
    if (node.children) {
      const content = node.children.map(child => renderNode(child)).join('')
      return node.tag ? `<${node.tag}>${content}</${node.tag}>` : content
    }
    
    return node.value || ''
  }
  </script>

  <style scoped lang="scss">
  .introduction-spiel {
    text-align: center;
  }

  .headings-inline-list {
    text-align: center;
  }
  </style>