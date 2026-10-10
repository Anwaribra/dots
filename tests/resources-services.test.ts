import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { runMigrations } from '../src/main/db/migrate'
import * as schema from '../src/main/db/schema'
import { setDatabase } from '../src/main/db/database'
import {
  bulkAddResourceItems,
  createDependency,
  createResource,
  createResourceItem,
  createWorkItem,
  duplicateResource,
  linkResourceItemToWorkItem,
  listResourceItems,
  listResources,
  seedBuiltInWorkItemTypes,
  updateWorkItem
} from '../src/main/services/entity-service'

describe('Stage 03 Resources & Completion Truth (Decision A14)', () => {
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

  it('creates resource and bulk adds items with bulk parser', () => {
    const res = createResource({
      title: 'TypeScript Deep Dive',
      resourceType: 'course',
      orderingMode: 'sequential'
    })
    expect(res.id).toBeDefined()

    const items = bulkAddResourceItems({
      resourceId: res.id,
      items: [
        { title: 'Video 1', estimatedMinutes: 35 },
        { title: 'Video 2', estimatedMinutes: 42 },
        { title: 'Video 3', estimatedMinutes: 28 }
      ]
    })

    expect(items.length).toBe(3)
    const list = listResourceItems(res.id)
    expect(list.length).toBe(3)
    expect(list[0].title).toBe('Video 1')
  })

  it('enforces sequential mode: Item N+1 is marked blocked until Item N is completed', () => {
    const res = createResource({
      title: 'Sequential Course',
      orderingMode: 'sequential'
    })

    const item1 = createResourceItem({ resourceId: res.id, title: 'Lesson 1', status: 'todo' })
    const item2 = createResourceItem({ resourceId: res.id, title: 'Lesson 2', status: 'todo' })

    let items = listResourceItems(res.id)
    const eval1 = items.find((i) => i.id === item1.id)!
    const eval2 = items.find((i) => i.id === item2.id)!

    expect(eval1.isBlocked).toBe(false)
    expect(eval2.isBlocked).toBe(true)
    expect(eval2.effectiveStatus).toBe('blocked')

    // Link item1 to a work item and complete it
    const wi1 = linkResourceItemToWorkItem({ resourceItemId: item1.id })
    updateWorkItem({ id: wi1.id, status: 'completed', progress: 100 })

    items = listResourceItems(res.id)
    const updatedEval1 = items.find((i) => i.id === item1.id)!
    const updatedEval2 = items.find((i) => i.id === item2.id)!

    expect(updatedEval1.effectiveStatus).toBe('completed')
    expect(updatedEval2.isBlocked).toBe(false)
    expect(updatedEval2.effectiveStatus).toBe('todo')
  })

  it('enforces Decision A14: linked resource item derives status/progress from work item', () => {
    const res = createResource({ title: 'Book Chapter' })
    const resItem = createResourceItem({ resourceId: res.id, title: 'Read Chapter 1', status: 'todo' })

    // Before linking, unlinked resource item owns its status
    let list = listResourceItems(res.id)
    expect(list[0].effectiveStatus).toBe('todo')

    // Link to work item
    const workItem = linkResourceItemToWorkItem({ resourceItemId: resItem.id })
    expect(workItem.id).toBeDefined()

    // Update work item status to in_progress with 50% progress
    updateWorkItem({ id: workItem.id, status: 'in_progress', progress: 50 })

    // Check resource item status/progress - MUST be derived from work item!
    list = listResourceItems(res.id)
    expect(list[0].effectiveStatus).toBe('in_progress')
    expect(list[0].effectiveProgress).toBe(50)

    // Complete work item
    updateWorkItem({ id: workItem.id, status: 'completed', progress: 100 })
    list = listResourceItems(res.id)
    expect(list[0].effectiveStatus).toBe('completed')
    expect(list[0].effectiveProgress).toBe(100)
  })

  it('rejects dependency cycle creation with clear error message', () => {
    const wi1 = createWorkItem({ title: 'Task A' })
    const wi2 = createWorkItem({ title: 'Task B' })

    createDependency({ predecessorId: wi1.id, successorId: wi2.id })

    expect(() => {
      createDependency({ predecessorId: wi2.id, successorId: wi1.id })
    }).toThrow(/Dependency cycle detected/)
  })

  it('duplicates a resource and all its items', () => {
    const res = createResource({ title: 'Original Course' })
    createResourceItem({ resourceId: res.id, title: 'Lesson 1' })
    createResourceItem({ resourceId: res.id, title: 'Lesson 2' })

    const copy = duplicateResource({ id: res.id })
    expect(copy.title).toBe('Original Course (Copy)')

    const copyItems = listResourceItems(copy.id)
    expect(copyItems.length).toBe(2)
    expect(copyItems[0].title).toBe('Lesson 1')
  })
})
