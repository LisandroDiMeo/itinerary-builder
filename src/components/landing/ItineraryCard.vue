<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Itinerary } from '@/types'
import { formatDateRange } from '@/utils/dates'
import { getLocationColor } from '@/utils/colors'

const props = defineProps<{ itinerary: Itinerary }>()
const emit = defineEmits<{ duplicate: []; delete: []; update: [name: string, description: string] }>()

const editing = ref(false)
const editName = ref('')
const editDesc = ref('')

const firstLocation = computed(() => props.itinerary.days[0]?.location || 'TBD')
const borderColor = computed(() => getLocationColor(firstLocation.value).border)

const dateRange = computed(() => {
  const days = props.itinerary.days
  if (days.length === 0) return 'No dates'
  const first = days[0]
  const last = days[days.length - 1]
  if (!first || !last) return 'No dates'
  return formatDateRange(first.date, last.date)
})

const stopSummary = computed(() => {
  const locations = new Set(props.itinerary.days.map(d => d.location))
  const locs = [...locations].filter(l => l !== 'TBD')
  if (locs.length <= 3) return locs.join(' → ')
  return `${locs.slice(0, 3).join(' → ')} + ${locs.length - 3} more`
})

function startEdit() {
  editName.value = props.itinerary.name
  editDesc.value = props.itinerary.description
  editing.value = true
}

function saveEdit() {
  emit('update', editName.value, editDesc.value)
  editing.value = false
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
    <div class="border-l-4 h-full flex flex-col" :class="borderColor">
      <!-- Edit mode -->
      <div v-if="editing" class="p-5 flex-1" @click.stop>
        <input
          v-model="editName"
          class="w-full px-2 py-1 border border-gray-300 rounded text-lg font-semibold mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          v-model="editDesc"
          rows="2"
          class="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-600 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <div class="flex gap-2">
          <button @click="saveEdit" class="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 cursor-pointer">Save</button>
          <button @click="editing = false" class="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer">Cancel</button>
        </div>
      </div>

      <!-- Display mode -->
      <router-link
        v-else
        :to="`/itinerary/${itinerary.id}`"
        class="p-5 flex-1 block no-underline text-inherit cursor-pointer"
      >
        <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ itinerary.name }}</h3>
        <p v-if="itinerary.description" class="text-sm text-gray-500 mb-3 line-clamp-2">{{ itinerary.description }}</p>
        <div class="space-y-1 text-sm text-gray-600">
          <div>📅 {{ dateRange }} &middot; {{ itinerary.days.length }} days</div>
          <div>📍 {{ stopSummary }}</div>
        </div>
      </router-link>

      <!-- Actions -->
      <div v-if="!editing" class="px-5 py-3 border-t border-gray-100 flex gap-2">
        <button @click.stop="startEdit" class="text-xs text-gray-500 hover:text-gray-700 cursor-pointer" title="Edit">
          ✏️ Edit
        </button>
        <button @click.stop="emit('duplicate')" class="text-xs text-gray-500 hover:text-gray-700 cursor-pointer" title="Duplicate">
          📋 Duplicate
        </button>
        <button @click.stop="emit('delete')" class="text-xs text-red-400 hover:text-red-600 cursor-pointer" title="Delete">
          🗑️ Delete
        </button>
      </div>
    </div>
  </div>
</template>
