<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { setLocale, type AppLocale } from '@/i18n'

const route = useRoute()
const { t, locale } = useI18n()

function choose(l: AppLocale) {
  setLocale(l)
}
</script>

<template>
  <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-14">
        <router-link to="/" class="flex items-center gap-2 text-gray-900 no-underline">
          <span class="text-xl">✈️</span>
          <span class="font-bold text-lg">{{ t('header.title') }}</span>
        </router-link>
        <div class="flex items-center gap-3">
          <div
            class="flex items-center gap-0.5 bg-gray-100 rounded-full p-0.5 text-xs font-medium"
            role="group"
            :aria-label="t('header.language')"
          >
            <button
              type="button"
              @click="choose('en')"
              class="px-2.5 py-1 rounded-full transition-colors cursor-pointer"
              :class="locale === 'en' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
              :aria-pressed="locale === 'en'"
            >
              EN
            </button>
            <button
              type="button"
              @click="choose('es')"
              class="px-2.5 py-1 rounded-full transition-colors cursor-pointer"
              :class="locale === 'es' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
              :aria-pressed="locale === 'es'"
            >
              ES
            </button>
          </div>
          <div v-if="route.name === 'itinerary'">
            <router-link
              to="/"
              class="text-sm text-gray-500 hover:text-gray-700 no-underline"
            >
              &larr; {{ t('header.allItineraries') }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
