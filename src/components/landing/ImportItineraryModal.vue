<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Itinerary } from '@/types'
import { formatDateRange } from '@/utils/dates'
import { readFileAsText } from '@/utils/file'
import BaseModal from '@/components/shared/BaseModal.vue'

defineProps<{ show: boolean }>()
const emit = defineEmits<{ close: []; import: [json: string] }>()

const { t } = useI18n()
const fileInput = ref<HTMLInputElement | null>(null)
const rawJson = ref('')
const error = ref('')
const preview = ref<Itinerary | null>(null)

const previewDateRange = computed(() => {
  if (!preview.value || preview.value.days.length === 0) return ''
  const days = preview.value.days
  const first = days[0]!
  const last = days[days.length - 1]!
  return formatDateRange(first.date, last.date)
})

async function handleFile(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  error.value = ''
  preview.value = null

  try {
    rawJson.value = await readFileAsText(file)
    parseAndPreview()
  } catch {
    error.value = t('importItinerary.errors.readFile')
  }
}

function parseAndPreview() {
  try {
    const data = JSON.parse(rawJson.value)
    if (!data || typeof data !== 'object') throw new Error(t('importItinerary.errors.notObject'))
    if (!data.name) throw new Error(t('importItinerary.errors.missingName'))
    if (!Array.isArray(data.days) || data.days.length === 0) throw new Error(t('importItinerary.errors.missingDays'))
    for (const day of data.days) {
      if (!day.date || !day.location) throw new Error(t('importItinerary.errors.dayMissingFields'))
    }
    preview.value = data as Itinerary
    error.value = ''
  } catch (e: any) {
    error.value = e.message || t('importItinerary.errors.invalidFormat')
    preview.value = null
  }
}

function doImport() {
  if (!rawJson.value) return
  emit('import', rawJson.value)
  reset()
}

function reset() {
  rawJson.value = ''
  error.value = ''
  preview.value = null
  if (fileInput.value) fileInput.value.value = ''
}

function handleClose() {
  reset()
  emit('close')
}
</script>

<template>
  <BaseModal :show="show" :title="t('importItinerary.title')" max-width="max-w-lg" @close="handleClose">
    <div class="space-y-4">
      <!-- Format explanation -->
      <i18n-t
        keypath="importItinerary.description"
        tag="div"
        class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700"
      >
        <template #name><code class="bg-blue-100 px-1 rounded">name</code></template>
        <template #days><code class="bg-blue-100 px-1 rounded">days</code></template>
        <template #date><code class="bg-blue-100 px-1 rounded">date</code></template>
        <template #location><code class="bg-blue-100 px-1 rounded">location</code></template>
        <template #coordinates><code class="bg-blue-100 px-1 rounded">coordinates</code></template>
      </i18n-t>

      <!-- File input -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('importItinerary.selectFile') }}</label>
        <input
          ref="fileInput"
          type="file"
          accept=".json,application/json"
          @change="handleFile"
          class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
        />
      </div>

      <!-- Error display -->
      <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
        {{ error }}
      </div>

      <!-- Preview -->
      <div v-if="preview" class="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
        <h4 class="font-semibold text-gray-900">{{ preview.name }}</h4>
        <p v-if="preview.description" class="text-sm text-gray-500">{{ preview.description }}</p>
        <div class="text-sm text-gray-600 space-y-1">
          <div>📅 {{ previewDateRange }} &middot; {{ preview.days.length }} {{ t('common.days') }}</div>
          <div>📍 {{ new Set(preview.days.map(d => d.location)).size }} {{ t('common.locations') }}</div>
        </div>
      </div>
    </div>

    <template #footer>
      <button
        @click="handleClose"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
      >
        {{ t('common.cancel') }}
      </button>
      <button
        @click="doImport"
        :disabled="!preview"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        {{ t('common.import') }}
      </button>
    </template>
  </BaseModal>
</template>
