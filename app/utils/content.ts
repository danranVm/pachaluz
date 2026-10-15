import {
  SUPPORTED_LOCALES,
  type CarouselSlide,
  type FestivalMessages,
  type LocaleCode
} from '~/types/content'

export function normalizeLocale(value: string | string[] | undefined): LocaleCode {
  const candidate = Array.isArray(value) ? value[0] : value
  return SUPPORTED_LOCALES.includes(candidate as LocaleCode)
    ? (candidate as LocaleCode)
    : 'zh-CN'
}

export function resolveSlideIndex(current: number, change: number, length: number): number {
  if (length <= 0) return 0
  return (current + change + length) % length
}

export function getSlideAlt(
  slide: CarouselSlide,
  messages: FestivalMessages,
  fallback: string
): string {
  return messages.carouselAlts[slide.altKey] || fallback
}

export function absoluteUrl(path: string, siteUrl: string): string {
  return new URL(path, siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`).toString()
}

export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}
