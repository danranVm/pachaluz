<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { CarouselSlide } from '~/types/content'
import { getSlideAlt, resolveSlideIndex } from '~/utils/content'
import type { FestivalMessages } from '~/types/content'

const props = withDefaults(defineProps<{
  slides: CarouselSlide[]
  messages: FestivalMessages
  interval?: number
  mode?: 'hero' | 'gallery'
  label: string
}>(), {
  interval: 5600,
  mode: 'gallery'
})

const current = ref(0)
const playing = ref(true)
const hovering = ref(false)
const touchStart = ref<number | null>(null)
let timer: ReturnType<typeof setInterval> | undefined

const hasMany = computed(() => props.slides.length > 1)

function go(change: number) {
  current.value = resolveSlideIndex(current.value, change, props.slides.length)
}

function goTo(index: number) {
  if (index >= 0 && index < props.slides.length) current.value = index
}

function stopTimer() {
  if (timer) clearInterval(timer)
  timer = undefined
}

function startTimer() {
  stopTimer()
  if (!import.meta.client || !playing.value || hovering.value || !hasMany.value) return
  timer = setInterval(() => go(1), props.interval)
}

function togglePlaying() {
  playing.value = !playing.value
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowLeft') go(-1)
  if (event.key === 'ArrowRight') go(1)
}

function onTouchStart(event: TouchEvent) {
  touchStart.value = event.changedTouches[0]?.clientX ?? null
}

function onTouchEnd(event: TouchEvent) {
  const end = event.changedTouches[0]?.clientX
  if (touchStart.value === null || end === undefined) return
  const distance = end - touchStart.value
  if (Math.abs(distance) > 48) go(distance > 0 ? -1 : 1)
  touchStart.value = null
}

watch([playing, hovering, () => props.slides.length], startTimer)
watch(() => props.slides, () => {
  if (current.value >= props.slides.length) current.value = 0
}, { deep: true })

onMounted(startTimer)
onBeforeUnmount(stopTimer)
</script>

<template>
  <div
    v-if="slides.length"
    class="carousel"
    :class="`carousel--${mode}`"
    role="region"
    aria-roledescription="carousel"
    :aria-label="label"
    tabindex="0"
    @keydown="onKeydown"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
    @focusin="hovering = true"
    @focusout="hovering = false"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <div class="carousel__track" :style="{ transform: `translate3d(-${current * 100}%, 0, 0)` }">
      <figure
        v-for="(slide, index) in slides"
        :key="slide.src"
        class="carousel__slide"
        :aria-hidden="index !== current"
      >
        <img
          :src="slide.src"
          :alt="getSlideAlt(slide, messages, `${label} ${index + 1}`)"
          :loading="mode === 'hero' && index === 0 ? 'eager' : 'lazy'"
          :fetchpriority="mode === 'hero' && index === 0 ? 'high' : 'auto'"
          width="1600"
          height="1000"
        >
      </figure>
    </div>

    <template v-if="hasMany">
      <button
        class="carousel__arrow carousel__arrow--previous"
        type="button"
        :aria-label="messages.accessibility.previousSlide"
        @click="go(-1)"
      >
        <span aria-hidden="true">←</span>
      </button>
      <button
        class="carousel__arrow carousel__arrow--next"
        type="button"
        :aria-label="messages.accessibility.nextSlide"
        @click="go(1)"
      >
        <span aria-hidden="true">→</span>
      </button>

      <div class="carousel__controls">
        <div class="carousel__dots">
          <button
            v-for="(_, index) in slides"
            :key="index"
            type="button"
            :class="{ 'is-active': index === current }"
            :aria-label="`${messages.accessibility.goToSlide} ${index + 1}`"
            :aria-current="index === current ? 'true' : undefined"
            @click="goTo(index)"
          />
        </div>
        <button
          class="carousel__play"
          type="button"
          :aria-label="playing ? messages.accessibility.pauseCarousel : messages.accessibility.playCarousel"
          @click="togglePlaying"
        >
          <span aria-hidden="true">{{ playing ? 'Ⅱ' : '▶' }}</span>
        </button>
      </div>
    </template>
  </div>
</template>
