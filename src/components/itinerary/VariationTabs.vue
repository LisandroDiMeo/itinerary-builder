<script setup lang="ts">
import { ref } from 'vue'
import type { ItineraryDay, DayVariation, Activity } from '@/types'
import ActivityItem from './ActivityItem.vue'
import { categoryIcons } from '@/utils/colors'

const props = defineProps<{ day: ItineraryDay }>()
const emit = defineEmits<{ removeVariation: [variationId: string] }>()

const activeTab = ref<string>('main')
</script>

<template>
  <div v-if="day.variations.length > 0" class="mt-3">
    <div class="flex gap-1 border-b border-gray-200 mb-3">
      <button
        @click="activeTab = 'main'"
        class="px-3 py-1.5 text-xs font-medium rounded-t-lg cursor-pointer transition-colors"
        :class="activeTab === 'main' ? 'bg-blue-100 text-blue-700 border border-b-white border-gray-200 -mb-px' : 'text-gray-500 hover:text-gray-700'"
      >
        Main Plan
      </button>
      <button
        v-for="v in day.variations"
        :key="v.id"
        @click="activeTab = v.id"
        class="px-3 py-1.5 text-xs font-medium rounded-t-lg cursor-pointer transition-colors flex items-center gap-1"
        :class="activeTab === v.id ? 'bg-amber-100 text-amber-700 border border-b-white border-gray-200 -mb-px' : 'text-gray-500 hover:text-gray-700'"
      >
        {{ v.sourceItineraryName }}
        <span
          @click.stop="emit('removeVariation', v.id)"
          class="text-gray-400 hover:text-red-500 ml-1"
          title="Remove variation"
        >&times;</span>
      </button>
    </div>

    <!-- Variation content -->
    <div v-if="activeTab !== 'main'">
      <div v-for="v in day.variations" :key="v.id">
        <div v-if="activeTab === v.id" class="space-y-2">
          <div class="text-xs text-amber-600 mb-2">
            From "{{ v.sourceItineraryName }}" &middot; {{ v.location }} &middot; {{ v.title }}
          </div>
          <div v-for="act in v.activities" :key="act.id" class="flex items-start gap-2">
            <span class="text-sm flex-shrink-0 mt-0.5">{{ categoryIcons[act.category] || '📌' }}</span>
            <div>
              <span class="text-sm font-medium text-gray-800">{{ act.title }}</span>
              <p class="text-xs text-gray-500 mt-0.5">{{ act.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
