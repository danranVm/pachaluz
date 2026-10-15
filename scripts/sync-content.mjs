import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { extname, join, parse, resolve } from 'node:path'

const root = process.cwd()
const contentDir = resolve(root, 'public/content')
const imageExtensions = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.svg', '.webp'])

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'))
  } catch (error) {
    throw new Error(`Invalid or missing JSON: ${file}\n${error.message}`)
  }
}

async function directoriesAt(path) {
  const entries = await readdir(path, { withFileTypes: true })
  return entries.filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
}

async function buildCarouselManifest() {
  const carouselsDir = join(contentDir, 'carousels')
  const groups = []

  for (const directory of await directoriesAt(carouselsDir)) {
    const imagesDir = join(carouselsDir, directory.name, 'images')
    const files = (await readdir(imagesDir, { withFileTypes: true }))
      .filter(entry => entry.isFile() && imageExtensions.has(extname(entry.name).toLowerCase()))
      .map(entry => entry.name)
      .sort((left, right) => left.localeCompare(right, 'en', { numeric: true }))

    groups.push({
      id: directory.name,
      slides: files.map(file => ({
        src: `/content/carousels/${directory.name}/images/${file}`,
        altKey: `${directory.name}.${parse(file).name}`
      }))
    })
  }

  groups.sort((left, right) => left.id.localeCompare(right.id))
  return { generatedAt: new Date().toISOString(), groups }
}

async function buildThemeManifest(site) {
  const themesDir = join(contentDir, 'themes')
  const themes = []

  for (const directory of await directoriesAt(themesDir)) {
    const config = await readJson(join(themesDir, directory.name, 'theme.json'))
    if (config.id !== directory.name) {
      throw new Error(`Theme id "${config.id}" must match directory "${directory.name}"`)
    }
    themes.push(config)
  }

  const themeIds = new Set(themes.map(theme => theme.id))
  for (const id of site.themes) {
    if (!themeIds.has(id)) throw new Error(`Configured theme "${id}" has no theme package`)
  }

  themes.sort((left, right) => site.themes.indexOf(left.id) - site.themes.indexOf(right.id))
  return { generatedAt: new Date().toISOString(), themes }
}

async function validateLocales(site, carousels) {
  const slideKeys = carousels.groups.flatMap(group => group.slides.map(slide => slide.altKey))

  for (const locale of site.locales) {
    const messages = await readJson(join(contentDir, 'locales', `${locale.code}.json`))
    for (const field of ['seo', 'nav', 'hero', 'about', 'experience', 'visit', 'tickets', 'accessibility']) {
      if (!messages[field]) throw new Error(`Locale ${locale.code} is missing "${field}"`)
    }
    const missingAlts = slideKeys.filter(key => !messages.carouselAlts?.[key])
    if (missingAlts.length) {
      console.warn(`[content] ${locale.code} uses fallback alt text for: ${missingAlts.join(', ')}`)
    }
  }
}

async function writeSeoFiles(site) {
  const base = site.siteUrl.endsWith('/') ? site.siteUrl : `${site.siteUrl}/`
  const urls = site.locales.map(locale => new URL(`${locale.code}/`, base).toString())
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map((url, index) => `  <url>
    <loc>${url}</loc>
${site.locales.map((locale, alternateIndex) => `    <xhtml:link rel="alternate" hreflang="${locale.code}" href="${urls[alternateIndex]}"/>`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${urls[site.locales.findIndex(item => item.code === site.defaultLocale)]}"/>
    <changefreq>weekly</changefreq>
    <priority>${index === 0 ? '1.0' : '0.9'}</priority>
  </url>`).join('\n')}
</urlset>
`
  const robots = `User-agent: *
Allow: /

Sitemap: ${new URL('sitemap.xml', base)}
`

  await Promise.all([
    writeFile(resolve(root, 'public/sitemap.xml'), sitemap),
    writeFile(resolve(root, 'public/robots.txt'), robots)
  ])
}

async function main() {
  const site = await readJson(join(contentDir, 'site.json'))
  if (!URL.canParse(site.siteUrl)) throw new Error('siteUrl must be an absolute URL')
  for (const link of [...site.socialLinks, ...site.ticketLinks]) {
    if (!URL.canParse(link.url) || new URL(link.url).protocol !== 'https:') {
      throw new Error(`External link "${link.id}" must use an absolute HTTPS URL`)
    }
  }
  if (!site.locales.some(locale => locale.code === site.defaultLocale)) {
    throw new Error('defaultLocale must be present in locales')
  }

  const carousels = await buildCarouselManifest()
  const themes = await buildThemeManifest(site)
  await validateLocales(site, carousels)

  await Promise.all([
    mkdir(join(contentDir, 'carousels'), { recursive: true }),
    mkdir(join(contentDir, 'themes'), { recursive: true })
  ])
  await Promise.all([
    writeFile(join(contentDir, 'carousels/manifest.json'), `${JSON.stringify(carousels, null, 2)}\n`),
    writeFile(join(contentDir, 'themes/manifest.json'), `${JSON.stringify(themes, null, 2)}\n`),
    writeSeoFiles(site)
  ])

  const imageCount = carousels.groups.reduce((total, group) => total + group.slides.length, 0)
  console.log(`[content] Synced ${carousels.groups.length} carousel groups, ${imageCount} images, ${themes.themes.length} themes.`)
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
