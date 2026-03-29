<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from './BaseModal.vue'
import { formatDateRange } from '@/utils/dates'

const SUPPRESS_KEY = 'itinerary-suppress-reorder-confirm'

const props = defineProps<{
  show: boolean
  oldGroups: { location: string; startDate: string; endDate: string }[]
  newGroups: { location: string; startDate: string; endDate: string }[]
}>()

const emit = defineEmits<{ confirm: []; cancel: [] }>()

const suppress = ref(false)

function confirm() {
  if (suppress.value) {
    localStorage.setItem(SUPPRESS_KEY, 'true')
  }
  emit('confirm')
}
</script>

<template>
  <BaseModal :show="show" title="Reorder Locations" @close="emit('cancel')">
    <div class="space-y-4">
      <p class="text-sm text-gray-600">
        Reordering locations will recalculate all dates. Here's how the schedule will change:
      </p>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <h4 class="text-xs font-semibold text-gray-500 uppercase mb-2">Current</h4>
          <div class="space-y-1">
            <div v-for="(g, i) in oldGroups" :key="i" class="text-sm text-gray-700 flex items-center gap-2">
              <span class="font-medium">{{ g.location }}</span>
              <span class="text-xs text-gray-400">{{ formatDateRange(g.startDate, g.endDate) }}</span>
            </div>
          </div>
        </div>
        <div>
          <h4 class="text-xs font-semibold text-gray-500 uppercase mb-2">After reorder</h4>
          <div class="space-y-1">
            <div v-for="(g, i) in newGroups" :key="i" class="text-sm text-gray-700 flex items-center gap-2">
              <span class="font-medium">{{ g.location }}</span>
              <span class="text-xs text-gray-400">{{ formatDateRange(g.startDate, g.endDate) }}</span>
            </div>
          </div>
        </div>
      </div>

      <label class="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          v-model="suppress"
          class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span class="text-sm text-gray-600">Don't show this again</span>
      </label>
    </div>

    <template #footer>
      <button
        @click="emit('cancel')"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
      >
        Cancel
      </button>
      <button
        @click="confirm"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
      >
        Reorder
      </button>
    </template>
  </BaseModal>
</template>
