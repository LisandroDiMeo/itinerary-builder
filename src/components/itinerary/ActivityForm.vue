<script setup lang="ts">
import { ref } from 'vue'
import type { Activity } from '@/types'

const emit = defineEmits<{ add: [activity: Omit<Activity, 'id'>] }>()

const show = ref(false)
const title = ref('')
const description = ref('')
const time = ref<Activity['time']>('morning')
const category = ref<Activity['category']>('sightseeing')

function submit() {
  if (!title.value.trim()) return
  emit('add', {
    title: title.value.trim(),
    description: description.value.trim(),
    time: time.value,
    category: category.value,
  })
  title.value = ''
  description.value = ''
  time.value = 'morning'
  category.value = 'sightseeing'
  show.value = false
}
</script>

<template>
  <div>
    <button
      v-if="!show"
      @click="show = true"
      class="text-xs text-blue-600 hover:text-blue-700 cursor-pointer font-medium"
    >
      + Add Activity
    </button>
    <div v-else class="bg-blue-50 rounded-lg p-3 space-y-2 mt-2">
      <input
        v-model="title"
        placeholder="Activity title"
        class="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <textarea
        v-model="description"
        rows="2"
        placeholder="Description"
        class="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      <div class="flex gap-2">
        <select v-model="time" class="px-2 py-1 border border-gray-300 rounded text-xs">
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
          <option value="all-day">All Day</option>
        </select>
        <select v-model="category" class="px-2 py-1 border border-gray-300 rounded text-xs">
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
        <button
          @click="submit"
          :disabled="!title.trim()"
          class="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
        >
          Add
        </button>
        <button @click="show = false" class="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>
