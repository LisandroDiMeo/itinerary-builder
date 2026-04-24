<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from '@/components/shared/BaseModal.vue'

defineProps<{ show: boolean }>()
const emit = defineEmits<{ close: []; create: [name: string, description: string, startDate: string, endDate: string] }>()

const { t } = useI18n()
const name = ref('')
const description = ref('')
const startDate = ref('')
const endDate = ref('')

function submit() {
  if (!name.value.trim() || !startDate.value || !endDate.value) return
  emit('create', name.value.trim(), description.value.trim(), startDate.value, endDate.value)
  name.value = ''
  description.value = ''
}
</script>

<template>
  <BaseModal :show="show" :title="t('createItinerary.title')" @close="emit('close')">
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('createItinerary.name') }}</label>
        <input
          v-model="name"
          type="text"
          :placeholder="t('createItinerary.namePlaceholder')"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('createItinerary.description') }}</label>
        <textarea
          v-model="description"
          rows="2"
          :placeholder="t('createItinerary.descriptionPlaceholder')"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('createItinerary.startDate') }}</label>
          <input
            v-model="startDate"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('createItinerary.endDate') }}</label>
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
        {{ t('common.cancel') }}
      </button>
      <button
        @click="submit"
        :disabled="!name.trim() || !startDate || !endDate"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {{ t('common.create') }}
      </button>
    </template>
  </BaseModal>
</template>
