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

        <nuxt-content 
        class="full-post"
        style="padding-bottom: 0"
        v-for="n in posts" :key="n.slug"
        :document="n" />

    </div>
</template>

<script>
export default {
  async asyncData({ $content }) {
    let posts = await $content('newsletters')
      .sortBy('slug', 'desc')
      .fetch();

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
  mounted() {
    setTimeout(() => {
      window.Nutshell.start();
    });
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
