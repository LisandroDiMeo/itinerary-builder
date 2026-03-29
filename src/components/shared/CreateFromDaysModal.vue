<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from './BaseModal.vue'

const props = defineProps<{ show: boolean; dayCount: number }>()
const emit = defineEmits<{ close: []; create: [name: string] }>()

const name = ref('')

function submit() {
  if (!name.value.trim()) return
  emit('create', name.value.trim())
  name.value = ''
}
</script>

<template>
  <BaseModal :show="show" title="Create Itinerary from Selection" @close="emit('close')">
    <div class="space-y-4">
      <p class="text-sm text-gray-600">
        Creating a new itinerary from {{ dayCount }} selected day{{ dayCount !== 1 ? 's' : '' }}, including any variations.
      </p>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Itinerary Name</label>
        <input
          v-model="name"
          type="text"
          placeholder="e.g. Alternative Trip"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          @keyup.enter="submit"
        />
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
        :disabled="!name.trim()"
        class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        Create
      </button>
    </template>
  </BaseModal>
</template>
