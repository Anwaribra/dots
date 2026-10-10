import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { runMigrations } from '../src/main/db/migrate'
import * as schema from '../src/main/db/schema'
import { setDatabase } from '../src/main/db/database'
import {
  archiveEntity,
  attachTag,
  createArea,
  createCustomFieldDef,
  createGoal,
  createMilestone,
  createNote,
  createProject,
  createTag,
  createWorkItem,
  createWorkItemType,
  deleteEntity,
  deleteNote,
  detachTag,
  getCustomFieldValues,
  getEntityTags,
  listAreas,
  listCustomFieldDefs,
  listGoals,
  listMilestones,
  listNotes,
  listProjects,
  listTags,
  listWorkItemTypes,
  listWorkItems,
  restoreEntity,
  seedBuiltInWorkItemTypes,
  setCustomFieldValue
} from '../src/main/services/entity-service'

describe('entity service & rules', () => {
  let client: Database.Database

  beforeEach(() => {
    client = new Database(':memory:')
    const db = drizzle(client, { schema })
    setDatabase(db as any)
    const migrationsFolder = path.resolve(process.cwd(), 'drizzle')
    runMigrations(db, migrationsFolder)
    seedBuiltInWorkItemTypes()
  })

  afterEach(() => {
    client.close()
  })

  it('allows creating a goal without an area (nullable areaId)', () => {
    const goal = createGoal({ title: 'Autonomous Goal', areaId: null })
    expect(goal.id).toBeDefined()
    expect(goal.areaId).toBeNull()

    const allGoals = listGoals()
    expect(allGoals.length).toBe(1)
    expect(allGoals[0].title).toBe('Autonomous Goal')
  })

  it('handles custom work item types and custom field definitions/values', () => {
    const customType = createWorkItemType({ name: 'Workout', color: '#ef4444' })
    expect(customType.name).toBe('Workout')

    const fieldDef1 = createCustomFieldDef({
      workItemTypeId: customType.id,
      name: 'Sets',
      fieldType: 'number'
    })
    const fieldDef2 = createCustomFieldDef({
      workItemTypeId: customType.id,
      name: 'Equipment',
      fieldType: 'select',
      options: ['Barbell', 'Dumbbell', 'Machine']
    })

    const defs = listCustomFieldDefs(customType.id)
    expect(defs.length).toBe(2)

    const workItem = createWorkItem({
      title: 'Leg Day Workout',
      workItemTypeId: customType.id
    })

    setCustomFieldValue({ workItemId: workItem.id, definitionId: fieldDef1.id, value: 5 })
    setCustomFieldValue({ workItemId: workItem.id, definitionId: fieldDef2.id, value: 'Barbell' })

    const values = getCustomFieldValues(workItem.id)
    expect(values.length).toBe(2)
    const setsVal = values.find((v) => v.definitionId === fieldDef1.id)
    expect(setsVal?.numberValue).toBe(5)
  })

  it('supports tag management and entity tagging', () => {
    const tag = createTag({ name: 'urgent', color: '#f59e0b' })
    const goal = createGoal({ title: 'Important Milestone Goal' })

    attachTag({ entityType: 'goal', entityId: goal.id, tagId: tag.id })
    let entityTagsList = getEntityTags('goal', goal.id)
    expect(entityTagsList.length).toBe(1)
    expect(entityTagsList[0].name).toBe('urgent')

    detachTag({ entityType: 'goal', entityId: goal.id, tagId: tag.id })
    entityTagsList = getEntityTags('goal', goal.id)
    expect(entityTagsList.length).toBe(0)
  })

  it('supports notes on entities', () => {
    const area = createArea({ name: 'Health' })
    const note = createNote({ entityType: 'area', entityId: area.id, content: 'Remember to drink water' })

    const areaNotes = listNotes('area', area.id)
    expect(areaNotes.length).toBe(1)
    expect(areaNotes[0].content).toBe('Remember to drink water')

    deleteNote(note.id)
    expect(listNotes('area', area.id).length).toBe(0)
  })

  it('handles project deletion choices (detach vs archive child work items)', () => {
    const project = createProject({ title: 'Project X' })
    const item1 = createWorkItem({ title: 'Task 1', projectId: project.id })
    const item2 = createWorkItem({ title: 'Task 2', projectId: project.id })

    // Test detach
    deleteEntity({ kind: 'project', id: project.id, childWorkItemAction: 'detach' })

    const remainingItems = listWorkItems()
    expect(remainingItems.length).toBe(2)
    expect(remainingItems[0].projectId).toBeNull()

    // Test archive on another project
    const project2 = createProject({ title: 'Project Y' })
    const item3 = createWorkItem({ title: 'Task 3', projectId: project2.id })

    deleteEntity({ kind: 'project', id: project2.id, childWorkItemAction: 'archive' })
    const activeItems = listWorkItems()
    expect(activeItems.find((i) => i.id === item3.id)).toBeUndefined()
  })
})
