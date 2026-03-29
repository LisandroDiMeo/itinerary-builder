<script setup lang="ts">
defineEmits<{ insert: []; insertMultiple: [] }>()
</script>

<template>
  <div class="group relative h-4 flex items-center justify-center -my-0.5">
    <!-- Dashed line + buttons appear on hover -->
    <div class="absolute inset-x-0 top-1/2 border-t border-dashed border-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
    <div class="relative z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        @click.stop="$emit('insert')"
        class="px-3 py-0.5 text-xs font-medium text-gray-400 bg-white border border-dashed border-gray-300 rounded-full hover:text-blue-600 hover:border-blue-400 cursor-pointer transition-colors"
      >
        + Add Day
      </button>
      <button
        @click.stop="$emit('insertMultiple')"
        class="px-3 py-0.5 text-xs font-medium text-gray-400 bg-white border border-dashed border-gray-300 rounded-full hover:text-blue-600 hover:border-blue-400 cursor-pointer transition-colors"
      >
        + Add Multiple
      </button>
    </div>
  </div>
</template>
