<script setup lang="ts">
import BaseModal from './BaseModal.vue'

defineProps<{ show: boolean; title: string; message: string; confirmText?: string; danger?: boolean }>()
const emit = defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <BaseModal :show="show" :title="title" @close="emit('cancel')">
    <p class="text-gray-600">{{ message }}</p>
    <template #footer>
      <button
        @click="emit('cancel')"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
      >
        Cancel
      </button>
      <button
        @click="emit('confirm')"
        class="px-4 py-2 text-sm font-medium text-white rounded-lg cursor-pointer"
        :class="danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'"
      >
        {{ confirmText || 'Confirm' }}
      </button>
    </template>
  </BaseModal>
</template>
