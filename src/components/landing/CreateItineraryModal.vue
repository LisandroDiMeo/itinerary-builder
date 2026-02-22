<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from '@/components/shared/BaseModal.vue'

defineProps<{ show: boolean }>()
const emit = defineEmits<{ close: []; create: [name: string, description: string, startDate: string, endDate: string] }>()

const name = ref('')
const description = ref('')
const startDate = ref('2026-12-03')
const endDate = ref('2026-12-28')

function submit() {
  if (!name.value.trim() || !startDate.value || !endDate.value) return
  emit('create', name.value.trim(), description.value.trim(), startDate.value, endDate.value)
  name.value = ''
  description.value = ''
}
</script>

<template>
  <BaseModal :show="show" title="Create New Itinerary" @close="emit('close')">
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          v-model="name"
          type="text"
          placeholder="e.g. Japan Alternative Plan"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          v-model="description"
          rows="2"
          placeholder="Brief description..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            v-model="startDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            v-model="endDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
    <template #footer>
      <button
        @click="emit('close')"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
      >
        Cancel
      </button>
      <button
        @click="submit"
        :disabled="!name.trim() || !startDate || !endDate"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        Create
      </button>
    </template>
  </BaseModal>
</template>
