import { and, asc, eq, isNull } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { getDatabase } from '../db/database'
import {
  areas,
  availabilityOverrides,
  availabilityRules,
  customFieldDefinitions,
  customFieldValues,
  entityTags,
  fixedEvents,
  goals,
  habitLogs,
  habits,
  milestones,
  notes,
  projects,
  resourceItems,
  resources,
  routines,
  settings,
  tags,
  timeBudgets,
  workItemDependencies,
  workItemTypes,
  workItems
} from '../db/schema'
import {
  archiveEntitySchema,
  attachTagSchema,
  bulkAddResourceItemsSchema,
  createAreaSchema,
  createAvailabilityOverrideSchema,
  createAvailabilityRuleSchema,
  createCustomFieldDefSchema,
  createFixedEventSchema,
  createGoalSchema,
  createHabitSchema,
  createMilestoneSchema,
  createNoteSchema,
  createProjectSchema,
  createResourceItemSchema,
  createResourceSchema,
  createRoutineSchema,
  createTagSchema,
  createTimeBudgetSchema,
  createWorkItemDependencySchema,
  createWorkItemSchema,
  createWorkItemTypeSchema,
  deleteEntitySchema,
  deleteWorkItemDependencySchema,
  linkResourceItemToWorkItemSchema,
  logHabitSchema,
  reorderResourceItemsSchema,
  restoreEntitySchema,
  setCustomFieldValueSchema,
  updateAreaSchema,
  updateCustomFieldDefSchema,
  updateFixedEventSchema,
  updateGoalSchema,
  updateHabitSchema,
  updateMilestoneSchema,
  updateProjectSchema,
  updateResourceItemSchema,
  updateResourceSchema,
  updateRoutineSchema,
  updateTimeBudgetSchema,
  updateWorkItemSchema,
  updateWorkItemTypeSchema,
  type Area,
  type AvailabilityOverride,
  type AvailabilityRule,
  type CustomFieldDefinition,
  type CustomFieldValue,
  type FixedEvent,
  type Goal,
  type Habit,
  type HabitLog,
  type Milestone,
  type Note,
  type Project,
  type Resource,
  type ResourceItem,
  type Routine,
  type Tag,
  type TimeBudget,
  type WorkItem,
  type WorkItemDependency,
  type WorkItemType
} from '../../shared/entities'
import { detectDependencyCycle, evaluateResourceItemsState } from '../../shared/dependency-utils'
import { calculateDayCapacity, type DayCapacityResult } from '../../shared/capacity'
import { expandRecurrenceRule } from '../../shared/recurrence'
import { getSettings } from './settings-service'

const now = (): number => Date.now()

// Seed built-in work item types if missing
export function seedBuiltInWorkItemTypes(): void {
  const db = getDatabase()
  const existing = db.select().from(workItemTypes).all()
  if (existing.length > 0) return

  const builtIns = [
    { name: 'Task', color: '#3b82f6', icon: 'CheckSquare' },
    { name: 'Activity', color: '#6366f1', icon: 'Activity' },
    { name: 'Study', color: '#8b5cf6', icon: 'BookOpen' },
    { name: 'Reading', color: '#ec4899', icon: 'Book' },
    { name: 'Video', color: '#f43f5e', icon: 'Video' },
    { name: 'Article', color: '#f97316', icon: 'FileText' },
    { name: 'Exercise', color: '#eab308', icon: 'Dumbbell' },
    { name: 'Practice', color: '#10b981', icon: 'Target' },
    { name: 'Assignment', color: '#14b8a6', icon: 'FileCheck' },
    { name: 'Review', color: '#06b6d4', icon: 'RotateCw' },
    { name: 'Meeting', color: '#0284c7', icon: 'Users' },
    { name: 'Custom', color: '#64748b', icon: 'Sparkles' }
  ]

  const timestamp = now()
  builtIns.forEach((item, index) => {
    db.insert(workItemTypes).values({
      id: randomUUID(),
      name: item.name,
      builtIn: true,
      color: item.color,
      icon: item.icon,
      sortOrder: index,
      createdAt: timestamp,
      updatedAt: timestamp,
      archivedAt: null
    }).run()
  })
}

// Seed default availability rules (0-6 days)
export function seedDefaultAvailabilityRules(): void {
  const db = getDatabase()
  const existing = db.select().from(availabilityRules).all()
  if (existing.length > 0) return

  const timestamp = now()
  for (let i = 0; i <= 6; i++) {
    db.insert(availabilityRules).values({
      id: randomUUID(),
      dayOfWeek: i,
      startTime: '09:00',
      endTime: '17:00',
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp
    }).run()
  }
}

// Areas
export function listAreas(): Area[] {
  seedBuiltInWorkItemTypes()
  seedDefaultAvailabilityRules()
  return getDatabase()
    .select()
    .from(areas)
    .where(isNull(areas.archivedAt))
    .orderBy(asc(areas.sortOrder))
    .all() as unknown as Area[]
}

export function createArea(input: unknown): Area {
  const value = createAreaSchema.parse(input)
  const time = now()
  const current = listAreas()
  const row = {
    id: randomUUID(),
    name: value.name,
    description: value.description ?? null,
    icon: value.icon ?? null,
    color: value.color ?? null,
    sortOrder: current.length,
    createdAt: time,
    updatedAt: time,
    archivedAt: null
  }
  getDatabase().insert(areas).values(row).run()
  return row as Area
}

export function updateArea(input: unknown): Area {
  const value = updateAreaSchema.parse(input)
  const time = now()
  const db = getDatabase()
  const existing = db.select().from(areas).where(eq(areas.id, value.id)).get()
  if (!existing) throw new Error('Area not found')

  const updated = {
    ...existing,
    name: value.name ?? existing.name,
    description: value.description !== undefined ? value.description : existing.description,
    icon: value.icon !== undefined ? value.icon : existing.icon,
    color: value.color !== undefined ? value.color : existing.color,
    updatedAt: time
  }
  db.update(areas).set(updated).where(eq(areas.id, value.id)).run()
  return updated as unknown as Area
}

// Goals
export function listGoals(): Goal[] {
  return getDatabase()
    .select()
    .from(goals)
    .where(isNull(goals.archivedAt))
    .orderBy(asc(goals.createdAt))
    .all() as unknown as Goal[]
}

export function createGoal(input: unknown): Goal {
  const value = createGoalSchema.parse(input)
  const time = now()
  const row = {
    id: randomUUID(),
    title: value.title,
    description: value.description ?? null,
    areaId: value.areaId ?? null,
    priority: value.priority,
    status: value.status,
    startDate: value.startDate ?? null,
    targetDate: value.targetDate ?? null,
    measurementType: value.measurementType,
    progressMode: value.progressMode,
    targetValue: value.targetValue ?? null,
    currentValue: value.currentValue,
    unit: value.unit ?? null,
    createdAt: time,
    updatedAt: time,
    archivedAt: null
  }
  getDatabase().insert(goals).values(row).run()
  return row as Goal
}

export function updateGoal(input: unknown): Goal {
  const value = updateGoalSchema.parse(input)
  const time = now()
  const db = getDatabase()
  const existing = db.select().from(goals).where(eq(goals.id, value.id)).get()
  if (!existing) throw new Error('Goal not found')

  const updated = {
    ...existing,
    title: value.title ?? existing.title,
    description: value.description !== undefined ? value.description : existing.description,
    areaId: value.areaId !== undefined ? value.areaId : existing.areaId,
    priority: value.priority ?? existing.priority,
    status: value.status ?? existing.status,
    startDate: value.startDate !== undefined ? value.startDate : existing.startDate,
    targetDate: value.targetDate !== undefined ? value.targetDate : existing.targetDate,
    measurementType: value.measurementType ?? existing.measurementType,
    progressMode: value.progressMode ?? existing.progressMode,
    targetValue: value.targetValue !== undefined ? value.targetValue : existing.targetValue,
    currentValue: value.currentValue !== undefined ? value.currentValue : existing.currentValue,
    unit: value.unit !== undefined ? value.unit : existing.unit,
    updatedAt: time
  }
  db.update(goals).set(updated).where(eq(goals.id, value.id)).run()
  return updated as unknown as Goal
}

// Milestones
export function listMilestones(goalId?: string): Milestone[] {
  const db = getDatabase()
  if (goalId) {
    return db
      .select()
      .from(milestones)
      .where(and(eq(milestones.goalId, goalId), isNull(milestones.archivedAt)))
      .orderBy(asc(milestones.orderIndex))
      .all() as unknown as Milestone[]
  }
  return db
    .select()
    .from(milestones)
    .where(isNull(milestones.archivedAt))
    .orderBy(asc(milestones.orderIndex))
    .all() as unknown as Milestone[]
}

export function createMilestone(input: unknown): Milestone {
  const value = createMilestoneSchema.parse(input)
  const time = now()
  const current = listMilestones(value.goalId)
  const row = {
    id: randomUUID(),
    goalId: value.goalId,
    title: value.title,
    description: value.description ?? null,
    targetDate: value.targetDate ?? null,
    status: value.status,
    progress: value.progress,
    orderIndex: current.length,
    createdAt: time,
    updatedAt: time,
    archivedAt: null
  }
  getDatabase().insert(milestones).values(row).run()
  return row as Milestone
}

export function updateMilestone(input: unknown): Milestone {
  const value = updateMilestoneSchema.parse(input)
  const time = now()
  const db = getDatabase()
  const existing = db.select().from(milestones).where(eq(milestones.id, value.id)).get()
  if (!existing) throw new Error('Milestone not found')

  const updated = {
    ...existing,
    title: value.title ?? existing.title,
    description: value.description !== undefined ? value.description : existing.description,
    targetDate: value.targetDate !== undefined ? value.targetDate : existing.targetDate,
    status: value.status ?? existing.status,
    progress: value.progress !== undefined ? value.progress : existing.progress,
    updatedAt: time
  }
  db.update(milestones).set(updated).where(eq(milestones.id, value.id)).run()
  return updated as unknown as Milestone
}

// Projects
export function listProjects(): Project[] {
  return getDatabase()
    .select()
    .from(projects)
    .where(isNull(projects.archivedAt))
    .orderBy(asc(projects.createdAt))
    .all() as unknown as Project[]
}

export function createProject(input: unknown): Project {
  const value = createProjectSchema.parse(input)
  const time = now()
  const row = {
    id: randomUUID(),
    title: value.title,
    description: value.description ?? null,
    areaId: value.areaId ?? null,
    goalId: value.goalId ?? null,
    milestoneId: value.milestoneId ?? null,
    parentProjectId: value.parentProjectId ?? null,
    priority: value.priority,
    status: value.status,
    startDate: value.startDate ?? null,
    deadline: value.deadline ?? null,
    estimatedMinutes: value.estimatedMinutes,
    completedMinutes: 0,
    progress: 0,
    createdAt: time,
    updatedAt: time,
    archivedAt: null
  }
  getDatabase().insert(projects).values(row).run()
  return row as Project
}

export function updateProject(input: unknown): Project {
  const value = updateProjectSchema.parse(input)
  const time = now()
  const db = getDatabase()
  const existing = db.select().from(projects).where(eq(projects.id, value.id)).get()
  if (!existing) throw new Error('Project not found')

  const updated = {
    ...existing,
    title: value.title ?? existing.title,
    description: value.description !== undefined ? value.description : existing.description,
    areaId: value.areaId !== undefined ? value.areaId : existing.areaId,
    goalId: value.goalId !== undefined ? value.goalId : existing.goalId,
    milestoneId: value.milestoneId !== undefined ? value.milestoneId : existing.milestoneId,
    parentProjectId: value.parentProjectId !== undefined ? value.parentProjectId : existing.parentProjectId,
    priority: value.priority ?? existing.priority,
    status: value.status ?? existing.status,
    startDate: value.startDate !== undefined ? value.startDate : existing.startDate,
    deadline: value.deadline !== undefined ? value.deadline : existing.deadline,
    estimatedMinutes: value.estimatedMinutes !== undefined ? value.estimatedMinutes : existing.estimatedMinutes,
    completedMinutes: value.completedMinutes !== undefined ? value.completedMinutes : existing.completedMinutes,
    progress: value.progress !== undefined ? value.progress : existing.progress,
    updatedAt: time
  }
  db.update(projects).set(updated).where(eq(projects.id, value.id)).run()
  return updated as unknown as Project
}

// Work Item Types
export function listWorkItemTypes(): WorkItemType[] {
  seedBuiltInWorkItemTypes()
  return getDatabase()
    .select()
    .from(workItemTypes)
    .where(isNull(workItemTypes.archivedAt))
    .orderBy(asc(workItemTypes.sortOrder))
    .all() as unknown as WorkItemType[]
}

export function createWorkItemType(input: unknown): WorkItemType {
  const value = createWorkItemTypeSchema.parse(input)
  const time = now()
  const current = listWorkItemTypes()
  const row = {
    id: randomUUID(),
    name: value.name,
    builtIn: value.builtIn,
    color: value.color ?? null,
    icon: value.icon ?? null,
    sortOrder: current.length,
    createdAt: time,
    updatedAt: time,
    archivedAt: null
  }
  getDatabase().insert(workItemTypes).values(row).run()
  return row as WorkItemType
}

export function updateWorkItemType(input: unknown): WorkItemType {
  const value = updateWorkItemTypeSchema.parse(input)
  const time = now()
  const db = getDatabase()
  const existing = db.select().from(workItemTypes).where(eq(workItemTypes.id, value.id)).get()
  if (!existing) throw new Error('Work Item Type not found')

  const updated = {
    ...existing,
    name: value.name ?? existing.name,
    color: value.color !== undefined ? value.color : existing.color,
    icon: value.icon !== undefined ? value.icon : existing.icon,
    updatedAt: time
  }
  db.update(workItemTypes).set(updated).where(eq(workItemTypes.id, value.id)).run()
  return updated as unknown as WorkItemType
}

// Custom Field Definitions
export function listCustomFieldDefs(workItemTypeId?: string): CustomFieldDefinition[] {
  const db = getDatabase()
  if (workItemTypeId) {
    return db
      .select()
      .from(customFieldDefinitions)
      .where(eq(customFieldDefinitions.workItemTypeId, workItemTypeId))
      .orderBy(asc(customFieldDefinitions.sortOrder))
      .all()
      .map((row) => ({
        ...row,
        options: row.options ? JSON.parse(row.options) : null
      })) as CustomFieldDefinition[]
  }
  return db
    .select()
    .from(customFieldDefinitions)
    .orderBy(asc(customFieldDefinitions.sortOrder))
    .all()
    .map((row) => ({
      ...row,
      options: row.options ? JSON.parse(row.options) : null
    })) as CustomFieldDefinition[]
}

export function createCustomFieldDef(input: unknown): CustomFieldDefinition {
  const value = createCustomFieldDefSchema.parse(input)
  const time = now()
  const current = listCustomFieldDefs(value.workItemTypeId)
  const row = {
    id: randomUUID(),
    workItemTypeId: value.workItemTypeId,
    name: value.name,
    fieldType: value.fieldType,
    options: value.options ? JSON.stringify(value.options) : null,
    required: value.required,
    sortOrder: current.length,
    createdAt: time,
    updatedAt: time
  }
  getDatabase().insert(customFieldDefinitions).values(row).run()
  return {
    ...row,
    options: value.options ?? null
  } as CustomFieldDefinition
}

export function updateCustomFieldDef(input: unknown): CustomFieldDefinition {
  const value = updateCustomFieldDefSchema.parse(input)
  const time = now()
  const db = getDatabase()
  const existing = db.select().from(customFieldDefinitions).where(eq(customFieldDefinitions.id, value.id)).get()
  if (!existing) throw new Error('Custom Field Definition not found')

  const updatedRow = {
    ...existing,
    name: value.name ?? existing.name,
    fieldType: value.fieldType ?? existing.fieldType,
    options: value.options !== undefined ? (value.options ? JSON.stringify(value.options) : null) : existing.options,
    required: value.required !== undefined ? value.required : existing.required,
    updatedAt: time
  }
  db.update(customFieldDefinitions).set(updatedRow).where(eq(customFieldDefinitions.id, value.id)).run()
  return {
    ...updatedRow,
    options: updatedRow.options ? JSON.parse(updatedRow.options) : null
  } as CustomFieldDefinition
}

// Custom Field Values
export function getCustomFieldValues(workItemId: string): CustomFieldValue[] {
  return getDatabase()
    .select()
    .from(customFieldValues)
    .where(eq(customFieldValues.workItemId, workItemId))
    .all() as CustomFieldValue[]
}

export function setCustomFieldValue(input: unknown): CustomFieldValue {
  const value = setCustomFieldValueSchema.parse(input)
  const time = now()
  const db = getDatabase()

  const def = db.select().from(customFieldDefinitions).where(eq(customFieldDefinitions.id, value.definitionId)).get()
  if (!def) throw new Error('Custom Field Definition not found')

  const existing = db
    .select()
    .from(customFieldValues)
    .where(and(eq(customFieldValues.workItemId, value.workItemId), eq(customFieldValues.definitionId, value.definitionId)))
    .get()

  const textVal = typeof value.value === 'string' && def.fieldType === 'text' ? value.value : null
  const numVal = typeof value.value === 'number' && def.fieldType === 'number' ? value.value : null
  const boolVal = typeof value.value === 'boolean' && def.fieldType === 'boolean' ? value.value : null
  const dateVal = typeof value.value === 'string' && def.fieldType === 'date' ? value.value : null
  const selectVal = typeof value.value === 'string' && def.fieldType === 'select' ? value.value : null

  if (existing) {
    const updated = {
      ...existing,
      textValue: textVal,
      numberValue: numVal,
      booleanValue: boolVal,
      dateValue: dateVal,
      selectValue: selectVal,
      updatedAt: time
    }
    db.update(customFieldValues).set(updated).where(eq(customFieldValues.id, existing.id)).run()
    return updated as CustomFieldValue
  } else {
    const row = {
      id: randomUUID(),
      workItemId: value.workItemId,
      definitionId: value.definitionId,
      textValue: textVal,
      numberValue: numVal,
      booleanValue: boolVal,
      dateValue: dateVal,
      selectValue: selectVal,
      createdAt: time,
      updatedAt: time
    }
    db.insert(customFieldValues).values(row).run()
    return row as CustomFieldValue
  }
}

// Work Items
export function listWorkItems(): WorkItem[] {
  return getDatabase()
    .select()
    .from(workItems)
    .where(isNull(workItems.archivedAt))
    .orderBy(asc(workItems.createdAt))
    .all() as unknown as WorkItem[]
}

export function createWorkItem(input: unknown): WorkItem {
  const value = createWorkItemSchema.parse(input)
  const time = now()
  const row = {
    id: randomUUID(),
    title: value.title,
    description: value.description ?? null,
    projectId: value.projectId ?? null,
    goalId: value.goalId ?? null,
    areaId: value.areaId ?? null,
    parentId: value.parentId ?? null,
    workItemTypeId: value.workItemTypeId ?? null,
    status: value.status,
    priority: value.priority,
    estimatedMinutes: value.estimatedMinutes,
    actualMinutes: value.actualMinutes,
    deadline: value.deadline ?? null,
    preferredDate: value.preferredDate ?? null,
    preferredStartTime: value.preferredStartTime ?? null,
    preferredEndTime: value.preferredEndTime ?? null,
    energyLevel: value.energyLevel ?? null,
    flexibility: value.flexibility,
    progress: value.progress,
    orderIndex: 0,
    recurrenceRule: value.recurrenceRule ?? null,
    createdAt: time,
    updatedAt: time,
    archivedAt: null
  }
  getDatabase().insert(workItems).values(row).run()

  if (value.customFieldValues) {
    for (const [defId, val] of Object.entries(value.customFieldValues)) {
      if (val !== undefined) {
        setCustomFieldValue({ workItemId: row.id, definitionId: defId, value: val })
      }
    }
  }

  return row as WorkItem
}

export function updateWorkItem(input: unknown): WorkItem {
  const value = updateWorkItemSchema.parse(input)
  const time = now()
  const db = getDatabase()
  const existing = db.select().from(workItems).where(eq(workItems.id, value.id)).get()
  if (!existing) throw new Error('Work Item not found')

  const updated = {
    ...existing,
    title: value.title ?? existing.title,
    description: value.description !== undefined ? value.description : existing.description,
    projectId: value.projectId !== undefined ? value.projectId : existing.projectId,
    goalId: value.goalId !== undefined ? value.goalId : existing.goalId,
    areaId: value.areaId !== undefined ? value.areaId : existing.areaId,
    parentId: value.parentId !== undefined ? value.parentId : existing.parentId,
    workItemTypeId: value.workItemTypeId !== undefined ? value.workItemTypeId : existing.workItemTypeId,
    status: value.status ?? existing.status,
    priority: value.priority ?? existing.priority,
    estimatedMinutes: value.estimatedMinutes !== undefined ? value.estimatedMinutes : existing.estimatedMinutes,
    actualMinutes: value.actualMinutes !== undefined ? value.actualMinutes : existing.actualMinutes,
    deadline: value.deadline !== undefined ? value.deadline : existing.deadline,
    preferredDate: value.preferredDate !== undefined ? value.preferredDate : existing.preferredDate,
    preferredStartTime: value.preferredStartTime !== undefined ? value.preferredStartTime : existing.preferredStartTime,
    preferredEndTime: value.preferredEndTime !== undefined ? value.preferredEndTime : existing.preferredEndTime,
    energyLevel: value.energyLevel !== undefined ? value.energyLevel : existing.energyLevel,
    flexibility: value.flexibility ?? existing.flexibility,
    progress: value.progress !== undefined ? value.progress : existing.progress,
    recurrenceRule: value.recurrenceRule !== undefined ? value.recurrenceRule : existing.recurrenceRule,
    updatedAt: time
  }
  db.update(workItems).set(updated).where(eq(workItems.id, value.id)).run()

  if (value.customFieldValues) {
    for (const [defId, val] of Object.entries(value.customFieldValues)) {
      if (val !== undefined) {
        setCustomFieldValue({ workItemId: existing.id, definitionId: defId, value: val })
      }
    }
  }

  return updated as unknown as WorkItem
}

// Stage 03 Services: Resources
export function listResources(): Resource[] {
  return getDatabase()
    .select()
    .from(resources)
    .where(isNull(resources.archivedAt))
    .orderBy(asc(resources.createdAt))
    .all() as unknown as Resource[]
}

export function getResource(id: string): Resource {
  const row = getDatabase().select().from(resources).where(eq(resources.id, id)).get()
  if (!row) throw new Error('Resource not found')
  return row as unknown as Resource
}

export function createResource(input: unknown): Resource {
  const value = createResourceSchema.parse(input)
  const time = now()
  const row = {
    id: randomUUID(),
    title: value.title,
    description: value.description ?? null,
    resourceType: value.resourceType,
    orderingMode: value.orderingMode,
    areaId: value.areaId ?? null,
    goalId: value.goalId ?? null,
    projectId: value.projectId ?? null,
    createdAt: time,
    updatedAt: time,
    archivedAt: null
  }
  getDatabase().insert(resources).values(row).run()
  return row as Resource
}

export function updateResource(input: unknown): Resource {
  const value = updateResourceSchema.parse(input)
  const time = now()
  const db = getDatabase()
  const existing = db.select().from(resources).where(eq(resources.id, value.id)).get()
  if (!existing) throw new Error('Resource not found')

  const updated = {
    ...existing,
    title: value.title ?? existing.title,
    description: value.description !== undefined ? value.description : existing.description,
    resourceType: value.resourceType ?? existing.resourceType,
    orderingMode: value.orderingMode ?? existing.orderingMode,
    areaId: value.areaId !== undefined ? value.areaId : existing.areaId,
    goalId: value.goalId !== undefined ? value.goalId : existing.goalId,
    projectId: value.projectId !== undefined ? value.projectId : existing.projectId,
    updatedAt: time
  }
  db.update(resources).set(updated).where(eq(resources.id, value.id)).run()
  return updated as unknown as Resource
}

export function duplicateResource(input: { id: string }): Resource {
  const db = getDatabase()
  const target = getResource(input.id)
  const time = now()

  const newRes = createResource({
    title: `${target.title} (Copy)`,
    description: target.description,
    resourceType: target.resourceType,
    orderingMode: target.orderingMode,
    areaId: target.areaId,
    goalId: target.goalId,
    projectId: target.projectId
  })

  const items = db
    .select()
    .from(resourceItems)
    .where(and(eq(resourceItems.resourceId, target.id), isNull(resourceItems.archivedAt)))
    .orderBy(asc(resourceItems.orderIndex))
    .all()

  const idMap = new Map<string, string>()
  items.forEach((item) => {
    idMap.set(item.id, randomUUID())
  })

  items.forEach((item) => {
    const newId = idMap.get(item.id)!
    const newParentId = item.parentId ? idMap.get(item.parentId) || null : null
    db.insert(resourceItems).values({
      id: newId,
      resourceId: newRes.id,
      parentId: newParentId,
      title: item.title,
      itemType: item.itemType,
      sourceUrl: item.sourceUrl,
      estimatedMinutes: item.estimatedMinutes,
      orderIndex: item.orderIndex,
      status: 'todo',
      progress: 0,
      notes: item.notes,
      workItemId: null,
      createdAt: time,
      updatedAt: time,
      archivedAt: null
    }).run()
  })

  return newRes
}

export function listResourceItems(resourceId: string): ResourceItem[] {
  const db = getDatabase()
  const res = db.select().from(resources).where(eq(resources.id, resourceId)).get()
  if (!res) return []

  const items = db
    .select()
    .from(resourceItems)
    .where(and(eq(resourceItems.resourceId, resourceId), isNull(resourceItems.archivedAt)))
    .orderBy(asc(resourceItems.orderIndex))
    .all()

  const workItemsMap = new Map<string, { id: string; status: string; progress: number; actualMinutes: number }>()
  for (const item of items) {
    if (item.workItemId) {
      const wi = db.select().from(workItems).where(eq(workItems.id, item.workItemId)).get()
      if (wi) {
        workItemsMap.set(wi.id, {
          id: wi.id,
          status: wi.status,
          progress: wi.progress,
          actualMinutes: wi.actualMinutes
        })
      }
    }
  }

  const deps = db.select().from(workItemDependencies).all()
  const depEdges = deps.map((d) => ({ predecessorId: d.predecessorId, successorId: d.successorId }))

  const titleMap = new Map<string, string>()
  items.forEach((i) => titleMap.set(i.id, i.title))

  const evaluatedMap = evaluateResourceItemsState(
    res.orderingMode as any,
    items as any,
    depEdges,
    workItemsMap,
    titleMap
  )

  return items.map((item) => {
    const evalData = evaluatedMap.get(item.id)
    return {
      ...item,
      effectiveStatus: evalData?.effectiveStatus ?? item.status,
      effectiveProgress: evalData?.effectiveProgress ?? item.progress,
      effectiveActualMinutes: evalData?.effectiveActualMinutes ?? 0,
      isBlocked: evalData?.isBlocked ?? false,
      blockedByTitle: evalData?.blockedByTitle
    } as unknown as ResourceItem
  })
}

export function createResourceItem(input: unknown): ResourceItem {
  const value = createResourceItemSchema.parse(input)
  const time = now()
  const existingItems = listResourceItems(value.resourceId)
  const row = {
    id: randomUUID(),
    resourceId: value.resourceId,
    parentId: value.parentId ?? null,
    title: value.title,
    itemType: value.itemType,
    sourceUrl: value.sourceUrl ?? null,
    estimatedMinutes: value.estimatedMinutes,
    orderIndex: existingItems.length,
    status: value.status,
    progress: value.progress,
    notes: value.notes ?? null,
    workItemId: value.workItemId ?? null,
    createdAt: time,
    updatedAt: time,
    archivedAt: null
  }
  getDatabase().insert(resourceItems).values(row).run()
  return row as unknown as ResourceItem
}

export function updateResourceItem(input: unknown): ResourceItem {
  const value = updateResourceItemSchema.parse(input)
  const time = now()
  const db = getDatabase()
  const existing = db.select().from(resourceItems).where(eq(resourceItems.id, value.id)).get()
  if (!existing) throw new Error('Resource Item not found')

  const updated = {
    ...existing,
    title: value.title ?? existing.title,
    itemType: value.itemType ?? existing.itemType,
    parentId: value.parentId !== undefined ? value.parentId : existing.parentId,
    sourceUrl: value.sourceUrl !== undefined ? value.sourceUrl : existing.sourceUrl,
    estimatedMinutes: value.estimatedMinutes !== undefined ? value.estimatedMinutes : existing.estimatedMinutes,
    orderIndex: value.orderIndex !== undefined ? value.orderIndex : existing.orderIndex,
    status: value.status ?? existing.status,
    progress: value.progress !== undefined ? value.progress : existing.progress,
    notes: value.notes !== undefined ? value.notes : existing.notes,
    workItemId: value.workItemId !== undefined ? value.workItemId : existing.workItemId,
    updatedAt: time
  }
  db.update(resourceItems).set(updated).where(eq(resourceItems.id, value.id)).run()
  return updated as unknown as ResourceItem
}

export function bulkAddResourceItems(input: unknown): ResourceItem[] {
  const value = bulkAddResourceItemsSchema.parse(input)
  const time = now()
  const db = getDatabase()
  const currentItems = listResourceItems(value.resourceId)
  let nextIndex = currentItems.length

  const created: ResourceItem[] = []

  for (const item of value.items) {
    const row = {
      id: randomUUID(),
      resourceId: value.resourceId,
      parentId: value.parentId ?? null,
      title: item.title,
      itemType: item.itemType || 'item',
      sourceUrl: null,
      estimatedMinutes: item.estimatedMinutes,
      orderIndex: nextIndex++,
      status: 'todo',
      progress: 0,
      notes: null,
      workItemId: null,
      createdAt: time,
      updatedAt: time,
      archivedAt: null
    }
    db.insert(resourceItems).values(row).run()
    created.push(row as unknown as ResourceItem)
  }

  return created
}

export function reorderResourceItems(input: unknown): void {
  const value = reorderResourceItemsSchema.parse(input)
  const db = getDatabase()
  const time = now()

  value.itemIdsInOrder.forEach((id, index) => {
    db.update(resourceItems)
      .set({ orderIndex: index, updatedAt: time })
      .where(eq(resourceItems.id, id))
      .run()
  })
}

export function linkResourceItemToWorkItem(input: unknown): WorkItem {
  const value = linkResourceItemToWorkItemSchema.parse(input)
  const db = getDatabase()

  const item = db.select().from(resourceItems).where(eq(resourceItems.id, value.resourceItemId)).get()
  if (!item) throw new Error('Resource Item not found')

  if (item.workItemId) {
    const existing = db.select().from(workItems).where(eq(workItems.id, item.workItemId)).get()
    if (existing) return existing as unknown as WorkItem
  }

  const res = getResource(item.resourceId)
  const time = now()

  const newWorkItem = createWorkItem({
    title: value.title || item.title,
    description: `Generated from resource item in ${res.title}`,
    estimatedMinutes: item.estimatedMinutes,
    projectId: value.projectId ?? res.projectId ?? null,
    goalId: value.goalId ?? res.goalId ?? null,
    areaId: value.areaId ?? res.areaId ?? null,
    status: item.status
  })

  db.update(resourceItems)
    .set({ workItemId: newWorkItem.id, updatedAt: time })
    .where(eq(resourceItems.id, item.id))
    .run()

  return newWorkItem
}

// Stage 03 Services: Work Item Dependencies & Cycle Detection
export function listDependencies(): WorkItemDependency[] {
  return getDatabase().select().from(workItemDependencies).all() as unknown as WorkItemDependency[]
}

export function createDependency(input: unknown): WorkItemDependency {
  const value = createWorkItemDependencySchema.parse(input)
  const existing = listDependencies()

  const cycleCheck = detectDependencyCycle(
    existing.map((d) => ({ predecessorId: d.predecessorId, successorId: d.successorId })),
    { predecessorId: value.predecessorId, successorId: value.successorId }
  )

  if (cycleCheck.hasCycle) {
    const pathStr = cycleCheck.path ? cycleCheck.path.join(' -> ') : ''
    throw new Error(`Dependency cycle detected: ${pathStr || 'A cycle would be created'}`)
  }

  const time = now()
  const row = {
    id: randomUUID(),
    predecessorId: value.predecessorId,
    successorId: value.successorId,
    predecessorType: value.predecessorType,
    successorType: value.successorType,
    dependencyType: value.dependencyType,
    createdAt: time,
    updatedAt: time
  }
  getDatabase().insert(workItemDependencies).values(row).run()
  return row as WorkItemDependency
}

export function deleteDependency(input: unknown): void {
  const value = deleteWorkItemDependencySchema.parse(input)
  getDatabase().delete(workItemDependencies).where(eq(workItemDependencies.id, value.id)).run()
}

// Stage 04 Services: Time Model (Availability, Capacity, Fixed Events, Time Budgets, Routines, Habits)
export function listAvailabilityRules(): AvailabilityRule[] {
  seedDefaultAvailabilityRules()
  return getDatabase()
    .select()
    .from(availabilityRules)
    .orderBy(asc(availabilityRules.dayOfWeek))
    .all() as unknown as AvailabilityRule[]
}

export function updateAvailabilityRules(input: { rules: unknown[] }): AvailabilityRule[] {
  const db = getDatabase()
  const time = now()
  for (const r of input.rules) {
    const parsed = createAvailabilityRuleSchema.parse(r)
    const existing = db.select().from(availabilityRules).where(eq(availabilityRules.dayOfWeek, parsed.dayOfWeek)).get()
    if (existing) {
      db.update(availabilityRules).set({ ...parsed, updatedAt: time }).where(eq(availabilityRules.id, existing.id)).run()
    } else {
      db.insert(availabilityRules).values({ id: randomUUID(), ...parsed, createdAt: time, updatedAt: time }).run()
    }
  }
  return listAvailabilityRules()
}

export function listAvailabilityOverrides(): AvailabilityOverride[] {
  return getDatabase().select().from(availabilityOverrides).orderBy(asc(availabilityOverrides.date)).all() as unknown as AvailabilityOverride[]
}

export function createAvailabilityOverride(input: unknown): AvailabilityOverride {
  const parsed = createAvailabilityOverrideSchema.parse(input)
  const time = now()
  const row = { id: randomUUID(), ...parsed, notes: parsed.notes ?? null, createdAt: time, updatedAt: time }
  getDatabase().insert(availabilityOverrides).values(row).run()
  return row as AvailabilityOverride
}

export function deleteAvailabilityOverride(id: string): void {
  getDatabase().delete(availabilityOverrides).where(eq(availabilityOverrides.id, id)).run()
}

export function listFixedEvents(): FixedEvent[] {
  return getDatabase()
    .select()
    .from(fixedEvents)
    .where(isNull(fixedEvents.archivedAt))
    .orderBy(asc(fixedEvents.startTime))
    .all() as unknown as FixedEvent[]
}

export function createFixedEvent(input: unknown): FixedEvent {
  const parsed = createFixedEventSchema.parse(input)
  const time = now()
  const row = {
    id: randomUUID(),
    title: parsed.title,
    startTime: parsed.startTime,
    endTime: parsed.endTime,
    recurrenceRule: parsed.recurrenceRule ?? null,
    flexibility: parsed.flexibility,
    locked: parsed.locked,
    notes: parsed.notes ?? null,
    createdAt: time,
    updatedAt: time,
    archivedAt: null
  }
  getDatabase().insert(fixedEvents).values(row).run()
  return row as FixedEvent
}

export function updateFixedEvent(input: unknown): FixedEvent {
  const parsed = updateFixedEventSchema.parse(input)
  const time = now()
  const db = getDatabase()
  const existing = db.select().from(fixedEvents).where(eq(fixedEvents.id, parsed.id)).get()
  if (!existing) throw new Error('Fixed event not found')

  const updated = {
    ...existing,
    title: parsed.title ?? existing.title,
    startTime: parsed.startTime ?? existing.startTime,
    endTime: parsed.endTime ?? existing.endTime,
    recurrenceRule: parsed.recurrenceRule !== undefined ? parsed.recurrenceRule : existing.recurrenceRule,
    flexibility: parsed.flexibility ?? existing.flexibility,
    locked: parsed.locked !== undefined ? parsed.locked : existing.locked,
    notes: parsed.notes !== undefined ? parsed.notes : existing.notes,
    updatedAt: time
  }
  db.update(fixedEvents).set(updated).where(eq(fixedEvents.id, parsed.id)).run()
  return updated as unknown as FixedEvent
}

export function getFixedEventConflicts(date: string): Array<{ eventA: FixedEvent; eventB: FixedEvent }> {
  const events = listFixedEvents().filter((fe) => {
    if (fe.recurrenceRule) {
      const dates = expandRecurrenceRule(fe.recurrenceRule, date, date, fe.startTime.substring(0, 10))
      return dates.includes(date)
    }
    return fe.startTime.startsWith(date)
  })

  function parseMinutes(timeStr: string): number {
    const timePart = timeStr.includes(' ') ? timeStr.split(' ')[1] : timeStr
    const [h, m] = timePart.split(':').map(Number)
    return (h || 0) * 60 + (m || 0)
  }

  const conflicts: Array<{ eventA: FixedEvent; eventB: FixedEvent }> = []
  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const a = events[i]
      const b = events[j]
      const aStart = parseMinutes(a.startTime)
      const aEnd = parseMinutes(a.endTime)
      const bStart = parseMinutes(b.startTime)
      const bEnd = parseMinutes(b.endTime)
      if (Math.max(aStart, bStart) < Math.min(aEnd, bEnd)) {
        conflicts.push({ eventA: a, eventB: b })
      }
    }
  }
  return conflicts
}

// Time Budgets (Decision A10: Real FKs, exactly ONE set via CHECK)
export function listTimeBudgets(): TimeBudget[] {
  return getDatabase()
    .select()
    .from(timeBudgets)
    .where(isNull(timeBudgets.archivedAt))
    .all()
    .map((row) => ({
      ...row,
      daysOfWeek: JSON.parse(row.daysOfWeek)
    })) as unknown as TimeBudget[]
}

export function createTimeBudget(input: unknown): TimeBudget {
  const parsed = createTimeBudgetSchema.parse(input)
  const time = now()

  // Validate exactly ONE scope FK is provided
  const scopes = [parsed.areaId, parsed.goalId, parsed.projectId, parsed.workItemTypeId].filter(Boolean)
  if (scopes.length !== 1) {
    throw new Error('Time budget must target exactly one scope (areaId, goalId, projectId, or workItemTypeId)')
  }

  const row = {
    id: randomUUID(),
    name: parsed.name,
    allocationMode: parsed.allocationMode,
    protection: parsed.protection,
    minimumMinutes: parsed.minimumMinutes,
    targetMinutes: parsed.targetMinutes,
    maximumMinutes: parsed.maximumMinutes,
    daysOfWeek: JSON.stringify(parsed.daysOfWeek),
    priority: parsed.priority,
    startDate: parsed.startDate ?? null,
    endDate: parsed.endDate ?? null,
    areaId: parsed.areaId ?? null,
    goalId: parsed.goalId ?? null,
    projectId: parsed.projectId ?? null,
    workItemTypeId: parsed.workItemTypeId ?? null,
    createdAt: time,
    updatedAt: time,
    archivedAt: null
  }
  getDatabase().insert(timeBudgets).values(row).run()
  return { ...row, daysOfWeek: parsed.daysOfWeek } as unknown as TimeBudget
}

export function updateTimeBudget(input: unknown): TimeBudget {
  const parsed = updateTimeBudgetSchema.parse(input)
  const time = now()
  const db = getDatabase()
  const existing = db.select().from(timeBudgets).where(eq(timeBudgets.id, parsed.id)).get()
  if (!existing) throw new Error('Time budget not found')

  const targetAreaId = parsed.areaId !== undefined ? parsed.areaId : existing.areaId
  const targetGoalId = parsed.goalId !== undefined ? parsed.goalId : existing.goalId
  const targetProjectId = parsed.projectId !== undefined ? parsed.projectId : existing.projectId
  const targetWorkItemTypeId = parsed.workItemTypeId !== undefined ? parsed.workItemTypeId : existing.workItemTypeId

  const scopes = [targetAreaId, targetGoalId, targetProjectId, targetWorkItemTypeId].filter(Boolean)
  if (scopes.length !== 1) {
    throw new Error('Time budget must target exactly one scope')
  }

  const updatedRow = {
    ...existing,
    name: parsed.name ?? existing.name,
    allocationMode: parsed.allocationMode ?? existing.allocationMode,
    protection: parsed.protection ?? existing.protection,
    minimumMinutes: parsed.minimumMinutes !== undefined ? parsed.minimumMinutes : existing.minimumMinutes,
    targetMinutes: parsed.targetMinutes !== undefined ? parsed.targetMinutes : existing.targetMinutes,
    maximumMinutes: parsed.maximumMinutes !== undefined ? parsed.maximumMinutes : existing.maximumMinutes,
    daysOfWeek: parsed.daysOfWeek !== undefined ? JSON.stringify(parsed.daysOfWeek) : existing.daysOfWeek,
    priority: parsed.priority ?? existing.priority,
    startDate: parsed.startDate !== undefined ? parsed.startDate : existing.startDate,
    endDate: parsed.endDate !== undefined ? parsed.endDate : existing.endDate,
    areaId: targetAreaId,
    goalId: targetGoalId,
    projectId: targetProjectId,
    workItemTypeId: targetWorkItemTypeId,
    updatedAt: time
  }
  db.update(timeBudgets).set(updatedRow).where(eq(timeBudgets.id, parsed.id)).run()
  return { ...updatedRow, daysOfWeek: JSON.parse(updatedRow.daysOfWeek) } as unknown as TimeBudget
}

// Routines
export function listRoutines(): Routine[] {
  return getDatabase()
    .select()
    .from(routines)
    .where(isNull(routines.archivedAt))
    .all() as unknown as Routine[]
}

export function createRoutine(input: unknown): Routine {
  const parsed = createRoutineSchema.parse(input)
  const time = now()
  const row = {
    id: randomUUID(),
    name: parsed.name,
    description: parsed.description ?? null,
    itemType: parsed.itemType,
    targetDuration: parsed.targetDuration,
    recurrenceRule: parsed.recurrenceRule,
    preferredTime: parsed.preferredTime ?? null,
    flexibility: parsed.flexibility,
    protected: parsed.protected,
    priority: parsed.priority,
    active: parsed.active,
    createdAt: time,
    updatedAt: time,
    archivedAt: null
  }
  getDatabase().insert(routines).values(row).run()
  return row as Routine
}

export function updateRoutine(input: unknown): Routine {
  const parsed = updateRoutineSchema.parse(input)
  const time = now()
  const db = getDatabase()
  const existing = db.select().from(routines).where(eq(routines.id, parsed.id)).get()
  if (!existing) throw new Error('Routine not found')

  const updated = {
    ...existing,
    name: parsed.name ?? existing.name,
    description: parsed.description !== undefined ? parsed.description : existing.description,
    itemType: parsed.itemType ?? existing.itemType,
    targetDuration: parsed.targetDuration !== undefined ? parsed.targetDuration : existing.targetDuration,
    recurrenceRule: parsed.recurrenceRule ?? existing.recurrenceRule,
    preferredTime: parsed.preferredTime !== undefined ? parsed.preferredTime : existing.preferredTime,
    flexibility: parsed.flexibility ?? existing.flexibility,
    protected: parsed.protected !== undefined ? parsed.protected : existing.protected,
    priority: parsed.priority ?? existing.priority,
    active: parsed.active !== undefined ? parsed.active : existing.active,
    updatedAt: time
  }
  db.update(routines).set(updated).where(eq(routines.id, parsed.id)).run()
  return updated as unknown as Routine
}

// Habits
export function listHabits(): Habit[] {
  return getDatabase()
    .select()
    .from(habits)
    .where(isNull(habits.archivedAt))
    .all() as unknown as Habit[]
}

export function createHabit(input: unknown): Habit {
  const parsed = createHabitSchema.parse(input)
  const time = now()
  const row = {
    id: randomUUID(),
    name: parsed.name,
    description: parsed.description ?? null,
    targetType: parsed.targetType,
    targetValue: parsed.targetValue,
    targetFrequencyDays: parsed.targetFrequencyDays,
    unit: parsed.unit ?? null,
    active: parsed.active,
    createdAt: time,
    updatedAt: time,
    archivedAt: null
  }
  getDatabase().insert(habits).values(row).run()
  return row as Habit
}

export function updateHabit(input: unknown): Habit {
  const parsed = updateHabitSchema.parse(input)
  const time = now()
  const db = getDatabase()
  const existing = db.select().from(habits).where(eq(habits.id, parsed.id)).get()
  if (!existing) throw new Error('Habit not found')

  const updated = {
    ...existing,
    name: parsed.name ?? existing.name,
    description: parsed.description !== undefined ? parsed.description : existing.description,
    targetType: parsed.targetType ?? existing.targetType,
    targetValue: parsed.targetValue !== undefined ? parsed.targetValue : existing.targetValue,
    targetFrequencyDays: parsed.targetFrequencyDays !== undefined ? parsed.targetFrequencyDays : existing.targetFrequencyDays,
    unit: parsed.unit !== undefined ? parsed.unit : existing.unit,
    active: parsed.active !== undefined ? parsed.active : existing.active,
    updatedAt: time
  }
  db.update(habits).set(updated).where(eq(habits.id, parsed.id)).run()
  return updated as unknown as Habit
}

export function logHabit(input: unknown): HabitLog {
  const parsed = logHabitSchema.parse(input)
  const time = now()
  const db = getDatabase()

  const existing = db
    .select()
    .from(habitLogs)
    .where(and(eq(habitLogs.habitId, parsed.habitId), eq(habitLogs.date, parsed.date)))
    .get()

  if (existing) {
    const updated = {
      ...existing,
      value: parsed.value,
      notes: parsed.notes !== undefined ? parsed.notes : existing.notes,
      updatedAt: time
    }
    db.update(habitLogs).set(updated).where(eq(habitLogs.id, existing.id)).run()
    return updated as HabitLog
  } else {
    const row = {
      id: randomUUID(),
      habitId: parsed.habitId,
      date: parsed.date,
      value: parsed.value,
      notes: parsed.notes ?? null,
      createdAt: time,
      updatedAt: time
    }
    db.insert(habitLogs).values(row).run()
    return row as HabitLog
  }
}

export function listHabitLogs(filter?: { habitId?: string; date?: string }): HabitLog[] {
  const db = getDatabase()
  if (filter?.habitId && filter?.date) {
    return db
      .select()
      .from(habitLogs)
      .where(and(eq(habitLogs.habitId, filter.habitId), eq(habitLogs.date, filter.date)))
      .orderBy(asc(habitLogs.date))
      .all() as HabitLog[]
  }
  if (filter?.habitId) {
    return db
      .select()
      .from(habitLogs)
      .where(eq(habitLogs.habitId, filter.habitId))
      .orderBy(asc(habitLogs.date))
      .all() as HabitLog[]
  }
  if (filter?.date) {
    return db
      .select()
      .from(habitLogs)
      .where(eq(habitLogs.date, filter.date))
      .orderBy(asc(habitLogs.date))
      .all() as HabitLog[]
  }
  return db.select().from(habitLogs).orderBy(asc(habitLogs.date)).all() as HabitLog[]
}

// Stage 04 Capacity Service wrapper
export function getCapacityForDate(date: string): DayCapacityResult {
  const setts = getSettings()
  const rules = listAvailabilityRules()
  const overrides = listAvailabilityOverrides()
  const fixedEvts = listFixedEvents()
  const budgets = listTimeBudgets()
  const routs = listRoutines()

  const dateObj = new Date(date)
  const dayOfWeek = isNaN(dateObj.getUTCDay()) ? 0 : dateObj.getUTCDay()

  // Filter fixed events occurring on this date
  const dateFixedEvents = fixedEvts.filter((fe) => {
    if (fe.recurrenceRule) {
      const dates = expandRecurrenceRule(fe.recurrenceRule, date, date, fe.startTime.substring(0, 10))
      return dates.includes(date)
    }
    return fe.startTime.startsWith(date)
  })

  // Filter active routines occurring on this date
  const dateRoutines = routs.filter((r) => {
    if (!r.active) return false
    const dates = expandRecurrenceRule(r.recurrenceRule, date, date)
    return dates.includes(date)
  })

  return calculateDayCapacity({
    date,
    dayOfWeek,
    availabilityRules: rules,
    availabilityOverrides: overrides,
    planningCapacityPercentage: setts.planningCapacityPercentage ?? 75,
    bufferPercentage: setts.bufferPercentage ?? 20,
    fixedEvents: dateFixedEvents.map((f) => ({ id: f.id, title: f.title, startTime: f.startTime, endTime: f.endTime, locked: f.locked })),
    timeBudgets: budgets,
    routines: dateRoutines.map((r) => ({ id: r.id, name: r.name, targetDuration: r.targetDuration, protected: r.protected }))
  })
}

// Tags
export function listTags(): Tag[] {
  return getDatabase()
    .select()
    .from(tags)
    .where(isNull(tags.archivedAt))
    .orderBy(asc(tags.name))
    .all() as unknown as Tag[]
}

export function createTag(input: unknown): Tag {
  const value = createTagSchema.parse(input)
  const time = now()
  const row = {
    id: randomUUID(),
    name: value.name,
    color: value.color ?? null,
    createdAt: time,
    updatedAt: time,
    archivedAt: null
  }
  getDatabase().insert(tags).values(row).run()
  return row as Tag
}

export function attachTag(input: unknown): void {
  const value = attachTagSchema.parse(input)
  const db = getDatabase()
  const existing = db
    .select()
    .from(entityTags)
    .where(and(eq(entityTags.entityType, value.entityType), eq(entityTags.entityId, value.entityId), eq(entityTags.tagId, value.tagId)))
    .get()
  if (existing) return

  const time = now()
  db.insert(entityTags).values({
    id: randomUUID(),
    entityType: value.entityType,
    entityId: value.entityId,
    tagId: value.tagId,
    createdAt: time,
    updatedAt: time
  }).run()
}

export function detachTag(input: unknown): void {
  const value = attachTagSchema.parse(input)
  getDatabase()
    .delete(entityTags)
    .where(and(eq(entityTags.entityType, value.entityType), eq(entityTags.entityId, value.entityId), eq(entityTags.tagId, value.tagId)))
    .run()
}

export function getEntityTags(entityType: string, entityId: string): Tag[] {
  const db = getDatabase()
  const mappings = db
    .select()
    .from(entityTags)
    .where(and(eq(entityTags.entityType, entityType), eq(entityTags.entityId, entityId)))
    .all()

  if (mappings.length === 0) return []
  const tagIds = mappings.map((m) => m.tagId)

  const result: Tag[] = []
  for (const tagId of tagIds) {
    const t = db.select().from(tags).where(eq(tags.id, tagId)).get()
    if (t) result.push(t as unknown as Tag)
  }
  return result
}

// Notes
export function listNotes(entityType: string, entityId: string): Note[] {
  return getDatabase()
    .select()
    .from(notes)
    .where(and(eq(notes.entityType, entityType), eq(notes.entityId, entityId), isNull(notes.archivedAt)))
    .orderBy(asc(notes.createdAt))
    .all() as unknown as Note[]
}

export function createNote(input: unknown): Note {
  const value = createNoteSchema.parse(input)
  const time = now()
  const row = {
    id: randomUUID(),
    entityType: value.entityType,
    entityId: value.entityId,
    content: value.content,
    createdAt: time,
    updatedAt: time,
    archivedAt: null
  }
  getDatabase().insert(notes).values(row).run()
  return row as Note
}

export function deleteNote(id: string): void {
  getDatabase().delete(notes).where(eq(notes.id, id)).run()
}

// Helper: Clean up polymorphic references (notes and entity_tags) for deleted/archived target entity
export function cleanupPolymorphicReferences(entityType: string, entityId: string): void {
  const db = getDatabase()
  db.delete(notes).where(and(eq(notes.entityType, entityType), eq(notes.entityId, entityId))).run()
  db.delete(entityTags).where(and(eq(entityTags.entityType, entityType), eq(entityTags.entityId, entityId))).run()
}

// Archive / Restore / Delete
export function archiveEntity(input: unknown): void {
  const value = archiveEntitySchema.parse(input)
  const update = { archivedAt: now(), updatedAt: now() }
  const db = getDatabase()

  if (value.kind === 'area') db.update(areas).set(update).where(eq(areas.id, value.id)).run()
  else if (value.kind === 'goal') db.update(goals).set(update).where(eq(goals.id, value.id)).run()
  else if (value.kind === 'project') db.update(projects).set(update).where(eq(projects.id, value.id)).run()
  else if (value.kind === 'workItem') db.update(workItems).set(update).where(eq(workItems.id, value.id)).run()
  else if (value.kind === 'workItemType') db.update(workItemTypes).set(update).where(eq(workItemTypes.id, value.id)).run()
  else if (value.kind === 'tag') db.update(tags).set(update).where(eq(tags.id, value.id)).run()
  else if (value.kind === 'milestone') db.update(milestones).set(update).where(eq(milestones.id, value.id)).run()
  else if (value.kind === 'resource') db.update(resources).set(update).where(eq(resources.id, value.id)).run()
  else if (value.kind === 'resourceItem') db.update(resourceItems).set(update).where(eq(resourceItems.id, value.id)).run()
  else if (value.kind === 'timeBudget') db.update(timeBudgets).set(update).where(eq(timeBudgets.id, value.id)).run()
  else if (value.kind === 'fixedEvent') db.update(fixedEvents).set(update).where(eq(fixedEvents.id, value.id)).run()
  else if (value.kind === 'routine') db.update(routines).set(update).where(eq(routines.id, value.id)).run()
  else if (value.kind === 'habit') db.update(habits).set(update).where(eq(habits.id, value.id)).run()

  cleanupPolymorphicReferences(value.kind, value.id)
}

export function restoreEntity(input: unknown): void {
  const value = restoreEntitySchema.parse(input)
  const update = { archivedAt: null, updatedAt: now() }
  const db = getDatabase()

  if (value.kind === 'area') db.update(areas).set(update).where(eq(areas.id, value.id)).run()
  else if (value.kind === 'goal') db.update(goals).set(update).where(eq(goals.id, value.id)).run()
  else if (value.kind === 'project') db.update(projects).set(update).where(eq(projects.id, value.id)).run()
  else if (value.kind === 'workItem') db.update(workItems).set(update).where(eq(workItems.id, value.id)).run()
  else if (value.kind === 'workItemType') db.update(workItemTypes).set(update).where(eq(workItemTypes.id, value.id)).run()
  else if (value.kind === 'tag') db.update(tags).set(update).where(eq(tags.id, value.id)).run()
  else if (value.kind === 'milestone') db.update(milestones).set(update).where(eq(milestones.id, value.id)).run()
  else if (value.kind === 'resource') db.update(resources).set(update).where(eq(resources.id, value.id)).run()
  else if (value.kind === 'resourceItem') db.update(resourceItems).set(update).where(eq(resourceItems.id, value.id)).run()
  else if (value.kind === 'timeBudget') db.update(timeBudgets).set(update).where(eq(timeBudgets.id, value.id)).run()
  else if (value.kind === 'fixedEvent') db.update(fixedEvents).set(update).where(eq(fixedEvents.id, value.id)).run()
  else if (value.kind === 'routine') db.update(routines).set(update).where(eq(routines.id, value.id)).run()
  else if (value.kind === 'habit') db.update(habits).set(update).where(eq(habits.id, value.id)).run()
}

export function deleteEntity(input: unknown): void {
  const value = deleteEntitySchema.parse(input)
  const db = getDatabase()
  const time = now()

  if (value.kind === 'area') {
    db.update(goals).set({ areaId: null, updatedAt: time }).where(eq(goals.areaId, value.id)).run()
    db.update(projects).set({ areaId: null, updatedAt: time }).where(eq(projects.areaId, value.id)).run()
    db.update(workItems).set({ areaId: null, updatedAt: time }).where(eq(workItems.areaId, value.id)).run()
    db.delete(areas).where(eq(areas.id, value.id)).run()
  } else if (value.kind === 'goal') {
    const action = value.childWorkItemAction ?? 'detach'
    if (action === 'archive') {
      db.update(workItems).set({ archivedAt: time, updatedAt: time }).where(eq(workItems.goalId, value.id)).run()
    } else {
      db.update(workItems).set({ goalId: null, updatedAt: time }).where(eq(workItems.goalId, value.id)).run()
    }
    db.update(projects).set({ goalId: null, updatedAt: time }).where(eq(projects.goalId, value.id)).run()
    db.delete(goals).where(eq(goals.id, value.id)).run()
  } else if (value.kind === 'project') {
    const action = value.childWorkItemAction ?? 'detach'
    if (action === 'archive') {
      db.update(workItems).set({ archivedAt: time, updatedAt: time }).where(eq(workItems.projectId, value.id)).run()
    } else {
      db.update(workItems).set({ projectId: null, updatedAt: time }).where(eq(workItems.projectId, value.id)).run()
    }
    db.delete(projects).where(eq(projects.id, value.id)).run()
  } else if (value.kind === 'workItem') {
    db.delete(workItems).where(eq(workItems.id, value.id)).run()
  } else if (value.kind === 'milestone') {
    db.delete(milestones).where(eq(milestones.id, value.id)).run()
  } else if (value.kind === 'workItemType') {
    db.update(workItems).set({ workItemTypeId: null, updatedAt: time }).where(eq(workItems.workItemTypeId, value.id)).run()
    db.delete(workItemTypes).where(eq(workItemTypes.id, value.id)).run()
  } else if (value.kind === 'tag') {
    db.delete(tags).where(eq(tags.id, value.id)).run()
  } else if (value.kind === 'resource') {
    db.delete(resources).where(eq(resources.id, value.id)).run()
  } else if (value.kind === 'resourceItem') {
    db.delete(resourceItems).where(eq(resourceItems.id, value.id)).run()
  } else if (value.kind === 'timeBudget') {
    db.delete(timeBudgets).where(eq(timeBudgets.id, value.id)).run()
  } else if (value.kind === 'fixedEvent') {
    db.delete(fixedEvents).where(eq(fixedEvents.id, value.id)).run()
  } else if (value.kind === 'routine') {
    db.delete(routines).where(eq(routines.id, value.id)).run()
  } else if (value.kind === 'habit') {
    db.delete(habits).where(eq(habits.id, value.id)).run()
  }

  cleanupPolymorphicReferences(value.kind, value.id)
}
