<script setup lang="ts">
import { ref } from 'vue'
import { useItineraryStore } from '@/stores/itinerary'
import { useUiStore } from '@/stores/ui'
import { downloadJson } from '@/utils/file'
import ItineraryCard from '@/components/landing/ItineraryCard.vue'
import CreateItineraryModal from '@/components/landing/CreateItineraryModal.vue'
import ImportItineraryModal from '@/components/landing/ImportItineraryModal.vue'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'

const store = useItineraryStore()
const ui = useUiStore()

const deleteTarget = ref<string | null>(null)
const showImportModal = ref(false)

function handleCreate(name: string, description: string, startDate: string, endDate: string) {
  store.create(name, description, startDate, endDate)
  ui.showCreateModal = false
}

function confirmDelete(id: string) {
  deleteTarget.value = id
}

function doDelete() {
  if (deleteTarget.value) {
    store.remove(deleteTarget.value)
    deleteTarget.value = null
  }
}

function handleExport(id: string) {
  const json = store.exportItinerary(id)
  if (!json) return
  const it = store.getById(id)
  const filename = `${(it?.name || 'itinerary').replace(/\s+/g, '-').toLowerCase()}.json`
  downloadJson(json, filename)
}

function handleImport(json: string) {
  try {
    store.importItinerary(json)
    showImportModal.value = false
  } catch {
    // error handled inside modal
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">My Itineraries</h1>
        <p class="text-sm text-gray-500 mt-1">Plan and compare your trip options</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="showImportModal = true"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer"
        >
          📥 Import
        </button>
        <button
          @click="ui.showCreateModal = true"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
        >
          + New Itinerary
        </button>
      </div>
    </div>

    <div v-if="store.itineraries.length === 0" class="text-center py-20 text-gray-400">
      <p class="text-4xl mb-4">✈️</p>
      <p class="text-lg">No itineraries yet</p>
      <p class="text-sm">Create your first itinerary to get started</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ItineraryCard
        v-for="it in store.itineraries"
        :key="it.id"
        :itinerary="it"
        @duplicate="store.duplicate(it.id)"
        @delete="confirmDelete(it.id)"
        @update="(name, desc) => store.updateMeta(it.id, name, desc)"
        @export="handleExport(it.id)"
      />
    </div>
  </div>

  <CreateItineraryModal
    :show="ui.showCreateModal"
    @close="ui.showCreateModal = false"
    @create="handleCreate"
  />

  <ImportItineraryModal
    :show="showImportModal"
    @close="showImportModal = false"
    @import="handleImport"
  />

  <ConfirmDialog
    :show="!!deleteTarget"
    title="Delete Itinerary"
    message="Are you sure you want to delete this itinerary? This action cannot be undone."
    confirm-text="Delete"
    :danger="true"
    @confirm="doDelete"
    @cancel="deleteTarget = null"
  />
</template>
