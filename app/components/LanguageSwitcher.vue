<script setup lang="ts">
import type { LocaleCode, LocaleOption } from '~/types/content'

defineProps<{
  locale: LocaleCode
  locales: LocaleOption[]
  label: string
}>()
</script>

<template>
  <label class="select-control">
    <span class="sr-only">{{ label }}</span>
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </svg>
    <select
      :value="locale"
      :aria-label="label"
      @change="navigateTo(`/${($event.target as HTMLSelectElement).value}/`)"
    >
      <option v-for="item in locales" :key="item.code" :value="item.code">
        {{ item.shortLabel }}
      </option>
    </select>
  </label>
</template>
