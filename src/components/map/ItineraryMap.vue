<script setup lang="ts">
import { ref, toRef } from 'vue'
import type { StopGroup, ItineraryDay } from '@/types'
import { useMap } from '@/composables/useMap'

const props = defineProps<{ stopGroups: StopGroup[]; days: ItineraryDay[] }>()

const mapContainer = ref<HTMLElement | null>(null)

useMap(
  mapContainer,
  toRef(props, 'stopGroups'),
  toRef(props, 'days')
)
</script>

<template>
  <div ref="mapContainer" class="w-full h-full rounded-lg" style="min-height: 300px;" />
</template>
