import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FestivalCarousel from '~/components/FestivalCarousel.vue'
import type { FestivalMessages } from '~/types/content'

const messages = {
  accessibility: {
    previousSlide: 'Previous',
    nextSlide: 'Next',
    pauseCarousel: 'Pause',
    playCarousel: 'Play',
    goToSlide: 'Go to',
    openMenu: 'Open',
    closeMenu: 'Close'
  },
  carouselAlts: {
    first: 'First lantern',
    second: 'Second lantern'
  }
} as FestivalMessages

describe('FestivalCarousel', () => {
  it('moves with controls and announces translated images', async () => {
    const wrapper = mount(FestivalCarousel, {
      props: {
        label: 'Festival gallery',
        messages,
        slides: [
          { src: '/first.svg', altKey: 'first' },
          { src: '/second.svg', altKey: 'second' }
        ]
      }
    })

    expect(wrapper.get('img').attributes('alt')).toBe('First lantern')
    expect(wrapper.get('.carousel__track').attributes('style')).toContain('0%')

    await wrapper.get('[aria-label="Next"]').trigger('click')
    expect(wrapper.get('.carousel__track').attributes('style')).toContain('-100%')

    await wrapper.get('[aria-label="Previous"]').trigger('click')
    expect(wrapper.get('.carousel__track').attributes('style')).toContain('0%')
  })

  it('does not render navigation for a single image', () => {
    const wrapper = mount(FestivalCarousel, {
      props: {
        label: 'Single image',
        messages,
        slides: [{ src: '/first.svg', altKey: 'first' }]
      }
    })

    expect(wrapper.find('.carousel__arrow').exists()).toBe(false)
    expect(wrapper.attributes('aria-roledescription')).toBe('carousel')
  })
})
