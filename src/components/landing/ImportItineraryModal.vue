<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Itinerary } from '@/types'
import { formatDateRange } from '@/utils/dates'
import { readFileAsText } from '@/utils/file'
import BaseModal from '@/components/shared/BaseModal.vue'

defineProps<{ show: boolean }>()
const emit = defineEmits<{ close: []; import: [json: string] }>()

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
    error.value = 'Failed to read file'
  }
}

function parseAndPreview() {
  try {
    const data = JSON.parse(rawJson.value)
    if (!data || typeof data !== 'object') throw new Error('Not a valid JSON object')
    if (!data.name) throw new Error('Missing itinerary name')
    if (!Array.isArray(data.days) || data.days.length === 0) throw new Error('Missing or empty days array')
    for (const day of data.days) {
      if (!day.date || !day.location) throw new Error('Each day must have date and location')
    }
    preview.value = data as Itinerary
    error.value = ''
  } catch (e: any) {
    error.value = e.message || 'Invalid JSON format'
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
  <BaseModal :show="show" title="Import Itinerary" max-width="max-w-lg" @close="handleClose">
    <div class="space-y-4">
      <!-- Format explanation -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
        Upload a JSON file previously exported from this app. The file should contain an itinerary
        with <code class="bg-blue-100 px-1 rounded">name</code>, <code class="bg-blue-100 px-1 rounded">days</code> array,
        and each day should have <code class="bg-blue-100 px-1 rounded">date</code>, <code class="bg-blue-100 px-1 rounded">location</code>,
        and <code class="bg-blue-100 px-1 rounded">coordinates</code>.
      </div>

      <!-- File input -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Select JSON file</label>
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
          <div>📅 {{ previewDateRange }} &middot; {{ preview.days.length }} days</div>
          <div>📍 {{ new Set(preview.days.map(d => d.location)).size }} locations</div>
        </div>
      </div>
    </div>

    <template #footer>
      <button
        @click="handleClose"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
      >
        Cancel
      </button>
      <button
        @click="doImport"
        :disabled="!preview"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        Import
      </button>
    </template>
  </BaseModal>
</template>
