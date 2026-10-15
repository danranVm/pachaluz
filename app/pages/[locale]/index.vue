<script setup lang="ts">
import { computed, toRef } from 'vue'
import type { CarouselGroup, FestivalContent } from '~/types/content'
import { absoluteUrl, normalizeLocale, safeJsonLd } from '~/utils/content'

const route = useRoute()
const locale = normalizeLocale(route.params.locale)

if (route.params.locale !== locale) {
  await navigateTo(`/${locale}/`, { redirectCode: 302 })
}

const { data, error } = await useAsyncData<FestivalContent>(`festival-${locale}`, async () => {
  return $fetch<FestivalContent>(`/api/content/${locale}`)
})

if (error.value || !data.value) {
  throw createError({
    statusCode: 500,
    statusMessage: 'Festival content could not be loaded'
  })
}

const content = computed(() => data.value as FestivalContent)
const site = computed(() => content.value.site)
const messages = computed(() => content.value.messages)
const themeManifest = computed(() => content.value.themes)
const { activeTheme, availableThemes, setTheme } = useFestivalTheme(
  toRef(content.value, 'site'),
  toRef(content.value, 'themes')
)

const canonical = computed(() => absoluteUrl(`${locale}/`, site.value.siteUrl))
const seoImage = computed(() => absoluteUrl(site.value.seoImage, site.value.siteUrl))

function carousel(id: string): CarouselGroup {
  return content.value.carousels.groups.find(group => group.id === id) || { id, slides: [] }
}

const eventJsonLd = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'Festival',
  name: messages.value.hero.title,
  description: messages.value.seo.description,
  startDate: site.value.event.startDate,
  endDate: site.value.event.endDate,
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
  image: [seoImage.value],
  location: {
    '@type': 'Place',
    name: site.value.event.venue,
    address: site.value.event.address,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.value.event.latitude,
      longitude: site.value.event.longitude
    }
  },
  offers: site.value.ticketLinks.filter(link => link.enabled !== false).map(link => ({
    '@type': 'Offer',
    url: link.url,
    availability: 'https://schema.org/InStock',
    validFrom: new Date().toISOString().slice(0, 10)
  })),
  organizer: {
    '@type': 'Organization',
    name: site.value.siteName,
    url: site.value.siteUrl
  }
}))

const breadcrumbJsonLd = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [{
    '@type': 'ListItem',
    position: 1,
    name: site.value.siteName,
    item: canonical.value
  }]
}))

const organizationJsonLd = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: site.value.siteName,
  url: site.value.siteUrl,
  logo: absoluteUrl('/favicon.svg', site.value.siteUrl),
  sameAs: site.value.socialLinks
    .filter(link => link.enabled !== false)
    .map(link => link.url)
}))

useSeoMeta({
  title: () => messages.value.seo.title,
  description: () => messages.value.seo.description,
  ogTitle: () => messages.value.seo.title,
  ogDescription: () => messages.value.seo.description,
  ogType: 'website',
  ogUrl: canonical,
  ogImage: seoImage,
  ogLocale: () => locale.replace('-', '_'),
  twitterCard: 'summary_large_image',
  twitterTitle: () => messages.value.seo.title,
  twitterDescription: () => messages.value.seo.description,
  twitterImage: seoImage
})

useHead(() => ({
  htmlAttrs: { lang: locale },
  meta: [
    { name: 'keywords', content: messages.value.seo.keywords }
  ],
  link: [
    { rel: 'canonical', href: canonical.value },
    ...site.value.locales.map(item => ({
      rel: 'alternate' as const,
      type: 'text/html',
      hreflang: item.code,
      href: absoluteUrl(`${item.code}/`, site.value.siteUrl)
    })),
    {
      rel: 'alternate' as const,
      type: 'text/html',
      hreflang: 'x-default',
      href: absoluteUrl(`${site.value.defaultLocale}/`, site.value.siteUrl)
    },
    {
      id: 'festival-theme',
      rel: 'stylesheet',
      href: themeManifest.value.themes.find(theme => theme.id === activeTheme.value)?.stylesheet
        || `/content/themes/${site.value.defaultTheme}/theme.css`
    }
  ],
  script: [
    { type: 'application/ld+json', innerHTML: safeJsonLd(eventJsonLd.value) },
    { type: 'application/ld+json', innerHTML: safeJsonLd(organizationJsonLd.value) },
    { type: 'application/ld+json', innerHTML: safeJsonLd(breadcrumbJsonLd.value) }
  ]
}))
</script>

<template>
  <div class="festival-page">
    <SiteHeader
      :messages="messages"
      :locale="locale"
      :locales="site.locales"
      :active-theme="activeTheme"
      :themes="availableThemes"
      @theme-change="setTheme"
    />

    <main>
      <section class="hero" aria-labelledby="hero-title">
        <FestivalCarousel
          class="hero__carousel"
          :slides="carousel('hero').slides"
          :messages="messages"
          :interval="site.carouselInterval"
          mode="hero"
          :label="messages.hero.title"
        />
        <div class="hero__shade" />
        <div class="hero__ornament hero__ornament--one" aria-hidden="true" />
        <div class="hero__ornament hero__ornament--two" aria-hidden="true" />
        <div class="hero__content shell">
          <p class="eyebrow">{{ messages.hero.eyebrow }}</p>
          <h1 id="hero-title">{{ messages.hero.title }}</h1>
          <p class="hero__subtitle">{{ messages.hero.subtitle }}</p>
          <p class="hero__dates">{{ messages.hero.dates }}</p>
          <div class="hero__actions">
            <a
              v-if="site.ticketLinks[0]"
              class="button button--primary"
              :href="site.ticketLinks[0].url"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ messages.hero.primaryCta }}
              <span aria-hidden="true">↗</span>
            </a>
            <a class="button button--ghost" href="#experience">
              {{ messages.hero.secondaryCta }}
            </a>
          </div>
        </div>
        <a class="hero__scroll" href="#about">
          <span>{{ messages.hero.scroll }}</span>
          <span aria-hidden="true">↓</span>
        </a>
      </section>

      <section id="about" class="about section">
        <div class="shell about__grid">
          <div>
            <p class="eyebrow">{{ messages.about.eyebrow }}</p>
            <h2>{{ messages.about.title }}</h2>
          </div>
          <p class="about__body">{{ messages.about.body }}</p>
        </div>
        <div class="shell stats">
          <div v-for="stat in messages.about.stats" :key="stat.label" class="stat">
            <strong>{{ stat.value }}</strong>
            <span>{{ stat.label }}</span>
          </div>
        </div>
      </section>

      <section id="experience" class="experience section">
        <div class="shell">
          <p class="eyebrow">{{ messages.experience.eyebrow }}</p>
          <h2>{{ messages.experience.title }}</h2>
          <div class="experience__grid">
            <article v-for="item in messages.experience.items" :key="item.title" class="experience-card">
              <span class="experience-card__icon" aria-hidden="true">{{ item.icon }}</span>
              <h3>{{ item.title }}</h3>
              <p>{{ item.body }}</p>
            </article>
          </div>
        </div>
      </section>

      <section id="gallery" class="gallery-section section">
        <div class="shell gallery-section__heading">
          <div>
            <p class="eyebrow">{{ messages.galleries.gallery?.eyebrow }}</p>
            <h2>{{ messages.galleries.gallery?.title }}</h2>
          </div>
          <p>{{ messages.galleries.gallery?.description }}</p>
        </div>
        <div class="shell shell--wide">
          <FestivalCarousel
            :slides="carousel('gallery').slides"
            :messages="messages"
            :interval="site.carouselInterval + 1200"
            :label="messages.galleries.gallery?.title || messages.nav.gallery"
          />
        </div>
      </section>

      <section id="visit" class="visit section">
        <div class="visit__glow" aria-hidden="true" />
        <div class="shell visit__grid">
          <div>
            <p class="eyebrow">{{ messages.visit.eyebrow }}</p>
            <h2>{{ messages.visit.title }}</h2>
          </div>
          <dl class="visit__details">
            <div>
              <dt>{{ messages.visit.dateLabel }}</dt>
              <dd>{{ messages.visit.dateValue }}</dd>
            </div>
            <div>
              <dt>{{ messages.visit.venueLabel }}</dt>
              <dd>{{ messages.visit.venueValue }}</dd>
            </div>
            <div>
              <dt>{{ messages.visit.addressLabel }}</dt>
              <dd>{{ messages.visit.addressValue }}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section id="tickets" class="tickets section">
        <div class="shell tickets__inner">
          <p class="eyebrow">{{ messages.tickets.eyebrow }}</p>
          <h2>{{ messages.tickets.title }}</h2>
          <p>{{ messages.tickets.body }}</p>
          <div class="tickets__links">
            <a
              v-for="link in site.ticketLinks.filter(item => item.enabled !== false)"
              :key="link.id"
              class="button button--primary"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ link.label }}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="shell footer__grid">
        <div>
          <div class="brand brand--footer"><span aria-hidden="true">✦</span> PACHA LUZ</div>
          <h2>{{ messages.social.title }}</h2>
          <p>{{ messages.social.description }}</p>
        </div>
        <div class="footer__socials">
          <a
            v-for="link in site.socialLinks.filter(item => item.enabled !== false)"
            :key="link.id"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ link.label }} <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
      <div class="shell footer__bottom">
        <span>© {{ new Date().getFullYear() }} {{ messages.footer.rights }}</span>
        <span>{{ messages.footer.privacy }}</span>
      </div>
    </footer>
  </div>
</template>
