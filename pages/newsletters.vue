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
                <h1>Join my mailing list.</h1><br>
                <p> (They're infrequent; unadd yourself anytime). </p>
                <label for="entry.1045781291"></label>
                <input type="text" placeholder="Email" name="entry.1045781291" id="entry.1045781291">
                <!-- <label for="entry.881603344"></label> -->
                <!-- <input type="text" placeholder="Name" name="entry.881603344" id="entry.881603344"> -->
                <input id="submit" type="submit" value="Submit">
            </div>
        </form>

        <br>
        <h2>
          Past newsletters
        </h2>

        <div 
        class="post-category"
        v-for="n in posts" :key="n.slug">
          <nuxt-content 
          style="padding-bottom: 0"
          :document="n" />
        </div>

        <!-- <section 
        :style="'grid-row: span ' + (1+posts.length)"
        class="post-category"
        v-for="(n, name) in posts" :key="name">
          <h2 class="category-name">{{ name }}</h2>
          <ul class="category-items">
            <li v-for="post in posts" :key="post.slug">
              <nuxt-link :to="'/posts/' + post.slug">{{ post.title }}</nuxt-link>
              <p class="preview-description">
                {{ post.description }}
              </p>
            </li>
          </ul>
        </section>  -->
    </div>
</template>

<script>
export default {
  async asyncData({ $content }) {

    let posts = await $content('newsletters')
      // .only(['title', 'description', 'slug', 'category', 'updatedAt', 'end'])
      .sortBy('slug', 'desc')
      .fetch();
    
 
    // sort posts in place in descending order by end, placing posts with no end at the front
    // posts.sort((a, b) => {
    //   if (!a.end && !b.end) {
    //     return new Date(b.updatedAt) - new Date(a.updatedAt);
    //   } else if (!a.end) {
    //     return -1;
    //   } else if (!b.end) {
    //     return 1;
    //   } else {
    //     return new Date(b.end) - new Date(a.end);
    //   }
    // });

    return { posts };
  },
  head() {
    return {
      title: 'Newsletters | Kenneth Sun',
      meta: [
        { hid: 'og:title', property: 'og:title', content: 'Newsletters' },
      ],
    };
  },
};
</script>

<style lang="scss" scoped>
.form {
    text-align: center;
}

::v-deep {
  .news-section{
    text-align: center;
    font-weight: 800;
    font-size: 1.1em;
    color: var(--primary-text-color);
    padding-top: 1em;
  }
}

</style>