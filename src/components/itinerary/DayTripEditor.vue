<script setup lang="ts">
import { ref, computed } from 'vue'
import { presetLocations, findPresetLocation } from '@/data/locations'

const props = defineProps<{
  isDayTrip: boolean | null
  dayTripDestination: string | null
  dayTripCoordinates: [number, number] | null
}>()

const emit = defineEmits<{
  update: [isDayTrip: boolean | null, destination: string | null, coordinates: [number, number] | null]
}>()

const editing = ref(false)
const enabled = ref(false)
const mode = ref<'preset' | 'custom'>('preset')
const selectedPreset = ref('')
const customName = ref('')
const customLat = ref('')
const customLng = ref('')
const searchQuery = ref('')

const filteredPresets = computed(() => {
  if (!searchQuery.value) return presetLocations
  const q = searchQuery.value.toLowerCase()
  return presetLocations.filter((l) => l.name.toLowerCase().includes(q))
})

function open() {
  enabled.value = !!props.isDayTrip
  if (props.dayTripDestination) {
    const preset = findPresetLocation(props.dayTripDestination)
    if (preset) {
      mode.value = 'preset'
      selectedPreset.value = preset.name
    } else {
      mode.value = 'custom'
      customName.value = props.dayTripDestination
      customLat.value = props.dayTripCoordinates ? String(props.dayTripCoordinates[0]) : ''
      customLng.value = props.dayTripCoordinates ? String(props.dayTripCoordinates[1]) : ''
    }
  } else {
    mode.value = 'preset'
    selectedPreset.value = ''
    customName.value = ''
    customLat.value = ''
    customLng.value = ''
  }
  searchQuery.value = ''
  editing.value = true
}

function save() {
  if (!enabled.value) {
    emit('update', null, null, null)
    editing.value = false
    return
  }
  if (mode.value === 'preset') {
    const preset = findPresetLocation(selectedPreset.value)
    if (preset) {
      emit('update', true, preset.name, preset.coordinates)
    }
  } else {
    const lat = parseFloat(customLat.value)
    const lng = parseFloat(customLng.value)
    if (customName.value.trim() && !isNaN(lat) && !isNaN(lng)) {
      emit('update', true, customName.value.trim(), [lat, lng])
    }
  }
  editing.value = false
}

function removeDayTrip() {
  emit('update', null, null, null)
  editing.value = false
}

const canSave = computed(() => {
  if (!enabled.value) return true
  if (mode.value === 'preset') return !!selectedPreset.value
  return (
    customName.value.trim() !== '' &&
    !isNaN(parseFloat(customLat.value)) &&
    !isNaN(parseFloat(customLng.value))
  )
})
</script>

<template>
  <!-- Display mode -->
  <template v-if="!editing">
    <button
      v-if="isDayTrip"
      @click.stop="open"
      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700 cursor-pointer transition-colors hover:bg-violet-200"
      title="Edit day trip"
    >
      🚃 Day Trip: {{ dayTripDestination }}
      <span class="text-[10px] opacity-60">✎</span>
    </button>
    <button
      v-else
      @click.stop="open"
      class="text-xs text-gray-400 hover:text-violet-600 cursor-pointer transition-colors"
    >
      + Day Trip
    </button>
  </template>

  <!-- Edit mode -->
  <div v-else class="bg-violet-50 border border-violet-200 rounded-lg p-3 space-y-3" @click.stop>
    <!-- Enable toggle -->
    <label class="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        v-model="enabled"
        class="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
      />
      <span class="text-sm font-medium text-gray-700">Day trip from this location</span>
    </label>

    <template v-if="enabled">
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
          placeholder="Search destinations..."
          class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        />
        <div class="max-h-40 overflow-y-auto space-y-0.5">
          <button
            v-for="loc in filteredPresets"
            :key="loc.name"
            @click="selectedPreset = loc.name"
            class="w-full text-left px-2.5 py-1.5 text-sm rounded-md cursor-pointer transition-colors flex items-center justify-between"
            :class="selectedPreset === loc.name ? 'bg-violet-100 text-violet-800' : 'hover:bg-gray-100 text-gray-700'"
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
          placeholder="Destination name"
          class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        />
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-[10px] text-gray-400 mb-0.5">Latitude</label>
            <input
              v-model="customLat"
              type="text"
              placeholder="35.6762"
              class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-[10px] text-gray-400 mb-0.5">Longitude</label>
            <input
              v-model="customLng"
              type="text"
              placeholder="139.6503"
              class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </template>

    <!-- Actions -->
    <div class="flex gap-2 justify-end">
      <button
        v-if="isDayTrip && enabled"
        @click="removeDayTrip"
        class="px-3 py-1 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 cursor-pointer mr-auto"
      >
        Remove Day Trip
      </button>
      <button
        @click="editing = false"
        class="px-3 py-1 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
      >
        Cancel
      </button>
      <button
        @click="save"
        :disabled="!canSave"
        class="px-3 py-1 text-xs font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        {{ enabled ? 'Save Day Trip' : 'Remove Day Trip' }}
      </button>
    </div>
  </div>
</template>
