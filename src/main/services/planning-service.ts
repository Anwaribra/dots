import { and, asc, eq, gte, lte } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { getDatabase } from '../db/database'
import { scheduledItems } from '../db/schema'
import { getSettings } from './settings-service'
import {
  listAvailabilityOverrides,
  listAvailabilityRules,
  listDependencies,
  listFixedEvents,
  listRoutines,
  listTimeBudgets,
  listWorkItems
} from './entity-service'
import { schedule } from '../scheduler/scheduling'
import type {
  PlanningInput,
  PlanningResult,
  ScheduleItem,
  AvailabilitySlot,
  FixedEventItem,
  WorkItemCandidate
} from '../scheduler/types'

const now = (): number => Date.now()

function formatDate(d: Date): string {
  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function generateWeekSchedule(startDateStr?: string): PlanningResult {
  const db = getDatabase()

  const start = startDateStr ? new Date(startDateStr) : new Date()
  const startDate = formatDate(start)

  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 6)
  const endDate = formatDate(end)

  const nowDate = formatDate(new Date())
  const setts = getSettings()

  // 1. Fetch Availability Slots
  const rules = listAvailabilityRules()
  const overrides = listAvailabilityOverrides()

  const availSlots: AvailabilitySlot[] = []
  const curr = new Date(start)

  while (curr <= end) {
    const dStr = formatDate(curr)
    const dayOfWeek = curr.getUTCDay()

    const ov = overrides.find((o) => o.date === dStr)
    if (ov) {
      if (!ov.isUnavailable) {
        const [sh, sm] = ov.startTime.split(':').map(Number)
        const [eh, em] = ov.endTime.split(':').map(Number)
        const mins = Math.max(0, (eh * 60 + em) - (sh * 60 + sm))
        availSlots.push({
          date: dStr,
          startTime: ov.startTime,
          endTime: ov.endTime,
          availableMinutes: mins
        })
      }
    } else {
      const rule = rules.find((r) => r.dayOfWeek === dayOfWeek && r.isActive)
      if (rule) {
        const [sh, sm] = rule.startTime.split(':').map(Number)
        const [eh, em] = rule.endTime.split(':').map(Number)
        const mins = Math.max(0, (eh * 60 + em) - (sh * 60 + sm))
        availSlots.push({
          date: dStr,
          startTime: rule.startTime,
          endTime: rule.endTime,
          availableMinutes: mins
        })
      }
    }

    curr.setUTCDate(curr.getUTCDate() + 1)
  }

  // 2. Fetch Fixed Events
  const rawEvents = listFixedEvents()
  const fixedEvents: FixedEventItem[] = []

  for (const fe of rawEvents) {
    const feDate = fe.startTime.substring(0, 10)
    const feStart = fe.startTime.includes(' ') ? fe.startTime.split(' ')[1] : fe.startTime
    const feEnd = fe.endTime.includes(' ') ? fe.endTime.split(' ')[1] : fe.endTime
    const [sh, sm] = feStart.split(':').map(Number)
    const [eh, em] = feEnd.split(':').map(Number)
    const dur = Math.max(0, (eh * 60 + em) - (sh * 60 + sm))

    fixedEvents.push({
      id: fe.id,
      title: fe.title,
      startTime: feStart,
      endTime: feEnd,
      date: feDate,
      durationMinutes: dur,
      locked: fe.locked,
      flexibility: fe.flexibility
    })
  }

  // 3. Fetch Time Budgets, Routines, Work Items, Dependencies
  const timeBudgets = listTimeBudgets()
  const routines = listRoutines()
  const rawWorkItems = listWorkItems()
  const dependencies = listDependencies()

  const workItems: WorkItemCandidate[] = rawWorkItems.map((w) => ({
    id: w.id,
    title: w.title,
    projectId: w.projectId,
    goalId: w.goalId,
    areaId: w.areaId,
    workItemTypeId: w.workItemTypeId,
    priority: w.priority as any,
    status: w.status,
    estimatedMinutes: w.estimatedMinutes,
    actualMinutes: w.actualMinutes,
    deadline: w.deadline,
    preferredDate: w.preferredDate,
    preferredStartTime: w.preferredStartTime,
    preferredEndTime: w.preferredEndTime,
    energyLevel: w.energyLevel as any,
    flexibility: w.flexibility as any,
    orderIndex: w.orderIndex
  }))

  const planningInput: PlanningInput = {
    nowDate,
    dateRange: { startDate, endDate },
    availability: availSlots,
    fixedEvents,
    timeBudgets,
    routines,
    workItems,
    dependencies,
    preferences: {
      minSessionMinutes: 15,
      maxSessionMinutes: 90
    },
    capacitySettings: {
      planningCapacityPercentage: setts.planningCapacityPercentage ?? 75,
      bufferPercentage: setts.bufferPercentage ?? 20
    }
  }

  // Run pure scheduler engine
  const result = schedule(planningInput)

  // Persist scheduled items into database for the date range
  const time = now()
  db.delete(scheduledItems)
    .where(and(gte(scheduledItems.date, startDate), lte(scheduledItems.date, endDate)))
    .run()

  for (const item of result.scheduledItems) {
    db.insert(scheduledItems)
      .values({
        id: randomUUID(),
        workItemId: item.workItemId,
        title: item.title,
        date: item.date,
        startTime: item.startTime,
        endTime: item.endTime,
        durationMinutes: item.durationMinutes,
        sessionIndex: item.sessionIndex,
        totalSessions: item.totalSessions,
        isSplit: item.isSplit,
        locked: item.locked,
        reason: item.reason,
        createdAt: time,
        updatedAt: time
      })
      .run()
  }

  return result
}

export function listPersistedSchedule(startDate: string, endDate: string): ScheduleItem[] {
  return getDatabase()
    .select()
    .from(scheduledItems)
    .where(and(gte(scheduledItems.date, startDate), lte(scheduledItems.date, endDate)))
    .orderBy(asc(scheduledItems.date), asc(scheduledItems.startTime))
    .all() as unknown as ScheduleItem[]
}

export function clearScheduleRange(startDate: string, endDate: string): void {
  getDatabase()
    .delete(scheduledItems)
    .where(and(gte(scheduledItems.date, startDate), lte(scheduledItems.date, endDate)))
    .run()
}
