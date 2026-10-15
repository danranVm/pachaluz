import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createError, defineEventHandler, getRouterParam } from 'h3'
import type {
  CarouselManifest,
  FestivalContent,
  FestivalMessages,
  LocaleCode,
  SiteConfig,
  ThemeManifest
} from '../../../app/types/content'
import { SUPPORTED_LOCALES } from '../../../app/types/content'

async function readJson<T>(path: string): Promise<T> {
  const file = resolve(process.cwd(), 'public/content', path)
  return JSON.parse(await readFile(file, 'utf8')) as T
}

export default defineEventHandler(async (event): Promise<FestivalContent> => {
  const locale = getRouterParam(event, 'locale') as LocaleCode

  if (!SUPPORTED_LOCALES.includes(locale)) {
    throw createError({ statusCode: 404, statusMessage: 'Unsupported locale' })
  }

  const [site, messages, carousels, themes] = await Promise.all([
    readJson<SiteConfig>('site.json'),
    readJson<FestivalMessages>(`locales/${locale}.json`),
    readJson<CarouselManifest>('carousels/manifest.json'),
    readJson<ThemeManifest>('themes/manifest.json')
  ])

  return { site, messages, carousels, themes }
})
