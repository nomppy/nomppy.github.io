// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxt/content',
    '@nuxtjs/color-mode',
    '@nuxtjs/sitemap',
    'nuxt-icons',
    "@nuxt/image"
  ],

  content: {
    markdown: {
      anchorLinks: false,
      remarkPlugins: {
        // 'remark-gfm': ,
        // 'remark-footnotes'; ,
      }
    }
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/styles/avenir-white.css" as *;',
        }
      }
    }
  },

  // color mode configuration
  // https://color-mode.nuxtjs.org/
  colorMode: {
    preference: 'system',
  },

  nitro: {
    prerender: {
      routes: ['/sitemap.xml'],
    }
  }
})