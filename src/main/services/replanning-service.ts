import { and, desc, eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { getDatabase } from '../db/database'
import { planVersions, replanningHistory, scheduledItems } from '../db/schema'
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
import { listPersistedSchedule } from './planning-service'
import { replan } from '../scheduler/replanning'
import type {
  ReplanningInput,
  ReplanningResult,
  ReplanningChange,
  ScheduleItem,
  AvailabilitySlot,
  FixedEventItem,
  WorkItemCandidate,
  ReplanningHistoryItem,
  PlanVersionItem
} from '../scheduler/types'

const now = (): number => Date.now()

function formatCurrentTime(d = new Date()): string {
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

export function previewReplanDay(input: {
  targetDate: string
  currentTime?: string
  trigger?: any
  activeWorkItemId?: string | null
}): ReplanningResult {
  const targetDate = input.targetDate
  const currentTime = input.currentTime || formatCurrentTime()
  const setts = getSettings()

  // 1. Availability for target date
  const rules = listAvailabilityRules()
  const overrides = listAvailabilityOverrides()
  const availSlots: AvailabilitySlot[] = []

  const dObj = new Date(targetDate)
  const dayOfWeek = dObj.getUTCDay()
  const ov = overrides.find((o) => o.date === targetDate)

  if (ov) {
    if (!ov.isUnavailable) {
      const [sh, sm] = ov.startTime.split(':').map(Number)
      const [eh, em] = ov.endTime.split(':').map(Number)
      availSlots.push({
        date: targetDate,
        startTime: ov.startTime,
        endTime: ov.endTime,
        availableMinutes: Math.max(0, (eh * 60 + em) - (sh * 60 + sm))
      })
    }
  } else {
    const rule = rules.find((r) => r.dayOfWeek === dayOfWeek && r.isActive)
    if (rule) {
      const [sh, sm] = rule.startTime.split(':').map(Number)
      const [eh, em] = rule.endTime.split(':').map(Number)
      availSlots.push({
        date: targetDate,
        startTime: rule.startTime,
        endTime: rule.endTime,
        availableMinutes: Math.max(0, (eh * 60 + em) - (sh * 60 + sm))
      })
    }
  }

  // 2. Fixed Events
  const rawEvents = listFixedEvents()
  const fixedEvents: FixedEventItem[] = []
  for (const fe of rawEvents) {
    const feDate = fe.startTime.substring(0, 10)
    const feStart = fe.startTime.includes(' ') ? fe.startTime.split(' ')[1] : fe.startTime
    const feEnd = fe.endTime.includes(' ') ? fe.endTime.split(' ')[1] : fe.endTime
    const [sh, sm] = feStart.split(':').map(Number)
    const [eh, em] = feEnd.split(':').map(Number)
    fixedEvents.push({
      id: fe.id,
      title: fe.title,
      startTime: feStart,
      endTime: feEnd,
      date: feDate,
      durationMinutes: Math.max(0, (eh * 60 + em) - (sh * 60 + sm)),
      locked: fe.locked,
      flexibility: fe.flexibility
    })
  }

  // 3. Budgets, Routines, Candidates, Dependencies
  const timeBudgets = listTimeBudgets()
  const routines = listRoutines()
  const rawWorkItems = listWorkItems()
  const dependencies = listDependencies()

  const candidateWorkItems: WorkItemCandidate[] = rawWorkItems.map((w) => ({
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

  const existingSchedule = listPersistedSchedule(targetDate, targetDate)

  const replanInput: ReplanningInput = {
    nowDate: targetDate,
    currentTime,
    existingSchedule,
    activeWorkItemId: input.activeWorkItemId,
    candidateWorkItems,
    dependencies,
    availability: availSlots,
    fixedEvents,
    timeBudgets,
    routines,
    preferences: {
      minSessionMinutes: 15,
      maxSessionMinutes: 90
    },
    capacitySettings: {
      planningCapacityPercentage: setts.planningCapacityPercentage ?? 75,
      bufferPercentage: setts.bufferPercentage ?? 20
    },
    trigger: input.trigger
  }

  return replan(replanInput)
}

export function applyReplanDay(input: {
  targetDate: string
  updatedSchedule: ScheduleItem[]
  changes: ReplanningChange[]
  trigger?: string
  summary?: string
}): { success: boolean; versionId: string; historyId: string } {
  const db = getDatabase()
  const time = now()
  const targetDate = input.targetDate

  // Fetch current schedule
  const currentSchedule = listPersistedSchedule(targetDate, targetDate)

  // Query existing versions count
  const existingVersions = db
    .select()
    .from(planVersions)
    .where(eq(planVersions.planDate, targetDate))
    .all()

  let nextIndex = existingVersions.length + 1

  // If this is the first replan, save the original plan as version 1
  if (existingVersions.length === 0 && currentSchedule.length > 0) {
    db.insert(planVersions)
      .values({
        id: randomUUID(),
        planDate: targetDate,
        versionName: 'Original Plan',
        versionIndex: 1,
        scheduleSnapshotJson: JSON.stringify(currentSchedule),
        trigger: 'initial',
        createdAt: time - 1000,
        updatedAt: time - 1000
      })
      .run()
    nextIndex = 2
  }

  // 1. Snapshot prior state as a version before this change
  const snapshotId = randomUUID()
  db.insert(planVersions)
    .values({
      id: snapshotId,
      planDate: targetDate,
      versionName: `Snapshot before ${input.trigger || 'replan'} (v${nextIndex})`,
      versionIndex: nextIndex,
      scheduleSnapshotJson: JSON.stringify(currentSchedule),
      trigger: input.trigger || 'replan',
      createdAt: time,
      updatedAt: time
    })
    .run()

  // 2. Log in replanning_history
  const historyId = randomUUID()
  const summaryText =
    input.summary ||
    `Applied replanning (${input.trigger || 'manual'}) with ${input.changes.length} change(s).`

  db.insert(replanningHistory)
    .values({
      id: historyId,
      targetDate,
      timestamp: time,
      trigger: input.trigger || 'manual',
      summary: summaryText,
      changesJson: JSON.stringify(input.changes),
      createdAt: time,
      updatedAt: time
    })
    .run()

  // 3. Update scheduled_items for this date
  // Delete all non-locked schedule items on targetDate
  db.delete(scheduledItems)
    .where(and(eq(scheduledItems.date, targetDate), eq(scheduledItems.locked, false)))
    .run()

  // Insert non-locked items from updated schedule
  for (const item of input.updatedSchedule) {
    if (!item.locked) {
      db.insert(scheduledItems)
        .values({
          id: randomUUID(),
          workItemId: item.workItemId || null,
          title: item.title,
          date: targetDate,
          startTime: item.startTime,
          endTime: item.endTime,
          durationMinutes: item.durationMinutes,
          sessionIndex: item.sessionIndex || 1,
          totalSessions: item.totalSessions || 1,
          isSplit: item.isSplit || false,
          locked: false,
          reason: item.reason || 'Replanned schedule item',
          createdAt: time,
          updatedAt: time
        })
        .run()
    }
  }

  // 4. Save the new state as an updated version snapshot
  const newVersionId = randomUUID()
  db.insert(planVersions)
    .values({
      id: newVersionId,
      planDate: targetDate,
      versionName: `Updated Plan (v${nextIndex + 1})`,
      versionIndex: nextIndex + 1,
      scheduleSnapshotJson: JSON.stringify(input.updatedSchedule),
      trigger: input.trigger || 'replan',
      createdAt: time + 10,
      updatedAt: time + 10
    })
    .run()

  return { success: true, versionId: newVersionId, historyId }
}

export function undoLastReplan(targetDate: string): {
  success: boolean
  restoredSchedule: ScheduleItem[]
} {
  const db = getDatabase()
  const time = now()

  // Get versions ordered descending
  const versions = db
    .select()
    .from(planVersions)
    .where(eq(planVersions.planDate, targetDate))
    .orderBy(desc(planVersions.versionIndex))
    .all()

  if (versions.length < 2) {
    // Cannot undo if no previous version exists
    const current = listPersistedSchedule(targetDate, targetDate)
    return { success: false, restoredSchedule: current }
  }

  // The latest version is versions[0], previous is versions[1]
  const targetVersion = versions[1]
  const restoredItems: ScheduleItem[] = JSON.parse(targetVersion.scheduleSnapshotJson)

  // Replace schedule in database
  db.delete(scheduledItems)
    .where(eq(scheduledItems.date, targetDate))
    .run()

  for (const item of restoredItems) {
    db.insert(scheduledItems)
      .values({
        id: randomUUID(),
        workItemId: item.workItemId || null,
        title: item.title,
        date: targetDate,
        startTime: item.startTime,
        endTime: item.endTime,
        durationMinutes: item.durationMinutes,
        sessionIndex: item.sessionIndex || 1,
        totalSessions: item.totalSessions || 1,
        isSplit: item.isSplit || false,
        locked: item.locked || false,
        reason: item.reason || `Restored from ${targetVersion.versionName}`,
        createdAt: time,
        updatedAt: time
      })
      .run()
  }

  // Log in replanning_history
  db.insert(replanningHistory)
    .values({
      id: randomUUID(),
      targetDate,
      timestamp: time,
      trigger: 'undo',
      summary: `Undid last replan, restored to "${targetVersion.versionName}".`,
      changesJson: JSON.stringify([]),
      createdAt: time,
      updatedAt: time
    })
    .run()

  // Remove the undone version from planVersions
  db.delete(planVersions)
    .where(eq(planVersions.id, versions[0].id))
    .run()

  return { success: true, restoredSchedule: restoredItems }
}

export function listReplanningHistory(targetDate?: string): ReplanningHistoryItem[] {
  const db = getDatabase()
  const rows = targetDate
    ? db
        .select()
        .from(replanningHistory)
        .where(eq(replanningHistory.targetDate, targetDate))
        .orderBy(desc(replanningHistory.timestamp))
        .all()
    : db
        .select()
        .from(replanningHistory)
        .orderBy(desc(replanningHistory.timestamp))
        .all()

  return rows.map((r) => ({
    id: r.id,
    targetDate: r.targetDate,
    timestamp: r.timestamp,
    trigger: r.trigger,
    summary: r.summary,
    changes: JSON.parse(r.changesJson || '[]'),
    createdAt: r.createdAt,
    updatedAt: r.updatedAt
  }))
}

export function listPlanVersions(targetDate: string): PlanVersionItem[] {
  const db = getDatabase()
  const rows = db
    .select()
    .from(planVersions)
    .where(eq(planVersions.planDate, targetDate))
    .orderBy(desc(planVersions.versionIndex))
    .all()

  return rows.map((r) => ({
    id: r.id,
    planDate: r.planDate,
    versionName: r.versionName,
    versionIndex: r.versionIndex,
    scheduleSnapshot: JSON.parse(r.scheduleSnapshotJson || '[]'),
    trigger: r.trigger,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt
  }))
}
