<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useItineraryStore } from '@/stores/itinerary'
import { useUiStore } from '@/stores/ui'
import { useItineraryHelpers } from '@/composables/useItinerary'
import type { ItineraryDay, Activity } from '@/types'
import { downloadJson } from '@/utils/file'
import ItineraryHeader from '@/components/itinerary/ItineraryHeader.vue'
import StopGroup from '@/components/itinerary/StopGroup.vue'
import DateRangeSelector from '@/components/itinerary/DateRangeSelector.vue'
import TransferModal from '@/components/transfer/TransferModal.vue'
import ItineraryMap from '@/components/map/ItineraryMap.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'

const route = useRoute()
const router = useRouter()
const store = useItineraryStore()
const ui = useUiStore()

const itineraryId = computed(() => route.params.id as string)
const itinerary = computed(() => store.getById(itineraryId.value))

const { stopGroups, dateRange } = useItineraryHelpers(() => itinerary.value)

const selectedDates = computed(() => {
  const set = new Set<string>()
  if (!ui.isSelectingRange) return set
  const it = itinerary.value
  if (!it) return set
  for (const day of it.days) {
    if (ui.isDateInSelection(day.date)) set.add(day.date)
  }
  return set
})

function toggleSelection() {
  if (ui.isSelectingRange) {
    ui.cancelSelection()
  } else {
    ui.startRangeSelection()
  }
}

function handleSelectDay(date: string) {
  if (!ui.isSelectingRange) return
  ui.selectDate(date)
}

function openTransfer() {
  ui.showTransferModal = true
}

function handleTransfer(targetId: string) {
  if (!ui.rangeStart || !ui.rangeEnd) return
  store.transferDays(itineraryId.value, targetId, ui.rangeStart, ui.rangeEnd)
  ui.showTransferModal = false
  ui.cancelSelection()
}

function handleAddActivity(date: string, activity: Omit<Activity, 'id'>) {
  store.addActivity(itineraryId.value, date, activity)
}

function handleUpdateActivity(date: string, activityId: string, updates: Partial<Activity>) {
  store.updateActivity(itineraryId.value, date, activityId, updates)
}

function handleRemoveActivity(date: string, activityId: string) {
  store.removeActivity(itineraryId.value, date, activityId)
}

function handleUpdateDay(date: string, updates: Partial<ItineraryDay>) {
  store.updateDay(itineraryId.value, date, updates)
}

function handleRemoveVariation(date: string, variationId: string) {
  store.removeVariation(itineraryId.value, date, variationId)
}

function handleExport() {
  const json = store.exportItinerary(itineraryId.value)
  if (!json) return
  const it = itinerary.value
  const filename = `${(it?.name || 'itinerary').replace(/\s+/g, '-').toLowerCase()}.json`
  downloadJson(json, filename)
}

function handleInsertDay(afterDate: string) {
  store.insertDay(itineraryId.value, afterDate)
}

const deleteDayTarget = ref<string | null>(null)

function handleDeleteDay(date: string) {
  deleteDayTarget.value = date
}

function doDeleteDay() {
  if (deleteDayTarget.value) {
    store.removeDay(itineraryId.value, deleteDayTarget.value)
    deleteDayTarget.value = null
  }
}

// Redirect if not found
if (!itinerary.value) {
  router.replace('/')
}
</script>

<template>
  <div v-if="itinerary" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <ItineraryHeader
      :itinerary="itinerary"
      :is-selecting="ui.isSelectingRange"
      @toggle-selection="toggleSelection"
      @export="handleExport"
    />

    <!-- Two-column layout -->
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Left: Day-by-day content -->
      <div class="flex-1 min-w-0">
        <StopGroup
          v-for="group in stopGroups"
          :key="group.location + group.startDate"
          :group="group"
          :itinerary-id="itineraryId"
          :start-date="dateRange.start"
          :is-selecting="ui.isSelectingRange"
          :selected-dates="selectedDates"
          @select-day="handleSelectDay"
          @add-activity="handleAddActivity"
          @update-activity="handleUpdateActivity"
          @remove-activity="handleRemoveActivity"
          @update-day="handleUpdateDay"
          @remove-variation="handleRemoveVariation"
          @insert-day="handleInsertDay"
          @delete-day="handleDeleteDay"
        />
      </div>

      <!-- Right: Sticky Map -->
      <div class="lg:w-[400px] flex-shrink-0">
        <div class="lg:sticky lg:top-20">
          <!-- Mobile: shorter map -->
          <div class="h-64 lg:h-[calc(100vh-8rem)] rounded-lg overflow-hidden border border-gray-200">
            <ItineraryMap :stop-groups="stopGroups" :days="itinerary.days" />
          </div>
        </div>
      </div>
    </div>

    <!-- Date Range Selector floating bar -->
    <DateRangeSelector
      v-if="ui.isSelectingRange"
      :start-date="ui.rangeStart"
      :end-date="ui.rangeEnd"
      @transfer="openTransfer"
      @cancel="ui.cancelSelection()"
    />

    <!-- Transfer Modal -->
    <TransferModal
      :show="ui.showTransferModal"
      :source-id="itineraryId"
      :start-date="ui.rangeStart || ''"
      :end-date="ui.rangeEnd || ''"
      @close="ui.showTransferModal = false"
      @transfer="handleTransfer"
    />

    <!-- Delete Day Confirmation -->
    <ConfirmDialog
      :show="!!deleteDayTarget"
      title="Delete Day"
      message="Are you sure you want to delete this day? Subsequent days will shift back by one day."
      confirm-text="Delete Day"
      :danger="true"
      @confirm="doDeleteDay"
      @cancel="deleteDayTarget = null"
    />
  </div>
</template>
