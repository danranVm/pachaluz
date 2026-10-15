import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const output = resolve(process.cwd(), '.output/public')
const site = JSON.parse(await readFile(resolve(process.cwd(), 'public/content/site.json'), 'utf8'))
const failures = []

function check(condition, message) {
  if (!condition) failures.push(message)
}

for (const locale of site.locales) {
  const html = await readFile(resolve(output, locale.code, 'index.html'), 'utf8')
  const messages = JSON.parse(
    await readFile(resolve(process.cwd(), `public/content/locales/${locale.code}.json`), 'utf8')
  )
  const canonical = new URL(`${locale.code}/`, site.siteUrl).toString()

  check(html.includes(`lang="${locale.code}"`), `${locale.code}: missing html lang`)
  check(html.includes(messages.seo.title), `${locale.code}: missing localized title`)
  check(html.includes(`rel="canonical" href="${canonical}"`), `${locale.code}: missing canonical`)
  check(html.includes('hreflang="x-default"'), `${locale.code}: missing x-default hreflang`)
  check(html.includes('application/ld+json'), `${locale.code}: missing JSON-LD`)
  check(html.includes('"@type":"Festival"'), `${locale.code}: missing Festival schema`)
  check(html.includes('"@type":"Organization"'), `${locale.code}: missing Organization schema`)
  check(html.includes('"@type":"BreadcrumbList"'), `${locale.code}: missing breadcrumb schema`)
  check(html.includes(messages.hero.title), `${locale.code}: missing rendered hero content`)
  check(html.includes('rel="noopener noreferrer"'), `${locale.code}: external links are not protected`)
}

const sitemap = await readFile(resolve(output, 'sitemap.xml'), 'utf8')
const robots = await readFile(resolve(output, 'robots.txt'), 'utf8')
for (const locale of site.locales) {
  check(sitemap.includes(new URL(`${locale.code}/`, site.siteUrl).toString()), `sitemap: missing ${locale.code}`)
}
check(robots.includes(new URL('sitemap.xml', site.siteUrl).toString()), 'robots: missing sitemap URL')

if (failures.length) {
  console.error(failures.map(failure => `- ${failure}`).join('\n'))
  process.exit(1)
}

console.log(`[output] Verified SEO and rendered content for ${site.locales.length} locales.`)
