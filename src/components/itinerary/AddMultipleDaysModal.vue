<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from '@/components/shared/BaseModal.vue'
import { presetLocations, findPresetLocation } from '@/data/locations'

defineProps<{ show: boolean }>()
const emit = defineEmits<{
  close: []
  add: [count: number, location: string, coordinates: [number, number], titlePrefix: string]
}>()

const { t } = useI18n()
const count = ref(3)
const titlePrefix = ref('')
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

const canSubmit = computed(() => {
  if (count.value < 1 || count.value > 30) return false
  if (mode.value === 'preset') return !!selectedPreset.value
  return (
    customName.value.trim() !== '' &&
    !isNaN(parseFloat(customLat.value)) &&
    !isNaN(parseFloat(customLng.value))
  )
})

function submit() {
  if (!canSubmit.value) return
  let location: string
  let coordinates: [number, number]
  if (mode.value === 'preset') {
    const preset = findPresetLocation(selectedPreset.value)
    if (!preset) return
    location = preset.name
    coordinates = preset.coordinates
  } else {
    location = customName.value.trim()
    coordinates = [parseFloat(customLat.value), parseFloat(customLng.value)]
  }
  emit('add', count.value, location, coordinates, titlePrefix.value.trim())
  reset()
}

function reset() {
  count.value = 3
  titlePrefix.value = ''
  selectedPreset.value = ''
  customName.value = ''
  customLat.value = ''
  customLng.value = ''
  searchQuery.value = ''
  mode.value = 'preset'
}
</script>

<template>
  <BaseModal :show="show" :title="t('addMultipleDays.title')" @close="emit('close')">
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('addMultipleDays.numberOfDays') }}</label>
        <input
          v-model.number="count"
          type="number"
          min="1"
          max="30"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('addMultipleDays.location') }}</label>
        <div class="flex gap-1 bg-gray-200 rounded-lg p-0.5 mb-2">
          <button
            @click="mode = 'preset'"
            class="flex-1 px-3 py-1 text-xs font-medium rounded-md cursor-pointer transition-colors"
            :class="mode === 'preset' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'"
          >
            {{ t('location.presetCity') }}
          </button>
          <button
            @click="mode = 'custom'"
            class="flex-1 px-3 py-1 text-xs font-medium rounded-md cursor-pointer transition-colors"
            :class="mode === 'custom' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'"
          >
            {{ t('location.customLocation') }}
          </button>
        </div>

        <div v-if="mode === 'preset'" class="space-y-2">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('location.searchDestinations')"
            class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div class="max-h-40 overflow-y-auto space-y-0.5">
            <button
              v-for="loc in filteredPresets"
              :key="loc.name"
              @click="selectedPreset = loc.name"
              class="w-full text-left px-2.5 py-1.5 text-sm rounded-md cursor-pointer transition-colors flex items-center justify-between"
              :class="selectedPreset === loc.name ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100 text-gray-700'"
            >
              <span>{{ loc.name }}</span>
              <span class="text-[10px] text-gray-400">{{ loc.coordinates[0].toFixed(2) }}, {{ loc.coordinates[1].toFixed(2) }}</span>
            </button>
            <div v-if="filteredPresets.length === 0" class="text-xs text-gray-400 py-2 text-center">
              {{ t('location.noMatches') }}
            </div>
          </div>
        </div>

        <div v-else class="space-y-2">
          <input
            v-model="customName"
            type="text"
            :placeholder="t('location.destinationName')"
            class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-[10px] text-gray-400 mb-0.5">{{ t('location.latitude') }}</label>
              <input
                v-model="customLat"
                type="text"
                placeholder="35.6762"
                class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-[10px] text-gray-400 mb-0.5">{{ t('location.longitude') }}</label>
              <input
                v-model="customLng"
                type="text"
                placeholder="139.6503"
                class="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('addMultipleDays.titlePrefix') }} <span class="text-gray-400 font-normal">{{ t('addMultipleDays.titlePrefixOptional') }}</span></label>
        <input
          v-model="titlePrefix"
          type="text"
          :placeholder="t('addMultipleDays.titlePrefixPlaceholder')"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p class="text-xs text-gray-400 mt-1">{{ t('addMultipleDays.titlePrefixHint', {
          prefix1: titlePrefix ? `${titlePrefix} 1` : t('defaults.newDay'),
          prefix2: titlePrefix ? `${titlePrefix} 2` : t('defaults.newDay'),
        }) }}</p>
      </div>
    </div>

    <template #footer>
      <button
        @click="emit('close')"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
      >
        {{ t('common.cancel') }}
      </button>
      <button
        @click="submit"
        :disabled="!canSubmit"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {{ t('addMultipleDays.submit', { count }, count) }}
      </button>
    </template>
  </BaseModal>
</template>
