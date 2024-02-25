// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  site: {
    url: 'https://kennethsun.net',
    name: 'Kenneth Sun',
    trailingSlash: true,
  },

  devtools: {
    enabled: true,

    timeline: {
      enabled: true
    }
  },
  modules: [
    '@nuxt/content',
    '@nuxtjs/color-mode',
    '@nuxtjs/sitemap',
    'nuxt-icon',
    "@nuxt/image"
  ],

  content: {
    markdown: {
      anchorLinks: false,
      remarkPlugins: {
        // 'remark-gfm': ,
        // 'remark-footnotes'; ,
      }
    },
    navigation: {
      fields: ['start', 'end', 'category'],
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
  },
})