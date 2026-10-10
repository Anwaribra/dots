export interface AvailabilityRuleInput {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

export interface AvailabilityOverrideInput {
  id: string
  date: string
  startTime: string
  endTime: string
  isUnavailable: boolean
}

export interface FixedEventInstanceInput {
  id: string
  title: string
  startTime: string // "HH:mm" or "YYYY-MM-DD HH:mm"
  endTime: string // "HH:mm" or "YYYY-MM-DD HH:mm"
  locked?: boolean
}

export interface TimeBudgetInput {
  id: string
  name: string
  allocationMode: 'minimum' | 'target' | 'maximum' | 'range'
  protection: 'flexible' | 'protected' | 'locked'
  minimumMinutes: number
  targetMinutes: number
  maximumMinutes: number
  daysOfWeek: number[]
  areaId?: string | null
  goalId?: string | null
  projectId?: string | null
  workItemTypeId?: string | null
}

export interface RoutineInstanceInput {
  id: string
  name: string
  targetDuration: number
  protected?: boolean
}

export interface DayCapacityInput {
  date: string // YYYY-MM-DD
  dayOfWeek: number // 0-6
  availabilityRules: AvailabilityRuleInput[]
  availabilityOverrides: AvailabilityOverrideInput[]
  planningCapacityPercentage: number // e.g. 75
  bufferPercentage: number // e.g. 20
  fixedEvents: FixedEventInstanceInput[]
  timeBudgets: TimeBudgetInput[]
  routines: RoutineInstanceInput[]
}

export interface DayCapacityResult {
  date: string
  dayOfWeek: number
  availableMinutes: number
  usableMinutes: number
  bufferMinutes: number
  fixedEventMinutes: number
  routineMinutes: number
  budgetSummary: {
    lockedMinutes: number
    protectedMinutes: number
    flexibleMinutes: number
    totalTargetMinutes: number
  }
  remainingMinutesForFlexibleWork: number
  conflictWarnings: string[]
  isOverloaded: boolean
}

function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0
  const timePart = timeStr.includes(' ') ? timeStr.split(' ')[1] : timeStr
  const [h, m] = timePart.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

export function calculateDayCapacity(input: DayCapacityInput): DayCapacityResult {
  const conflictWarnings: string[] = []

  // 1. Calculate Available Minutes
  let availableMinutes = 0
  const override = input.availabilityOverrides.find((o) => o.date === input.date)

  if (override) {
    if (!override.isUnavailable) {
      const start = parseTimeToMinutes(override.startTime)
      const end = parseTimeToMinutes(override.endTime)
      availableMinutes = Math.max(0, end - start)
    }
  } else {
    const rule = input.availabilityRules.find((r) => r.dayOfWeek === input.dayOfWeek && r.isActive)
    if (rule) {
      const start = parseTimeToMinutes(rule.startTime)
      const end = parseTimeToMinutes(rule.endTime)
      availableMinutes = Math.max(0, end - start)
    }
  }

  // 2. Usable Capacity & Buffer
  const usableMinutes = Math.round(availableMinutes * (Math.max(0, Math.min(100, input.planningCapacityPercentage)) / 100))
  const bufferMinutes = Math.round(usableMinutes * (Math.max(0, Math.min(100, input.bufferPercentage)) / 100))

  // 3. Fixed Events & Overlap/Conflict Detection
  let fixedEventMinutes = 0
  const eventIntervals: Array<{ id: string; title: string; start: number; end: number }> = []

  for (const fe of input.fixedEvents) {
    const start = parseTimeToMinutes(fe.startTime)
    const end = parseTimeToMinutes(fe.endTime)
    const duration = Math.max(0, end - start)
    fixedEventMinutes += duration
    eventIntervals.push({ id: fe.id, title: fe.title, start, end })
  }

  // Detect overlaps between fixed events
  for (let i = 0; i < eventIntervals.length; i++) {
    for (let j = i + 1; j < eventIntervals.length; j++) {
      const e1 = eventIntervals[i]
      const e2 = eventIntervals[j]
      if (Math.max(e1.start, e2.start) < Math.min(e1.end, e2.end)) {
        conflictWarnings.push(`Conflicting fixed events: "${e1.title}" overlaps with "${e2.title}"`)
      }
    }
  }

  // 4. Routines
  let routineMinutes = 0
  for (const r of input.routines) {
    routineMinutes += r.targetDuration || 0
  }

  // 5. Time Budgets
  let lockedMinutes = 0
  let protectedMinutes = 0
  let flexibleMinutes = 0
  let totalTargetMinutes = 0

  const activeBudgets = input.timeBudgets.filter((b) => b.daysOfWeek.includes(input.dayOfWeek))

  for (const b of activeBudgets) {
    const minM = b.minimumMinutes || 0
    const targetM = b.targetMinutes || minM
    totalTargetMinutes += targetM

    if (b.protection === 'locked') {
      lockedMinutes += targetM
    } else if (b.protection === 'protected') {
      protectedMinutes += targetM
    } else {
      flexibleMinutes += targetM
    }
  }

  // 6. Remaining usable capacity
  const committedMinutes = bufferMinutes + fixedEventMinutes + routineMinutes + lockedMinutes + protectedMinutes
  const remainingMinutesForFlexibleWork = Math.max(0, usableMinutes - committedMinutes)
  const isOverloaded = committedMinutes > usableMinutes

  if (isOverloaded) {
    conflictWarnings.push(`Day capacity overloaded: committed ${committedMinutes}m exceeds usable ${usableMinutes}m`)
  }

  return {
    date: input.date,
    dayOfWeek: input.dayOfWeek,
    availableMinutes,
    usableMinutes,
    bufferMinutes,
    fixedEventMinutes,
    routineMinutes,
    budgetSummary: {
      lockedMinutes,
      protectedMinutes,
      flexibleMinutes,
      totalTargetMinutes
    },
    remainingMinutesForFlexibleWork,
    conflictWarnings,
    isOverloaded
  }
}
