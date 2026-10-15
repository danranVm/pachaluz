import { computed, onMounted, ref, watch, type Ref } from 'vue'
import type { SiteConfig, ThemeManifest } from '~/types/content'

const STORAGE_KEY = 'pacha-luz-theme'

export function useFestivalTheme(site: Ref<SiteConfig>, manifest: Ref<ThemeManifest>) {
  const activeTheme = ref(site.value.defaultTheme)

  const availableThemes = computed(() =>
    manifest.value.themes.filter(theme => site.value.themes.includes(theme.id))
  )

  function isAllowed(theme: string) {
    return availableThemes.value.some(item => item.id === theme)
  }

  function applyTheme(theme: string) {
    const selected = isAllowed(theme) ? theme : site.value.defaultTheme
    activeTheme.value = selected

    if (!import.meta.client) return
    document.documentElement.dataset.theme = selected

    const config = availableThemes.value.find(item => item.id === selected)
    if (!config) return

    let link = document.querySelector<HTMLLinkElement>('#festival-theme')
    if (!link) {
      link = document.createElement('link')
      link.id = 'festival-theme'
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    }
    link.href = config.stylesheet
    localStorage.setItem(STORAGE_KEY, selected)
  }

  onMounted(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    applyTheme(stored && isAllowed(stored) ? stored : activeTheme.value)
  })

  watch(() => site.value.defaultTheme, value => {
    if (!isAllowed(activeTheme.value)) applyTheme(value)
  })

  return {
    activeTheme,
    availableThemes,
    setTheme: applyTheme
  }
}
