// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: true,
  css: ['~/assets/styles/main.css'],
  app: {
    head: {
      titleTemplate: '%s · PachA Luz',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#170a2e' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ]
    }
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      failOnError: true,
      routes: ['/', '/zh-CN/', '/en/', '/es/', '/404.html']
    }
  },
  routeRules: {
    '/': { prerender: true },
    '/zh-CN/**': { prerender: true },
    '/en/**': { prerender: true },
    '/es/**': { prerender: true }
  },
  typescript: {
    typeCheck: true,
    strict: true
  }
})
