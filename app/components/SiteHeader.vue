<script setup lang="ts">
import { ref } from 'vue'
import type { FestivalMessages, LocaleCode, LocaleOption } from '~/types/content'

defineProps<{
  messages: FestivalMessages
  locale: LocaleCode
  locales: LocaleOption[]
  activeTheme: string
  themes: Array<{ id: string; label: string }>
}>()

const emit = defineEmits<{
  themeChange: [value: string]
}>()

const menuOpen = ref(false)
</script>

<template>
  <header class="site-header">
    <NuxtLink :to="`/${locale}/`" class="brand" aria-label="PachA Luz">
      <span class="brand__sun" aria-hidden="true">✦</span>
      <span><strong>PACHA</strong> LUZ</span>
    </NuxtLink>

    <button
      class="menu-toggle"
      type="button"
      :aria-expanded="menuOpen"
      aria-controls="main-navigation"
      :aria-label="menuOpen ? messages.accessibility.closeMenu : messages.accessibility.openMenu"
      @click="menuOpen = !menuOpen"
    >
      <span />
      <span />
    </button>

    <nav id="main-navigation" class="site-nav" :class="{ 'is-open': menuOpen }">
      <a href="#experience" @click="menuOpen = false">{{ messages.nav.experience }}</a>
      <a href="#gallery" @click="menuOpen = false">{{ messages.nav.gallery }}</a>
      <a href="#visit" @click="menuOpen = false">{{ messages.nav.visit }}</a>
      <a href="#tickets" class="nav-ticket" @click="menuOpen = false">{{ messages.nav.tickets }}</a>
      <div class="site-nav__controls">
        <LanguageSwitcher :locale :locales :label="messages.nav.language" />
        <ThemeSwitcher
          :model-value="activeTheme"
          :themes
          :names="messages.themeNames"
          :label="messages.nav.theme"
          @update:model-value="emit('themeChange', $event)"
        />
      </div>
    </nav>
  </header>
</template>
