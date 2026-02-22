import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '@/views/LandingView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingView,
    },
    {
      path: '/itinerary/:id',
      name: 'itinerary',
      component: () => import('@/views/ItineraryView.vue'),
    },
  ],
})

export default router
