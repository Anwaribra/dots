import { and, desc, eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { getDatabase } from '../db/database'
import { goalMetrics, goals, milestones, progressHistory, workItems } from '../db/schema'
import {
  calculateGoalProgress,
  type GoalProgressResult,
  type ProgressMode
} from '../../shared/progress-engine'

const now = (): number => Date.now()

export function getGoalProgress(goalId: string): GoalProgressResult {
  const db = getDatabase()
  const goal = db.select().from(goals).where(eq(goals.id, goalId)).get()
  if (!goal) {
    return {
      progressPercentage: 0,
      percentage: 0,
      completedWorkloadMinutes: 0,
      totalWorkloadMinutes: 0,
      completedCount: 0,
      totalCount: 0,
      details: 'Goal not found'
    }
  }

  // Work items linked to this goal
  const wItems = db.select().from(workItems).where(eq(workItems.goalId, goalId)).all()
  // Milestones linked to this goal
  const mStones = db.select().from(milestones).where(eq(milestones.goalId, goalId)).all()
  // Custom metrics linked to this goal
  const gMetrics = db.select().from(goalMetrics).where(eq(goalMetrics.goalId, goalId)).all()

  const mode = (goal.progressMode || 'percentage') as ProgressMode

  return calculateGoalProgress({
    mode,
    currentValue: goal.currentValue,
    targetValue: goal.targetValue || 100,
    manualPercentage: goal.currentValue,
    workItems: wItems.map((w) => ({
      id: w.id,
      title: w.title,
      status: w.status,
      estimatedMinutes: w.estimatedMinutes,
      actualMinutes: w.actualMinutes
    })),
    milestones: mStones.map((m) => ({
      id: m.id,
      title: m.title,
      status: m.status,
      progress: m.progress,
      weight: (m as any).weight || 1
    })),
    metrics: gMetrics.map((g) => ({
      id: g.id,
      name: g.name,
      currentValue: g.currentValue,
      targetValue: g.targetValue
    }))
  })
}

export function recordProgressSnapshot(
  entityType: 'goal' | 'project' | 'milestone',
  entityId: string,
  progress?: number,
  notes?: string
): void {
  const db = getDatabase()
  const time = now()
  const recordedDate = new Date(time).toISOString().substring(0, 10)

  let finalProgress = progress
  if (finalProgress === undefined) {
    if (entityType === 'goal') {
      const res = getGoalProgress(entityId)
      finalProgress = res.progressPercentage
    } else {
      finalProgress = 0
    }
  }

  db.insert(progressHistory)
    .values({
      id: randomUUID(),
      entityType,
      entityId,
      progress: finalProgress,
      recordedDate,
      timestamp: time,
      notes: notes || null,
      createdAt: time,
      updatedAt: time
    })
    .run()
}

export function getProgressHistory(entityType: string, entityId: string) {
  const db = getDatabase()
  return db
    .select()
    .from(progressHistory)
    .where(and(eq(progressHistory.entityType, entityType), eq(progressHistory.entityId, entityId)))
    .orderBy(desc(progressHistory.timestamp))
    .all()
}

export function listGoalMetrics(goalId: string) {
  const db = getDatabase()
  return db.select().from(goalMetrics).where(eq(goalMetrics.goalId, goalId)).all()
}

export function createGoalMetric(input: {
  goalId: string
  name: string
  unit?: string
  currentValue?: number
  targetValue?: number
}) {
  const db = getDatabase()
  const time = now()
  const id = randomUUID()
  const item = {
    id,
    goalId: input.goalId,
    name: input.name,
    unit: input.unit || null,
    currentValue: input.currentValue ?? 0,
    targetValue: input.targetValue ?? 100,
    createdAt: time,
    updatedAt: time
  }
  db.insert(goalMetrics).values(item).run()
  return item
}

export function updateGoalMetric(input: {
  id: string
  name?: string
  unit?: string
  currentValue?: number
  targetValue?: number
}) {
  const db = getDatabase()
  const updates: Record<string, any> = { updatedAt: now() }
  if (input.name !== undefined) updates.name = input.name
  if (input.unit !== undefined) updates.unit = input.unit
  if (input.currentValue !== undefined) updates.currentValue = input.currentValue
  if (input.targetValue !== undefined) updates.targetValue = input.targetValue

  db.update(goalMetrics).set(updates).where(eq(goalMetrics.id, input.id)).run()
  return db.select().from(goalMetrics).where(eq(goalMetrics.id, input.id)).get()
}

export function deleteGoalMetric(id: string): void {
  const db = getDatabase()
  db.delete(goalMetrics).where(eq(goalMetrics.id, id)).run()
}
