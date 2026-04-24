<script setup lang="ts">
import { computed, ref, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useItineraryStore } from '@/stores/itinerary'
import { useUiStore } from '@/stores/ui'
import { useItineraryHelpers } from '@/composables/useItinerary'
import type { ItineraryDay, Activity, DayVariation } from '@/types'
import { downloadJson } from '@/utils/file'
import ItineraryHeader from '@/components/itinerary/ItineraryHeader.vue'
import StopGroup from '@/components/itinerary/StopGroup.vue'
import MultiSelectBar from '@/components/itinerary/MultiSelectBar.vue'
import TransferModal from '@/components/transfer/TransferModal.vue'
import ItineraryMap from '@/components/map/ItineraryMap.vue'
import AddMultipleDaysModal from '@/components/itinerary/AddMultipleDaysModal.vue'
import CreateFromDaysModal from '@/components/shared/CreateFromDaysModal.vue'
import ReorderConfirmDialog from '@/components/shared/ReorderConfirmDialog.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import { recalculateDateRanges } from '@/utils/dates'
import Sortable from 'sortablejs'

const route = useRoute()
const router = useRouter()
const store = useItineraryStore()
const ui = useUiStore()
const { t } = useI18n()

const itineraryId = computed(() => route.params.id as string)
const itinerary = computed(() => store.getById(itineraryId.value))

const { stopGroups, dateRange } = useItineraryHelpers(() => itinerary.value)

const selectedDatesArray = computed(() => Array.from(ui.selectedDates).sort())

// Drag-and-drop StopGroup reordering
const SUPPRESS_KEY = 'itinerary-suppress-reorder-confirm'
const stopGroupsContainer = ref<HTMLElement | null>(null)
let sortableInstance: Sortable | null = null

const showReorderConfirm = ref(false)
const pendingReorder = ref<number[] | null>(null)
const reorderOldGroups = ref<{ location: string; startDate: string; endDate: string }[]>([])
const reorderNewGroups = ref<{ location: string; startDate: string; endDate: string }[]>([])

function initSortable() {
  if (!stopGroupsContainer.value) return
  if (sortableInstance) sortableInstance.destroy()
  sortableInstance = Sortable.create(stopGroupsContainer.value, {
    handle: '.drag-handle',
    animation: 150,
    ghostClass: 'opacity-30',
    onEnd(evt) {
      const oldIndex = evt.oldIndex
      const newIndex = evt.newIndex
      if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) return

      // Build new order array
      const groups = stopGroups.value
      const order = groups.map((_, i) => i)
      const [moved] = order.splice(oldIndex, 1)
      order.splice(newIndex, 0, moved!)

      // Revert DOM change (let Vue handle re-rendering)
      const el = evt.item
      const parent = el.parentNode
      if (parent && oldIndex !== undefined && newIndex !== undefined) {
        if (oldIndex < newIndex) {
          parent.insertBefore(el, parent.children[oldIndex] || null)
        } else {
          parent.insertBefore(el, parent.children[oldIndex + 1] || null)
        }
      }

      // Check suppress flag
      const suppressed = localStorage.getItem(SUPPRESS_KEY) === 'true'
      if (suppressed) {
        store.reorderStopGroups(itineraryId.value, order)
        return
      }

      // Show confirmation with preview
      const it = itinerary.value
      if (!it || it.days.length === 0) return
      const startDate = it.days[0]!.date
      const oldCounts = groups.map(g => g.days.length)
      const newCounts = order.map(i => oldCounts[i]!)

      reorderOldGroups.value = groups.map(g => ({
        location: g.location,
        startDate: g.startDate,
        endDate: g.endDate,
      }))

      const newRanges = recalculateDateRanges(startDate, newCounts)
      reorderNewGroups.value = order.map((origIdx, newIdx) => ({
        location: groups[origIdx]!.location,
        startDate: newRanges[newIdx]!.startDate,
        endDate: newRanges[newIdx]!.endDate,
      }))

      pendingReorder.value = order
      showReorderConfirm.value = true
    },
  })
}

function doReorder() {
  if (pendingReorder.value) {
    store.reorderStopGroups(itineraryId.value, pendingReorder.value)
    pendingReorder.value = null
    showReorderConfirm.value = false
  }
}

function cancelReorder() {
  pendingReorder.value = null
  showReorderConfirm.value = false
}

// Re-init sortable when stopGroups change
watch(stopGroups, () => {
  nextTick(() => initSortable())
})

function toggleSelection() {
  if (ui.isSelecting) {
    ui.cancelSelection()
  } else {
    ui.startSelection()
  }
}

function handleSelectDay(date: string, shiftKey: boolean) {
  if (!ui.isSelecting) return
  if (shiftKey && ui.lastSelectedDate && itinerary.value) {
    // Shift-click: select range between lastSelectedDate and clicked date
    const allDates = itinerary.value.days.map(d => d.date)
    const lastIdx = allDates.indexOf(ui.lastSelectedDate)
    const clickIdx = allDates.indexOf(date)
    if (lastIdx !== -1 && clickIdx !== -1) {
      const start = Math.min(lastIdx, clickIdx)
      const end = Math.max(lastIdx, clickIdx)
      ui.selectDateRange(allDates.slice(start, end + 1))
    }
  } else {
    ui.toggleDate(date)
  }
}

// Transfer
function openTransfer() {
  ui.showTransferModal = true
}

function handleTransfer(targetId: string) {
  store.transferSelectedDays(itineraryId.value, targetId, selectedDatesArray.value)
  ui.showTransferModal = false
  ui.cancelSelection()
}

// Remove days
const showRemoveConfirm = ref(false)

function handleRemoveDays() {
  showRemoveConfirm.value = true
}

function doRemoveDays() {
  store.removeDays(itineraryId.value, selectedDatesArray.value)
  showRemoveConfirm.value = false
  ui.cancelSelection()
}

// Create from days
const showCreateFromDays = ref(false)

function handleCreateFromDays() {
  showCreateFromDays.value = true
}

function doCreateFromDays(name: string) {
  const newIt = store.createFromDays(itineraryId.value, selectedDatesArray.value, name)
  showCreateFromDays.value = false
  ui.cancelSelection()
  if (newIt) {
    router.push(`/itinerary/${newIt.id}`)
  }
}

// Clean days
const showCleanConfirm = ref(false)

function handleCleanDays() {
  showCleanConfirm.value = true
}

function doCleanDays() {
  store.cleanDays(itineraryId.value, selectedDatesArray.value)
  showCleanConfirm.value = false
  ui.cancelSelection()
}

// Activity management
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

// Variation management
function handleRemoveVariation(date: string, variationId: string) {
  store.removeVariation(itineraryId.value, date, variationId)
}

function handleAddVariation(date: string) {
  store.addManualVariation(itineraryId.value, date)
}

function handlePromoteVariation(date: string, variationId: string) {
  store.promoteVariation(itineraryId.value, date, variationId)
}

function handleUpdateVariation(date: string, variationId: string, updates: Partial<DayVariation>) {
  store.updateVariation(itineraryId.value, date, variationId, updates)
}

function handleAddVariationActivity(date: string, variationId: string, activity: Omit<Activity, 'id'>) {
  store.addVariationActivity(itineraryId.value, date, variationId, activity)
}

function handleUpdateVariationActivity(date: string, variationId: string, activityId: string, updates: Partial<Activity>) {
  store.updateVariationActivity(itineraryId.value, date, variationId, activityId, updates)
}

function handleRemoveVariationActivity(date: string, variationId: string, activityId: string) {
  store.removeVariationActivity(itineraryId.value, date, variationId, activityId)
}

// Export
function handleExport() {
  const json = store.exportItinerary(itineraryId.value)
  if (!json) return
  const it = itinerary.value
  const filename = `${(it?.name || 'itinerary').replace(/\s+/g, '-').toLowerCase()}.json`
  downloadJson(json, filename)
}

// Day insertion
function handleInsertDay(afterDate: string) {
  store.insertDay(itineraryId.value, afterDate)
}

const addMultipleAfterDate = ref<string | null>(null)

function handleInsertMultipleDays(afterDate: string) {
  addMultipleAfterDate.value = afterDate
}

function handleAddMultipleDays(count: number, location: string, coordinates: [number, number], titlePrefix: string) {
  if (addMultipleAfterDate.value) {
    store.insertMultipleDays(itineraryId.value, addMultipleAfterDate.value, count, location, coordinates, titlePrefix)
    addMultipleAfterDate.value = null
  }
}

// Delete day
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
      :is-selecting="ui.isSelecting"
      @toggle-selection="toggleSelection"
      @export="handleExport"
    />

    <!-- Two-column layout -->
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Left: Day-by-day content -->
      <div ref="stopGroupsContainer" class="flex-1 min-w-0">
        <StopGroup
          v-for="group in stopGroups"
          :key="group.location + group.startDate"
          :group="group"
          :itinerary-id="itineraryId"
          :start-date="dateRange.start"
          :is-selecting="ui.isSelecting"
          :selected-dates="ui.selectedDates"
          @select-day="handleSelectDay"
          @add-activity="handleAddActivity"
          @update-activity="handleUpdateActivity"
          @remove-activity="handleRemoveActivity"
          @update-day="handleUpdateDay"
          @remove-variation="handleRemoveVariation"
          @add-variation="handleAddVariation"
          @promote-variation="handlePromoteVariation"
          @update-variation="handleUpdateVariation"
          @add-variation-activity="handleAddVariationActivity"
          @update-variation-activity="handleUpdateVariationActivity"
          @remove-variation-activity="handleRemoveVariationActivity"
          @insert-day="handleInsertDay"
          @insert-multiple-days="handleInsertMultipleDays"
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

    <!-- Multi-Select floating bar -->
    <MultiSelectBar
      v-if="ui.isSelecting && ui.hasSelection"
      :selected-count="ui.selectedCount"
      @transfer="openTransfer"
      @remove="handleRemoveDays"
      @create="handleCreateFromDays"
      @clean="handleCleanDays"
      @cancel="ui.cancelSelection()"
    />

    <!-- Transfer Modal -->
    <TransferModal
      :show="ui.showTransferModal"
      :source-id="itineraryId"
      :dates="selectedDatesArray"
      @close="ui.showTransferModal = false"
      @transfer="handleTransfer"
    />

    <!-- Add Multiple Days Modal -->
    <AddMultipleDaysModal
      :show="!!addMultipleAfterDate"
      @close="addMultipleAfterDate = null"
      @add="handleAddMultipleDays"
    />

    <!-- Create From Days Modal -->
    <CreateFromDaysModal
      :show="showCreateFromDays"
      :day-count="ui.selectedCount"
      @close="showCreateFromDays = false"
      @create="doCreateFromDays"
    />

    <!-- Reorder Confirmation -->
    <ReorderConfirmDialog
      :show="showReorderConfirm"
      :old-groups="reorderOldGroups"
      :new-groups="reorderNewGroups"
      @confirm="doReorder"
      @cancel="cancelReorder"
    />

    <!-- Delete Day Confirmation -->
    <ConfirmDialog
      :show="!!deleteDayTarget"
      :title="t('confirm.deleteDayTitle')"
      :message="t('confirm.deleteDayMessage')"
      :confirm-text="t('confirm.deleteDayConfirm')"
      :danger="true"
      @confirm="doDeleteDay"
      @cancel="deleteDayTarget = null"
    />

    <!-- Remove Days Confirmation -->
    <ConfirmDialog
      :show="showRemoveConfirm"
      :title="t('confirm.removeDaysTitle')"
      :message="t('confirm.removeDaysMessage', { count: ui.selectedCount }, ui.selectedCount)"
      :confirm-text="t('confirm.removeDaysConfirm')"
      :danger="true"
      @confirm="doRemoveDays"
      @cancel="showRemoveConfirm = false"
    />

    <!-- Clean Days Confirmation -->
    <ConfirmDialog
      :show="showCleanConfirm"
      :title="t('confirm.cleanDaysTitle')"
      :message="t('confirm.cleanDaysMessage', { count: ui.selectedCount }, ui.selectedCount)"
      :confirm-text="t('confirm.cleanDaysConfirm')"
      :danger="false"
      @confirm="doCleanDays"
      @cancel="showCleanConfirm = false"
    />
  </div>
</template>
