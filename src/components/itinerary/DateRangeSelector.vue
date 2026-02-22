<script setup lang="ts">
import { computed } from 'vue'
import { formatDate, daysBetween } from '@/utils/dates'

const props = defineProps<{
  startDate: string | null
  endDate: string | null
}>()

const emit = defineEmits<{ transfer: []; cancel: [] }>()

const rangeText = computed(() => {
  if (!props.startDate) return 'Click a day to start selecting'
  if (!props.endDate) return `${formatDate(props.startDate)} — click another day to set end`
  const count = daysBetween(props.startDate, props.endDate) + 1
  return `${formatDate(props.startDate)} → ${formatDate(props.endDate)} (${count} days)`
})

const canTransfer = computed(() => !!props.startDate && !!props.endDate)
</script>

<template>
  <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-blue-200 rounded-xl shadow-lg px-6 py-3 flex items-center gap-4">
    <div class="text-sm text-gray-700">{{ rangeText }}</div>
    <button
      v-if="canTransfer"
      @click="emit('transfer')"
      class="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
    >
      Add to Itinerary
    </button>
    <button
      @click="emit('cancel')"
      class="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
    >
      Cancel
    </button>
  </div>
</template>
