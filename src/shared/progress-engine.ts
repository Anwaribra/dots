/**
 * Pure Deterministic Progress Engine (Stage 10)
 * Evaluates progress across multiple models (percentage, count, duration, numeric, weighted, milestone).
 * Operates independently from scheduling and native modules.
 */

export type ProgressMode =
  | 'percentage'
  | 'count'
  | 'duration'
  | 'numeric'
  | 'weighted'
  | 'milestone'

export type ProgressWorkItem = {
  id: string
  title?: string
  status?: string // 'todo' | 'in_progress' | 'done' | 'completed' | etc.
  completed?: boolean
  estimatedMinutes?: number
  actualMinutes?: number
}

export type ProgressMilestone = {
  id: string
  title?: string
  status?: string
  completed?: boolean
  progress?: number // 0 - 100
  progressPercent?: number // alias
  weight?: number   // positive integer component weight (e.g. 20, 40, etc.)
}

export type ProgressMetric = {
  id: string
  name: string
  currentValue: number
  targetValue: number
}

export type GoalProgressInput = {
  mode: ProgressMode
  currentValue?: number
  targetValue?: number
  manualPercentage?: number
  workItems?: ProgressWorkItem[]
  milestones?: ProgressMilestone[]
  metrics?: ProgressMetric[]
}

export type ProgressCalculationInput = GoalProgressInput

export type GoalProgressResult = {
  progressPercentage: number // clamped 0 - 100
  percentage: number // alias for convenience
  completedWorkloadMinutes: number
  totalWorkloadMinutes: number
  completedDurationMinutes?: number
  totalDurationMinutes?: number
  completedCount: number
  totalCount: number
  completedItems?: number
  totalItems?: number
  currentValue?: number
  targetValue?: number
  breakdown?: Record<string, { completed: boolean; percentage: number; weight?: number; title?: string }>
  details: string
}

export function isItemCompleted(status?: string | null, completed?: boolean): boolean {
  if (completed === true) return true
  if (!status) return false
  const s = status.toLowerCase()
  return s === 'done' || s === 'completed'
}

/**
 * Calculates progress for a goal based on its selected progress mode.
 * Never defaults to raw task count alone unless 'count' mode is explicitly selected.
 */
export function calculateGoalProgress(input: GoalProgressInput): GoalProgressResult {
  const items = input.workItems || []
  const milestones = input.milestones || []

  const totalCount = items.length
  const completedCount = items.filter((i) => isItemCompleted(i.status, i.completed)).length

  const totalWorkloadMinutes = items.reduce((acc, i) => acc + (i.estimatedMinutes || 0), 0)
  const completedWorkloadMinutes = items.reduce((acc, i) => {
    if (isItemCompleted(i.status, i.completed)) {
      return acc + (i.estimatedMinutes || i.actualMinutes || 0)
    }
    return acc + Math.min(i.actualMinutes || 0, i.estimatedMinutes || 0)
  }, 0)

  let progressPercentage = 0
  let details = ''

  switch (input.mode) {
    case 'percentage': {
      const p = input.manualPercentage ?? input.currentValue ?? 0
      progressPercentage = Math.max(0, Math.min(100, Math.round(p)))
      details = `Manual percentage: ${progressPercentage}%`
      break
    }

    case 'numeric': {
      const current = input.currentValue ?? 0
      const target = input.targetValue ?? 0
      if (target <= 0) {
        progressPercentage = 0
        details = `Numeric target is zero: ${current}/${target}`
      } else {
        progressPercentage = Math.max(0, Math.min(100, Math.round((current / target) * 100)))
        details = `Numeric progress: ${current} of ${target} (${progressPercentage}%)`
      }
      break
    }

    case 'count': {
      if (totalCount === 0) {
        progressPercentage = 0
        details = 'No work items linked'
      } else {
        progressPercentage = Math.max(0, Math.min(100, Math.round((completedCount / totalCount) * 100)))
        details = `Task count: ${completedCount} of ${totalCount} completed (${progressPercentage}%)`
      }
      break
    }

    case 'duration': {
      if (totalWorkloadMinutes <= 0) {
        // Fall back to count if estimated minutes are zero
        if (totalCount === 0) {
          progressPercentage = 0
          details = 'No work items or duration specified'
        } else {
          progressPercentage = Math.max(0, Math.min(100, Math.round((completedCount / totalCount) * 100)))
          details = `Fallback to count: ${completedCount}/${totalCount} tasks completed`
        }
      } else {
        // Round to 2 decimal places if needed or integer
        const raw = (completedWorkloadMinutes / totalWorkloadMinutes) * 100
        progressPercentage = Math.max(0, Math.min(100, Math.round(raw * 100) / 100))
        details = `Duration-weighted: ${completedWorkloadMinutes}m of ${totalWorkloadMinutes}m completed (${progressPercentage}%)`
      }
      break
    }

    case 'weighted': {
      // Component weights (e.g. Validation 20%, MVP Development 40%, Marketing 20%, Launch 20%)
      if (milestones.length === 0) {
        progressPercentage = 0
        details = 'No weighted milestone components defined'
      } else {
        const totalWeight = milestones.reduce((acc, m) => acc + Math.max(0, m.weight || 1), 0)
        if (totalWeight <= 0) {
          progressPercentage = 0
          details = 'Total milestone weight is zero'
        } else {
          const weightedSum = milestones.reduce((acc, m) => {
            const prog = isItemCompleted(m.status, m.completed)
              ? 100
              : Math.max(0, Math.min(100, m.progress ?? m.progressPercent ?? 0))
            return acc + (prog * Math.max(0, m.weight || 1))
          }, 0)
          progressPercentage = Math.max(0, Math.min(100, Math.round(weightedSum / totalWeight)))
          details = `Weighted components: ${progressPercentage}% across ${milestones.length} milestones (total weight: ${totalWeight})`
        }
      }
      break
    }

    case 'milestone': {
      if (milestones.length === 0) {
        progressPercentage = 0
        details = 'No milestones defined'
      } else {
        const sumProg = milestones.reduce((acc, m) => {
          if (isItemCompleted(m.status, m.completed)) return acc + 100
          return acc + Math.max(0, Math.min(100, m.progress ?? m.progressPercent ?? 0))
        }, 0)
        const raw = sumProg / milestones.length
        progressPercentage = Math.max(0, Math.min(100, Math.round(raw * 100) / 100))
        details = `Milestone average: ${progressPercentage}% (${milestones.filter((m) => isItemCompleted(m.status, m.completed)).length}/${milestones.length} completed)`
      }
      break
    }

    default: {
      progressPercentage = 0
      details = 'Unknown progress mode'
    }
  }

  const breakdown: Record<string, { completed: boolean; percentage: number; weight?: number; title?: string }> = {}
  for (const m of milestones) {
    const isDone = isItemCompleted(m.status, m.completed)
    const pct = isDone ? 100 : Math.max(0, Math.min(100, m.progress ?? m.progressPercent ?? 0))
    breakdown[m.id] = {
      completed: isDone,
      percentage: pct,
      weight: m.weight,
      title: m.title
    }
  }

  return {
    progressPercentage,
    percentage: progressPercentage,
    completedWorkloadMinutes,
    totalWorkloadMinutes,
    completedDurationMinutes: completedWorkloadMinutes,
    totalDurationMinutes: totalWorkloadMinutes,
    completedCount,
    totalCount,
    completedItems: completedCount,
    totalItems: totalCount,
    currentValue: input.currentValue,
    targetValue: input.targetValue,
    breakdown,
    details
  }
}

/**
 * Calculates project progress based on duration-weighted completion of its child work items.
 * A 10-minute task and a 3-hour task do not weigh the same.
 */
export function calculateProjectProgress(workItems: ProgressWorkItem[]): {
  progressPercentage: number
  percentage: number
  completedMinutes: number
  totalMinutes: number
  completedTasks: number
  totalTasks: number
} {
  const totalTasks = workItems.length
  const completedTasks = workItems.filter((i) => isItemCompleted(i.status, i.completed)).length

  const totalMinutes = workItems.reduce((acc, i) => acc + (i.estimatedMinutes || 0), 0)
  const completedMinutes = workItems.reduce((acc, i) => {
    if (isItemCompleted(i.status, i.completed)) {
      return acc + (i.estimatedMinutes || i.actualMinutes || 0)
    }
    return acc + Math.min(i.actualMinutes || 0, i.estimatedMinutes || 0)
  }, 0)

  let progressPercentage = 0
  if (totalMinutes > 0) {
    progressPercentage = Math.max(0, Math.min(100, Math.round((completedMinutes / totalMinutes) * 100)))
  } else if (totalTasks > 0) {
    progressPercentage = Math.max(0, Math.min(100, Math.round((completedTasks / totalTasks) * 100)))
  }

  return {
    progressPercentage,
    percentage: progressPercentage,
    completedMinutes,
    totalMinutes,
    completedTasks,
    totalTasks
  }
}

/**
 * Calculates velocity (completed minutes per active day) given historical snapshots.
 */
export function calculateVelocity(
  history: Array<
    | { recordedDate: string; progress: number }
    | { snapshotDate: string; progressPercentage: number }
    | Record<string, any>
  >
): {
  currentProgress: number
  previousProgress: number
  progressDelta: number
  totalGain: number
  velocityPerDay: number
  trend: 'improving' | 'steady' | 'declining'
} {
  if (!history || history.length === 0) {
    return {
      currentProgress: 0,
      previousProgress: 0,
      progressDelta: 0,
      totalGain: 0,
      velocityPerDay: 0,
      trend: 'steady'
    }
  }

  const normalized = history.map((h) => ({
    date: (h as any).recordedDate || (h as any).snapshotDate || '',
    progress: (h as any).progress ?? (h as any).progressPercentage ?? 0
  }))

  const sorted = [...normalized].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const current = sorted[sorted.length - 1].progress
  const previous = sorted.length > 1 ? sorted[sorted.length - 2].progress : sorted[0].progress
  const delta = current - previous

  const firstDate = new Date(sorted[0].date).getTime()
  const lastDate = new Date(sorted[sorted.length - 1].date).getTime()
  const daysDiff = Math.max(1, Math.round((lastDate - firstDate) / (1000 * 3600 * 24)))

  const totalGain = current - sorted[0].progress
  const velocityPerDay = parseFloat((totalGain / daysDiff).toFixed(2))

  const trend: 'improving' | 'steady' | 'declining' =
    totalGain > 0 ? 'improving' : totalGain < 0 ? 'declining' : 'steady'

  return {
    currentProgress: current,
    previousProgress: previous,
    progressDelta: delta,
    totalGain,
    velocityPerDay,
    trend
  }
}
