<template>
  <ul class="site-nav">
    <li>
      <nuxt-link to="/home">home</nuxt-link>
    </li>
    <li>
      <nuxt-link to="/about">about</nuxt-link>
    </li>
    <li>
      <nuxt-link to="/contact">contact</nuxt-link>
    </li>
    <li>
      <nuxt-link to="/posts">posts</nuxt-link>
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.site-nav {
  padding: 0;
  margin: 20px;
  display: flex;
  justify-content: center;
  font-family: var(--sans-serif-font-stack);

  a {
    text-decoration: none;
    color: var(--primary-text-color);
    font-variant: small-caps;

    &:hover {
      text-decoration-color: var(--accent-text-color);
      text-decoration-line: underline;
      text-decoration-thickness: 3px;
    }
  }

  li {
    margin: 0 5px;
    list-style-type: none;

    a.nuxt-link-active {
      color: var(--tertiary-text-color);
    }

    a.nuxt-link-exact-active {
      color: var(--accent-text-color);
    }
  }
}
</style>