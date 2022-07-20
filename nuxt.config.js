import getRoutes from './utils/getRoutes';

export default {
  // Target (https://go.nuxtjs.dev/config-target
  target: 'static',
  
  buildDir: 'dist',
  
  server: {
    // host: '0',
    port: 3000,
  },

  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    title: 'Kenneth Sun',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Personal website of Kenneth Sun' },
      { hid: 'og:description', property: 'og:description', content: 'Personal website of Kenneth Sun' },
      { hid: 'apple-mobile-web-app-title', name: 'apple-mobile-web-app-title', content: 'Kenneth Sun' },
      { hid: 'og:site_name', property: 'og:site_name', content: 'kennethsun.net' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Average&family=Libre+Baskerville&family=Montserrat&family=Roboto&family=Source+Sans+Pro&family=Zilla+Slab&display=swap' }
    ],
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: [
  ],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [
  ],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
  ],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    // https://go.nuxtjs.dev/content
    '@nuxt/content',
  ],

  // Axios module configuration (https://go.nuxtjs.dev/config-axios)
  axios: {},

  // Content module configuration (https://go.nuxtjs.dev/config-content)
  content: {
    markdown: {
      remarkPlugins: ['remark-gfm'],
      prism: {
        theme: '~/assets/styles/prism-nord.css',
      },
    },
  },

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {
    transpile: [
      'remark-gfm',
    ],
  },

  generate: {
    crawler: true,
    dir: 'generate',
    async routes () {
      const { $content } = require('@nuxt/content');
      const files = await $content({ deep: true }).only(['path']).fetch();

      return files.map(file => file.path === '/index' ? '/' : file.path);
    }
  },

  sitemap: {
    hostname: 'https://spesthecat.github.io',
    routes() {
      return getRoutes();
    }
  },
};
