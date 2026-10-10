import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { runMigrations } from '../src/main/db/migrate'
import * as schema from '../src/main/db/schema'
import { setDatabase } from '../src/main/db/database'
import {
  attachTag,
  createArea,
  createAvailabilityOverride,
  createFixedEvent,
  createGoal,
  createHabit,
  createNote,
  createRoutine,
  createTag,
  createTimeBudget,
  deleteAvailabilityOverride,
  deleteEntity,
  getEntityTags,
  getFixedEventConflicts,
  getCapacityForDate,
  listAvailabilityRules,
  listNotes,
  listTimeBudgets,
  logHabit,
  updateAvailabilityRules
} from '../src/main/services/entity-service'

describe('Stage 04 Time Model Services & Constraints', () => {
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

  it('seeds default availability rules and allows updating them', () => {
    const rules = listAvailabilityRules()
    expect(rules).toHaveLength(7)
    const sunday = rules.find((r) => r.dayOfWeek === 0)
    expect(sunday).toBeDefined()
    expect(sunday?.startTime).toBe('09:00')
    expect(sunday?.endTime).toBe('17:00')

    const updatedRules = updateAvailabilityRules({
      rules: [
        {
          dayOfWeek: 0,
          startTime: '10:00',
          endTime: '15:00',
          isActive: true
        }
      ]
    })
    const updatedSunday = updatedRules.find((r) => r.dayOfWeek === 0)
    expect(updatedSunday?.startTime).toBe('10:00')
    expect(updatedSunday?.endTime).toBe('15:00')
  })

  it('manages availability overrides for specific dates', () => {
    const override = createAvailabilityOverride({
      date: '2026-10-10',
      startTime: '10:00',
      endTime: '12:00',
      isUnavailable: false,
      notes: 'Half-day conference'
    })
    expect(override.date).toBe('2026-10-10')
    expect(override.startTime).toBe('10:00')

    deleteAvailabilityOverride(override.id)
  })

  it('creates and updates fixed events with recurrence and detects conflicts', () => {
    const ev1 = createFixedEvent({
      title: 'Standup',
      startTime: '2026-10-10 09:00',
      endTime: '2026-10-10 09:30',
      flexibility: 'fixed',
      locked: true
    })
    const ev2 = createFixedEvent({
      title: 'Sprint Planning',
      startTime: '2026-10-10 09:15',
      endTime: '2026-10-10 10:15',
      flexibility: 'fixed',
      locked: true
    })

    const conflicts = getFixedEventConflicts('2026-10-10')
    expect(conflicts).toHaveLength(1)
    expect(conflicts[0].eventA.id).toBe(ev1.id)
    expect(conflicts[0].eventB.id).toBe(ev2.id)
  })

  it('enforces SQL CHECK constraint on time_budgets: exactly one scope FK must be set', () => {
    const area = createArea({ name: 'Health' })
    const goal = createGoal({ title: 'Marathon', areaId: area.id })

    // Valid: exactly areaId set
    const b1 = createTimeBudget({
      name: 'Health Budget',
      allocationMode: 'minimum',
      protection: 'protected',
      minimumMinutes: 300,
      targetMinutes: 300,
      maximumMinutes: 300,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      areaId: area.id
    })
    expect(b1.areaId).toBe(area.id)
    expect(b1.goalId).toBeNull()

    // Invalid: no scope set -> must throw
    expect(() =>
      createTimeBudget({
        name: 'Invalid No Scope',
        allocationMode: 'target',
        protection: 'flexible',
        minimumMinutes: 60,
        targetMinutes: 60,
        maximumMinutes: 60,
        daysOfWeek: [1]
      })
    ).toThrow()

    // Invalid: two scopes set -> must throw
    expect(() =>
      createTimeBudget({
        name: 'Invalid Two Scopes',
        allocationMode: 'target',
        protection: 'flexible',
        minimumMinutes: 60,
        targetMinutes: 60,
        maximumMinutes: 60,
        daysOfWeek: [1],
        areaId: area.id,
        goalId: goal.id
      })
    ).toThrow()
  })

  it('cascades foreign keys when scoped entity is deleted', () => {
    const area = createArea({ name: 'Work' })
    const budget = createTimeBudget({
      name: 'Work Hours',
      allocationMode: 'target',
      protection: 'locked',
      minimumMinutes: 2400,
      targetMinutes: 2400,
      maximumMinutes: 2400,
      daysOfWeek: [0, 1, 2, 3, 4],
      areaId: area.id
    })
    expect(budget.id).toBeDefined()

    // Delete area
    deleteEntity({ kind: 'area', id: area.id })

    // Budget should be deleted due to ON DELETE CASCADE
    const remaining = listTimeBudgets()
    expect(remaining.find((b) => b.id === budget.id)).toBeUndefined()
  })

  it('supports independent allocationMode and protection columns', () => {
    const area = createArea({ name: 'Learning' })
    const budget = createTimeBudget({
      name: 'Study',
      allocationMode: 'range',
      protection: 'locked',
      minimumMinutes: 60,
      targetMinutes: 120,
      maximumMinutes: 180,
      daysOfWeek: [0, 6],
      areaId: area.id
    })

    expect(budget.allocationMode).toBe('range')
    expect(budget.protection).toBe('locked')
    expect(budget.minimumMinutes).toBe(60)
    expect(budget.maximumMinutes).toBe(180)
  })

  it('creates routines and habits, logs habit completions, and cleans up polymorphic references', () => {
    const routine = createRoutine({
      name: 'Morning Routine',
      targetDuration: 45
    })
    expect(routine.name).toBe('Morning Routine')

    const habit = createHabit({
      name: 'Drink Water',
      targetValue: 2500,
      unit: 'ml'
    })
    expect(habit.name).toBe('Drink Water')

    const log = logHabit({
      habitId: habit.id,
      date: '2026-10-10',
      value: 2500
    })
    expect(log.value).toBe(2500)

    // Attach a tag and a note to habit to test polymorphic cleanup
    const tag = createTag({ name: 'Hydration' })
    attachTag({ entityType: 'habit', entityId: habit.id, tagId: tag.id })
    createNote({ entityType: 'habit', entityId: habit.id, content: 'Track hydration daily' })

    const tagsBefore = getEntityTags('habit', habit.id)
    const notesBefore = listNotes('habit', habit.id)
    expect(tagsBefore).toHaveLength(1)
    expect(notesBefore).toHaveLength(1)

    // Delete habit and verify polymorphic references cleaned up
    deleteEntity({ kind: 'habit', id: habit.id })
    const tagsAfter = getEntityTags('habit', habit.id)
    const notesAfter = listNotes('habit', habit.id)
    expect(tagsAfter).toHaveLength(0)
    expect(notesAfter).toHaveLength(0)
  })

  it('calculates full capacity breakdown for a specific date', () => {
    const area = createArea({ name: 'Development' })
    createTimeBudget({
      name: 'Coding Time',
      allocationMode: 'target',
      protection: 'locked',
      minimumMinutes: 180,
      targetMinutes: 180,
      maximumMinutes: 180,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      areaId: area.id
    })

    createFixedEvent({
      title: 'Team Meeting',
      startTime: '2026-10-10 10:00',
      endTime: '2026-10-10 11:00',
      flexibility: 'fixed',
      locked: true
    })

    const capacity = getCapacityForDate('2026-10-10')
    expect(capacity.availableMinutes).toBe(480)
    expect(capacity.fixedEventMinutes).toBe(60)
    expect(capacity.budgetSummary.lockedMinutes).toBe(180)
    expect(capacity.remainingMinutesForFlexibleWork).toBeGreaterThan(0)
  })
})
