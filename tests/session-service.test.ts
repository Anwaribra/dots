import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { runMigrations } from '../src/main/db/migrate'
import { setDatabase } from '../src/main/db/database'
import * as schema from '../src/main/db/schema'
import { timeSessions, workItems } from '../src/main/db/schema'
import {
  createTimeSession,
  deleteTimeSession,
  listTimeSessions,
  updateTimeSession
} from '../src/main/services/session-service'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import path from 'node:path'

function makeDb() {
  const sqlite = new Database(':memory:')
  const db = drizzle(sqlite, { schema })
  setDatabase(db)
  runMigrations(db, path.join(__dirname, '../drizzle'))
  return db
}

function createWorkItemInDb(db: any, id: string, estimatedMinutes = 60) {
  db.insert(workItems).values({
    id,
    title: 'Test Item',
    status: 'todo',
    priority: 'medium',
    estimatedMinutes,
    actualMinutes: 0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }).run()
}

describe('session-service: source-of-truth cache invariant', () => {
  let db: ReturnType<typeof drizzle>

  beforeEach(() => {
    db = makeDb()
  })

  afterEach(() => {
    setDatabase(undefined as any)
  })

  it('actualMinutes cache equals SUM after create', () => {
    const wid = randomUUID()
    createWorkItemInDb(db, wid)

    const now = Date.now()
    createTimeSession({
      workItemId: wid,
      startTime: now - 60 * 60 * 1000,
      endTime: now,
      durationMinutes: 60,
      pausedDurationMinutes: 0
    })

    const wi = db.select().from(workItems).where(eq(workItems.id, wid)).get()
    const sessions = db.select().from(timeSessions).where(eq(timeSessions.workItemId, wid)).all()
    const sum = sessions.reduce((acc, s) => acc + Math.max(0, s.durationMinutes - (s.pausedDurationMinutes || 0)), 0)

    expect(wi?.actualMinutes).toBe(sum)
    expect(wi?.actualMinutes).toBe(60)
  })

  it('actualMinutes cache equals SUM after two sessions', () => {
    const wid = randomUUID()
    createWorkItemInDb(db, wid)

    const now = Date.now()
    createTimeSession({ workItemId: wid, startTime: now - 3600000, endTime: now, durationMinutes: 60, pausedDurationMinutes: 0 })
    createTimeSession({ workItemId: wid, startTime: now - 1800000, endTime: now, durationMinutes: 30, pausedDurationMinutes: 0 })

    const wi = db.select().from(workItems).where(eq(workItems.id, wid)).get()
    const sessions = db.select().from(timeSessions).where(eq(timeSessions.workItemId, wid)).all()
    const sum = sessions.reduce((acc, s) => acc + Math.max(0, s.durationMinutes - (s.pausedDurationMinutes || 0)), 0)

    expect(wi?.actualMinutes).toBe(sum)
    expect(wi?.actualMinutes).toBe(90)
  })

  it('actualMinutes cache updates correctly after session update', () => {
    const wid = randomUUID()
    createWorkItemInDb(db, wid)

    const now = Date.now()
    const session = createTimeSession({ workItemId: wid, startTime: now - 3600000, endTime: now, durationMinutes: 60, pausedDurationMinutes: 0 })

    updateTimeSession({ id: session.id, durationMinutes: 45 })

    const wi = db.select().from(workItems).where(eq(workItems.id, wid)).get()
    const sessions = db.select().from(timeSessions).where(eq(timeSessions.workItemId, wid)).all()
    const sum = sessions.reduce((acc, s) => acc + Math.max(0, s.durationMinutes - (s.pausedDurationMinutes || 0)), 0)

    expect(wi?.actualMinutes).toBe(sum)
    expect(wi?.actualMinutes).toBe(45)
  })

  it('actualMinutes cache resets to 0 after all sessions deleted', () => {
    const wid = randomUUID()
    createWorkItemInDb(db, wid)

    const now = Date.now()
    const s1 = createTimeSession({ workItemId: wid, startTime: now - 3600000, endTime: now, durationMinutes: 60, pausedDurationMinutes: 0 })
    const s2 = createTimeSession({ workItemId: wid, startTime: now - 1800000, endTime: now, durationMinutes: 30, pausedDurationMinutes: 0 })

    deleteTimeSession(s1.id)
    deleteTimeSession(s2.id)

    const wi = db.select().from(workItems).where(eq(workItems.id, wid)).get()
    expect(wi?.actualMinutes).toBe(0)
  })

  it('paused minutes are excluded from actual', () => {
    const wid = randomUUID()
    createWorkItemInDb(db, wid)

    const now = Date.now()
    // 60 minutes gross, 15 paused → 45 net
    createTimeSession({ workItemId: wid, startTime: now - 3600000, endTime: now, durationMinutes: 60, pausedDurationMinutes: 15 })

    const wi = db.select().from(workItems).where(eq(workItems.id, wid)).get()
    expect(wi?.actualMinutes).toBe(45)
  })

  it('listTimeSessions filters by workItemId', () => {
    const wid1 = randomUUID()
    const wid2 = randomUUID()
    createWorkItemInDb(db, wid1)
    createWorkItemInDb(db, wid2)

    const now = Date.now()
    createTimeSession({ workItemId: wid1, startTime: now - 3600000, endTime: now, durationMinutes: 60 })
    createTimeSession({ workItemId: wid2, startTime: now - 1800000, endTime: now, durationMinutes: 30 })

    const list1 = listTimeSessions(wid1)
    expect(list1.length).toBe(1)
    expect(list1[0].workItemId).toBe(wid1)

    const all = listTimeSessions()
    expect(all.length).toBe(2)
  })

  it('deleteTimeSession with unknown id is a no-op', () => {
    const db2 = makeDb()
    expect(() => deleteTimeSession(randomUUID())).not.toThrow()
  })

  it('updateTimeSession throws for unknown id', () => {
    expect(() => updateTimeSession({ id: randomUUID(), durationMinutes: 10 })).toThrow()
  })
})
