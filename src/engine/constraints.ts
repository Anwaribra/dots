import type { FixedEventItem, ScheduleItem, ExistingScheduleItem } from './types'

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0
  const timePart = timeStr.includes(' ') ? timeStr.split(' ')[1] : timeStr
  const [h, m] = timePart.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

export function formatMinutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export type TimeInterval = {
  start: number
  end: number
  locked?: boolean
  title?: string
}

export function getFreeIntervalsForDay(
  dayStartMinutes: number,
  dayEndMinutes: number,
  fixedEvents: FixedEventItem[],
  existingSchedule: (ScheduleItem | ExistingScheduleItem)[],
  date: string
): TimeInterval[] {
  const occupied: TimeInterval[] = []

  // 1. Fixed Events
  for (const fe of fixedEvents) {
    if (fe.date === date) {
      const start = parseTimeToMinutes(fe.startTime)
      const end = parseTimeToMinutes(fe.endTime)
      if (end > start) {
        occupied.push({ start, end, locked: true, title: fe.title })
      }
    }
  }

  // 2. Existing locked schedule items
  for (const item of existingSchedule) {
    if (item.date === date && item.locked) {
      const start = parseTimeToMinutes(item.startTime)
      const end = parseTimeToMinutes(item.endTime)
      if (end > start) {
        occupied.push({ start, end, locked: true, title: item.title })
      }
    }
  }

  // Sort occupied intervals chronologically
  occupied.sort((a, b) => a.start - b.start)

  // Find free intervals between dayStartMinutes and dayEndMinutes
  const free: TimeInterval[] = []
  let current = dayStartMinutes

  for (const occ of occupied) {
    if (occ.start > current) {
      const start = Math.max(current, dayStartMinutes)
      const end = Math.min(occ.start, dayEndMinutes)
      if (end > start) {
        free.push({ start, end })
      }
    }
    current = Math.max(current, occ.end)
  }

  if (current < dayEndMinutes) {
    free.push({ start: current, end: dayEndMinutes })
  }

  return free
}

export function findNextAvailableSlot(
  freeIntervals: TimeInterval[],
  durationMinutes: number
): { start: number; end: number } | null {
  for (const interval of freeIntervals) {
    const slotDuration = interval.end - interval.start
    if (slotDuration >= durationMinutes) {
      return {
        start: interval.start,
        end: interval.start + durationMinutes
      }
    }
  }
  return null
}
