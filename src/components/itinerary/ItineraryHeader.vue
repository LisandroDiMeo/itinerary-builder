<script setup lang="ts">
import { computed } from 'vue'
import type { Itinerary } from '@/types'
import { formatDateRange } from '@/utils/dates'

const props = defineProps<{
  itinerary: Itinerary
  isSelecting: boolean
}>()

const emit = defineEmits<{ toggleSelection: []; export: [] }>()

const dateRange = computed(() => {
  if (props.itinerary.days.length === 0) return 'No dates'
  const first = props.itinerary.days[0]
  const last = props.itinerary.days[props.itinerary.days.length - 1]
  if (!first || !last) return 'No dates'
  return formatDateRange(first.date, last.date)
})

const locationCount = computed(() => {
  return new Set(props.itinerary.days.map(d => d.location)).size
})
</script>

<template>
  <div class="mb-6">
    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ itinerary.name }}</h1>
        <p v-if="itinerary.description" class="text-sm text-gray-500 mt-1">{{ itinerary.description }}</p>
        <div class="flex items-center gap-3 mt-2 text-sm text-gray-500">
          <span>📅 {{ dateRange }}</span>
          <span>{{ itinerary.days.length }} days</span>
          <span>📍 {{ locationCount }} locations</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="emit('export')"
          class="px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 whitespace-nowrap"
        >
          💾 Export JSON
        </button>
        <button
          @click="emit('toggleSelection')"
          class="px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors whitespace-nowrap"
          :class="isSelecting
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          {{ isSelecting ? 'Cancel Selection' : 'Select Days' }}
        </button>
      </div>
    </div>
  </div>
</template>
