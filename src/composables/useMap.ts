import { onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
import L from 'leaflet'
import type { StopGroup, ItineraryDay } from '@/types'
import { getMarkerColor } from '@/utils/colors'
import { formatDateRange } from '@/utils/dates'

// Fix Leaflet's default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export function useMap(
  container: Ref<HTMLElement | null>,
  stopGroups: Ref<StopGroup[]>,
  days: Ref<ItineraryDay[]>
) {
  const map = ref<L.Map | null>(null)

  function render() {
    if (!map.value) return
    // Clear layers
    map.value.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        map.value!.removeLayer(layer)
      }
    })

    const groups = stopGroups.value
    if (groups.length === 0) return

    const coords: L.LatLngExpression[] = []

    // Circle markers for each stop
    for (const g of groups) {
      const [lat, lng] = g.coordinates
      const color = getMarkerColor(g.location)
      const radius = Math.max(8, Math.min(20, g.nights * 4))
      const marker = L.circleMarker([lat, lng], {
        radius,
        color,
        fillColor: color,
        fillOpacity: 0.6,
        weight: 2,
      }).addTo(map.value!)

      marker.bindPopup(`
        <strong>${g.location}</strong><br/>
        ${g.nights} night${g.nights > 1 ? 's' : ''}<br/>
        ${formatDateRange(g.startDate, g.endDate)}
      `)

      coords.push([lat, lng])
    }

    // Route polyline
    if (coords.length > 1) {
      L.polyline(coords, { color: '#9ca3af', weight: 2, opacity: 0.6 }).addTo(map.value!)
    }

    // Day trip dashed lines
    for (const day of days.value) {
      if (day.isDayTrip && day.dayTripCoordinates) {
        const from: L.LatLngExpression = [day.coordinates[0], day.coordinates[1]]
        const to: L.LatLngExpression = [day.dayTripCoordinates[0], day.dayTripCoordinates[1]]

        L.polyline([from, to], {
          color: '#a78bfa',
          weight: 1.5,
          dashArray: '6 4',
          opacity: 0.7,
        }).addTo(map.value!)

        L.circleMarker(to, {
          radius: 5,
          color: '#a78bfa',
          fillColor: '#a78bfa',
          fillOpacity: 0.5,
          weight: 1,
        })
          .bindPopup(`Day trip: ${day.dayTripDestination}`)
          .addTo(map.value!)
      }
    }

    // Fit bounds
    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords as L.LatLngTuple[])
      map.value!.fitBounds(bounds.pad(0.15))
    }
  }

  onMounted(() => {
    if (!container.value) return
    map.value = L.map(container.value, {
      center: [36.5, 137.0],
      zoom: 6,
      zoomControl: true,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map.value)

    render()
  })

  watch([stopGroups, days], () => render(), { deep: true })

  onUnmounted(() => {
    map.value?.remove()
  })

  return { map }
}
