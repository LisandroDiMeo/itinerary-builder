<script setup lang="ts">
defineEmits<{ insert: [] }>()
</script>

<template>
  <div class="group relative h-4 flex items-center justify-center -my-0.5">
    <!-- Dashed line + button appear on hover -->
    <div class="absolute inset-x-0 top-1/2 border-t border-dashed border-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
    <button
      @click.stop="$emit('insert')"
      class="relative z-10 px-3 py-0.5 text-xs font-medium text-gray-400 bg-white border border-dashed border-gray-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:text-blue-600 hover:border-blue-400 cursor-pointer"
    >
      + Add Day
    </button>
  </div>
</template>
