import { createRouter, createWebHashHistory } from 'vue-router'
import LandingView from '@/views/LandingView.vue'

const router = createRouter({
  history: createWebHashHistory(),
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
