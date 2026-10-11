/**
 * Pure Analytics Engine (Stage 10)
 * Aggregates times, planned vs scheduled vs actual, completion rate, deadline performance,
 * capacity utilization, and breakdowns by area/goal/project.
 */

export type AnalyticsFilter = {
  startDate?: string // YYYY-MM-DD
  endDate?: string   // YYYY-MM-DD
  areaId?: string
  goalId?: string
  projectId?: string
  tagId?: string
  itemType?: string
}

export type TimeBreakdownItem = {
  id: string
  areaId?: string
  projectId?: string
  projectName?: string
  goalId?: string
  goalTitle?: string
  title?: string
  name: string
  color?: string
  minutes: number
  actualMinutes?: number
  plannedMinutes?: number
  percentage: number
}

export type AnalyticsOverview = {
  plannedMinutes: number
  scheduledMinutes: number
  actualMinutes: number
  plannedVsActual: {
    plannedMinutes: number
    scheduledMinutes: number
    actualMinutes: number
  }
  completionRate: number // 0 - 100
  totalTasks: number
  completedTasks: number
  totalItemsCount: number
  completedItemsCount: number
  overdueTasks: number
  overdueCount: number
  upcomingDeadlines: number
  deadlinePerformanceRate: number // 0 - 100
  capacityUtilization: number // 0 - 100
  timeByArea: TimeBreakdownItem[]
  timeByProject: TimeBreakdownItem[]
  timeByGoal: TimeBreakdownItem[]
  dailyTrends: {
    date: string
    scheduledMinutes: number
    actualMinutes: number
    completedTasks: number
  }[]
}

export type AnalyticsRawData = Parameters<typeof computeAnalyticsOverview>[0]

export function computeAnalyticsOverview(
  params: {
    workItems?: Array<{
      id: string
      title?: string
      status?: string
      completed?: boolean
      areaId?: string | null
      goalId?: string | null
      projectId?: string | null
      itemType?: string
      tags?: string[]
      estimatedMinutes?: number
      actualMinutes?: number
      scheduledMinutes?: number
      deadline?: string | null
      dueDate?: string | null
      completedAt?: string | null
      createdAt?: number | string
    }>
    sessions?: Array<{
      id: string
      workItemId?: string | null
      areaId?: string | null
      goalId?: string | null
      projectId?: string | null
      durationMinutes?: number
      pausedDurationMinutes?: number
      startTime?: number | string
      startedAt?: string
      endedAt?: string | null
    }>
    scheduledItems?: Array<{
      id: string
      workItemId?: string | null
      date: string
      durationMinutes?: number
    }>
    areas?: Array<{ id: string; name?: string; title?: string; color?: string | null }>
    projects?: Array<{ id: string; name?: string; title?: string; areaId?: string | null; goalId?: string | null }>
    goals?: Array<{ id: string; name?: string; title?: string; areaId?: string | null }>
    filter?: AnalyticsFilter
    usableCapacityMinutes?: number
    nowDate?: string
  },
  legacyFilter?: AnalyticsFilter
): AnalyticsOverview {
  const f = legacyFilter || params.filter || {}
  const todayStr = params.nowDate || new Date().toISOString().substring(0, 10)

  const workItems = params.workItems || []
  const sessions = params.sessions || []
  const scheduledItems = params.scheduledItems || []
  const areas = params.areas || []
  const projects = params.projects || []
  const goals = params.goals || []

  // 1. Filter work items
  let filteredItems = workItems
  if (f.areaId) filteredItems = filteredItems.filter((w) => w.areaId === f.areaId)
  if (f.goalId) filteredItems = filteredItems.filter((w) => w.goalId === f.goalId)
  if (f.projectId) filteredItems = filteredItems.filter((w) => w.projectId === f.projectId)
  if (f.itemType) filteredItems = filteredItems.filter((w) => w.itemType === f.itemType)
  if (f.tagId) filteredItems = filteredItems.filter((w) => w.tags && w.tags.includes(f.tagId!))

  const allowedItemIds = new Set(filteredItems.map((w) => w.id))

  const workItemsMap = new Map(workItems.map((w) => [w.id, w]))

  // 2. Filter sessions
  let filteredSessions = sessions.filter((s) => {
    const parentItem = s.workItemId ? workItemsMap.get(s.workItemId) : null
    if (s.workItemId && !allowedItemIds.has(s.workItemId)) return false
    const sArea = s.areaId || parentItem?.areaId
    const sGoal = s.goalId || parentItem?.goalId
    const sProj = s.projectId || parentItem?.projectId

    if (f.areaId && sArea !== f.areaId) return false
    if (f.goalId && sGoal !== f.goalId) return false
    if (f.projectId && sProj !== f.projectId) return false

    if (f.startDate || f.endDate) {
      const timeVal = s.startTime || s.startedAt
      if (timeVal) {
        const sDate = typeof timeVal === 'number'
          ? new Date(timeVal).toISOString().substring(0, 10)
          : timeVal.substring(0, 10)
        if (f.startDate && sDate < f.startDate) return false
        if (f.endDate && sDate > f.endDate) return false
      }
    }
    return true
  })

  // 3. Filter scheduled items
  let filteredScheduled = scheduledItems.filter((s) => {
    if (s.workItemId && !allowedItemIds.has(s.workItemId)) return false
    if (f.startDate && s.date < f.startDate) return false
    if (f.endDate && s.date > f.endDate) return false
    return true
  })

  // Planned, Scheduled, Actual totals
  const plannedMinutes = filteredItems.reduce((acc, i) => acc + (i.estimatedMinutes || 0), 0)
  const scheduledMinutes = filteredScheduled.length > 0
    ? filteredScheduled.reduce((acc, s) => acc + (s.durationMinutes || 0), 0)
    : filteredItems.reduce((acc, i) => acc + (i.scheduledMinutes || i.estimatedMinutes || 0), 0)
  const actualMinutes = filteredSessions.reduce(
    (acc, s) => acc + Math.max(0, (s.durationMinutes || 0) - (s.pausedDurationMinutes || 0)),
    0
  )

  // Completion counts
  const totalTasks = filteredItems.length
  const completedTasks = filteredItems.filter(
    (w) => w.completed === true || w.status === 'done' || w.status === 'completed'
  ).length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 10000) / 100 : 0

  // Deadlines & Overdue
  let overdueTasks = 0
  let upcomingDeadlines = 0
  let completedWithDeadline = 0
  let completedOnTime = 0

  for (const item of filteredItems) {
    const isDone = item.completed === true || item.status === 'done' || item.status === 'completed'
    const dLine = item.deadline || item.dueDate

    if (!isDone && dLine) {
      if (dLine < todayStr) {
        overdueTasks++
      } else {
        upcomingDeadlines++
      }
    }

    if (isDone && dLine) {
      completedWithDeadline++
      const finishDate = item.completedAt ? item.completedAt.substring(0, 10) : todayStr
      if (finishDate <= dLine) {
        completedOnTime++
      }
    }
  }

  const deadlinePerformanceRate = completedWithDeadline > 0
    ? Math.round((completedOnTime / completedWithDeadline) * 10000) / 100
    : 100

  // Capacity utilization
  const totalCap = params.usableCapacityMinutes || (scheduledMinutes > 0 ? scheduledMinutes * 1.2 : 480)
  const capacityUtilization = totalCap > 0 ? Math.min(100, Math.round((scheduledMinutes / totalCap) * 100)) : 0

  // Time by Area
  const areaMinutesMap = new Map<string, { actualMinutes: number; plannedMinutes: number }>()
  for (const s of filteredSessions) {
    const net = Math.max(0, (s.durationMinutes || 0) - (s.pausedDurationMinutes || 0))
    const wi = s.workItemId ? workItemsMap.get(s.workItemId) : null
    const aId = s.areaId || wi?.areaId || 'unassigned'
    const cur = areaMinutesMap.get(aId) || { actualMinutes: 0, plannedMinutes: 0 }
    cur.actualMinutes += net
    areaMinutesMap.set(aId, cur)
  }

  for (const item of filteredItems) {
    const aId = item.areaId || 'unassigned'
    const cur = areaMinutesMap.get(aId) || { actualMinutes: 0, plannedMinutes: 0 }
    cur.plannedMinutes += (item.estimatedMinutes || 0)
    areaMinutesMap.set(aId, cur)
  }

  const timeByArea: TimeBreakdownItem[] = []
  for (const [aId, data] of areaMinutesMap.entries()) {
    const area = areas.find((a) => a.id === aId)
    const name = area ? (area.name || area.title || 'Area') : aId === 'unassigned' ? 'Unassigned' : 'Area'
    const color = area?.color || '#6366f1'
    timeByArea.push({
      id: aId,
      areaId: aId,
      name,
      color,
      minutes: data.actualMinutes,
      actualMinutes: data.actualMinutes,
      plannedMinutes: data.plannedMinutes,
      percentage: actualMinutes > 0 ? Math.round((data.actualMinutes / actualMinutes) * 100) : 0
    })
  }
  timeByArea.sort((a, b) => b.minutes - a.minutes)

  // Time by Project
  const projectMinutesMap = new Map<string, number>()
  for (const s of filteredSessions) {
    const net = Math.max(0, (s.durationMinutes || 0) - (s.pausedDurationMinutes || 0))
    const wi = s.workItemId ? workItems.find((w) => w.id === s.workItemId) : null
    const pId = s.projectId || wi?.projectId || 'unassigned'
    projectMinutesMap.set(pId, (projectMinutesMap.get(pId) || 0) + net)
  }

  const timeByProject: TimeBreakdownItem[] = []
  for (const [pId, mins] of projectMinutesMap.entries()) {
    const proj = projects.find((p) => p.id === pId)
    const name = proj ? (proj.name || proj.title || 'Project') : pId === 'unassigned' ? 'Unassigned' : 'Project'
    timeByProject.push({
      id: pId,
      projectId: pId,
      projectName: name,
      title: name,
      name,
      minutes: mins,
      actualMinutes: mins,
      percentage: actualMinutes > 0 ? Math.round((mins / actualMinutes) * 100) : 0
    })
  }
  timeByProject.sort((a, b) => b.minutes - a.minutes)

  // Time by Goal
  const goalMinutesMap = new Map<string, number>()
  for (const s of filteredSessions) {
    const net = Math.max(0, (s.durationMinutes || 0) - (s.pausedDurationMinutes || 0))
    const wi = s.workItemId ? workItems.find((w) => w.id === s.workItemId) : null
    const gId = s.goalId || wi?.goalId || 'unassigned'
    goalMinutesMap.set(gId, (goalMinutesMap.get(gId) || 0) + net)
  }

  const timeByGoal: TimeBreakdownItem[] = []
  for (const [gId, mins] of goalMinutesMap.entries()) {
    const goal = goals.find((g) => g.id === gId)
    const name = goal ? (goal.title || goal.name || 'Goal') : gId === 'unassigned' ? 'Unassigned' : 'Goal'
    timeByGoal.push({
      id: gId,
      goalId: gId,
      goalTitle: name,
      title: name,
      name,
      minutes: mins,
      actualMinutes: mins,
      percentage: actualMinutes > 0 ? Math.round((mins / actualMinutes) * 100) : 0
    })
  }
  timeByGoal.sort((a, b) => b.minutes - a.minutes)

  // Daily Trends aggregation
  const datesMap = new Map<string, { scheduledMinutes: number; actualMinutes: number; completedTasks: number }>()

  for (const s of filteredScheduled) {
    const cur = datesMap.get(s.date) || { scheduledMinutes: 0, actualMinutes: 0, completedTasks: 0 }
    cur.scheduledMinutes += (s.durationMinutes || 0)
    datesMap.set(s.date, cur)
  }

  for (const ses of filteredSessions) {
    const timeVal = ses.startTime || ses.startedAt
    const dStr = typeof timeVal === 'number'
      ? new Date(timeVal).toISOString().substring(0, 10)
      : timeVal ? timeVal.substring(0, 10) : todayStr
    const cur = datesMap.get(dStr) || { scheduledMinutes: 0, actualMinutes: 0, completedTasks: 0 }
    cur.actualMinutes += Math.max(0, (ses.durationMinutes || 0) - (ses.pausedDurationMinutes || 0))
    datesMap.set(dStr, cur)
  }

  const dailyTrends = Array.from(datesMap.entries())
    .map(([date, data]) => ({
      date,
      scheduledMinutes: data.scheduledMinutes,
      actualMinutes: data.actualMinutes,
      completedTasks: data.completedTasks
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return {
    plannedMinutes,
    scheduledMinutes,
    actualMinutes,
    plannedVsActual: {
      plannedMinutes,
      scheduledMinutes,
      actualMinutes
    },
    completionRate,
    totalTasks,
    completedTasks,
    totalItemsCount: totalTasks,
    completedItemsCount: completedTasks,
    overdueTasks,
    overdueCount: overdueTasks,
    upcomingDeadlines,
    deadlinePerformanceRate,
    capacityUtilization,
    timeByArea,
    timeByProject,
    timeByGoal,
    dailyTrends
  }
}
