<template>
  <div>
    <div class="site-nav">
      <nuxt-link to="/">home</nuxt-link>
      <nuxt-link to="/about">about</nuxt-link>
      <nuxt-link to="/contact">contact</nuxt-link>
      <nuxt-link to="/posts">posts</nuxt-link>
    </div>

    <div class="post-container">
      <div class="meta">
        <div class="type">
          {{ post.category }}
        </div>
        <div class="title">
          {{ post.title }}
        </div>
        <div class="date">
          {{ (post.start || post.createdAt).slice(0, 10) }}&ndash;{{ (post.end|| post.updatedAt).slice(0, 10) }}
        </div>
      </div>

      <nuxt-content 
        :document="post"
      />
      
      <contact class="footer" />
    </div>
  </div>
</template>

<script>

export default {

  async asyncData({ $content, params, redirect }) {

    const post = await $content('posts', params.id)
      .fetch()
      .catch(() => {
        return redirect('/posts');
      });

    return { post };
  },
};
</script>

<style lang='scss' scoped>
.site-nav {
  margin: 10px;
  display: flex;
  justify-content: center;

  a {
    margin: 0 5px;
    text-decoration: none;
    color: var(--primary-text-color);
    font-variant: petite-caps;

    &:hover {
      text-decoration-color: var(--link-hover-color);
      text-decoration-line: underline;
      text-decoration-thickness: 3px;
    }
  }
}
.meta {
  width: 100%;
  height: 100%;
  padding: 30px 30px;
  box-sizing: border-box;
  color: white;

  .type, .updated {
    // margin-bottom: 10px;
    font-weight: 700;
    // color: #7a7a8c;
    color: var(--accent-text-color);
  }

  .title {
    width: 100%;
    text-align: center;
    font-weight: bold;
    font-size: 2em;
    font-variant: petite-caps;
    color: white;
    margin-bottom: 20px;
  }

  img {
    position: absolute;
    object-fit: cover;
    width: 100%;
    height: 100%;
  }

}

.project-container {
  position: relative;
}

.background {
  left: 0;
  width: 100%;
  z-index: 1;
  overflow: hidden;
}

.footer {
  z-index: 1;
  margin-top: 70px;
  width: 100%;
  position: relative;
  overflow: hidden;
  height: 70px;
  background-color: white;
}

</style>

<style lang='scss'>

.nuxt-content {
    z-index: 2;
    color: var(--primary-text-color);
    // font-family: 'Open Sans', sans-serif;
    font-family: var(--serif-font-stack);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    line-height: 1.5;

    width: 60%;
    min-height: 70vh;
    position: relative;
    left: 20%;
    margin-top: 100px;

    p {
      + p {
        text-indent: 2.5em;
      }

      a {
        color: var(--link-color);

        &:hover, &:visited, &:active {
          color: var(--link-hover-color);
        }
      }

      img {
        position: relative;
        max-width: 100%;
        height: auto;
        margin: auto;
        display: block;
      }

      &.img-wrapper {
        width: 140%;
        left: -20%;
        position: relative;
      }
    }

    iframe {
      position: relative;
      height: 30vh;
      width: 100%;
      display: block;
    }

    pre {
      overflow-x: scroll;
    }

    h1, h2 {
      border-bottom: 2px dotted var(--primary-text-color);
      margin-top: 1.5em;
      margin-bottom: 0.8em;

      a::before {
        content: '#';
        cursor: pointer;
        position: absolute;
        left: -25px;
        font-weight: normal;
        color: var(--accent-text-color);
      }
    }

    h3 {
      font-size: 1.2em;
    }
}
</style>
