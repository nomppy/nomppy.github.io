<template>
  <ul class="site-nav">
    <li>
      <nuxt-link to="/">welcome</nuxt-link>
    </li>
    <li>
      <nuxt-link to="/posts/">posts</nuxt-link>
    </li>
    <li>
      <nuxt-link to="/news/">news</nuxt-link>
    </li>

    <color-mode-switch class="color-mode-switch"/>
  </ul>
</template>

<style lang="scss" scoped>
.color-mode-switch {
  position: fixed;
  z-index: 100;
  right: 1em;
  top: 1em;
}

.site-nav {
  font-size: 1.5em;
  font-weight: bolder;
  padding: 20px;
  display: flex;
  justify-content: center;
  font-family: var(--serif-font-stack);
  letter-spacing: 1px;

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
    margin: 0 15px;
    list-style-type: none;

    a.router-link-active:not([href="/"]) { // excludes the root route
      color: var(--tertiary-text-color);
    }

    a.router-link-exact-active {
      color: var(--accent-text-color) !important; // overrides above
    }
  }
}
</style>
