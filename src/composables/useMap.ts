import { onMounted, onUnmounted, watch, nextTick, type Ref } from 'vue'
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
  let mapInstance: L.Map | null = null

  function render() {
    const m = mapInstance
    if (!m) return
    // Clear all non-tile layers
    m.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) {
        m.removeLayer(layer)
      }
    })

    const groups = stopGroups.value
    if (groups.length === 0) return

    const allCoords: L.LatLngTuple[] = []
    const routeCoords: L.LatLngTuple[] = []
    const dayTripCoords: L.LatLngTuple[] = []

    // Route polyline (draw first so markers sit on top)
    for (const g of groups) {
      routeCoords.push([g.coordinates[0], g.coordinates[1]])
    }

    // Route outline (thicker, darker — gives a "border" effect)
    if (routeCoords.length > 1) {
      L.polyline(routeCoords, {
        color: '#374151',
        weight: 5,
        opacity: 0.3,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(m)

      // Main route line
      L.polyline(routeCoords, {
        color: '#3b82f6',
        weight: 3,
        opacity: 0.8,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(m)
    }

    // Day trip dashed lines
    for (const day of days.value) {
      if (day.isDayTrip && day.dayTripCoordinates) {
        const from: L.LatLngTuple = [day.coordinates[0], day.coordinates[1]]
        const to: L.LatLngTuple = [day.dayTripCoordinates[0], day.dayTripCoordinates[1]]
        dayTripCoords.push(to)

        L.polyline([from, to], {
          color: '#8b5cf6',
          weight: 2,
          dashArray: '8 6',
          opacity: 0.7,
          lineCap: 'round',
        }).addTo(m)

        // Day trip destination marker (smaller)
        L.circleMarker(to, {
          radius: 5,
          color: '#8b5cf6',
          fillColor: '#c4b5fd',
          fillOpacity: 0.7,
          weight: 2,
        })
          .bindPopup(`<strong>Day trip:</strong> ${day.dayTripDestination}`)
          .addTo(m)
      }
    }

    // Circle markers for each stop (on top)
    for (const g of groups) {
      const [lat, lng] = g.coordinates
      const color = getMarkerColor(g.location)
      const radius = Math.max(10, Math.min(22, g.nights * 4 + 2))

      // White border ring
      L.circleMarker([lat, lng], {
        radius: radius + 3,
        color: '#ffffff',
        fillColor: '#ffffff',
        fillOpacity: 0.9,
        weight: 0,
      }).addTo(m)

      // Colored marker
      const marker = L.circleMarker([lat, lng], {
        radius,
        color: '#ffffff',
        fillColor: color,
        fillOpacity: 0.85,
        weight: 2,
      }).addTo(m)

      marker.bindPopup(`
        <div style="text-align:center;min-width:120px;">
          <strong style="font-size:14px;">${g.location}</strong><br/>
          <span style="color:#666;">${g.nights} night${g.nights > 1 ? 's' : ''}</span><br/>
          <span style="color:#999;font-size:12px;">${formatDateRange(g.startDate, g.endDate)}</span>
        </div>
      `)

      allCoords.push([lat, lng])
    }

    // Fit bounds including day trips
    const boundsCoords = [...allCoords, ...dayTripCoords]
    if (boundsCoords.length > 0) {
      const bounds = L.latLngBounds(boundsCoords)
      m.fitBounds(bounds.pad(0.12))
    }
  }

  onMounted(async () => {
    if (!container.value) return
    mapInstance = L.map(container.value, {
      center: [36.5, 137.0],
      zoom: 6,
      zoomControl: true,
      scrollWheelZoom: true,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(mapInstance)

    // Let the container settle, then fix tile rendering
    await nextTick()
    setTimeout(() => {
      mapInstance?.invalidateSize()
      render()
    }, 150)
  })

  watch([stopGroups, days], () => render(), { deep: true })

  onUnmounted(() => {
    mapInstance?.remove()
    mapInstance = null
  })

  return { map: mapInstance }
}
