<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ItineraryDay, Activity, DayVariation } from '@/types'
import { formatDate, getDayNumber } from '@/utils/dates'
import ActivityItem from './ActivityItem.vue'
import ActivityForm from './ActivityForm.vue'
import VariationTabs from './VariationTabs.vue'
import LocationEditor from './LocationEditor.vue'
import DayTripEditor from './DayTripEditor.vue'
import Badge from '@/components/shared/Badge.vue'

const props = defineProps<{
  day: ItineraryDay
  startDate: string
  itineraryId: string
  isSelected?: boolean
  isSelecting?: boolean
}>()

const emit = defineEmits<{
  selectDay: [date: string, shiftKey: boolean]
  addActivity: [date: string, activity: Omit<Activity, 'id'>]
  updateActivity: [date: string, activityId: string, updates: Partial<Activity>]
  removeActivity: [date: string, activityId: string]
  updateDay: [date: string, updates: Partial<ItineraryDay>]
  removeVariation: [date: string, variationId: string]
  addVariation: [date: string]
  promoteVariation: [date: string, variationId: string]
  updateVariation: [date: string, variationId: string, updates: Partial<DayVariation>]
  addVariationActivity: [date: string, variationId: string, activity: Omit<Activity, 'id'>]
  updateVariationActivity: [date: string, variationId: string, activityId: string, updates: Partial<Activity>]
  removeVariationActivity: [date: string, variationId: string, activityId: string]
  deleteDay: [date: string]
}>()

const { t } = useI18n()
const editingTitle = ref(false)
const editTitle = ref('')
const activeVariationTab = ref('main')

const dayNum = computed(() => getDayNumber(props.day.date, props.startDate))
const formattedDate = computed(() => formatDate(props.day.date))

const mainActivities = computed(() => {
  const sorted = [...props.day.activities]
  const order = { morning: 0, 'all-day': 1, afternoon: 2, evening: 3 }
  sorted.sort((a, b) => (order[a.time] ?? 4) - (order[b.time] ?? 4))
  return sorted
})

function startEditTitle() {
  editTitle.value = props.day.title
  editingTitle.value = true
}

function saveTitle() {
  emit('updateDay', props.day.date, { title: editTitle.value })
  editingTitle.value = false
}
</script>

<template>
  <div
    class="group/card bg-white rounded-lg border p-4 transition-all"
    :class="[
      isSelected ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200',
      isSelecting ? 'cursor-pointer hover:border-blue-300' : ''
    ]"
    @click="(e: MouseEvent) => isSelecting ? emit('selectDay', day.date, e.shiftKey) : undefined"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-gray-400 uppercase">{{ t('day.dayNumber', { n: dayNum }) }}</span>
        <span class="text-xs text-gray-400">{{ formattedDate }}</span>
        <DayTripEditor
          :is-day-trip="day.isDayTrip"
          :day-trip-destination="day.dayTripDestination"
          :day-trip-coordinates="day.dayTripCoordinates"
          @update="(isDT, dest, coords) => emit('updateDay', day.date, { isDayTrip: isDT, dayTripDestination: dest, dayTripCoordinates: coords })"
        />
        <Badge v-if="day.variations.length > 0" color="bg-amber-100 text-amber-700">
          {{ t('day.variations', { count: day.variations.length }, day.variations.length) }}
        </Badge>
      </div>
      <button
        @click.stop="emit('deleteDay', day.date)"
        class="opacity-100 lg:opacity-0 lg:group-hover/card:opacity-100 transition-opacity text-gray-300 hover:text-red-500 cursor-pointer p-1"
        :title="t('day.deleteTooltip')"
      >
        🗑️
      </button>
    </div>

    <!-- Location Editor -->
    <div class="mb-2">
      <LocationEditor
        :location="day.location"
        :coordinates="day.coordinates"
        @update="(loc, coords) => emit('updateDay', day.date, { location: loc, coordinates: coords })"
      />
    </div>

    <!-- Title -->
    <div class="mb-3">
      <div v-if="editingTitle" class="flex gap-2" @click.stop>
        <input
          v-model="editTitle"
          class="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keyup.enter="saveTitle"
        />
        <button @click="saveTitle" class="text-xs text-blue-600 cursor-pointer">{{ t('common.save') }}</button>
        <button @click="editingTitle = false" class="text-xs text-gray-400 cursor-pointer">{{ t('common.cancel') }}</button>
      </div>
      <h4
        v-else
        class="text-base font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
        @click.stop="startEditTitle"
      >
        {{ day.title }}
      </h4>
      <p v-if="day.accommodation" class="text-xs text-gray-400 mt-0.5">🏨 {{ day.accommodation }}</p>
    </div>

    <!-- Variation Tabs -->
    <VariationTabs
      :day="day"
      v-model:active-tab="activeVariationTab"
      @remove-variation="(vId) => emit('removeVariation', day.date, vId)"
      @add-variation="emit('addVariation', day.date)"
      @promote-variation="(vId) => emit('promoteVariation', day.date, vId)"
      @update-variation="(vId, u) => emit('updateVariation', day.date, vId, u)"
      @add-variation-activity="(vId, act) => emit('addVariationActivity', day.date, vId, act)"
      @update-variation-activity="(vId, aId, u) => emit('updateVariationActivity', day.date, vId, aId, u)"
      @remove-variation-activity="(vId, aId) => emit('removeVariationActivity', day.date, vId, aId)"
    />

    <!-- Activities (main, shown when main tab is active) -->
    <div v-if="activeVariationTab === 'main'" class="space-y-2">
      <ActivityItem
        v-for="act in mainActivities"
        :key="act.id"
        :activity="act"
        @update="(updates) => emit('updateActivity', day.date, act.id, updates)"
        @remove="emit('removeActivity', day.date, act.id)"
      />
    </div>

    <!-- Add Activity (only when main tab) -->
    <div v-if="activeVariationTab === 'main'" class="mt-3">
      <ActivityForm @add="(act) => emit('addActivity', day.date, act)" />
    </div>
  </div>
</template>
