<script setup lang="ts">
defineProps<{ selectedCount: number }>()
defineEmits<{
  transfer: []
  remove: []
  create: []
  clean: []
  cancel: []
}>()
</script>

<template>
  <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-blue-200 rounded-xl shadow-lg px-6 py-3 flex items-center gap-3">
    <div class="text-sm font-medium text-gray-700">
      {{ selectedCount }} day{{ selectedCount !== 1 ? 's' : '' }} selected
    </div>
    <div class="h-5 w-px bg-gray-200" />
    <button
      @click="$emit('transfer')"
      class="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
    >
      Transfer
    </button>
    <button
      @click="$emit('create')"
      class="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 cursor-pointer transition-colors"
    >
      Create Itinerary
    </button>
    <button
      @click="$emit('clean')"
      class="px-3 py-1.5 text-xs font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 cursor-pointer transition-colors"
    >
      Clean
    </button>
    <button
      @click="$emit('remove')"
      class="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 cursor-pointer transition-colors"
    >
      Remove
    </button>
    <div class="h-5 w-px bg-gray-200" />
    <button
      @click="$emit('cancel')"
      class="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
    >
      Cancel
    </button>
  </div>
</template>
