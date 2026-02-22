const locationColors: Record<string, { bg: string; border: string; text: string; marker: string }> = {
  Tokyo: { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-700', marker: '#ef4444' },
  Fujikawaguchiko: { bg: 'bg-sky-100', border: 'border-sky-500', text: 'text-sky-700', marker: '#0ea5e9' },
  Matsumoto: { bg: 'bg-emerald-100', border: 'border-emerald-500', text: 'text-emerald-700', marker: '#10b981' },
  Nagano: { bg: 'bg-teal-100', border: 'border-teal-500', text: 'text-teal-700', marker: '#14b8a6' },
  Kyoto: { bg: 'bg-amber-100', border: 'border-amber-500', text: 'text-amber-700', marker: '#f59e0b' },
  Osaka: { bg: 'bg-orange-100', border: 'border-orange-500', text: 'text-orange-700', marker: '#f97316' },
  Fukuoka: { bg: 'bg-purple-100', border: 'border-purple-500', text: 'text-purple-700', marker: '#a855f7' },
  Nagasaki: { bg: 'bg-pink-100', border: 'border-pink-500', text: 'text-pink-700', marker: '#ec4899' },
  Beppu: { bg: 'bg-indigo-100', border: 'border-indigo-500', text: 'text-indigo-700', marker: '#6366f1' },
}

const defaultColor = { bg: 'bg-gray-100', border: 'border-gray-500', text: 'text-gray-700', marker: '#6b7280' }

export function getLocationColor(location: string) {
  return locationColors[location] || defaultColor
}

export function getMarkerColor(location: string): string {
  return (locationColors[location] || defaultColor).marker
}

export const categoryIcons: Record<string, string> = {
  sightseeing: '🏛️',
  food: '🍜',
  transport: '🚄',
  shopping: '🛍️',
  nature: '🌿',
  culture: '⛩️',
  onsen: '♨️',
  nightlife: '🌙',
  other: '📌',
}
