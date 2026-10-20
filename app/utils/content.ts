import {
  type CarouselSlide,
  type FestivalMessages,
  type LocaleCode
} from '~/types/content'

export function normalizeLocale(value: string | string[] | undefined): LocaleCode {
  const candidate = Array.isArray(value) ? value[0] : value
  if (!candidate) return 'es'

  const normalizedCandidate = candidate.toLowerCase()
  if (normalizedCandidate === 'zh' || normalizedCandidate.startsWith('zh-')) return 'zh-CN'
  if (normalizedCandidate === 'en' || normalizedCandidate.startsWith('en-')) return 'en'
  if (normalizedCandidate === 'es' || normalizedCandidate.startsWith('es-')) return 'es'

  return 'es'
}

export function resolveBrowserLocale(language: string | undefined): LocaleCode {
  return normalizeLocale(language)
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
