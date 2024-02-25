<template>
    <div class="center-container">
        <form 
        class="light form" 
        name="gform" 
        id="gform" 
        enctype="text/plain" 
        action="https://docs.google.com/forms/d/e/1FAIpQLSdqIg6GPEJXH4vRY_Gnl8f13AitXlekgKSpYiazVgk1ELeCFA/formResponse?"
        target="hidden_iframe" onsubmit=submitted()>
            <div class="fade-out" id="email-entry">
                <!-- 227649005 -->
                <!-- 1045781291 -->
                <h1>get emails from me!</h1><br>
                <p>(you can unadd yourself anytime) </p>
                <p> see past emails below.</p>
                <label for="entry.1045781291"></label>
                <input type="text" placeholder="Email" name="entry.1045781291" id="entry.1045781291">
                <!-- <label for="entry.881603344"></label> -->
                <!-- <input type="text" placeholder="Name" name="entry.881603344" id="entry.881603344"> -->
                <input id="submit" type="submit" value="Submit">
            </div>
        </form>

        <br>
        <!-- <pre>
          {{  posts }}
        </pre> -->
        <ContentList 
        :query="query"
        v-slot="{ list }">
          <div v-for="article in list" :key="article._path">
            <ContentDoc 
            :path="article._path" />
          </div>
        </ContentList>

    </div>
</template>
<!-- <script src="nutshell.js"></script> -->
<script setup>
// let nutshell_ready = false;
const query = { path: '/news', sort: [{ title: -1 }] }
const posts = queryContent('/news')
                        .sort({ title: 1, $numeric: true })
                        // .only(['_path', 'title', 'description', 'category', 'end'])
                        .find();

useHead({
  title: 'Newsletters | Kenneth Sun',
  meta: [
    { hid: 'og:title', property: 'og:title', content: 'Newsletters' },
  ],
  script: [
    {src: '/js/nutshell.js'},
  ],
});

onMounted(() => {
  setTimeout  (() => {
    window.Nutshell.start();
  });
});
// // group posts by category
// const grouped = posts.reduce((acc, post) => {
//   if (!acc[post.category]) {
//     acc[post.category] = [];
//   }
//   acc[post.category].push(post);
//   return acc;
// }, {});
</script>
<!-- <script>
export default {
  async asyncData({ $content }) {
    let posts = await $content('')
      .sortBy('slug', 'desc')
      .fetch();

    return { posts };
  },

  mounted() {
    setTimeout(() => {
      window.Nutshell.start();
    });
  },
};
</script> -->

<style lang="scss" scoped>
.form {
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
