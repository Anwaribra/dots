import { eq, or, sql } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { getDatabase } from '../db/database'
import { resourceItems, reviewEvents, reviewPolicies, workItems } from '../db/schema'
import {
  calculateNextReviewAt,
  evaluateReviewStatus,
  getDueReviews,
  parseIntervalDays,
  type ReviewableItemState,
  type ReviewPolicyData,
  type ReviewResultType
} from '../../shared/review-engine'

const now = (): number => Date.now()

export type ReviewPolicyInput = {
  name: string
  intervalStrategy?: string
  intervalDays?: number[] | string
  shortenOnWeak?: boolean
  enabled?: boolean
}

export type ReviewPolicyUpdateInput = Partial<ReviewPolicyInput> & { id: string }

export type ReviewEventInput = {
  workItemId?: string | null
  resourceItemId?: string | null
  reviewedAt?: number
  durationMinutes?: number
  result?: ReviewResultType | null
  notes?: string | null
}

export function createReviewPolicy(input: ReviewPolicyInput): ReviewPolicyData {
  const db = getDatabase()
  const id = randomUUID()
  const time = now()

  const intervalDaysStr = Array.isArray(input.intervalDays)
    ? JSON.stringify(input.intervalDays)
    : input.intervalDays || '[1,3,7,14,30]'

  const policyObj = {
    id,
    name: input.name,
    intervalStrategy: input.intervalStrategy || 'fixed',
    intervalDays: intervalDaysStr,
    shortenOnWeak: input.shortenOnWeak ?? false,
    enabled: input.enabled ?? true,
    createdAt: time,
    updatedAt: time
  }

  db.insert(reviewPolicies).values(policyObj).run()
  return {
    ...policyObj,
    intervalDays: parseIntervalDays(policyObj.intervalDays)
  }
}

export function updateReviewPolicy(input: ReviewPolicyUpdateInput): ReviewPolicyData {
  const db = getDatabase()
  const existing = db.select().from(reviewPolicies).where(eq(reviewPolicies.id, input.id)).get()
  if (!existing) throw new Error(`Review policy with id "${input.id}" not found`)

  const updates: Record<string, any> = { updatedAt: now() }
  if (input.name !== undefined) updates.name = input.name
  if (input.intervalStrategy !== undefined) updates.intervalStrategy = input.intervalStrategy
  if (input.intervalDays !== undefined) {
    updates.intervalDays = Array.isArray(input.intervalDays)
      ? JSON.stringify(input.intervalDays)
      : input.intervalDays
  }
  if (input.shortenOnWeak !== undefined) updates.shortenOnWeak = input.shortenOnWeak
  if (input.enabled !== undefined) updates.enabled = input.enabled

  db.update(reviewPolicies).set(updates).where(eq(reviewPolicies.id, input.id)).run()

  const updated = db.select().from(reviewPolicies).where(eq(reviewPolicies.id, input.id)).get()!
  return {
    ...updated,
    intervalDays: parseIntervalDays(updated.intervalDays)
  }
}

export function listReviewPolicies(): ReviewPolicyData[] {
  const db = getDatabase()
  const list = db.select().from(reviewPolicies).all()
  return list.map((p) => ({
    ...p,
    intervalDays: parseIntervalDays(p.intervalDays)
  }))
}

export function deleteReviewPolicy(id: string): void {
  const db = getDatabase()
  db.transaction((tx) => {
    // Detach policy from workItems and resourceItems
    tx.update(workItems).set({ reviewPolicyId: null, reviewStatus: 'none' }).where(eq(workItems.reviewPolicyId, id)).run()
    tx.update(resourceItems).set({ reviewPolicyId: null, reviewStatus: 'none' }).where(eq(resourceItems.reviewPolicyId, id)).run()
    tx.delete(reviewPolicies).where(eq(reviewPolicies.id, id)).run()
  })
}

export function attachReviewPolicy(itemKind: 'workItem' | 'resourceItem', itemId: string, policyId: string): void {
  const db = getDatabase()
  const policy = db.select().from(reviewPolicies).where(eq(reviewPolicies.id, policyId)).get()
  if (!policy) throw new Error(`Review policy "${policyId}" not found`)

  const currentTime = now()
  const policyData: ReviewPolicyData = {
    ...policy,
    intervalDays: parseIntervalDays(policy.intervalDays)
  }

  const initialNext = calculateNextReviewAt(policyData, 0, null, currentTime)
  const initialStatus = evaluateReviewStatus(initialNext, currentTime)

  if (itemKind === 'workItem') {
    db.update(workItems)
      .set({
        reviewPolicyId: policyId,
        nextReviewAt: initialNext,
        reviewStatus: initialStatus,
        updatedAt: currentTime
      })
      .where(eq(workItems.id, itemId))
      .run()
  } else {
    db.update(resourceItems)
      .set({
        reviewPolicyId: policyId,
        nextReviewAt: initialNext,
        reviewStatus: initialStatus,
        updatedAt: currentTime
      })
      .where(eq(resourceItems.id, itemId))
      .run()
  }
}

export function detachReviewPolicy(itemKind: 'workItem' | 'resourceItem', itemId: string): void {
  const db = getDatabase()
  const updates = { reviewPolicyId: null, reviewStatus: 'none', updatedAt: now() }
  if (itemKind === 'workItem') {
    db.update(workItems).set(updates).where(eq(workItems.id, itemId)).run()
  } else {
    db.update(resourceItems).set(updates).where(eq(resourceItems.id, itemId)).run()
  }
}

export function recordReviewEvent(input: ReviewEventInput) {
  const db = getDatabase()
  const eventId = randomUUID()
  const reviewedAtMs = input.reviewedAt ?? now()

  if ((!input.workItemId && !input.resourceItemId) || (input.workItemId && input.resourceItemId)) {
    throw new Error('Exactly one of workItemId or resourceItemId must be provided.')
  }

  return db.transaction((tx) => {
    // 1. Insert review event
    tx.insert(reviewEvents).values({
      id: eventId,
      workItemId: input.workItemId ?? null,
      resourceItemId: input.resourceItemId ?? null,
      reviewedAt: reviewedAtMs,
      durationMinutes: input.durationMinutes ?? 0,
      result: input.result ?? null,
      notes: input.notes ?? null,
      createdAt: reviewedAtMs,
      updatedAt: reviewedAtMs
    }).run()

    // 2. Fetch item & policy to update review state
    if (input.workItemId) {
      const item = tx.select().from(workItems).where(eq(workItems.id, input.workItemId)).get()
      if (item && item.reviewPolicyId) {
        const policyRow = tx.select().from(reviewPolicies).where(eq(reviewPolicies.id, item.reviewPolicyId)).get()
        if (policyRow) {
          const policyData: ReviewPolicyData = {
            ...policyRow,
            intervalDays: parseIntervalDays(policyRow.intervalDays)
          }
          const newCount = (item.reviewCount || 0) + 1
          const nextAt = calculateNextReviewAt(policyData, newCount, input.result, reviewedAtMs)
          const newStatus = evaluateReviewStatus(nextAt, reviewedAtMs)

          tx.update(workItems)
            .set({
              lastReviewedAt: reviewedAtMs,
              nextReviewAt: nextAt,
              reviewCount: newCount,
              reviewStatus: newStatus,
              updatedAt: reviewedAtMs
            })
            .where(eq(workItems.id, input.workItemId))
            .run()
        }
      }
    } else if (input.resourceItemId) {
      const item = tx.select().from(resourceItems).where(eq(resourceItems.id, input.resourceItemId)).get()
      if (item && item.reviewPolicyId) {
        const policyRow = tx.select().from(reviewPolicies).where(eq(reviewPolicies.id, item.reviewPolicyId)).get()
        if (policyRow) {
          const policyData: ReviewPolicyData = {
            ...policyRow,
            intervalDays: parseIntervalDays(policyRow.intervalDays)
          }
          const newCount = (item.reviewCount || 0) + 1
          const nextAt = calculateNextReviewAt(policyData, newCount, input.result, reviewedAtMs)
          const newStatus = evaluateReviewStatus(nextAt, reviewedAtMs)

          tx.update(resourceItems)
            .set({
              lastReviewedAt: reviewedAtMs,
              nextReviewAt: nextAt,
              reviewCount: newCount,
              reviewStatus: newStatus,
              updatedAt: reviewedAtMs
            })
            .where(eq(resourceItems.id, input.resourceItemId))
            .run()
        }
      }
    }

    return tx.select().from(reviewEvents).where(eq(reviewEvents.id, eventId)).get()
  })
}

export function listReviewEvents(filter: { workItemId?: string; resourceItemId?: string }) {
  const db = getDatabase()
  if (filter.workItemId) {
    return db.select().from(reviewEvents).where(eq(reviewEvents.workItemId, filter.workItemId)).all()
  }
  if (filter.resourceItemId) {
    return db.select().from(reviewEvents).where(eq(reviewEvents.resourceItemId, filter.resourceItemId)).all()
  }
  return db.select().from(reviewEvents).all()
}

export function getDueReviewsList(nowMs: number = Date.now()) {
  const db = getDatabase()
  const policiesList = listReviewPolicies()
  const policiesMap = Object.fromEntries(policiesList.map((p) => [p.id, p]))

  const wItems = db.select().from(workItems).where(sql`${workItems.reviewPolicyId} IS NOT NULL`).all()
  const rItems = db.select().from(resourceItems).where(sql`${resourceItems.reviewPolicyId} IS NOT NULL`).all()

  const reviewableItems: ReviewableItemState[] = [
    ...wItems.map((w) => ({
      id: w.id,
      title: w.title,
      itemKind: 'workItem' as const,
      reviewPolicyId: w.reviewPolicyId,
      lastReviewedAt: w.lastReviewedAt,
      nextReviewAt: w.nextReviewAt,
      reviewCount: w.reviewCount,
      reviewStatus: (w.reviewStatus || 'none') as any,
      estimatedMinutes: w.estimatedMinutes
    })),
    ...rItems.map((r) => ({
      id: r.id,
      title: r.title,
      itemKind: 'resourceItem' as const,
      reviewPolicyId: r.reviewPolicyId,
      lastReviewedAt: r.lastReviewedAt,
      nextReviewAt: r.nextReviewAt,
      reviewCount: r.reviewCount,
      reviewStatus: (r.reviewStatus || 'none') as any,
      estimatedMinutes: r.estimatedMinutes
    }))
  ]

  return getDueReviews(reviewableItems, policiesMap, nowMs)
}

/**
 * Stage 08 instruction: Due reviews become ordinary schedulable work through the generic work-item path.
 * Converts due resource items into work items (if not already linked) so the scheduler picks them up naturally.
 */
export function ensureDueReviewsAsWorkItems(nowMs: number = Date.now()) {
  const db = getDatabase()
  const due = getDueReviewsList(nowMs)
  const createdWorkItems = []

  for (const item of due.allDueOrOverdue) {
    if (item.itemKind === 'resourceItem') {
      const rItem = db.select().from(resourceItems).where(eq(resourceItems.id, item.id)).get()
      if (rItem && !rItem.workItemId) {
        // Create work item for this due resource item
        const wiId = randomUUID()
        const time = now()
        db.transaction((tx) => {
          tx.insert(workItems).values({
            id: wiId,
            title: `Review: ${rItem.title}`,
            status: 'todo',
            priority: 'medium',
            estimatedMinutes: rItem.estimatedMinutes || 30,
            actualMinutes: 0,
            reviewPolicyId: rItem.reviewPolicyId,
            lastReviewedAt: rItem.lastReviewedAt,
            nextReviewAt: rItem.nextReviewAt,
            reviewCount: rItem.reviewCount,
            reviewStatus: rItem.reviewStatus,
            createdAt: time,
            updatedAt: time
          }).run()

          tx.update(resourceItems).set({ workItemId: wiId, updatedAt: time }).where(eq(resourceItems.id, item.id)).run()
        })
        createdWorkItems.push(wiId)
      }
    }
  }

  return createdWorkItems
}
