import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import es from './locales/es.json'

export type AppLocale = 'en' | 'es'

const STORAGE_KEY = 'itinerary-builder-locale'

function detectInitialLocale(): AppLocale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'es') return saved
  } catch { /* ignore */ }
  const nav = typeof navigator !== 'undefined' ? navigator.language : ''
  return nav.toLowerCase().startsWith('es') ? 'es' : 'en'
}

export const i18n = createI18n({
  legacy: false,
  locale: detectInitialLocale(),
  fallbackLocale: 'en',
  messages: { en, es },
})

export function setLocale(locale: AppLocale) {
  i18n.global.locale.value = locale
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch { /* ignore */ }
}

export function getLocale(): AppLocale {
  return i18n.global.locale.value as AppLocale
}

export function getIntlLocale(): string {
  return getLocale() === 'es' ? 'es-ES' : 'en-US'
}

export function t(key: string, named?: Record<string, unknown>): string {
  return named ? i18n.global.t(key, named) : i18n.global.t(key)
}
