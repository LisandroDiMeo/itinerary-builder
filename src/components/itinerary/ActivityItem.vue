<script setup lang="ts">
import { ref } from 'vue'
import type { Activity } from '@/types'
import { categoryIcons } from '@/utils/colors'

const props = defineProps<{ activity: Activity; readonly?: boolean }>()
const emit = defineEmits<{ update: [updates: Partial<Activity>]; remove: [] }>()

const editing = ref(false)
const editTitle = ref('')
const editDesc = ref('')
const editTime = ref<Activity['time']>('morning')
const editCategory = ref<Activity['category']>('sightseeing')

const timeLabels: Record<string, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  'all-day': 'All Day',
}

function startEdit() {
  if (props.readonly) return
  editTitle.value = props.activity.title
  editDesc.value = props.activity.description
  editTime.value = props.activity.time
  editCategory.value = props.activity.category
  editing.value = true
}

function save() {
  emit('update', {
    title: editTitle.value,
    description: editDesc.value,
    time: editTime.value,
    category: editCategory.value,
  })
  editing.value = false
}
</script>

<template>
  <!-- Edit mode -->
  <div v-if="editing" class="bg-gray-50 rounded-lg p-3 space-y-2" @click.stop>
    <input
      v-model="editTitle"
      class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Activity title"
    />
    <textarea
      v-model="editDesc"
      rows="2"
      class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      placeholder="Description"
    />
    <div class="flex gap-2">
      <select v-model="editTime" class="px-2 py-1 border border-gray-300 rounded text-xs">
        <option value="morning">Morning</option>
        <option value="afternoon">Afternoon</option>
        <option value="evening">Evening</option>
        <option value="all-day">All Day</option>
      </select>
      <select v-model="editCategory" class="px-2 py-1 border border-gray-300 rounded text-xs">
        <option value="sightseeing">Sightseeing</option>
        <option value="food">Food</option>
        <option value="transport">Transport</option>
        <option value="shopping">Shopping</option>
        <option value="nature">Nature</option>
        <option value="culture">Culture</option>
        <option value="onsen">Onsen</option>
        <option value="nightlife">Nightlife</option>
        <option value="other">Other</option>
      </select>
    </div>
    <div class="flex gap-2">
      <button @click="save" class="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 cursor-pointer">Save</button>
      <button @click="editing = false" class="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer">Cancel</button>
    </div>
  </div>

  <!-- Display mode -->
  <div v-else class="flex items-start gap-2 group">
    <span class="text-sm flex-shrink-0 mt-0.5">{{ categoryIcons[activity.category] || '📌' }}</span>
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-800">{{ activity.title }}</span>
        <span class="text-xs text-gray-400">{{ timeLabels[activity.time] }}</span>
      </div>
      <p class="text-xs text-gray-500 mt-0.5 leading-relaxed">{{ activity.description }}</p>
    </div>
    <div v-if="!readonly" class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
      <button @click.stop="startEdit" class="text-xs text-gray-400 hover:text-blue-600 cursor-pointer" title="Edit">✏️</button>
      <button @click.stop="emit('remove')" class="text-xs text-gray-400 hover:text-red-600 cursor-pointer" title="Remove">🗑️</button>
    </div>
  </div>
</template>
