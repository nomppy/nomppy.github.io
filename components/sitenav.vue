<template>
  <ul class="site-nav">
    <li>
      <site-link to="/">welcome</site-link>
    </li>
    <li>
      <site-link to="/favorites/">favorites</site-link>
    </li>
    <li>
      <site-link to="/photos/">photos</site-link>
    </li>
    <!-- <li>
      <site-link to="/news/">news</site-link>
    </li> -->
  </ul>
</template>

<style lang="scss" scoped>
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

// Top bar on phones: smaller, and wraps instead of running off the screen.
@media (max-width: 480px) {
  .site-nav {
    font-size: 1.15em;
    padding: 14px 8px;
    flex-wrap: wrap;
    gap: 0.2em 0;

    li {
      margin: 0 10px;
    }
  }
}
</style>
