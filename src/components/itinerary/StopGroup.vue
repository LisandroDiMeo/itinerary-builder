<script setup lang="ts">
import { computed } from 'vue'
import type { StopGroup, ItineraryDay, Activity } from '@/types'
import { formatDateRange } from '@/utils/dates'
import { getLocationColor } from '@/utils/colors'
import DayCard from './DayCard.vue'
import AddDayDivider from './AddDayDivider.vue'
import Badge from '@/components/shared/Badge.vue'

const props = defineProps<{
  group: StopGroup
  itineraryId: string
  startDate: string
  isSelecting?: boolean
  selectedDates?: Set<string>
}>()

const emit = defineEmits<{
  selectDay: [date: string]
  addActivity: [date: string, activity: Omit<Activity, 'id'>]
  updateActivity: [date: string, activityId: string, updates: Partial<Activity>]
  removeActivity: [date: string, activityId: string]
  updateDay: [date: string, updates: Partial<ItineraryDay>]
  removeVariation: [date: string, variationId: string]
  insertDay: [afterDate: string]
  deleteDay: [date: string]
}>()

const colors = computed(() => getLocationColor(props.group.location))
const dateRange = computed(() => formatDateRange(props.group.startDate, props.group.endDate))
</script>

<template>
  <div class="mb-8">
    <div class="flex items-center gap-3 mb-4 border-l-4 pl-4" :class="colors.border">
      <div>
        <h3 class="text-lg font-bold text-gray-900">{{ group.location }}</h3>
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <span>{{ dateRange }}</span>
          <Badge :color="`${colors.bg} ${colors.text}`">
            {{ group.nights }} night{{ group.nights !== 1 ? 's' : '' }}
          </Badge>
        </div>
      </div>
    </div>

    <div class="space-y-3 ml-4">
      <template v-for="(day, idx) in group.days" :key="day.date">
        <DayCard
          :day="day"
          :start-date="startDate"
          :itinerary-id="itineraryId"
          :is-selecting="isSelecting"
          :is-selected="selectedDates?.has(day.date)"
          @select-day="(d) => emit('selectDay', d)"
          @add-activity="(d, act) => emit('addActivity', d, act)"
          @update-activity="(d, aId, u) => emit('updateActivity', d, aId, u)"
          @remove-activity="(d, aId) => emit('removeActivity', d, aId)"
          @update-day="(d, u) => emit('updateDay', d, u)"
          @remove-variation="(d, vId) => emit('removeVariation', d, vId)"
          @delete-day="(d) => emit('deleteDay', d)"
        />
        <AddDayDivider
          v-if="idx < group.days.length - 1"
          @insert="emit('insertDay', day.date)"
        />
      </template>
    </div>
  </div>
</template>
