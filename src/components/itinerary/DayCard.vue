<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ItineraryDay, Activity } from '@/types'
import { formatDate, getDayNumber } from '@/utils/dates'
import ActivityItem from './ActivityItem.vue'
import ActivityForm from './ActivityForm.vue'
import VariationTabs from './VariationTabs.vue'
import LocationEditor from './LocationEditor.vue'
import Badge from '@/components/shared/Badge.vue'

const props = defineProps<{
  day: ItineraryDay
  startDate: string
  itineraryId: string
  isSelected?: boolean
  isSelecting?: boolean
}>()

const emit = defineEmits<{
  selectDay: [date: string]
  addActivity: [date: string, activity: Omit<Activity, 'id'>]
  updateActivity: [date: string, activityId: string, updates: Partial<Activity>]
  removeActivity: [date: string, activityId: string]
  updateDay: [date: string, updates: Partial<ItineraryDay>]
  removeVariation: [date: string, variationId: string]
}>()

const editingTitle = ref(false)
const editTitle = ref('')

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
    class="bg-white rounded-lg border p-4 transition-all"
    :class="[
      isSelected ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200',
      isSelecting ? 'cursor-pointer hover:border-blue-300' : ''
    ]"
    @click="isSelecting ? emit('selectDay', day.date) : undefined"
  >
    <!-- Header -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-gray-400 uppercase">Day {{ dayNum }}</span>
        <span class="text-xs text-gray-400">{{ formattedDate }}</span>
        <Badge v-if="day.isDayTrip" color="bg-violet-100 text-violet-700">
          🚃 Day Trip: {{ day.dayTripDestination }}
        </Badge>
        <Badge v-if="day.variations.length > 0" color="bg-amber-100 text-amber-700">
          {{ day.variations.length }} variation{{ day.variations.length > 1 ? 's' : '' }}
        </Badge>
      </div>
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
        <button @click="saveTitle" class="text-xs text-blue-600 cursor-pointer">Save</button>
        <button @click="editingTitle = false" class="text-xs text-gray-400 cursor-pointer">Cancel</button>
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
      @remove-variation="(vId) => emit('removeVariation', day.date, vId)"
    />

    <!-- Activities (main, shown when no variation selected or main tab) -->
    <div v-if="day.variations.length === 0 || true" class="space-y-2">
      <ActivityItem
        v-for="act in mainActivities"
        :key="act.id"
        :activity="act"
        @update="(updates) => emit('updateActivity', day.date, act.id, updates)"
        @remove="emit('removeActivity', day.date, act.id)"
      />
    </div>

    <!-- Add Activity -->
    <div class="mt-3">
      <ActivityForm @add="(act) => emit('addActivity', day.date, act)" />
    </div>
  </div>
</template>
