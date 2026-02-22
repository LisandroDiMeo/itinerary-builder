export interface PresetLocation {
  name: string
  coordinates: [number, number]
}

export const presetLocations: PresetLocation[] = [
  // Major cities
  { name: 'Tokyo', coordinates: [35.6762, 139.6503] },
  { name: 'Kyoto', coordinates: [35.0116, 135.7681] },
  { name: 'Osaka', coordinates: [34.6937, 135.5023] },
  { name: 'Fukuoka', coordinates: [33.5904, 130.4017] },
  { name: 'Nagoya', coordinates: [35.1815, 136.9066] },
  { name: 'Sapporo', coordinates: [43.0618, 141.3545] },
  { name: 'Hiroshima', coordinates: [34.3853, 132.4553] },
  { name: 'Sendai', coordinates: [38.2682, 140.8694] },
  { name: 'Yokohama', coordinates: [35.4437, 139.6380] },
  { name: 'Kobe', coordinates: [34.6901, 135.1956] },

  // Itinerary locations
  { name: 'Fujikawaguchiko', coordinates: [35.4961, 138.7667] },
  { name: 'Matsumoto', coordinates: [36.2381, 137.9720] },
  { name: 'Nagano', coordinates: [36.6485, 138.1950] },
  { name: 'Nagasaki', coordinates: [32.7503, 129.8779] },
  { name: 'Beppu', coordinates: [33.2846, 131.4914] },

  // Popular destinations
  { name: 'Nara', coordinates: [34.6851, 135.8048] },
  { name: 'Kamakura', coordinates: [35.3192, 139.5467] },
  { name: 'Nikko', coordinates: [36.7580, 139.5986] },
  { name: 'Hakone', coordinates: [35.2326, 139.1070] },
  { name: 'Kanazawa', coordinates: [36.5613, 136.6562] },
  { name: 'Takayama', coordinates: [36.1461, 137.2520] },
  { name: 'Shirakawa-go', coordinates: [36.2578, 136.9060] },
  { name: 'Miyajima', coordinates: [34.2961, 132.3196] },
  { name: 'Naoshima', coordinates: [34.4601, 133.9953] },
  { name: 'Yufuin', coordinates: [33.2670, 131.3700] },
  { name: 'Dazaifu', coordinates: [33.5217, 130.5350] },
  { name: 'Uji', coordinates: [34.8843, 135.8003] },
  { name: 'Arashiyama', coordinates: [35.0094, 135.6672] },
  { name: 'Okinawa', coordinates: [26.3344, 127.8056] },
  { name: 'Lake Suwa', coordinates: [36.0488, 138.0855] },
  { name: 'Jigokudani', coordinates: [36.7330, 138.4627] },
]

export function findPresetLocation(name: string): PresetLocation | undefined {
  return presetLocations.find(
    (l) => l.name.toLowerCase() === name.toLowerCase()
  )
}
