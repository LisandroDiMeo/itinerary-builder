import { computed } from 'vue'
import type { Itinerary, StopGroup } from '@/types'

export function useItineraryHelpers(itinerary: () => Itinerary | undefined) {
  const stopGroups = computed<StopGroup[]>(() => {
    const it = itinerary()
    if (!it) return []
    const groups: StopGroup[] = []
    let current: StopGroup | null = null

    for (const day of it.days) {
      if (!current || current.location !== day.location) {
        if (current && current.days.length > 0) {
          current.nights = current.days.length
          current.endDate = current.days[current.days.length - 1]!.date
        }
        current = {
          location: day.location,
          coordinates: day.coordinates,
          days: [day],
          nights: 0,
          startDate: day.date,
          endDate: day.date,
        }
        groups.push(current)
      } else {
        current.days.push(day)
      }
    }
    if (current && current.days.length > 0) {
      current.nights = current.days.length
      current.endDate = current.days[current.days.length - 1]!.date
    }
    return groups
  })

  const dateRange = computed(() => {
    const it = itinerary()
    if (!it || it.days.length === 0) return { start: '', end: '' }
    return { start: it.days[0]!.date, end: it.days[it.days.length - 1]!.date }
  })

  const mapMarkers = computed(() => {
    const groups = stopGroups.value
    return groups.map(g => ({
      location: g.location,
      coordinates: g.coordinates,
      nights: g.nights,
      startDate: g.startDate,
      endDate: g.endDate,
    }))
  })

  return { stopGroups, dateRange, mapMarkers }
}
