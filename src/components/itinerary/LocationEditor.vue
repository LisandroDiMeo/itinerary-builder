<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { presetLocations, findPresetLocation } from '@/data/locations'
import { getLocationColor } from '@/utils/colors'

const props = defineProps<{
  location: string
  coordinates: [number, number]
}>()

const emit = defineEmits<{
  update: [location: string, coordinates: [number, number]]
}>()

const editing = ref(false)
const mode = ref<'preset' | 'custom'>('preset')
const selectedPreset = ref('')
const customName = ref('')
const customLat = ref('')
const customLng = ref('')
const searchQuery = ref('')

const colors = computed(() => getLocationColor(props.location))

const filteredPresets = computed(() => {
  if (!searchQuery.value) return presetLocations
  const q = searchQuery.value.toLowerCase()
  return presetLocations.filter((l) => l.name.toLowerCase().includes(q))
})

function open() {
  // Pre-fill with current values
  const preset = findPresetLocation(props.location)
  if (preset) {
    mode.value = 'preset'
    selectedPreset.value = preset.name
  } else {
    mode.value = 'custom'
    customName.value = props.location
    customLat.value = String(props.coordinates[0])
    customLng.value = String(props.coordinates[1])
  }
  searchQuery.value = ''
  editing.value = true
}

function selectPreset(name: string) {
  selectedPreset.value = name
}

function save() {
  if (mode.value === 'preset') {
    const preset = findPresetLocation(selectedPreset.value)
    if (preset) {
      emit('update', preset.name, preset.coordinates)
    }
  } else {
    const lat = parseFloat(customLat.value)
    const lng = parseFloat(customLng.value)
    if (customName.value.trim() && !isNaN(lat) && !isNaN(lng)) {
      emit('update', customName.value.trim(), [lat, lng])
    }
  }
  editing.value = false
}

const canSave = computed(() => {
  if (mode.value === 'preset') return !!selectedPreset.value
  return (
    customName.value.trim() !== '' &&
    !isNaN(parseFloat(customLat.value)) &&
    !isNaN(parseFloat(customLng.value))
  )
})
</script>

<template>
  <!-- Display mode: clickable location badge -->
  <button
    v-if="!editing"
    @click.stop="open"
    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors hover:opacity-80"
    :class="[colors.bg, colors.text]"
    title="Change location"
  >
    📍 {{ location }}
    <span class="text-[10px] opacity-60">✎</span>
  </button>

  <!-- Edit mode -->
  <div v-else class="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-3" @click.stop>
    <!-- Mode toggle -->
    <div class="flex gap-1 bg-gray-200 rounded-lg p-0.5">
      <button
        @click="mode = 'preset'"
        class="flex-1 px-3 py-1 text-xs font-medium rounded-md cursor-pointer transition-colors"
        :class="mode === 'preset' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'"
      >
        Preset City
      </button>
      <button
        @click="mode = 'custom'"
        class="flex-1 px-3 py-1 text-xs font-medium rounded-md cursor-pointer transition-colors"
        :class="mode === 'custom' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'"
      >
        Custom Location
      </button>
    </div>

    <!-- Preset mode -->
    <div v-if="mode === 'preset'" class="space-y-2">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search cities..."
        class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <div class="max-h-40 overflow-y-auto space-y-0.5">
        <button
          v-for="loc in filteredPresets"
          :key="loc.name"
          @click="selectPreset(loc.name)"
          class="w-full text-left px-2.5 py-1.5 text-sm rounded-md cursor-pointer transition-colors flex items-center justify-between"
          :class="selectedPreset === loc.name ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100 text-gray-700'"
        >
          <span>{{ loc.name }}</span>
          <span class="text-[10px] text-gray-400">{{ loc.coordinates[0].toFixed(2) }}, {{ loc.coordinates[1].toFixed(2) }}</span>
        </button>
        <div v-if="filteredPresets.length === 0" class="text-xs text-gray-400 py-2 text-center">
          No matches — try Custom Location
        </div>
      </div>
    </div>

    <!-- Custom mode -->
    <div v-else class="space-y-2">
      <input
        v-model="customName"
        type="text"
        placeholder="Location name"
        class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="block text-[10px] text-gray-400 mb-0.5">Latitude</label>
          <input
            v-model="customLat"
            type="text"
            placeholder="35.6762"
            class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label class="block text-[10px] text-gray-400 mb-0.5">Longitude</label>
          <input
            v-model="customLng"
            type="text"
            placeholder="139.6503"
            class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-2 justify-end">
      <button
        @click="editing = false"
        class="px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
      >
        Cancel
      </button>
      <button
        @click="save"
        :disabled="!canSave"
        class="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        Update Location
      </button>
    </div>
  </div>
</template>
