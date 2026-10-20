import { describe, expect, it } from 'vitest'
import {
  absoluteUrl,
  getSlideAlt,
  normalizeLocale,
  resolveBrowserLocale,
  resolveSlideIndex,
  safeJsonLd
} from '~/utils/content'
import type { FestivalMessages } from '~/types/content'

describe('content utilities', () => {
  it('normalizes supported and unsupported locales', () => {
    expect(normalizeLocale('en')).toBe('en')
    expect(normalizeLocale(['es'])).toBe('es')
    expect(normalizeLocale('fr')).toBe('es')
    expect(normalizeLocale(undefined)).toBe('es')
  })

  it('maps browser language variants and falls back to Spanish', () => {
    expect(resolveBrowserLocale('zh-TW')).toBe('zh-CN')
    expect(resolveBrowserLocale('en-US')).toBe('en')
    expect(resolveBrowserLocale('es-MX')).toBe('es')
    expect(resolveBrowserLocale('fr-FR')).toBe('es')
  })

  it('wraps carousel indexes in either direction', () => {
    expect(resolveSlideIndex(0, 1, 3)).toBe(1)
    expect(resolveSlideIndex(2, 1, 3)).toBe(0)
    expect(resolveSlideIndex(0, -1, 3)).toBe(2)
    expect(resolveSlideIndex(2, 2, 0)).toBe(0)
  })

  it('uses translated alt text and falls back safely', () => {
    const messages = {
      carouselAlts: { 'hero.first': 'Translated lantern' }
    } as FestivalMessages
    expect(getSlideAlt({ src: '/first.svg', altKey: 'hero.first' }, messages, 'Fallback'))
      .toBe('Translated lantern')
    expect(getSlideAlt({ src: '/second.svg', altKey: 'hero.second' }, messages, 'Fallback'))
      .toBe('Fallback')
  })

  it('builds canonical URLs and escapes JSON-LD markup', () => {
    expect(absoluteUrl('en/', 'https://festival.example')).toBe('https://festival.example/en/')
    expect(safeJsonLd({ title: '</script>' })).not.toContain('<')
    expect(safeJsonLd({ title: '</script>' })).toContain('\\u003c/script>')
  })
})
