<script setup lang="ts">
defineProps<{
  modelValue: string
  themes: Array<{ id: string; label: string }>
  names: Record<string, string>
  label: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <label class="select-control">
    <span class="sr-only">{{ label }}</span>
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3a9 9 0 1 0 9 9c0-1.1-.9-2-2-2h-1.2a2 2 0 0 1-2-2V6.8A3.8 3.8 0 0 0 12 3Z" />
      <circle cx="7.5" cy="12" r=".8" />
      <circle cx="10" cy="16" r=".8" />
      <circle cx="9.5" cy="8" r=".8" />
    </svg>
    <select
      :value="modelValue"
      :aria-label="label"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-for="theme in themes" :key="theme.id" :value="theme.id">
        {{ names[theme.id] || theme.label }}
      </option>
    </select>
  </label>
</template>
