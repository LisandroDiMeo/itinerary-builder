export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateRange(start: string, end: string): string {
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  const sMonth = s.toLocaleDateString('en-US', { month: 'short' })
  const eMonth = e.toLocaleDateString('en-US', { month: 'short' })
  if (sMonth === eMonth) {
    return `${sMonth} ${s.getDate()}-${e.getDate()}`
  }
  return `${sMonth} ${s.getDate()} - ${eMonth} ${e.getDate()}`
}

export function daysBetween(start: string, end: string): number {
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24))
}

export function isDateInRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function getDayOfWeek(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { weekday: 'long' })
}

export function getDayNumber(dateStr: string, startDate: string): number {
  return daysBetween(startDate, dateStr) + 1
}

export function recalculateDateRanges(
  startDate: string,
  groupDayCounts: number[]
): { startDate: string; endDate: string }[] {
  const result: { startDate: string; endDate: string }[] = []
  const cursor = new Date(startDate + 'T00:00:00')
  for (const count of groupDayCounts) {
    const groupStart = cursor.toISOString().slice(0, 10)
    cursor.setDate(cursor.getDate() + count - 1)
    const groupEnd = cursor.toISOString().slice(0, 10)
    result.push({ startDate: groupStart, endDate: groupEnd })
    cursor.setDate(cursor.getDate() + 1)
  }
  return result
}
