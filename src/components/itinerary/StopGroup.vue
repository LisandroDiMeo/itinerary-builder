<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { StopGroup, ItineraryDay, Activity, DayVariation } from '@/types'
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
  insertDay: [afterDate: string]
  insertMultipleDays: [afterDate: string]
  deleteDay: [date: string]
}>()

const { t } = useI18n()
const colors = computed(() => getLocationColor(props.group.location))
const dateRange = computed(() => formatDateRange(props.group.startDate, props.group.endDate))
</script>

<template>
  <div class="mb-8">
    <div class="flex items-center gap-3 mb-4 border-l-4 pl-4" :class="colors.border">
      <div class="drag-handle cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 flex-shrink-0 select-none" :title="t('stopGroup.dragTooltip')">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/>
          <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
          <circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/>
        </svg>
      </div>
      <div>
        <h3 class="text-lg font-bold text-gray-900">{{ group.location }}</h3>
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <span>{{ dateRange }}</span>
          <Badge :color="`${colors.bg} ${colors.text}`">
            {{ t('stopGroup.nights', { count: group.nights }, group.nights) }}
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
          @select-day="(d, shift) => emit('selectDay', d, shift)"
          @add-activity="(d, act) => emit('addActivity', d, act)"
          @update-activity="(d, aId, u) => emit('updateActivity', d, aId, u)"
          @remove-activity="(d, aId) => emit('removeActivity', d, aId)"
          @update-day="(d, u) => emit('updateDay', d, u)"
          @remove-variation="(d, vId) => emit('removeVariation', d, vId)"
          @add-variation="(d) => emit('addVariation', d)"
          @promote-variation="(d, vId) => emit('promoteVariation', d, vId)"
          @update-variation="(d, vId, u) => emit('updateVariation', d, vId, u)"
          @add-variation-activity="(d, vId, act) => emit('addVariationActivity', d, vId, act)"
          @update-variation-activity="(d, vId, aId, u) => emit('updateVariationActivity', d, vId, aId, u)"
          @remove-variation-activity="(d, vId, aId) => emit('removeVariationActivity', d, vId, aId)"
          @delete-day="(d) => emit('deleteDay', d)"
        />
        <AddDayDivider
          @insert="emit('insertDay', day.date)"
          @insert-multiple="emit('insertMultipleDays', day.date)"
        />
      </template>
    </div>
  </div>
</template>
