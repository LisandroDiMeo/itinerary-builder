<script setup lang="ts">
import { computed } from 'vue'
import { useItineraryStore } from '@/stores/itinerary'
import BaseModal from '@/components/shared/BaseModal.vue'

const props = defineProps<{
  show: boolean
  sourceId: string
  dates: string[]
}>()

const emit = defineEmits<{ close: []; transfer: [targetId: string] }>()

const store = useItineraryStore()

const targets = computed(() =>
  store.itineraries.filter(it => it.id !== props.sourceId)
)
</script>

<template>
  <BaseModal :show="show" title="Transfer Days" @close="emit('close')">
    <div class="space-y-4">
      <p class="text-sm text-gray-600">
        Transfer {{ dates.length }} day{{ dates.length !== 1 ? 's' : '' }} to another itinerary.
        If the target already has plans for those dates, they'll be added as variations.
      </p>

      <div v-if="targets.length === 0" class="text-center py-6 text-gray-400">
        <p class="text-sm">No other itineraries available.</p>
        <p class="text-xs mt-1">Create another itinerary first to transfer days.</p>
      </div>

      <div v-else class="space-y-2">
        <button
          v-for="target in targets"
          :key="target.id"
          @click="emit('transfer', target.id)"
          class="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
        >
          <div class="font-medium text-gray-900 text-sm">{{ target.name }}</div>
          <div class="text-xs text-gray-500 mt-0.5">{{ target.days.length }} days</div>
        </button>
      </div>
    </div>
  </BaseModal>
</template>
