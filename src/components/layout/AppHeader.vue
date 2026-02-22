<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-14">
        <router-link to="/" class="flex items-center gap-2 text-gray-900 no-underline">
          <span class="text-xl">🗾</span>
          <span class="font-bold text-lg">Japan 2026</span>
        </router-link>
        <div v-if="route.name === 'itinerary'">
          <router-link
            to="/"
            class="text-sm text-gray-500 hover:text-gray-700 no-underline"
          >
            &larr; All Itineraries
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>
