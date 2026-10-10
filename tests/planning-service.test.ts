import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { runMigrations } from '../src/main/db/migrate'
import * as schema from '../src/main/db/schema'
import { setDatabase } from '../src/main/db/database'
import { createArea, createWorkItem } from '../src/main/services/entity-service'
import {
  clearScheduleRange,
  generateWeekSchedule,
  listPersistedSchedule
} from '../src/main/services/planning-service'

describe('Stage 05 PlanningService Integration Tests', () => {
  let sqlite: Database.Database

  beforeEach(() => {
    sqlite = new Database(':memory:')
    sqlite.pragma('foreign_keys = ON')
    const db = drizzle(sqlite, { schema })
    setDatabase(db)
    const migrationsFolder = path.resolve(__dirname, '../drizzle')
    runMigrations(db, migrationsFolder)
  })

  afterEach(() => {
    sqlite.close()
  })

  it('generateWeekSchedule loads DB data, runs scheduler, and persists schedule items', () => {
    const area = createArea({ name: 'Development' })
    const w1 = createWorkItem({
      title: 'Build Feature X',
      areaId: area.id,
      priority: 'high',
      estimatedMinutes: 120
    })
    const w2 = createWorkItem({
      title: 'Fix Bug Y',
      areaId: area.id,
      priority: 'critical',
      estimatedMinutes: 60
    })

    const todayStr = new Date().toISOString().substring(0, 10)
    const result = generateWeekSchedule(todayStr)

    expect(result.scheduledItems.length).toBeGreaterThan(0)
    expect(result.scheduledItems.some((s) => s.workItemId === w2.id)).toBe(true)

    // Check database persistence
    const end = new Date()
    end.setUTCDate(end.getUTCDate() + 6)
    const endDateStr = end.toISOString().substring(0, 10)

    const persisted = listPersistedSchedule(todayStr, endDateStr)
    expect(persisted.length).toBe(result.scheduledItems.length)

    // Clear schedule
    clearScheduleRange(todayStr, endDateStr)
    const afterClear = listPersistedSchedule(todayStr, endDateStr)
    expect(afterClear).toHaveLength(0)
  })
})
