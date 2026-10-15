export const SUPPORTED_LOCALES = ['zh-CN', 'en', 'es'] as const

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number]

export interface LocaleOption {
  code: LocaleCode
  label: string
  shortLabel: string
}

export interface LinkItem {
  id: string
  label: string
  url: string
  enabled?: boolean
}

export interface SiteConfig {
  siteName: string
  siteUrl: string
  defaultLocale: LocaleCode
  locales: LocaleOption[]
  defaultTheme: string
  themes: string[]
  event: {
    startDate: string
    endDate: string
    venue: string
    address: string
    latitude: number
    longitude: number
  }
  seoImage: string
  carouselInterval: number
  socialLinks: LinkItem[]
  ticketLinks: LinkItem[]
}

export interface FestivalMessages {
  seo: {
    title: string
    description: string
    keywords: string
  }
  nav: {
    experience: string
    gallery: string
    visit: string
    tickets: string
    language: string
    theme: string
    menu: string
  }
  hero: {
    eyebrow: string
    title: string
    subtitle: string
    dates: string
    primaryCta: string
    secondaryCta: string
    scroll: string
  }
  about: {
    eyebrow: string
    title: string
    body: string
    stats: Array<{ value: string; label: string }>
  }
  experience: {
    eyebrow: string
    title: string
    items: Array<{ title: string; body: string; icon: string }>
  }
  galleries: Record<string, { eyebrow: string; title: string; description: string }>
  visit: {
    eyebrow: string
    title: string
    dateLabel: string
    dateValue: string
    venueLabel: string
    venueValue: string
    addressLabel: string
    addressValue: string
  }
  tickets: {
    eyebrow: string
    title: string
    body: string
  }
  social: {
    title: string
    description: string
  }
  footer: {
    rights: string
    privacy: string
  }
  accessibility: {
    previousSlide: string
    nextSlide: string
    pauseCarousel: string
    playCarousel: string
    goToSlide: string
    openMenu: string
    closeMenu: string
  }
  carouselAlts: Record<string, string>
  themeNames: Record<string, string>
}

export interface CarouselSlide {
  src: string
  altKey: string
}

export interface CarouselGroup {
  id: string
  slides: CarouselSlide[]
}

export interface CarouselManifest {
  generatedAt: string
  groups: CarouselGroup[]
}

export interface ThemeManifest {
  generatedAt: string
  themes: Array<{ id: string; label: string; stylesheet: string }>
}

export interface FestivalContent {
  site: SiteConfig
  messages: FestivalMessages
  carousels: CarouselManifest
  themes: ThemeManifest
}
