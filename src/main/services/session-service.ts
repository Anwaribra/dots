import { eq, sql } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { getDatabase } from '../db/database'
import { projects, timeSessions, workItems } from '../db/schema'
import { computeNetSessionMinutes } from '../../shared/time-math'

const now = (): number => Date.now()

export type TimeSessionInput = {
  workItemId?: string | null
  scheduledItemId?: string | null
  projectId?: string | null
  goalId?: string | null
  areaId?: string | null
  startTime: number
  endTime: number
  durationMinutes?: number
  pausedDurationMinutes?: number
  interruptionsCount?: number
  mode?: 'countdown' | 'stopwatch' | 'pomodoro' | 'custom'
  notes?: string | null
}

export type TimeSessionUpdateInput = {
  id: string
  startTime?: number
  endTime?: number
  durationMinutes?: number
  pausedDurationMinutes?: number
  interruptionsCount?: number
  notes?: string | null
}

export type TimeSessionItem = {
  id: string
  workItemId?: string | null
  scheduledItemId?: string | null
  projectId?: string | null
  goalId?: string | null
  areaId?: string | null
  startTime: number
  endTime: number
  durationMinutes: number
  pausedDurationMinutes: number
  interruptionsCount: number
  mode: string
  notes?: string | null
  createdAt: number
  updatedAt: number
}

function syncWorkItemActualInTx(db: any, workItemId: string): number {
  // Compute sum of net minutes from time_sessions for this workItemId
  const sessions = db
    .select({
      durationMinutes: timeSessions.durationMinutes,
      pausedDurationMinutes: timeSessions.pausedDurationMinutes
    })
    .from(timeSessions)
    .where(eq(timeSessions.workItemId, workItemId))
    .all()

  const totalActualMinutes = sessions.reduce((acc: number, s: { durationMinutes: number; pausedDurationMinutes: number | null }) => {
    const net = Math.max(0, s.durationMinutes - (s.pausedDurationMinutes || 0))
    return acc + net
  }, 0)

  // Update work_items table cache in same transaction
  db.update(workItems)
    .set({ actualMinutes: totalActualMinutes, updatedAt: now() })
    .where(eq(workItems.id, workItemId))
    .run()

  // Also update project completed minutes if linked
  const item = db.select({ projectId: workItems.projectId }).from(workItems).where(eq(workItems.id, workItemId)).get()
  if (item?.projectId) {
    const pItems = db.select({ actualMinutes: workItems.actualMinutes }).from(workItems).where(eq(workItems.projectId, item.projectId)).all()
    const pTotal = pItems.reduce((acc: number, i: { actualMinutes: number | null }) => acc + (i.actualMinutes || 0), 0)
    db.update(projects)
      .set({ completedMinutes: pTotal, updatedAt: now() })
      .where(eq(projects.id, item.projectId))
      .run()
  }

  return totalActualMinutes
}

export function createTimeSession(input: TimeSessionInput): TimeSessionItem {
  const db = getDatabase()
  const time = now()
  const id = randomUUID()

  const durMinutes =
    input.durationMinutes !== undefined
      ? input.durationMinutes
      : computeNetSessionMinutes(input.startTime, input.endTime, (input.pausedDurationMinutes || 0) * 60000)

  const sessionObj = {
    id,
    workItemId: input.workItemId ?? null,
    scheduledItemId: input.scheduledItemId ?? null,
    projectId: input.projectId ?? null,
    goalId: input.goalId ?? null,
    areaId: input.areaId ?? null,
    startTime: input.startTime,
    endTime: input.endTime,
    durationMinutes: durMinutes,
    pausedDurationMinutes: input.pausedDurationMinutes ?? 0,
    interruptionsCount: input.interruptionsCount ?? 0,
    mode: input.mode ?? 'stopwatch',
    notes: input.notes ?? null,
    createdAt: time,
    updatedAt: time
  }

  db.transaction((tx) => {
    tx.insert(timeSessions).values(sessionObj).run()
    if (input.workItemId) {
      syncWorkItemActualInTx(tx, input.workItemId)
    }
  })

  return sessionObj as TimeSessionItem
}

export function updateTimeSession(input: TimeSessionUpdateInput): TimeSessionItem {
  const db = getDatabase()
  const existing = db.select().from(timeSessions).where(eq(timeSessions.id, input.id)).get()
  if (!existing) {
    throw new Error(`TimeSession with id "${input.id}" not found`)
  }

  const updates: Record<string, any> = { updatedAt: now() }
  if (input.startTime !== undefined) updates.startTime = input.startTime
  if (input.endTime !== undefined) updates.endTime = input.endTime
  if (input.durationMinutes !== undefined) updates.durationMinutes = input.durationMinutes
  if (input.pausedDurationMinutes !== undefined) updates.pausedDurationMinutes = input.pausedDurationMinutes
  if (input.interruptionsCount !== undefined) updates.interruptionsCount = input.interruptionsCount
  if (input.notes !== undefined) updates.notes = input.notes

  db.transaction((tx) => {
    tx.update(timeSessions).set(updates).where(eq(timeSessions.id, input.id)).run()
    if (existing.workItemId) {
      syncWorkItemActualInTx(tx, existing.workItemId)
    }
  })

  const updated = db.select().from(timeSessions).where(eq(timeSessions.id, input.id)).get()
  return updated as TimeSessionItem
}

export function deleteTimeSession(id: string): void {
  const db = getDatabase()
  const existing = db.select().from(timeSessions).where(eq(timeSessions.id, id)).get()
  if (!existing) return

  db.transaction((tx) => {
    tx.delete(timeSessions).where(eq(timeSessions.id, id)).run()
    if (existing.workItemId) {
      syncWorkItemActualInTx(tx, existing.workItemId)
    }
  })
}

export function listTimeSessions(workItemId?: string): TimeSessionItem[] {
  const db = getDatabase()
  if (workItemId) {
    return db.select().from(timeSessions).where(eq(timeSessions.workItemId, workItemId)).all() as TimeSessionItem[]
  }
  return db.select().from(timeSessions).all() as TimeSessionItem[]
}
