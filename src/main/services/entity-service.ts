import { and, asc, eq, isNull } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { getDatabase } from '../db/database'
import {
  areas,
  customFieldDefinitions,
  customFieldValues,
  entityTags,
  goals,
  milestones,
  notes,
  projects,
  tags,
  workItemTypes,
  workItems
} from '../db/schema'
import {
  archiveEntitySchema,
  attachTagSchema,
  createAreaSchema,
  createCustomFieldDefSchema,
  createGoalSchema,
  createMilestoneSchema,
  createNoteSchema,
  createProjectSchema,
  createTagSchema,
  createWorkItemSchema,
  createWorkItemTypeSchema,
  deleteEntitySchema,
  restoreEntitySchema,
  setCustomFieldValueSchema,
  updateAreaSchema,
  updateCustomFieldDefSchema,
  updateGoalSchema,
  updateMilestoneSchema,
  updateProjectSchema,
  updateWorkItemSchema,
  updateWorkItemTypeSchema,
  type Area,
  type CustomFieldDefinition,
  type CustomFieldValue,
  type Goal,
  type Milestone,
  type Note,
  type Project,
  type Tag,
  type WorkItem,
  type WorkItemType
} from '../../shared/entities'

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

// Areas
export function listAreas(): Area[] {
  seedBuiltInWorkItemTypes()
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
}

export function deleteEntity(input: unknown): void {
  const value = deleteEntitySchema.parse(input)
  const db = getDatabase()
  const time = now()

  if (value.kind === 'area') {
    // Detach goals, projects, work items from area
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
  }
}
