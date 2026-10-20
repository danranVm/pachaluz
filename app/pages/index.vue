<script setup lang="ts">
import { onMounted } from 'vue'
import { resolveBrowserLocale } from '~/utils/content'

onMounted(() => {
  const locale = resolveBrowserLocale(navigator.language)
  return navigateTo(`/${locale}/`, { replace: true })
})
</script>

<template>
  <main class="redirect-page">
    <a href="/es/">Entrar en PachA Luz</a>
  </main>
</template>
