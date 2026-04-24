<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useItineraryStore } from '@/stores/itinerary'
import BaseModal from '@/components/shared/BaseModal.vue'

const props = defineProps<{
  show: boolean
  sourceId: string
  dates: string[]
}>()

const emit = defineEmits<{ close: []; transfer: [targetId: string] }>()

const store = useItineraryStore()
const { t } = useI18n()

const targets = computed(() =>
  store.itineraries.filter(it => it.id !== props.sourceId)
)
</script>

<template>
  <BaseModal :show="show" :title="t('transfer.title')" @close="emit('close')">
    <div class="space-y-4">
      <p class="text-sm text-gray-600">
        {{ t('transfer.description', { count: dates.length }, dates.length) }}
      </p>

      <div v-if="targets.length === 0" class="text-center py-6 text-gray-400">
        <p class="text-sm">{{ t('transfer.noTargets') }}</p>
        <p class="text-xs mt-1">{{ t('transfer.createFirst') }}</p>
      </div>

      <div v-else class="space-y-2">
        <button
          v-for="target in targets"
          :key="target.id"
          @click="emit('transfer', target.id)"
          class="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
        >
          <div class="font-medium text-gray-900 text-sm">{{ target.name }}</div>
          <div class="text-xs text-gray-500 mt-0.5">{{ t('transfer.daysSuffix', { count: target.days.length }, target.days.length) }}</div>
        </button>
      </div>
    </div>
  </BaseModal>
</template>
