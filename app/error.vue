<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{ error: NuxtError }>()

useSeoMeta({
  title: 'Page not found',
  robots: 'noindex, nofollow'
})
</script>

<template>
  <main class="error-page">
    <div class="error-page__light" aria-hidden="true">✦</div>
    <p class="eyebrow">PachA Luz</p>
    <h1>{{ error.statusCode === 404 ? '404' : error.statusCode }}</h1>
    <p>{{ error.statusCode === 404 ? 'This light has wandered off the path.' : error.statusMessage }}</p>
    <button class="button button--primary" type="button" @click="clearError({ redirect: '/zh-CN/' })">
      Return home
    </button>
  </main>
</template>
