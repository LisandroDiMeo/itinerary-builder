<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Activity } from '@/types'
import { categoryIcons } from '@/utils/colors'

const props = defineProps<{ activity: Activity; readonly?: boolean }>()
const emit = defineEmits<{ update: [updates: Partial<Activity>]; remove: [] }>()

const { t } = useI18n()
const editing = ref(false)
const editTitle = ref('')
const editDesc = ref('')
const editTime = ref<Activity['time']>('morning')
const editCategory = ref<Activity['category']>('sightseeing')

const timeLabel = computed(() => {
  const key = props.activity.time === 'all-day' ? 'allDay' : props.activity.time
  return t(`activity.time.${key}`)
})

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
      :placeholder="t('activity.titlePlaceholder')"
    />
    <textarea
      v-model="editDesc"
      rows="2"
      class="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      :placeholder="t('activity.descriptionPlaceholder')"
    />
    <div class="flex gap-2">
      <select v-model="editTime" class="px-2 py-1 border border-gray-300 rounded text-xs">
        <option value="morning">{{ t('activity.time.morning') }}</option>
        <option value="afternoon">{{ t('activity.time.afternoon') }}</option>
        <option value="evening">{{ t('activity.time.evening') }}</option>
        <option value="all-day">{{ t('activity.time.allDay') }}</option>
      </select>
      <select v-model="editCategory" class="px-2 py-1 border border-gray-300 rounded text-xs">
        <option value="sightseeing">{{ t('activity.category.sightseeing') }}</option>
        <option value="food">{{ t('activity.category.food') }}</option>
        <option value="transport">{{ t('activity.category.transport') }}</option>
        <option value="shopping">{{ t('activity.category.shopping') }}</option>
        <option value="nature">{{ t('activity.category.nature') }}</option>
        <option value="culture">{{ t('activity.category.culture') }}</option>
        <option value="onsen">{{ t('activity.category.onsen') }}</option>
        <option value="nightlife">{{ t('activity.category.nightlife') }}</option>
        <option value="other">{{ t('activity.category.other') }}</option>
      </select>
    </div>
    <div class="flex gap-2">
      <button @click="save" class="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 cursor-pointer">{{ t('common.save') }}</button>
      <button @click="editing = false" class="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer">{{ t('common.cancel') }}</button>
    </div>
  </div>

  <!-- Display mode -->
  <div v-else class="flex items-start gap-2 group">
    <span class="text-sm flex-shrink-0 mt-0.5">{{ categoryIcons[activity.category] || '📌' }}</span>
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-800">{{ activity.title }}</span>
        <span class="text-xs text-gray-400">{{ timeLabel }}</span>
      </div>
      <p class="text-xs text-gray-500 mt-0.5 leading-relaxed">{{ activity.description }}</p>
    </div>
    <div v-if="!readonly" class="flex-shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex gap-1">
      <button @click.stop="startEdit" class="text-xs text-gray-400 hover:text-blue-600 cursor-pointer" :title="t('activity.editTooltip')">✏️</button>
      <button @click.stop="emit('remove')" class="text-xs text-gray-400 hover:text-red-600 cursor-pointer" :title="t('activity.removeTooltip')">🗑️</button>
    </div>
  </div>
</template>
