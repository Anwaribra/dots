import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { setDatabase } from '../src/main/db/database'
import { runMigrations } from '../src/main/db/migrate'
import * as schema from '../src/main/db/schema'
import { resourceItems, reviewEvents, reviewPolicies, workItems } from '../src/main/db/schema'
import {
  calculateNextReviewAt,
  evaluateReviewStatus,
  getDueReviews,
  parseIntervalDays
} from '../src/shared/review-engine'
import { eq } from 'drizzle-orm'
import {
  attachReviewPolicy,
  createReviewPolicy,
  getDueReviewsList,
  listReviewEvents,
  recordReviewEvent
} from '../src/main/services/review-service'
import { randomUUID } from 'node:crypto'
import path from 'node:path'

function makeDb() {
  const sqlite = new Database(':memory:')
  const db = drizzle(sqlite, { schema })
  setDatabase(db)
  runMigrations(db, path.join(__dirname, '../drizzle'))
  return db
}

describe('Pure Review Engine', () => {
  it('parses interval days from JSON string or array', () => {
    expect(parseIntervalDays('[1, 3, 7, 14, 30]')).toEqual([1, 3, 7, 14, 30])
    expect(parseIntervalDays([2, 5, 10])).toEqual([2, 5, 10])
    expect(parseIntervalDays('invalid')).toEqual([1, 3, 7, 14, 30])
  })

  it('calculates next review at with standard interval progression', () => {
    const policy = {
      id: 'p1',
      name: 'Default',
      intervalStrategy: 'fixed',
      intervalDays: [1, 3, 7, 14, 30],
      shortenOnWeak: true,
      enabled: true
    }

    const dayMs = 24 * 60 * 60 * 1000
    const startMs = 1000000

    // count 0 -> index 0 (1 day)
    expect(calculateNextReviewAt(policy, 0, 'good', startMs)).toBe(startMs + 1 * dayMs)
    // count 1 -> index 1 (3 days)
    expect(calculateNextReviewAt(policy, 1, 'good', startMs)).toBe(startMs + 3 * dayMs)
    // count 2 -> index 2 (7 days)
    expect(calculateNextReviewAt(policy, 2, 'good', startMs)).toBe(startMs + 7 * dayMs)
  })

  it('shortens next interval on weak recall if policy dictates', () => {
    const policyShorten = {
      id: 'p1',
      name: 'Shorten',
      intervalStrategy: 'fixed',
      intervalDays: [1, 3, 7, 14, 30],
      shortenOnWeak: true,
      enabled: true
    }

    const policyNoShorten = {
      ...policyShorten,
      shortenOnWeak: false
    }

    const dayMs = 24 * 60 * 60 * 1000
    const startMs = 1000000

    // count = 2 (normally 7 days). On weak + shortenOnWeak, index becomes max(0, 2 - 1) = 1 (3 days)
    expect(calculateNextReviewAt(policyShorten, 2, 'weak', startMs)).toBe(startMs + 3 * dayMs)

    // On weak without shortenOnWeak, index remains 2 (7 days)
    expect(calculateNextReviewAt(policyNoShorten, 2, 'weak', startMs)).toBe(startMs + 7 * dayMs)
  })

  it('evaluates review status correctly for due and overdue', () => {
    const dayMs = 24 * 60 * 60 * 1000
    const nextReviewAt = 1000000

    // Before due date
    expect(evaluateReviewStatus(nextReviewAt, 900000)).toBe('scheduled')
    // On or after due date
    expect(evaluateReviewStatus(nextReviewAt, nextReviewAt)).toBe('due')
    // 1+ day past due date -> overdue
    expect(evaluateReviewStatus(nextReviewAt, nextReviewAt + dayMs + 1)).toBe('overdue')
  })

  it('filters due and overdue reviews from items', () => {
    const nowMs = 10000000
    const dayMs = 24 * 60 * 60 * 1000

    const policy = {
      id: 'p1',
      name: 'P1',
      intervalStrategy: 'fixed',
      intervalDays: [1, 3, 7],
      shortenOnWeak: false,
      enabled: true
    }

    const items = [
      {
        id: '1',
        title: 'Item 1 - Future',
        itemKind: 'workItem' as const,
        reviewPolicyId: 'p1',
        nextReviewAt: nowMs + dayMs,
        reviewCount: 0,
        reviewStatus: 'scheduled' as const
      },
      {
        id: '2',
        title: 'Item 2 - Due',
        itemKind: 'workItem' as const,
        reviewPolicyId: 'p1',
        nextReviewAt: nowMs - 100,
        reviewCount: 1,
        reviewStatus: 'due' as const
      },
      {
        id: '3',
        title: 'Item 3 - Overdue',
        itemKind: 'resourceItem' as const,
        reviewPolicyId: 'p1',
        nextReviewAt: nowMs - 2 * dayMs,
        reviewCount: 2,
        reviewStatus: 'overdue' as const
      }
    ]

    const result = getDueReviews(items, { p1: policy }, nowMs)
    expect(result.dueItems.length).toBe(1)
    expect(result.dueItems[0].id).toBe('2')
    expect(result.overdueItems.length).toBe(1)
    expect(result.overdueItems[0].id).toBe('3')
    expect(result.allDueOrOverdue.length).toBe(2)
  })
})

describe('Review System Service Integration & Constraints (Decision A14)', () => {
  let db: ReturnType<typeof drizzle>

  beforeEach(() => {
    db = makeDb()
  })

  afterEach(() => {
    setDatabase(undefined as any)
  })

  it('enforces SQL CHECK constraint: review_events must have EXACTLY ONE reference (workItemId XOR resourceItemId)', () => {
    const wId = randomUUID()
    const rId = randomUUID()

    // 1. Neither reference -> fails CHECK constraint
    expect(() => {
      db.insert(reviewEvents).values({
        id: randomUUID(),
        workItemId: null,
        resourceItemId: null,
        reviewedAt: Date.now(),
        durationMinutes: 10,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }).run()
    }).toThrow()

    // 2. Both references -> fails CHECK constraint
    expect(() => {
      db.insert(reviewEvents).values({
        id: randomUUID(),
        workItemId: wId,
        resourceItemId: rId,
        reviewedAt: Date.now(),
        durationMinutes: 10,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }).run()
    }).toThrow()
  })

  it('attaches policy and preserves review history over multiple reviews', () => {
    const policy = createReviewPolicy({
      name: 'Custom Spaced Repetition',
      intervalDays: [1, 3, 7, 14],
      shortenOnWeak: true
    })

    const wId = randomUUID()
    const nowTime = Date.now()

    db.insert(workItems).values({
      id: wId,
      title: 'Study Chapter 1',
      status: 'todo',
      priority: 'medium',
      createdAt: nowTime,
      updatedAt: nowTime
    }).run()

    attachReviewPolicy('workItem', wId, policy.id)

    // First review (good)
    recordReviewEvent({
      workItemId: wId,
      reviewedAt: nowTime,
      durationMinutes: 20,
      result: 'good',
      notes: 'Understood core concepts'
    })

    // Second review (good)
    recordReviewEvent({
      workItemId: wId,
      reviewedAt: nowTime + 24 * 60 * 60 * 1000,
      durationMinutes: 15,
      result: 'good',
      notes: 'Reviewed flashcards'
    })

    // Third review (weak - should shorten next interval)
    recordReviewEvent({
      workItemId: wId,
      reviewedAt: nowTime + 4 * 24 * 60 * 60 * 1000,
      durationMinutes: 30,
      result: 'weak',
      notes: 'Struggled with theorem proof'
    })

    const events = listReviewEvents({ workItemId: wId })
    expect(events.length).toBe(3)
    expect(events[0].notes).toBe('Understood core concepts')
    expect(events[2].result).toBe('weak')

    const updatedWi = db.select().from(workItems).where(eq(workItems.id, wId)).get()
    expect(updatedWi?.reviewCount).toBe(3)
    expect(updatedWi?.lastReviewedAt).toBe(nowTime + 4 * 24 * 60 * 60 * 1000)
  })

  it('retrieves due reviews list correctly', () => {
    const policy = createReviewPolicy({
      name: 'Daily Policy',
      intervalDays: [1, 2, 4]
    })

    const wId = randomUUID()
    const pastTime = Date.now() - 3 * 24 * 60 * 60 * 1000

    db.insert(workItems).values({
      id: wId,
      title: 'Due Work Item',
      status: 'todo',
      priority: 'high',
      reviewPolicyId: policy.id,
      nextReviewAt: pastTime,
      reviewCount: 1,
      reviewStatus: 'due',
      createdAt: pastTime,
      updatedAt: pastTime
    }).run()

    const dueList = getDueReviewsList()
    expect(dueList.allDueOrOverdue.length).toBe(1)
    expect(dueList.allDueOrOverdue[0].id).toBe(wId)
  })
})
