<script setup lang="ts">
defineProps<{ color?: string }>()
</script>

<template>
  <span
    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
    :class="color || 'bg-gray-100 text-gray-700'"
  >
    <slot />
  </span>
</template>
