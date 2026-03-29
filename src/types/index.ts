export interface Itinerary {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  days: ItineraryDay[]
}

export interface ItineraryDay {
  date: string
  location: string
  coordinates: [number, number]
  title: string
  accommodation: string | null
  activities: Activity[]
  isDayTrip: boolean | null
  dayTripDestination: string | null
  dayTripCoordinates: [number, number] | null
  variations: DayVariation[]
}

export interface Activity {
  id: string
  time: 'morning' | 'afternoon' | 'evening' | 'all-day'
  title: string
  description: string
  category: ActivityCategory
}

export type ActivityCategory =
  | 'sightseeing'
  | 'food'
  | 'transport'
  | 'shopping'
  | 'nature'
  | 'culture'
  | 'onsen'
  | 'nightlife'
  | 'other'

export interface DayVariation {
  id: string
  sourceItineraryId: string | null
  sourceItineraryName: string | null
  location: string
  coordinates: [number, number]
  title: string
  accommodation: string | null
  activities: Activity[]
  isDayTrip: boolean | null
  dayTripDestination: string | null
}

export interface StopGroup {
  location: string
  coordinates: [number, number]
  days: ItineraryDay[]
  nights: number
  startDate: string
  endDate: string
}
