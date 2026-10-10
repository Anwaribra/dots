import { z } from 'zod'

export const prioritySchema = z.enum(['critical', 'high', 'medium', 'low'])
export const statusSchema = z.enum(['active', 'completed', 'paused', 'cancelled', 'todo', 'in_progress', 'done', 'blocked'])
export const flexibilitySchema = z.enum(['fixed', 'semi_flexible', 'flexible'])
export const energyLevelSchema = z.enum(['low', 'medium', 'high']).nullable().optional()
export const fieldTypeSchema = z.enum(['text', 'number', 'boolean', 'date', 'select'])
export const entityKindSchema = z.enum(['area', 'goal', 'milestone', 'project', 'workItem', 'workItemType', 'tag', 'note', 'resource', 'resourceItem', 'timeBudget', 'fixedEvent', 'routine', 'habit'])
export const orderingModeSchema = z.enum(['sequential', 'flexible', 'dependency_based'])
export const resourceTypeSchema = z.enum(['course', 'book', 'playlist', 'pdf', 'article_collection', 'training_program', 'study_plan', 'custom'])
export const allocationModeSchema = z.enum(['minimum', 'target', 'maximum', 'range'])
export const protectionSchema = z.enum(['flexible', 'protected', 'locked'])
export const habitTargetTypeSchema = z.enum(['binary', 'count', 'duration', 'frequency'])

// Areas
export const createAreaSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().max(4000).nullable().optional(),
  icon: z.string().max(64).nullable().optional(),
  color: z.string().max(32).nullable().optional()
})
export const updateAreaSchema = createAreaSchema.partial().extend({
  id: z.string().uuid()
})

// Goals
export const createGoalSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(4000).nullable().optional(),
  areaId: z.string().uuid().nullable().optional(),
  priority: prioritySchema.optional().default('medium'),
  status: statusSchema.optional().default('active'),
  startDate: z.string().nullable().optional(),
  targetDate: z.string().nullable().optional(),
  measurementType: z.enum(['binary', 'percentage', 'count', 'duration', 'numeric', 'weighted', 'custom']).optional().default('percentage'),
  progressMode: z.enum(['manual', 'weighted', 'calculated']).optional().default('manual'),
  targetValue: z.number().nullable().optional(),
  currentValue: z.number().optional().default(0),
  unit: z.string().max(32).nullable().optional()
})
export const updateGoalSchema = createGoalSchema.partial().extend({
  id: z.string().uuid()
})

// Milestones
export const createMilestoneSchema = z.object({
  goalId: z.string().uuid(),
  title: z.string().trim().min(1).max(200),
  description: z.string().max(4000).nullable().optional(),
  targetDate: z.string().nullable().optional(),
  status: statusSchema.optional().default('active'),
  progress: z.number().min(0).max(100).optional().default(0)
})
export const updateMilestoneSchema = createMilestoneSchema.partial().extend({
  id: z.string().uuid()
})

// Projects
export const createProjectSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(4000).nullable().optional(),
  areaId: z.string().uuid().nullable().optional(),
  goalId: z.string().uuid().nullable().optional(),
  milestoneId: z.string().uuid().nullable().optional(),
  parentProjectId: z.string().uuid().nullable().optional(),
  priority: prioritySchema.optional().default('medium'),
  status: statusSchema.optional().default('active'),
  startDate: z.string().nullable().optional(),
  deadline: z.string().nullable().optional(),
  estimatedMinutes: z.number().int().min(0).optional().default(0)
})
export const updateProjectSchema = createProjectSchema.partial().extend({
  id: z.string().uuid(),
  completedMinutes: z.number().int().min(0).optional(),
  progress: z.number().min(0).max(100).optional()
})

// Work Item Types
export const createWorkItemTypeSchema = z.object({
  name: z.string().trim().min(1).max(100),
  color: z.string().max(32).nullable().optional(),
  icon: z.string().max(64).nullable().optional(),
  builtIn: z.boolean().optional().default(false)
})
export const updateWorkItemTypeSchema = createWorkItemTypeSchema.partial().extend({
  id: z.string().uuid()
})

// Custom Field Definitions
export const createCustomFieldDefSchema = z.object({
  workItemTypeId: z.string().uuid(),
  name: z.string().trim().min(1).max(100),
  fieldType: fieldTypeSchema,
  options: z.array(z.string()).nullable().optional(),
  required: z.boolean().optional().default(false)
})
export const updateCustomFieldDefSchema = createCustomFieldDefSchema.partial().extend({
  id: z.string().uuid()
})

// Work Items
export const createWorkItemSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(4000).nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
  goalId: z.string().uuid().nullable().optional(),
  areaId: z.string().uuid().nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
  workItemTypeId: z.string().uuid().nullable().optional(),
  status: statusSchema.optional().default('todo'),
  priority: prioritySchema.optional().default('medium'),
  estimatedMinutes: z.number().int().min(0).optional().default(0),
  actualMinutes: z.number().int().min(0).optional().default(0),
  deadline: z.string().nullable().optional(),
  preferredDate: z.string().nullable().optional(),
  preferredStartTime: z.string().nullable().optional(),
  preferredEndTime: z.string().nullable().optional(),
  energyLevel: energyLevelSchema,
  flexibility: flexibilitySchema.optional().default('flexible'),
  progress: z.number().min(0).max(100).optional().default(0),
  recurrenceRule: z.string().nullable().optional(),
  customFieldValues: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional()
})
export const updateWorkItemSchema = createWorkItemSchema.partial().extend({
  id: z.string().uuid()
})

// Custom Field Values
export const setCustomFieldValueSchema = z.object({
  workItemId: z.string().uuid(),
  definitionId: z.string().uuid(),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()])
})

// Tags
export const createTagSchema = z.object({
  name: z.string().trim().min(1).max(60),
  color: z.string().max(32).nullable().optional()
})
export const attachTagSchema = z.object({
  entityType: z.string(),
  entityId: z.string().uuid(),
  tagId: z.string().uuid()
})

// Notes
export const createNoteSchema = z.object({
  entityType: z.string(),
  entityId: z.string().uuid(),
  content: z.string().trim().min(1).max(10000)
})

// Stage 03 Schemas: Resources & Items
export const createResourceSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(4000).nullable().optional(),
  resourceType: resourceTypeSchema.optional().default('course'),
  orderingMode: orderingModeSchema.optional().default('sequential'),
  areaId: z.string().uuid().nullable().optional(),
  goalId: z.string().uuid().nullable().optional(),
  projectId: z.string().uuid().nullable().optional()
})
export const updateResourceSchema = createResourceSchema.partial().extend({
  id: z.string().uuid()
})

export const createResourceItemSchema = z.object({
  resourceId: z.string().uuid(),
  parentId: z.string().uuid().nullable().optional(),
  title: z.string().trim().min(1).max(200),
  itemType: z.string().optional().default('item'),
  sourceUrl: z.string().nullable().optional(),
  estimatedMinutes: z.number().int().min(0).optional().default(0),
  orderIndex: z.number().int().min(0).optional().default(0),
  status: statusSchema.optional().default('todo'),
  progress: z.number().min(0).max(100).optional().default(0),
  notes: z.string().nullable().optional(),
  workItemId: z.string().uuid().nullable().optional()
})
export const updateResourceItemSchema = createResourceItemSchema.partial().extend({
  id: z.string().uuid()
})

export const bulkAddResourceItemsSchema = z.object({
  resourceId: z.string().uuid(),
  parentId: z.string().uuid().nullable().optional(),
  items: z.array(z.object({
    title: z.string().trim().min(1),
    estimatedMinutes: z.number().int().min(0).default(0),
    itemType: z.string().optional().default('item')
  }))
})

export const reorderResourceItemsSchema = z.object({
  resourceId: z.string().uuid(),
  itemIdsInOrder: z.array(z.string().uuid())
})

export const linkResourceItemToWorkItemSchema = z.object({
  resourceItemId: z.string().uuid(),
  title: z.string().trim().min(1).optional(),
  projectId: z.string().uuid().nullable().optional(),
  goalId: z.string().uuid().nullable().optional(),
  areaId: z.string().uuid().nullable().optional()
})

export const createWorkItemDependencySchema = z.object({
  predecessorId: z.string().uuid(),
  successorId: z.string().uuid(),
  predecessorType: z.string().optional().default('work_item'),
  successorType: z.string().optional().default('work_item'),
  dependencyType: z.string().optional().default('finish_to_start')
})
export const deleteWorkItemDependencySchema = z.object({
  id: z.string().uuid()
})

// Stage 04 Schemas: Time Model
export const createAvailabilityRuleSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional().default('09:00'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional().default('17:00'),
  isActive: z.boolean().optional().default(true)
})

export const createAvailabilityOverrideSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  isUnavailable: z.boolean().optional().default(false),
  notes: z.string().nullable().optional()
})

export const createFixedEventSchema = z.object({
  title: z.string().trim().min(1).max(200),
  startTime: z.string(),
  endTime: z.string(),
  recurrenceRule: z.string().nullable().optional(),
  flexibility: flexibilitySchema.optional().default('fixed'),
  locked: z.boolean().optional().default(true),
  notes: z.string().nullable().optional()
})
export const updateFixedEventSchema = createFixedEventSchema.partial().extend({
  id: z.string().uuid()
})

export const createTimeBudgetSchema = z.object({
  name: z.string().trim().min(1).max(120),
  allocationMode: allocationModeSchema.optional().default('target'),
  protection: protectionSchema.optional().default('flexible'),
  minimumMinutes: z.number().int().min(0).optional().default(0),
  targetMinutes: z.number().int().min(0).optional().default(0),
  maximumMinutes: z.number().int().min(0).optional().default(0),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional().default([0, 1, 2, 3, 4, 5, 6]),
  priority: prioritySchema.optional().default('medium'),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  areaId: z.string().uuid().nullable().optional(),
  goalId: z.string().uuid().nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
  workItemTypeId: z.string().uuid().nullable().optional()
})
export const updateTimeBudgetSchema = createTimeBudgetSchema.partial().extend({
  id: z.string().uuid()
})

export const createRoutineSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().max(4000).nullable().optional(),
  itemType: z.string().optional().default('routine'),
  targetDuration: z.number().int().min(1).optional().default(30),
  recurrenceRule: z.string().optional().default('FREQ=DAILY'),
  preferredTime: z.string().nullable().optional(),
  flexibility: flexibilitySchema.optional().default('semi_flexible'),
  protected: z.boolean().optional().default(false),
  priority: prioritySchema.optional().default('medium'),
  active: z.boolean().optional().default(true)
})
export const updateRoutineSchema = createRoutineSchema.partial().extend({
  id: z.string().uuid()
})

export const createHabitSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().max(4000).nullable().optional(),
  targetType: habitTargetTypeSchema.optional().default('binary'),
  targetValue: z.number().int().min(1).optional().default(1),
  targetFrequencyDays: z.number().int().min(1).optional().default(7),
  unit: z.string().max(32).nullable().optional(),
  active: z.boolean().optional().default(true)
})
export const updateHabitSchema = createHabitSchema.partial().extend({
  id: z.string().uuid()
})

export const logHabitSchema = z.object({
  habitId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  value: z.number().int().min(0).optional().default(1),
  notes: z.string().nullable().optional()
})

// Actions
export const archiveEntitySchema = z.object({
  kind: entityKindSchema,
  id: z.string().uuid()
})
export const restoreEntitySchema = z.object({
  kind: entityKindSchema,
  id: z.string().uuid()
})
export const deleteEntitySchema = z.object({
  kind: z.enum(['area', 'goal', 'milestone', 'project', 'workItem', 'workItemType', 'tag', 'note', 'resource', 'resourceItem', 'timeBudget', 'fixedEvent', 'routine', 'habit']),
  id: z.string().uuid(),
  childWorkItemAction: z.enum(['detach', 'archive']).optional()
})

// TypeScript Types
export type Area = z.infer<typeof createAreaSchema> & { id: string; sortOrder: number; createdAt: number; updatedAt: number; archivedAt: number | null }
export type Goal = z.infer<typeof createGoalSchema> & { id: string; createdAt: number; updatedAt: number; archivedAt: number | null }
export type Milestone = z.infer<typeof createMilestoneSchema> & { id: string; orderIndex: number; createdAt: number; updatedAt: number; archivedAt: number | null }
export type Project = z.infer<typeof createProjectSchema> & { id: string; completedMinutes: number; progress: number; createdAt: number; updatedAt: number; archivedAt: number | null }
export type WorkItemType = z.infer<typeof createWorkItemTypeSchema> & { id: string; builtIn: boolean; sortOrder: number; createdAt: number; updatedAt: number; archivedAt: number | null }
export type CustomFieldDefinition = { id: string; workItemTypeId: string; name: string; fieldType: 'text' | 'number' | 'boolean' | 'date' | 'select'; options: string[] | null; required: boolean; sortOrder: number; createdAt: number; updatedAt: number }
export type CustomFieldValue = { id: string; workItemId: string; definitionId: string; textValue: string | null; numberValue: number | null; booleanValue: boolean | null; dateValue: string | null; selectValue: string | null; createdAt: number; updatedAt: number }
export type WorkItem = z.infer<typeof createWorkItemSchema> & { id: string; actualMinutes: number; progress: number; orderIndex: number; createdAt: number; updatedAt: number; archivedAt: number | null }
export type Tag = z.infer<typeof createTagSchema> & { id: string; createdAt: number; updatedAt: number; archivedAt: number | null }
export type EntityTag = { id: string; entityType: string; entityId: string; tagId: string; createdAt: number; updatedAt: number }
export type Note = { id: string; entityType: string; entityId: string; content: string; createdAt: number; updatedAt: number; archivedAt: number | null }

export type Resource = z.infer<typeof createResourceSchema> & { id: string; createdAt: number; updatedAt: number; archivedAt: number | null }
export type ResourceItem = z.infer<typeof createResourceItemSchema> & { id: string; effectiveStatus?: string; effectiveProgress?: number; effectiveActualMinutes?: number; isBlocked?: boolean; blockedByTitle?: string; createdAt: number; updatedAt: number; archivedAt: number | null }
export type WorkItemDependency = z.infer<typeof createWorkItemDependencySchema> & { id: string; createdAt: number; updatedAt: number }

export type AvailabilityRule = z.infer<typeof createAvailabilityRuleSchema> & { id: string; createdAt: number; updatedAt: number }
export type AvailabilityOverride = z.infer<typeof createAvailabilityOverrideSchema> & { id: string; createdAt: number; updatedAt: number }
export type FixedEvent = z.infer<typeof createFixedEventSchema> & { id: string; createdAt: number; updatedAt: number; archivedAt: number | null }
export type TimeBudget = z.infer<typeof createTimeBudgetSchema> & { id: string; createdAt: number; updatedAt: number; archivedAt: number | null }
export type Routine = z.infer<typeof createRoutineSchema> & { id: string; createdAt: number; updatedAt: number; archivedAt: number | null }
export type Habit = z.infer<typeof createHabitSchema> & { id: string; createdAt: number; updatedAt: number; archivedAt: number | null }
export type HabitLog = z.infer<typeof logHabitSchema> & { id: string; createdAt: number; updatedAt: number }
