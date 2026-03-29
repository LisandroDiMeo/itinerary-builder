import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const isSelecting = ref(false)
  const selectedDates = ref(new Set<string>())
  const lastSelectedDate = ref<string | null>(null)
  const showTransferModal = ref(false)
  const showCreateModal = ref(false)

  function startSelection() {
    isSelecting.value = true
    selectedDates.value = new Set()
    lastSelectedDate.value = null
  }

  function toggleDate(date: string) {
    const s = new Set(selectedDates.value)
    if (s.has(date)) {
      s.delete(date)
    } else {
      s.add(date)
    }
    selectedDates.value = s
    lastSelectedDate.value = date
  }

  function selectDateRange(dates: string[]) {
    const s = new Set(selectedDates.value)
    for (const d of dates) {
      s.add(d)
    }
    selectedDates.value = s
    if (dates.length > 0) {
      lastSelectedDate.value = dates[dates.length - 1]!
    }
  }

  function cancelSelection() {
    isSelecting.value = false
    selectedDates.value = new Set()
    lastSelectedDate.value = null
  }

  function isDateSelected(date: string): boolean {
    return selectedDates.value.has(date)
  }

  const selectedCount = computed(() => selectedDates.value.size)
  const hasSelection = computed(() => selectedDates.value.size > 0)

  return {
    isSelecting,
    selectedDates,
    lastSelectedDate,
    showTransferModal,
    showCreateModal,
    startSelection,
    toggleDate,
    selectDateRange,
    cancelSelection,
    isDateSelected,
    selectedCount,
    hasSelection,
  }
})
