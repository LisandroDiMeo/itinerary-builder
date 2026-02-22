<script setup lang="ts">
import { computed } from 'vue'
import type { Itinerary } from '@/types'
import { formatDateRange } from '@/utils/dates'

const props = defineProps<{
  itinerary: Itinerary
  isSelecting: boolean
}>()

const emit = defineEmits<{ toggleSelection: [] }>()

const dateRange = computed(() => {
  if (props.itinerary.days.length === 0) return 'No dates'
  return formatDateRange(
    props.itinerary.days[0].date,
    props.itinerary.days[props.itinerary.days.length - 1].date
  )
})

const locationCount = computed(() => {
  return new Set(props.itinerary.days.map(d => d.location)).size
})
</script>

<template>
  <div class="mb-6">
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ itinerary.name }}</h1>
        <p v-if="itinerary.description" class="text-sm text-gray-500 mt-1">{{ itinerary.description }}</p>
        <div class="flex items-center gap-3 mt-2 text-sm text-gray-500">
          <span>📅 {{ dateRange }}</span>
          <span>{{ itinerary.days.length }} days</span>
          <span>📍 {{ locationCount }} locations</span>
        </div>
      </div>
      <button
        @click="emit('toggleSelection')"
        class="px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors"
        :class="isSelecting
          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
      >
        {{ isSelecting ? 'Cancel Selection' : 'Select Date Range' }}
      </button>
    </div>
  </div>
</template>
