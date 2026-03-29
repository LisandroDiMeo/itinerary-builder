<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { ItineraryDay, DayVariation, Activity } from '@/types'
import ActivityItem from './ActivityItem.vue'
import ActivityForm from './ActivityForm.vue'
import LocationEditor from './LocationEditor.vue'
import { categoryIcons } from '@/utils/colors'

const props = defineProps<{ day: ItineraryDay }>()

const activeTab = defineModel<string>('activeTab', { default: 'main' })

const emit = defineEmits<{
  removeVariation: [variationId: string]
  addVariation: []
  promoteVariation: [variationId: string]
  updateVariation: [variationId: string, updates: Partial<DayVariation>]
  addVariationActivity: [variationId: string, activity: Omit<Activity, 'id'>]
  updateVariationActivity: [variationId: string, activityId: string, updates: Partial<Activity>]
  removeVariationActivity: [variationId: string, activityId: string]
}>()

// Reset active tab if the active variation was removed
watch(() => props.day.variations, (variations) => {
  if (activeTab.value !== 'main' && !variations.find(v => v.id === activeTab.value)) {
    activeTab.value = 'main'
  }
}, { deep: true })

const activeVariation = computed(() =>
  props.day.variations.find(v => v.id === activeTab.value)
)

const sortedVariationActivities = computed(() => {
  if (!activeVariation.value) return []
  const sorted = [...activeVariation.value.activities]
  const order: Record<string, number> = { morning: 0, 'all-day': 1, afternoon: 2, evening: 3 }
  sorted.sort((a, b) => (order[a.time] ?? 4) - (order[b.time] ?? 4))
  return sorted
})
</script>

<template>
  <div class="mt-3">
    <!-- Tab bar -->
    <div class="flex items-center gap-1 border-b border-gray-200 mb-3" v-if="day.variations.length > 0">
      <button
        @click="activeTab = 'main'"
        class="group/tab px-3 py-1.5 text-xs font-medium rounded-t-lg cursor-pointer transition-colors flex items-center gap-1"
        :class="activeTab === 'main' ? 'bg-blue-100 text-blue-700 border border-b-white border-gray-200 -mb-px' : 'text-gray-500 hover:text-gray-700'"
      >
        Main Plan
        <span
          v-if="day.variations.length > 0"
          @click.stop="emit('promoteVariation', day.variations[0]!.id)"
          class="text-gray-400 hover:text-red-500 ml-0.5 hidden group-hover/tab:inline"
          title="Remove main and promote first variation"
        >&times;</span>
      </button>
      <button
        v-for="v in day.variations"
        :key="v.id"
        @click="activeTab = v.id"
        class="group/tab px-3 py-1.5 text-xs font-medium rounded-t-lg cursor-pointer transition-colors flex items-center gap-1"
        :class="activeTab === v.id ? 'bg-amber-100 text-amber-700 border border-b-white border-gray-200 -mb-px' : 'text-gray-500 hover:text-gray-700'"
      >
        {{ v.sourceItineraryName || 'Manual' }}
        <span
          @click.stop="emit('promoteVariation', v.id)"
          class="text-gray-400 hover:text-blue-500 hidden group-hover/tab:inline"
          title="Promote to main"
        >&#8593;</span>
        <span
          @click.stop="emit('removeVariation', v.id)"
          class="text-gray-400 hover:text-red-500 hidden group-hover/tab:inline"
          title="Remove variation"
        >&times;</span>
      </button>
      <button
        @click="emit('addVariation')"
        class="px-2 py-1.5 text-xs text-gray-400 hover:text-blue-600 cursor-pointer transition-colors"
        title="Add a manual variation"
      >+</button>
    </div>

    <!-- Add variation button when no variations exist -->
    <div v-else class="mb-2">
      <button
        @click="emit('addVariation')"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border border-dashed border-gray-300 text-gray-400 hover:border-amber-400 hover:text-amber-600 cursor-pointer transition-colors"
        title="Add an alternative plan for this day"
      >
        + Add Variation
      </button>
    </div>

    <!-- Variation content (editable) -->
    <div v-if="activeTab !== 'main' && activeVariation">
      <div class="space-y-3">
        <div class="text-xs text-amber-600 mb-2">
          {{ activeVariation.sourceItineraryName ? `From "${activeVariation.sourceItineraryName}"` : 'Manual variation' }}
        </div>

        <!-- Variation location -->
        <LocationEditor
          :location="activeVariation.location"
          :coordinates="activeVariation.coordinates"
          @update="(loc, coords) => emit('updateVariation', activeVariation!.id, { location: loc, coordinates: coords })"
        />

        <!-- Variation title -->
        <div class="text-sm font-medium text-gray-800">{{ activeVariation.title }}</div>

        <!-- Variation activities (editable) -->
        <div class="space-y-2">
          <ActivityItem
            v-for="act in sortedVariationActivities"
            :key="act.id"
            :activity="act"
            @update="(updates) => emit('updateVariationActivity', activeVariation!.id, act.id, updates)"
            @remove="emit('removeVariationActivity', activeVariation!.id, act.id)"
          />
        </div>

        <!-- Add activity to variation -->
        <ActivityForm @add="(act) => emit('addVariationActivity', activeVariation!.id, act)" />
      </div>
    </div>
  </div>
</template>
