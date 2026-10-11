import { and, eq, gte, lte } from 'drizzle-orm'
import { getDatabase } from '../db/database'
import {
  areas,
  goals,
  habitLogs,
  habits,
  milestones,
  projects,
  scheduledItems,
  timeSessions,
  workItems
} from '../db/schema'
import { getGoalProgress } from './progress-service'

export interface WeeklyReviewPeriod {
  startDate: string // YYYY-MM-DD
  endDate: string   // YYYY-MM-DD
}

export interface AreaSummary {
  id: string
  name: string
  color?: string | null
  plannedMinutes: number
  actualMinutes: number
  completedItems: number
  totalItems: number
}

export interface GoalProgressChange {
  id: string
  title: string
  priority: string
  targetDate?: string | null
  progressPercentage: number
  status: string
}

export interface FrictionItem {
  kind: 'postponed' | 'skipped' | 'missed_deadline' | 'overloaded_day' | 'bad_estimate'
  description: string
  date?: string
  entityId?: string
  entityTitle?: string
}

export interface WeeklyReviewResult {
  period: WeeklyReviewPeriod
  generatedAt: number

  // Overall numbers
  totalPlannedMinutes: number
  totalActualMinutes: number
  totalCompletedItems: number
  totalScheduledItems: number
  completionRate: number
  /** Average minutes worked per active day */
  avgDailyActualMinutes: number

  // By area
  byArea: AreaSummary[]

  // Goal progress
  goalProgress: GoalProgressChange[]

  // Habits
  habitsSummary: {
    totalHabits: number
    avgCompletionRate: number // 0-100
  }

  // Friction signals
  friction: FrictionItem[]

  // Data-driven observations (plain language, analytical)
  observations: string[]

  // Missed deadlines
  missedDeadlines: { id: string; title: string; deadline: string; type: string }[]

  // Items completed this week
  completedThisWeek: { id: string; title: string; completedAt?: number | null }[]
}

export function generateWeeklyReview(period: WeeklyReviewPeriod): WeeklyReviewResult {
  const db = getDatabase()
  const { startDate, endDate } = period
  const now = Date.now()

  // ── Scheduled items in range ──────────────────────────────────────────────
  const scheduled = db
    .select()
    .from(scheduledItems)
    .where(and(gte(scheduledItems.date, startDate), lte(scheduledItems.date, endDate)))
    .all()

  const totalScheduledItems = scheduled.length
  const totalPlannedMinutes = scheduled.reduce((s, i) => s + i.durationMinutes, 0)

  // ── Time sessions in range ────────────────────────────────────────────────
  const allSessions = db.select().from(timeSessions).all()
  const sessions = allSessions.filter((s) => {
    const d = new Date(s.startTime).toISOString().substring(0, 10)
    return d >= startDate && d <= endDate
  })
  const totalActualMinutes = sessions.reduce(
    (s, i) => s + Math.max(0, i.durationMinutes - i.pausedDurationMinutes),
    0
  )

  // ── Completed work items ──────────────────────────────────────────────────
  const allWorkItems = db.select().from(workItems).all()
  const completedThisWeek = allWorkItems.filter((w) => {
    if (w.status !== 'done' && w.status !== 'completed') return false
    const updatedDate = new Date(w.updatedAt).toISOString().substring(0, 10)
    return updatedDate >= startDate && updatedDate <= endDate
  })
  const totalCompletedItems = completedThisWeek.length
  const completionRate =
    totalScheduledItems > 0 ? Math.round((totalCompletedItems / totalScheduledItems) * 100) : 0

  // ── Active days ───────────────────────────────────────────────────────────
  const activeDays = new Set(
    sessions.map((s) => new Date(s.startTime).toISOString().substring(0, 10))
  ).size
  const avgDailyActualMinutes = activeDays > 0 ? Math.round(totalActualMinutes / activeDays) : 0

  // ── By area ───────────────────────────────────────────────────────────────
  const allAreas = db.select().from(areas).all()
  const byArea: AreaSummary[] = allAreas.map((area) => {
    const areaItems = allWorkItems.filter((w) => w.areaId === area.id)
    const areaItemIds = new Set(areaItems.map((w) => w.id))
    const areaSessions = sessions.filter((s) => s.workItemId && areaItemIds.has(s.workItemId))
    const areaScheduled = scheduled.filter((s) => s.workItemId && areaItemIds.has(s.workItemId))
    const areaActual = areaSessions.reduce(
      (s, i) => s + Math.max(0, i.durationMinutes - i.pausedDurationMinutes),
      0
    )
    const areaCompleted = areaItems.filter(
      (w) =>
        (w.status === 'done' || w.status === 'completed') &&
        new Date(w.updatedAt).toISOString().substring(0, 10) >= startDate
    ).length

    return {
      id: area.id,
      name: area.name,
      color: area.color,
      plannedMinutes: areaScheduled.reduce((s, i) => s + i.durationMinutes, 0),
      actualMinutes: areaActual,
      completedItems: areaCompleted,
      totalItems: areaItems.filter((w) => w.status !== 'done' && w.status !== 'completed').length + areaCompleted
    }
  }).filter((a) => a.totalItems > 0 || a.actualMinutes > 0)

  // ── Goal progress ─────────────────────────────────────────────────────────
  const allGoals = db.select().from(goals).where(eq(goals.status, 'active')).all()
  const goalProgress: GoalProgressChange[] = allGoals.map((g) => {
    const p = getGoalProgress(g.id)
    return {
      id: g.id,
      title: g.title,
      priority: g.priority,
      targetDate: g.targetDate,
      progressPercentage: p.progressPercentage,
      status: g.status
    }
  })

  // ── Habits ────────────────────────────────────────────────────────────────
  const allHabits = db.select().from(habits).all()
  const allHabitLogs = db
    .select()
    .from(habitLogs)
    .where(and(gte(habitLogs.date, startDate), lte(habitLogs.date, endDate)))
    .all()

  let avgHabitCompletion = 0
  if (allHabits.length > 0) {
    // Days in range
    const start = new Date(startDate)
    const end = new Date(endDate)
    const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1)
    const maxPossible = allHabits.length * days
    const actual = allHabitLogs.filter((l) => (l.value ?? 0) > 0).length
    avgHabitCompletion = maxPossible > 0 ? Math.round((actual / maxPossible) * 100) : 0
  }

  // ── Friction signals ──────────────────────────────────────────────────────
  const friction: FrictionItem[] = []

  // Missed deadlines
  const missedDeadlines: WeeklyReviewResult['missedDeadlines'] = []
  for (const w of allWorkItems) {
    if (w.deadline && w.deadline >= startDate && w.deadline <= endDate) {
      if (w.status !== 'done' && w.status !== 'completed') {
        missedDeadlines.push({ id: w.id, title: w.title, deadline: w.deadline, type: 'task' })
        friction.push({
          kind: 'missed_deadline',
          description: `Task "${w.title}" missed its deadline (${w.deadline})`,
          date: w.deadline,
          entityId: w.id,
          entityTitle: w.title
        })
      }
    }
  }
  const allProjects = db.select().from(projects).all()
  for (const p of allProjects) {
    if (p.deadline && p.deadline >= startDate && p.deadline <= endDate) {
      if (p.status !== 'done' && p.status !== 'completed') {
        missedDeadlines.push({ id: p.id, title: p.title, deadline: p.deadline, type: 'project' })
        friction.push({
          kind: 'missed_deadline',
          description: `Project "${p.title}" missed its deadline (${p.deadline})`,
          date: p.deadline,
          entityId: p.id,
          entityTitle: p.title
        })
      }
    }
  }

  // Overloaded days: any day where planned > 600 min
  const byDate = new Map<string, number>()
  for (const s of scheduled) {
    byDate.set(s.date, (byDate.get(s.date) ?? 0) + s.durationMinutes)
  }
  for (const [date, mins] of byDate.entries()) {
    if (mins > 600) {
      friction.push({
        kind: 'overloaded_day',
        description: `${date} had ${mins} minutes planned (>${600} min threshold)`,
        date
      })
    }
  }

  // Bad estimates: sessions where actual > 150% of estimated duration
  for (const s of sessions) {
    if (s.workItemId) {
      const wi = allWorkItems.find((w) => w.id === s.workItemId)
      if (wi && wi.estimatedMinutes > 0) {
        const actual = s.durationMinutes - s.pausedDurationMinutes
        if (actual > wi.estimatedMinutes * 1.5) {
          friction.push({
            kind: 'bad_estimate',
            description: `"${wi.title}": estimated ${wi.estimatedMinutes} min, took ${actual} min`,
            entityId: wi.id,
            entityTitle: wi.title
          })
        }
      }
    }
  }

  // ── Observations ──────────────────────────────────────────────────────────
  const observations: string[] = []

  if (totalActualMinutes > 0 && totalPlannedMinutes > 0) {
    const utilizationPct = Math.round((totalActualMinutes / totalPlannedMinutes) * 100)
    observations.push(`Utilization was ${utilizationPct}% of planned time (${Math.round(totalActualMinutes / 60)}h actual vs ${Math.round(totalPlannedMinutes / 60)}h planned).`)
  }

  if (missedDeadlines.length === 0) {
    observations.push('No deadlines were missed this week.')
  } else {
    observations.push(`${missedDeadlines.length} deadline(s) were missed this week.`)
  }

  if (avgHabitCompletion >= 80) {
    observations.push(`Habit completion rate was ${avgHabitCompletion}% — consistently maintained.`)
  } else if (avgHabitCompletion > 0) {
    observations.push(`Habit completion rate was ${avgHabitCompletion}%.`)
  }

  const overloaded = friction.filter((f) => f.kind === 'overloaded_day').length
  if (overloaded > 0) {
    observations.push(`${overloaded} day(s) exceeded the 600-minute planning threshold — consider distributing work more evenly.`)
  }

  if (byArea.length > 0) {
    const topArea = [...byArea].sort((a, b) => b.actualMinutes - a.actualMinutes)[0]
    observations.push(`Most time was spent on "${topArea.name}" (${Math.round(topArea.actualMinutes / 60)}h actual).`)
  }

  const badEstimates = friction.filter((f) => f.kind === 'bad_estimate').length
  if (badEstimates > 0) {
    observations.push(`${badEstimates} task(s) took more than 50% longer than estimated.`)
  }

  return {
    period,
    generatedAt: now,
    totalPlannedMinutes,
    totalActualMinutes,
    totalCompletedItems,
    totalScheduledItems,
    completionRate,
    avgDailyActualMinutes,
    byArea,
    goalProgress,
    habitsSummary: {
      totalHabits: allHabits.length,
      avgCompletionRate: avgHabitCompletion
    },
    friction,
    observations,
    missedDeadlines,
    completedThisWeek: completedThisWeek.map((w) => ({ id: w.id, title: w.title, completedAt: w.updatedAt }))
  }
}
