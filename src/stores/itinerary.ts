import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Itinerary, ItineraryDay, Activity, DayVariation } from '@/types'
import { seedItinerary } from '@/data/seed'
import { generateId } from '@/utils/dates'

const STORAGE_KEY = 'japan-itineraries'

function loadFromStorage(): Itinerary[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) return JSON.parse(data)
  } catch { /* ignore */ }
  return []
}

function saveToStorage(itineraries: Itinerary[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(itineraries))
}

export const useItineraryStore = defineStore('itinerary', () => {
  const itineraries = ref<Itinerary[]>(loadFromStorage())

  // Seed if empty
  if (itineraries.value.length === 0) {
    itineraries.value = [JSON.parse(JSON.stringify(seedItinerary))]
    saveToStorage(itineraries.value)
  }

  // Auto-save
  watch(itineraries, (val) => saveToStorage(val), { deep: true })

  function getById(id: string): Itinerary | undefined {
    return itineraries.value.find(it => it.id === id)
  }

  function create(name: string, description: string, startDate: string, endDate: string): Itinerary {
    const days: ItineraryDay[] = []
    const start = new Date(startDate + 'T00:00:00')
    const end = new Date(endDate + 'T00:00:00')
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10)
      days.push({
        date: dateStr,
        location: 'TBD',
        coordinates: [36.2048, 138.2529],
        title: `Day ${days.length + 1}`,
        accommodation: null,
        activities: [],
        isDayTrip: null,
        dayTripDestination: null,
        dayTripCoordinates: null,
        variations: [],
      })
    }
    const itinerary: Itinerary = {
      id: generateId(),
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      days,
    }
    itineraries.value.push(itinerary)
    return itinerary
  }

  function duplicate(id: string): Itinerary | undefined {
    const source = getById(id)
    if (!source) return
    const copy: Itinerary = JSON.parse(JSON.stringify(source))
    copy.id = generateId()
    copy.name = `${source.name} (Copy)`
    copy.createdAt = new Date().toISOString()
    copy.updatedAt = new Date().toISOString()
    itineraries.value.push(copy)
    return copy
  }

  function remove(id: string) {
    itineraries.value = itineraries.value.filter(it => it.id !== id)
  }

  function updateMeta(id: string, name: string, description: string) {
    const it = getById(id)
    if (!it) return
    it.name = name
    it.description = description
    it.updatedAt = new Date().toISOString()
  }

  function updateDay(itineraryId: string, date: string, updates: Partial<ItineraryDay>) {
    const it = getById(itineraryId)
    if (!it) return
    const day = it.days.find(d => d.date === date)
    if (!day) return
    Object.assign(day, updates)
    it.updatedAt = new Date().toISOString()
  }

  function addActivity(itineraryId: string, date: string, activity: Omit<Activity, 'id'>): Activity | undefined {
    const it = getById(itineraryId)
    if (!it) return
    const day = it.days.find(d => d.date === date)
    if (!day) return
    const newActivity: Activity = { ...activity, id: generateId() }
    day.activities.push(newActivity)
    it.updatedAt = new Date().toISOString()
    return newActivity
  }

  function updateActivity(itineraryId: string, date: string, activityId: string, updates: Partial<Activity>) {
    const it = getById(itineraryId)
    if (!it) return
    const day = it.days.find(d => d.date === date)
    if (!day) return
    const act = day.activities.find(a => a.id === activityId)
    if (!act) return
    Object.assign(act, updates)
    it.updatedAt = new Date().toISOString()
  }

  function removeActivity(itineraryId: string, date: string, activityId: string) {
    const it = getById(itineraryId)
    if (!it) return
    const day = it.days.find(d => d.date === date)
    if (!day) return
    day.activities = day.activities.filter(a => a.id !== activityId)
    it.updatedAt = new Date().toISOString()
  }

  function transferDays(sourceId: string, targetId: string, startDate: string, endDate: string) {
    const source = getById(sourceId)
    const target = getById(targetId)
    if (!source || !target) return

    const sourceDays = source.days.filter(d => d.date >= startDate && d.date <= endDate)

    for (const srcDay of sourceDays) {
      const targetDay = target.days.find(d => d.date === srcDay.date)
      if (targetDay) {
        // Add as variation
        const variation: DayVariation = {
          id: generateId(),
          sourceItineraryId: sourceId,
          sourceItineraryName: source.name,
          location: srcDay.location,
          coordinates: srcDay.coordinates,
          title: srcDay.title,
          accommodation: srcDay.accommodation,
          activities: JSON.parse(JSON.stringify(srcDay.activities)),
          isDayTrip: srcDay.isDayTrip,
          dayTripDestination: srcDay.dayTripDestination,
        }
        targetDay.variations.push(variation)
      } else {
        // Insert day directly
        const newDay: ItineraryDay = JSON.parse(JSON.stringify(srcDay))
        newDay.variations = []
        target.days.push(newDay)
        target.days.sort((a, b) => a.date.localeCompare(b.date))
      }
    }
    target.updatedAt = new Date().toISOString()
  }

  function insertDay(itineraryId: string, afterDate: string) {
    const it = getById(itineraryId)
    if (!it) return
    const afterIdx = it.days.findIndex(d => d.date === afterDate)
    if (afterIdx === -1) return

    const afterDay = it.days[afterIdx]!
    // Compute new date = afterDate + 1 day
    const newDateObj = new Date(afterDate + 'T00:00:00')
    newDateObj.setDate(newDateObj.getDate() + 1)
    const newDateStr = newDateObj.toISOString().slice(0, 10)

    // Shift all subsequent days (those at or after newDateStr) forward by 1 day
    for (let i = it.days.length - 1; i > afterIdx; i--) {
      const day = it.days[i]!
      const d = new Date(day.date + 'T00:00:00')
      d.setDate(d.getDate() + 1)
      day.date = d.toISOString().slice(0, 10)
    }

    const newDay: ItineraryDay = {
      date: newDateStr,
      location: afterDay.location,
      coordinates: [...afterDay.coordinates] as [number, number],
      title: `New Day`,
      accommodation: null,
      activities: [],
      isDayTrip: null,
      dayTripDestination: null,
      dayTripCoordinates: null,
      variations: [],
    }

    it.days.splice(afterIdx + 1, 0, newDay)
    it.updatedAt = new Date().toISOString()
  }

  function removeDay(itineraryId: string, date: string) {
    const it = getById(itineraryId)
    if (!it) return
    const idx = it.days.findIndex(d => d.date === date)
    if (idx === -1) return

    it.days.splice(idx, 1)

    // Shift subsequent days back by 1 day
    for (let i = idx; i < it.days.length; i++) {
      const day = it.days[i]!
      const d = new Date(day.date + 'T00:00:00')
      d.setDate(d.getDate() - 1)
      day.date = d.toISOString().slice(0, 10)
    }

    it.updatedAt = new Date().toISOString()
  }

  function removeVariation(itineraryId: string, date: string, variationId: string) {
    const it = getById(itineraryId)
    if (!it) return
    const day = it.days.find(d => d.date === date)
    if (!day) return
    day.variations = day.variations.filter(v => v.id !== variationId)
    it.updatedAt = new Date().toISOString()
  }

  function exportItinerary(id: string): string | undefined {
    const it = getById(id)
    if (!it) return
    return JSON.stringify(it, null, 2)
  }

  function importItinerary(json: string): Itinerary {
    const data = JSON.parse(json)
    // Validate required fields
    if (!data || typeof data !== 'object') throw new Error('Invalid JSON: not an object')
    if (!data.name || typeof data.name !== 'string') throw new Error('Invalid itinerary: missing name')
    if (!Array.isArray(data.days)) throw new Error('Invalid itinerary: missing days array')
    for (const day of data.days) {
      if (!day.date || typeof day.date !== 'string') throw new Error('Invalid day: missing date')
      if (!day.location || typeof day.location !== 'string') throw new Error('Invalid day: missing location')
      if (!Array.isArray(day.coordinates) || day.coordinates.length !== 2) throw new Error('Invalid day: missing coordinates')
    }
    // Assign new ID and timestamps
    const it: Itinerary = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    // Ensure all days have required fields with defaults
    it.days = it.days.map((d: any) => ({
      date: d.date,
      location: d.location,
      coordinates: d.coordinates,
      title: d.title || 'Untitled',
      accommodation: d.accommodation || null,
      activities: Array.isArray(d.activities) ? d.activities : [],
      isDayTrip: d.isDayTrip ?? null,
      dayTripDestination: d.dayTripDestination ?? null,
      dayTripCoordinates: d.dayTripCoordinates ?? null,
      variations: Array.isArray(d.variations) ? d.variations : [],
    }))
    itineraries.value.push(it)
    return it
  }

  return {
    itineraries,
    getById,
    create,
    duplicate,
    remove,
    updateMeta,
    updateDay,
    addActivity,
    updateActivity,
    removeActivity,
    transferDays,
    insertDay,
    removeDay,
    removeVariation,
    exportItinerary,
    importItinerary,
  }
})
