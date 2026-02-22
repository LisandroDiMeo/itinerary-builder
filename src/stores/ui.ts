import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const isSelectingRange = ref(false)
  const rangeStart = ref<string | null>(null)
  const rangeEnd = ref<string | null>(null)
  const showTransferModal = ref(false)
  const showCreateModal = ref(false)

  function startRangeSelection() {
    isSelectingRange.value = true
    rangeStart.value = null
    rangeEnd.value = null
  }

  function selectDate(date: string) {
    if (!rangeStart.value) {
      rangeStart.value = date
    } else if (!rangeEnd.value) {
      if (date < rangeStart.value) {
        rangeEnd.value = rangeStart.value
        rangeStart.value = date
      } else {
        rangeEnd.value = date
      }
    } else {
      rangeStart.value = date
      rangeEnd.value = null
    }
  }

  function cancelSelection() {
    isSelectingRange.value = false
    rangeStart.value = null
    rangeEnd.value = null
  }

  function isDateInSelection(date: string): boolean {
    if (!rangeStart.value) return false
    if (!rangeEnd.value) return date === rangeStart.value
    return date >= rangeStart.value && date <= rangeEnd.value
  }

  return {
    isSelectingRange,
    rangeStart,
    rangeEnd,
    showTransferModal,
    showCreateModal,
    startRangeSelection,
    selectDate,
    cancelSelection,
    isDateInSelection,
  }
})
