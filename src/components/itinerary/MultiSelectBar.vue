<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps<{ selectedCount: number }>()
defineEmits<{
  transfer: []
  remove: []
  create: []
  clean: []
  cancel: []
}>()

const { t } = useI18n()
const expanded = ref(false)
</script>

<template>
  <!-- Desktop: horizontal floating bar -->
  <div class="hidden sm:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-blue-200 rounded-xl shadow-lg px-6 py-3 items-center gap-3">
    <div class="text-sm font-medium text-gray-700 whitespace-nowrap">
      {{ t('multiSelect.selected', { count: selectedCount }, selectedCount) }}
    </div>
    <div class="h-5 w-px bg-gray-200" />
    <button
      @click="$emit('transfer')"
      class="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
    >
      {{ t('multiSelect.transfer') }}
    </button>
    <button
      @click="$emit('create')"
      class="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 cursor-pointer transition-colors"
    >
      {{ t('multiSelect.createItinerary') }}
    </button>
    <button
      @click="$emit('clean')"
      class="px-3 py-1.5 text-xs font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 cursor-pointer transition-colors"
    >
      {{ t('multiSelect.clean') }}
    </button>
    <button
      @click="$emit('remove')"
      class="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 cursor-pointer transition-colors"
    >
      {{ t('multiSelect.remove') }}
    </button>
    <div class="h-5 w-px bg-gray-200" />
    <button
      @click="$emit('cancel')"
      class="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
    >
      {{ t('common.cancel') }}
    </button>
  </div>

  <!-- Mobile: FAB with expandable vertical menu -->
  <div class="sm:hidden fixed bottom-5 right-4 z-50 flex flex-col-reverse items-end gap-2">
    <!-- Expanded action buttons -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div v-if="expanded" class="flex flex-col items-end gap-2 mb-1">
        <!-- Count badge -->
        <div class="px-3 py-1.5 bg-white border border-gray-200 rounded-full shadow text-xs font-medium text-gray-700">
          {{ t('multiSelect.selectedShort', { count: selectedCount }, selectedCount) }}
        </div>

        <button
          @click="$emit('transfer'); expanded = false"
          class="flex items-center gap-2 pl-3 pr-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-full shadow-lg active:bg-blue-700 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          {{ t('multiSelect.transfer') }}
        </button>

        <button
          @click="$emit('create'); expanded = false"
          class="flex items-center gap-2 pl-3 pr-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-full shadow-lg active:bg-emerald-700 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          {{ t('multiSelect.createItinerary') }}
        </button>

        <button
          @click="$emit('clean'); expanded = false"
          class="flex items-center gap-2 pl-3 pr-4 py-2.5 bg-amber-500 text-white text-sm font-medium rounded-full shadow-lg active:bg-amber-600 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/></svg>
          {{ t('multiSelect.clean') }}
        </button>

        <button
          @click="$emit('remove'); expanded = false"
          class="flex items-center gap-2 pl-3 pr-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-full shadow-lg active:bg-red-700 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4h8v2"/></svg>
          {{ t('multiSelect.remove') }}
        </button>

        <button
          @click="$emit('cancel'); expanded = false"
          class="flex items-center gap-2 pl-3 pr-4 py-2.5 bg-white text-gray-600 text-sm font-medium rounded-full shadow-lg border border-gray-200 active:bg-gray-50 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          {{ t('common.cancel') }}
        </button>
      </div>
    </Transition>

    <!-- FAB toggle button -->
    <button
      @click="expanded = !expanded"
      class="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center active:bg-blue-700 cursor-pointer transition-transform"
      :class="expanded ? 'rotate-45' : ''"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
    </button>
  </div>
</template>
