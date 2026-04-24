<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from './BaseModal.vue'

const props = defineProps<{ show: boolean; dayCount: number }>()
const emit = defineEmits<{ close: []; create: [name: string] }>()

const { t } = useI18n()
const name = ref('')

function submit() {
  if (!name.value.trim()) return
  emit('create', name.value.trim())
  name.value = ''
}
</script>

<template>
  <BaseModal :show="show" :title="t('createFromDays.title')" @close="emit('close')">
    <div class="space-y-4">
      <p class="text-sm text-gray-600">
        {{ t('createFromDays.description', { count: dayCount }, dayCount) }}
      </p>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('createFromDays.name') }}</label>
        <input
          v-model="name"
          type="text"
          :placeholder="t('createFromDays.namePlaceholder')"
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
        {{ t('common.cancel') }}
      </button>
      <button
        @click="submit"
        :disabled="!name.trim()"
        class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {{ t('common.create') }}
      </button>
    </template>
  </BaseModal>
</template>
