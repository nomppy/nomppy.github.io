<template>
    <div class="center-container">
      <EmailSub class='sub-action'>
      <h1>get emails from me!</h1><br>
      <p>(you can unadd yourself anytime by returning to the form) </p>
      <p> see past emails below.</p>
      </EmailSub>
      <br>
        <!-- <pre>
          {{  posts }}
        </pre> -->
        <ContentList
        :query="query"
        v-slot="{ list }">
          <div v-for="article in list" :key="article._path">
            <ContentDoc
            :head="false"
            :path="article._path" />
          </div>
        </ContentList>

    </div>
</template>
<script>
export default {
  setup() {
    useSeoMeta({
      title: 'News',
      description: 'Past newsletters',
    });
  },
  data() {
    return {
      query: { path: '/news', sort: [{ title: -1 }]}
    };
  },
  mounted() {
      setTimeout(() => {
        window.Nutshell.start();
      });
  }
}

</script>

<style lang="scss" scoped>
.sub-action {
    text-align: center;
}

:deep(.news-section){
  text-align: center;
  font-weight: 800;
  font-size: 1.1em;
  color: var(--primary-text-color);
  padding-top: 1em;
}

</style>
