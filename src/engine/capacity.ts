import type {
  DayCapacityInfo,
  AvailabilitySlot,
  FixedEventItem,
  TimeBudgetItem,
  RoutineItem,
  CapacitySettings
} from './types'

export const DEFAULT_CAPACITY_SETTINGS: CapacitySettings = {
  planningCapacityPercentage: 75, // 75% max load threshold
  bufferPercentage: 20            // 20% protected reality buffer
}

export function initializeDayCapacity(
  date: string,
  dayOfWeek: number,
  availSlots: AvailabilitySlot[],
  fixedEvts: FixedEventItem[],
  budgets: TimeBudgetItem[],
  routines: RoutineItem[],
  settings: CapacitySettings = DEFAULT_CAPACITY_SETTINGS
): DayCapacityInfo {
  // 1. Available minutes from availability slots for this date
  const dateSlots = availSlots.filter((s) => s.date === date)
  const availableMinutes = dateSlots.reduce((sum, s) => sum + s.availableMinutes, 0)

  // 2. Usable capacity % and Buffer %
  const usableMinutes = Math.round(
    availableMinutes * (Math.max(1, Math.min(100, settings.planningCapacityPercentage)) / 100)
  )
  const bufferMinutes = Math.round(
    usableMinutes * (Math.max(0, Math.min(100, settings.bufferPercentage)) / 100)
  )

  // 3. Fixed Events for this date
  const dateFixed = fixedEvts.filter((f) => f.date === date)
  const fixedMinutes = dateFixed.reduce((sum, f) => sum + f.durationMinutes, 0)

  // 4. Routines for this date
  const routineMinutes = routines.reduce((sum, r) => sum + r.targetDuration, 0)

  // 5. Active Time Budgets for this day of week
  const activeBudgets = budgets.filter((b) => b.daysOfWeek.includes(dayOfWeek))
  const budgetMinutes = activeBudgets.reduce(
    (sum, b) => sum + (b.targetMinutes || b.minimumMinutes || 0),
    0
  )

  const committedBaseline = bufferMinutes + fixedMinutes + routineMinutes
  const netRemainingMinutes = Math.max(0, usableMinutes - committedBaseline)
  const isOverloaded = committedBaseline > usableMinutes

  return {
    date,
    dayOfWeek,
    availableMinutes,
    usableMinutes,
    bufferMinutes,
    fixedMinutes,
    budgetMinutes,
    scheduledMinutes: 0,
    netRemainingMinutes,
    isOverloaded
  }
}

export function updateDayScheduledCapacity(
  capacity: DayCapacityInfo,
  addedMinutes: number
): DayCapacityInfo {
  const scheduledMinutes = capacity.scheduledMinutes + addedMinutes
  const totalCommitted = capacity.bufferMinutes + capacity.fixedMinutes + scheduledMinutes
  const netRemainingMinutes = Math.max(0, capacity.usableMinutes - totalCommitted)
  const isOverloaded = totalCommitted > capacity.usableMinutes

  return {
    ...capacity,
    scheduledMinutes,
    netRemainingMinutes,
    isOverloaded
  }
}
