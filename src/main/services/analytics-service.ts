import { asc, desc, eq, gte, lte } from 'drizzle-orm'
import { getDatabase } from '../db/database'
import {
  areas,
  goals,
  habits,
  habitLogs,
  milestones,
  projects,
  scheduledItems,
  timeSessions,
  workItems
} from '../db/schema'
import {
  computeAnalyticsOverview,
  type AnalyticsFilter,
  type AnalyticsOverview
} from '../../shared/analytics-engine'
import { getGoalProgress } from './progress-service'

export function getAnalyticsOverview(filter?: AnalyticsFilter): AnalyticsOverview {
  const db = getDatabase()

  const allItems = db.select().from(workItems).all()
  const allSessions = db.select().from(timeSessions).all()
  const allScheduled = db.select().from(scheduledItems).all()
  const allAreas = db.select().from(areas).all()
  const allProjects = db.select().from(projects).all()
  const allGoals = db.select().from(goals).all()

  return computeAnalyticsOverview({
    workItems: allItems,
    sessions: allSessions,
    scheduledItems: allScheduled,
    areas: allAreas,
    projects: allProjects,
    goals: allGoals,
    filter
  })
}

export type DashboardData = {
  todaySummary: {
    date: string
    plannedMinutes: number
    actualMinutes: number
    remainingMinutes: number
    completionRate: number
  }
  currentTask: {
    id: string
    title: string
    timeSlot: string
    durationMinutes: number
    projectTitle?: string
  } | null
  activeGoals: {
    id: string
    title: string
    priority: string
    progressPercentage: number
    targetDate?: string | null
    details: string
  }[]
  timeByArea: {
    id: string
    name: string
    color?: string
    minutes: number
    percentage: number
  }[]
  upcomingDeadlines: {
    id: string
    title: string
    deadline: string
    type: 'task' | 'project' | 'goal'
    isOverdue: boolean
  }[]
  recentSessions: {
    id: string
    title: string
    durationMinutes: number
    dateStr: string
  }[]
  habitsSummary: {
    total: number
    completedToday: number
  }
}

export function getDashboardWidgetsData(nowDate?: string): DashboardData {
  const db = getDatabase()
  const todayStr = nowDate || new Date().toISOString().substring(0, 10)

  // 1. Today items
  const todayScheduled = db
    .select()
    .from(scheduledItems)
    .where(eq(scheduledItems.date, todayStr))
    .orderBy(asc(scheduledItems.startTime))
    .all()

  const todaySessions = db
    .select()
    .from(timeSessions)
    .all()
    .filter((s) => new Date(s.startTime).toISOString().substring(0, 10) === todayStr)

  const plannedMinutes = todayScheduled.reduce((acc, s) => acc + s.durationMinutes, 0)
  const actualMinutes = todaySessions.reduce(
    (acc, s) => acc + Math.max(0, s.durationMinutes - s.pausedDurationMinutes),
    0
  )
  const remainingMinutes = Math.max(0, plannedMinutes - actualMinutes)
  const completionRate = plannedMinutes > 0 ? Math.round((actualMinutes / plannedMinutes) * 100) : 0

  // 2. Current / next task
  let currentTask: DashboardData['currentTask'] = null
  if (todayScheduled.length > 0) {
    const firstUnfinished = todayScheduled[0]
    const wi = firstUnfinished.workItemId
      ? db.select().from(workItems).where(eq(workItems.id, firstUnfinished.workItemId)).get()
      : null
    const proj = wi?.projectId
      ? db.select().from(projects).where(eq(projects.id, wi.projectId)).get()
      : null

    currentTask = {
      id: firstUnfinished.id,
      title: firstUnfinished.title,
      timeSlot: `${firstUnfinished.startTime} - ${firstUnfinished.endTime}`,
      durationMinutes: firstUnfinished.durationMinutes,
      projectTitle: proj?.title
    }
  }

  // 3. Active goals progress
  const allGoals = db.select().from(goals).where(eq(goals.status, 'active')).all()
  const activeGoals = allGoals.map((g) => {
    const p = getGoalProgress(g.id)
    return {
      id: g.id,
      title: g.title,
      priority: g.priority,
      progressPercentage: p.progressPercentage,
      targetDate: g.targetDate,
      details: p.details
    }
  })

  // 4. Time by Area
  const overview = getAnalyticsOverview()
  const timeByArea = overview.timeByArea

  // 5. Upcoming deadlines
  const allWorkItems = db.select().from(workItems).all()
  const allProjects = db.select().from(projects).all()
  const upcomingDeadlines: DashboardData['upcomingDeadlines'] = []

  for (const w of allWorkItems) {
    if (w.deadline && w.status !== 'done' && w.status !== 'completed') {
      upcomingDeadlines.push({
        id: w.id,
        title: w.title,
        deadline: w.deadline,
        type: 'task',
        isOverdue: w.deadline < todayStr
      })
    }
  }

  for (const p of allProjects) {
    if (p.deadline && p.status !== 'done' && p.status !== 'completed') {
      upcomingDeadlines.push({
        id: p.id,
        title: p.title,
        deadline: p.deadline,
        type: 'project',
        isOverdue: p.deadline < todayStr
      })
    }
  }

  upcomingDeadlines.sort((a, b) => a.deadline.localeCompare(b.deadline))

  // 6. Recent sessions
  const recentSessionsList = db
    .select()
    .from(timeSessions)
    .orderBy(desc(timeSessions.startTime))
    .limit(5)
    .all()

  const recentSessions = recentSessionsList.map((s) => {
    const wi = s.workItemId ? db.select().from(workItems).where(eq(workItems.id, s.workItemId)).get() : null
    return {
      id: s.id,
      title: wi ? wi.title : 'Focus Session',
      durationMinutes: Math.max(0, s.durationMinutes - s.pausedDurationMinutes),
      dateStr: new Date(s.startTime).toISOString().substring(0, 10)
    }
  })

  // 7. Habits
  const activeHabits = db.select().from(habits).all()
  const todayLogs = db
    .select()
    .from(habitLogs)
    .where(eq(habitLogs.date, todayStr))
    .all()

  const habitsSummary = {
    total: activeHabits.length,
    completedToday: todayLogs.filter((l) => (l.value ?? 0) > 0).length
  }

  return {
    todaySummary: {
      date: todayStr,
      plannedMinutes,
      actualMinutes,
      remainingMinutes,
      completionRate
    },
    currentTask,
    activeGoals,
    timeByArea,
    upcomingDeadlines: upcomingDeadlines.slice(0, 5),
    recentSessions,
    habitsSummary
  }
}
