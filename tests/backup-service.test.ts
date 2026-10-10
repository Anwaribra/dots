import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { runMigrations } from '../src/main/db/migrate'
import { setDatabase } from '../src/main/db/database'
import * as schema from '../src/main/db/schema'
import { areas, workItems } from '../src/main/db/schema'
import {
  exportJsonData,
  restoreJsonData,
  validateJsonBackup
} from '../src/main/services/backup-service'
import { randomUUID } from 'node:crypto'
import path from 'node:path'

function makeDb() {
  const sqlite = new Database(':memory:')
  const db = drizzle(sqlite, { schema })
  setDatabase(db)
  runMigrations(db, path.join(__dirname, '../drizzle'))
  return db
}

describe('backup-service', () => {
  let db: ReturnType<typeof drizzle>

  beforeEach(() => {
    db = makeDb()
  })

  afterEach(() => {
    setDatabase(undefined as any)
  })

  it('exportJsonData returns all required arrays', () => {
    const backup = exportJsonData()
    expect(backup.version).toBeDefined()
    expect(typeof backup.exportedAt).toBe('number')
    expect(Array.isArray(backup.data.settings)).toBe(true)
    expect(Array.isArray(backup.data.areas)).toBe(true)
    expect(Array.isArray(backup.data.workItems)).toBe(true)
    expect(Array.isArray(backup.data.projects)).toBe(true)
    expect(Array.isArray(backup.data.timeSessions)).toBe(true)
    expect(Array.isArray(backup.data.scheduledItems)).toBe(true)
  })

  it('validateJsonBackup accepts valid backup', () => {
    const backup = exportJsonData()
    expect(validateJsonBackup(backup)).toBe(true)
  })

  it('validateJsonBackup rejects null', () => {
    expect(validateJsonBackup(null)).toBe(false)
  })

  it('validateJsonBackup rejects missing version', () => {
    expect(validateJsonBackup({ data: { settings: [], areas: [], workItems: [], projects: [] } })).toBe(false)
  })

  it('validateJsonBackup rejects missing data arrays', () => {
    expect(validateJsonBackup({ version: '1.0', data: { settings: [] } })).toBe(false)
  })

  it('validateJsonBackup rejects non-array data fields', () => {
    expect(validateJsonBackup({
      version: '1.0',
      data: { settings: null, areas: [], workItems: [], projects: [] }
    })).toBe(false)
  })

  it('restoreJsonData throws for invalid json string', () => {
    expect(() => restoreJsonData('not valid json')).toThrow()
  })

  it('restoreJsonData throws for corrupted structure', () => {
    expect(() => restoreJsonData({ version: '1.0', data: { settings: 'bad' } })).toThrow()
  })

  it('exportJsonData → restoreJsonData round-trip preserves all data', () => {
    // Insert test data
    const areaId = randomUUID()
    const now = Date.now()
    db.insert(areas).values({
      id: areaId,
      name: 'Test Area',
      color: '#ff0000',
      createdAt: now,
      updatedAt: now
    }).run()

    const workItemId = randomUUID()
    db.insert(workItems).values({
      id: workItemId,
      title: 'Test Task',
      status: 'todo',
      priority: 'high',
      estimatedMinutes: 90,
      actualMinutes: 0,
      createdAt: now,
      updatedAt: now
    }).run()

    // Export
    const backup = exportJsonData()
    expect(backup.data.areas.length).toBe(1)
    expect(backup.data.workItems.length).toBe(1)

    // Wipe by restoring from backup (restore clears and re-inserts)
    restoreJsonData(backup)

    // Re-export and verify
    const restored = exportJsonData()
    expect(restored.data.areas.length).toBe(1)
    expect(restored.data.areas[0].id).toBe(areaId)
    expect(restored.data.workItems.length).toBe(1)
    expect(restored.data.workItems[0].id).toBe(workItemId)
    expect(restored.data.workItems[0].title).toBe('Test Task')
  })

  it('restoreJsonData accepts JSON string input', () => {
    const backup = exportJsonData()
    const jsonStr = JSON.stringify(backup)
    // Should not throw
    expect(() => restoreJsonData(jsonStr)).not.toThrow()
  })

  it('round-trip with JSON stringify/parse preserves data', () => {
    const areaId = randomUUID()
    const now = Date.now()
    db.insert(areas).values({ id: areaId, name: 'Area 2', color: '#00ff00', createdAt: now, updatedAt: now }).run()

    const backup = exportJsonData()
    const str = JSON.stringify(backup)
    const parsed = JSON.parse(str)

    restoreJsonData(parsed)

    const restored = exportJsonData()
    expect(restored.data.areas[0].id).toBe(areaId)
  })

  it('restore is atomic: invalid data leaves db intact', () => {
    const areaId = randomUUID()
    const now = Date.now()
    db.insert(areas).values({ id: areaId, name: 'Area', color: '#000', createdAt: now, updatedAt: now }).run()

    // Attempt restore with corrupted data
    expect(() => restoreJsonData({ version: '1.0', data: { settings: 'broken' } })).toThrow()

    // Original data should still be intact because restoreJsonData throws before deleting
    // (validateJsonBackup is called first)
    const afterError = exportJsonData()
    expect(afterError.data.areas.length).toBe(1)
  })
})
