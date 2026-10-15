import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import type {
  CarouselManifest,
  FestivalMessages,
  SiteConfig,
  ThemeManifest
} from '~/types/content'

async function json<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(resolve(process.cwd(), path), 'utf8')) as T
}

describe('operator-managed content', () => {
  it('has a valid locale file for every configured language', async () => {
    const site = await json<SiteConfig>('public/content/site.json')

    for (const locale of site.locales) {
      const messages = await json<FestivalMessages>(`public/content/locales/${locale.code}.json`)
      expect(messages.seo.title).toBeTruthy()
      expect(messages.hero.title).toBeTruthy()
      expect(messages.accessibility.nextSlide).toBeTruthy()
    }
  })

  it('provides translated alt text for every carousel image', async () => {
    const site = await json<SiteConfig>('public/content/site.json')
    const manifest = await json<CarouselManifest>('public/content/carousels/manifest.json')
    const keys = manifest.groups.flatMap(group => group.slides.map(slide => slide.altKey))

    expect(keys.length).toBeGreaterThan(0)
    for (const locale of site.locales) {
      const messages = await json<FestivalMessages>(`public/content/locales/${locale.code}.json`)
      expect(keys.filter(key => !messages.carouselAlts[key])).toEqual([])
    }
  })

  it('only exposes configured themes and safe external links', async () => {
    const site = await json<SiteConfig>('public/content/site.json')
    const themes = await json<ThemeManifest>('public/content/themes/manifest.json')

    expect(themes.themes.map(theme => theme.id)).toEqual(site.themes)
    for (const item of [...site.socialLinks, ...site.ticketLinks]) {
      const url = new URL(item.url)
      expect(url.protocol).toBe('https:')
    }
  })
})
