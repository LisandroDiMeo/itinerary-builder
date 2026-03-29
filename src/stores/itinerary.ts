import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Itinerary, ItineraryDay, Activity, DayVariation } from '@/types'
import { seedItinerary } from '@/data/seed'
import { generateId } from '@/utils/dates'

const STORAGE_KEY = 'itinerary-builder-data'
const OLD_STORAGE_KEY = 'japan-itineraries'

function loadFromStorage(): Itinerary[] {
  try {
    // Migration: old key -> new key
    const oldData = localStorage.getItem(OLD_STORAGE_KEY)
    const newData = localStorage.getItem(STORAGE_KEY)
    if (oldData && !newData) {
      localStorage.setItem(STORAGE_KEY, oldData)
      localStorage.removeItem(OLD_STORAGE_KEY)
      return JSON.parse(oldData)
    }
    if (newData) return JSON.parse(newData)
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
        coordinates: [20, 0],
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

  function insertMultipleDays(
    itineraryId: string,
    afterDate: string,
    count: number,
    location: string,
    coordinates: [number, number],
    titlePrefix: string
  ) {
    const it = getById(itineraryId)
    if (!it) return
    const afterIdx = it.days.findIndex(d => d.date === afterDate)
    if (afterIdx === -1) return

    // Shift all subsequent days forward by `count` days
    for (let i = it.days.length - 1; i > afterIdx; i--) {
      const day = it.days[i]!
      const d = new Date(day.date + 'T00:00:00')
      d.setDate(d.getDate() + count)
      day.date = d.toISOString().slice(0, 10)
    }

    // Insert `count` new days
    const newDays: ItineraryDay[] = []
    for (let n = 1; n <= count; n++) {
      const newDateObj = new Date(afterDate + 'T00:00:00')
      newDateObj.setDate(newDateObj.getDate() + n)
      newDays.push({
        date: newDateObj.toISOString().slice(0, 10),
        location,
        coordinates: [...coordinates] as [number, number],
        title: titlePrefix ? `${titlePrefix} ${n}` : 'New Day',
        accommodation: null,
        activities: [],
        isDayTrip: null,
        dayTripDestination: null,
        dayTripCoordinates: null,
        variations: [],
      })
    }

    it.days.splice(afterIdx + 1, 0, ...newDays)
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

  function addManualVariation(itineraryId: string, date: string): DayVariation | undefined {
    const it = getById(itineraryId)
    if (!it) return
    const day = it.days.find(d => d.date === date)
    if (!day) return
    const variation: DayVariation = {
      id: generateId(),
      sourceItineraryId: null,
      sourceItineraryName: null,
      location: day.location,
      coordinates: [...day.coordinates] as [number, number],
      title: `Variation ${day.variations.length + 1}`,
      accommodation: null,
      activities: [],
      isDayTrip: null,
      dayTripDestination: null,
    }
    day.variations.push(variation)
    it.updatedAt = new Date().toISOString()
    return variation
  }

  function promoteVariation(itineraryId: string, date: string, variationId: string) {
    const it = getById(itineraryId)
    if (!it) return
    const day = it.days.find(d => d.date === date)
    if (!day) return
    const variationIdx = day.variations.findIndex(v => v.id === variationId)
    if (variationIdx === -1) return
    const variation = day.variations[variationIdx]!

    // Save current main as a variation
    const oldMain: DayVariation = {
      id: generateId(),
      sourceItineraryId: null,
      sourceItineraryName: 'Main Plan',
      location: day.location,
      coordinates: [...day.coordinates] as [number, number],
      title: day.title,
      accommodation: day.accommodation,
      activities: JSON.parse(JSON.stringify(day.activities)),
      isDayTrip: day.isDayTrip,
      dayTripDestination: day.dayTripDestination,
    }

    // Apply variation data onto the day
    day.location = variation.location
    day.coordinates = [...variation.coordinates] as [number, number]
    day.title = variation.title
    day.accommodation = variation.accommodation
    day.activities = JSON.parse(JSON.stringify(variation.activities))
    day.isDayTrip = variation.isDayTrip
    day.dayTripDestination = variation.dayTripDestination
    day.dayTripCoordinates = null

    // Remove the promoted variation and insert old main at its position
    day.variations.splice(variationIdx, 1, oldMain)

    it.updatedAt = new Date().toISOString()
  }

  function updateVariation(itineraryId: string, date: string, variationId: string, updates: Partial<DayVariation>) {
    const it = getById(itineraryId)
    if (!it) return
    const day = it.days.find(d => d.date === date)
    if (!day) return
    const variation = day.variations.find(v => v.id === variationId)
    if (!variation) return
    Object.assign(variation, updates)
    it.updatedAt = new Date().toISOString()
  }

  function addVariationActivity(itineraryId: string, date: string, variationId: string, activity: Omit<Activity, 'id'>): Activity | undefined {
    const it = getById(itineraryId)
    if (!it) return
    const day = it.days.find(d => d.date === date)
    if (!day) return
    const variation = day.variations.find(v => v.id === variationId)
    if (!variation) return
    const newActivity: Activity = { ...activity, id: generateId() }
    variation.activities.push(newActivity)
    it.updatedAt = new Date().toISOString()
    return newActivity
  }

  function updateVariationActivity(itineraryId: string, date: string, variationId: string, activityId: string, updates: Partial<Activity>) {
    const it = getById(itineraryId)
    if (!it) return
    const day = it.days.find(d => d.date === date)
    if (!day) return
    const variation = day.variations.find(v => v.id === variationId)
    if (!variation) return
    const act = variation.activities.find(a => a.id === activityId)
    if (!act) return
    Object.assign(act, updates)
    it.updatedAt = new Date().toISOString()
  }

  function removeVariationActivity(itineraryId: string, date: string, variationId: string, activityId: string) {
    const it = getById(itineraryId)
    if (!it) return
    const day = it.days.find(d => d.date === date)
    if (!day) return
    const variation = day.variations.find(v => v.id === variationId)
    if (!variation) return
    variation.activities = variation.activities.filter(a => a.id !== activityId)
    it.updatedAt = new Date().toISOString()
  }

  function reorderStopGroups(itineraryId: string, newGroupOrder: number[]) {
    const it = getById(itineraryId)
    if (!it || it.days.length === 0) return

    // Build current groups (consecutive days by location)
    const groups: ItineraryDay[][] = []
    let currentGroup: ItineraryDay[] = []
    let currentLocation = ''
    for (const day of it.days) {
      if (day.location !== currentLocation) {
        if (currentGroup.length > 0) groups.push(currentGroup)
        currentGroup = [day]
        currentLocation = day.location
      } else {
        currentGroup.push(day)
      }
    }
    if (currentGroup.length > 0) groups.push(currentGroup)

    // Validate order
    if (newGroupOrder.length !== groups.length) return

    // Reorder groups
    const reordered = newGroupOrder.map(idx => groups[idx]!)

    // Flatten and recalculate dates
    const startDate = new Date(it.days[0]!.date + 'T00:00:00')
    const newDays: ItineraryDay[] = []
    const cursor = new Date(startDate)
    for (const group of reordered) {
      for (const day of group) {
        newDays.push({ ...day, date: cursor.toISOString().slice(0, 10) })
        cursor.setDate(cursor.getDate() + 1)
      }
    }

    it.days = newDays
    it.updatedAt = new Date().toISOString()
  }

  function removeDays(itineraryId: string, dates: string[]) {
    const it = getById(itineraryId)
    if (!it) return
    const dateSet = new Set(dates)
    it.days = it.days.filter(d => !dateSet.has(d.date))
    // Recalculate dates sequentially from the first day
    if (it.days.length > 0) {
      const startDate = new Date(it.days[0]!.date + 'T00:00:00')
      for (let i = 0; i < it.days.length; i++) {
        const d = new Date(startDate)
        d.setDate(startDate.getDate() + i)
        it.days[i]!.date = d.toISOString().slice(0, 10)
      }
    }
    it.updatedAt = new Date().toISOString()
  }

  function createFromDays(itineraryId: string, dates: string[], newName: string): Itinerary | undefined {
    const it = getById(itineraryId)
    if (!it) return
    const dateSet = new Set(dates)
    const selectedDays: ItineraryDay[] = it.days
      .filter(d => dateSet.has(d.date))
      .map(d => JSON.parse(JSON.stringify(d)))

    if (selectedDays.length === 0) return

    // Recalculate to contiguous dates starting from the earliest
    const sortedDates = [...dates].sort()
    const startDate = new Date(sortedDates[0]! + 'T00:00:00')
    for (let i = 0; i < selectedDays.length; i++) {
      const d = new Date(startDate)
      d.setDate(startDate.getDate() + i)
      selectedDays[i]!.date = d.toISOString().slice(0, 10)
    }

    const newIt: Itinerary = {
      id: generateId(),
      name: newName,
      description: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      days: selectedDays,
    }
    itineraries.value.push(newIt)
    return newIt
  }

  function cleanDays(itineraryId: string, dates: string[]) {
    const it = getById(itineraryId)
    if (!it) return
    const dateSet = new Set(dates)
    for (const day of it.days) {
      if (dateSet.has(day.date)) {
        day.activities = []
        day.variations = []
      }
    }
    it.updatedAt = new Date().toISOString()
  }

  function transferSelectedDays(sourceId: string, targetId: string, dates: string[]) {
    const source = getById(sourceId)
    const target = getById(targetId)
    if (!source || !target) return

    const dateSet = new Set(dates)
    const sourceDays = source.days.filter(d => dateSet.has(d.date))

    for (const srcDay of sourceDays) {
      const targetDay = target.days.find(d => d.date === srcDay.date)
      if (targetDay) {
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
        const newDay: ItineraryDay = JSON.parse(JSON.stringify(srcDay))
        newDay.variations = []
        target.days.push(newDay)
        target.days.sort((a, b) => a.date.localeCompare(b.date))
      }
    }
    target.updatedAt = new Date().toISOString()
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
    insertMultipleDays,
    removeDay,
    removeVariation,
    addManualVariation,
    promoteVariation,
    updateVariation,
    addVariationActivity,
    updateVariationActivity,
    removeVariationActivity,
    reorderStopGroups,
    removeDays,
    createFromDays,
    cleanDays,
    transferSelectedDays,
    exportItinerary,
    importItinerary,
  }
})
