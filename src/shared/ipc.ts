import { z } from 'zod'
import { settingsSchema, settingsUpdateSchema } from './settings'
import type { PlanningResult, ScheduleItem as SchedulerScheduleItem } from '../main/scheduler/types'
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
} from './entities'
import type { DayCapacityResult } from './capacity'

export const ipcChannels = {
  settingsGet: 'settings:get',
  settingsUpdate: 'settings:update',

  areasList: 'areas:list',
  areasCreate: 'areas:create',
  areasUpdate: 'areas:update',

  goalsList: 'goals:list',
  goalsCreate: 'goals:create',
  goalsUpdate: 'goals:update',

  milestonesList: 'milestones:list',
  milestonesCreate: 'milestones:create',
  milestonesUpdate: 'milestones:update',

  projectsList: 'projects:list',
  projectsCreate: 'projects:create',
  projectsUpdate: 'projects:update',

  workItemTypesList: 'work-item-types:list',
  workItemTypesCreate: 'work-item-types:create',
  workItemTypesUpdate: 'work-item-types:update',

  customFieldDefsList: 'custom-field-defs:list',
  customFieldDefsCreate: 'custom-field-defs:create',
  customFieldDefsUpdate: 'custom-field-defs:update',

  customFieldValuesGet: 'custom-field-values:get',
  customFieldValuesSet: 'custom-field-values:set',

  workItemsList: 'work-items:list',
  workItemsCreate: 'work-items:create',
  workItemsUpdate: 'work-items:update',

  tagsList: 'tags:list',
  tagsCreate: 'tags:create',
  tagsAttach: 'tags:attach',
  tagsDetach: 'tags:detach',
  tagsGetForEntity: 'tags:get-for-entity',

  notesList: 'notes:list',
  notesCreate: 'notes:create',
  notesDelete: 'notes:delete',

  resourcesList: 'resources:list',
  resourcesGet: 'resources:get',
  resourcesCreate: 'resources:create',
  resourcesUpdate: 'resources:update',
  resourcesDuplicate: 'resources:duplicate',

  resourceItemsList: 'resource-items:list',
  resourceItemsCreate: 'resource-items:create',
  resourceItemsUpdate: 'resource-items:update',
  resourceItemsBulkAdd: 'resource-items:bulk-add',
  resourceItemsReorder: 'resource-items:reorder',
  resourceItemsLinkWorkItem: 'resource-items:link-work-item',

  dependenciesList: 'dependencies:list',
  dependenciesCreate: 'dependencies:create',
  dependenciesDelete: 'dependencies:delete',

  // Stage 04 Channels: Time Model
  availabilityRulesList: 'availability-rules:list',
  availabilityRulesUpdate: 'availability-rules:update',
  availabilityOverridesList: 'availability-overrides:list',
  availabilityOverridesCreate: 'availability-overrides:create',
  availabilityOverridesDelete: 'availability-overrides:delete',

  capacityCalculate: 'capacity:calculate',

  fixedEventsList: 'fixed-events:list',
  fixedEventsCreate: 'fixed-events:create',
  fixedEventsUpdate: 'fixed-events:update',

  timeBudgetsList: 'time-budgets:list',
  timeBudgetsCreate: 'time-budgets:create',
  timeBudgetsUpdate: 'time-budgets:update',

  routinesList: 'routines:list',
  routinesCreate: 'routines:create',
  routinesUpdate: 'routines:update',

  habitsList: 'habits:list',
  habitsCreate: 'habits:create',
  habitsUpdate: 'habits:update',
  habitsLog: 'habits:log',
  habitsListLogs: 'habits:list-logs',

  // Stage 05 & 06 Channels: Planning Engine & UI
  planningGenerateWeek: 'planning:generate-week',
  planningGetSchedule: 'planning:get-schedule',
  planningClearSchedule: 'planning:clear-schedule',
  planningUpdateScheduleItem: 'planning:update-schedule-item',
  planningCreateScheduleItem: 'planning:create-schedule-item',
  planningDeleteScheduleItem: 'planning:delete-schedule-item',

  entityArchive: 'entities:archive',
  entityRestore: 'entities:restore',
  entityDelete: 'entities:delete'
} as const

export const ipcSchemas = {
  [ipcChannels.settingsGet]: z.undefined(),
  [ipcChannels.settingsUpdate]: settingsUpdateSchema,

  [ipcChannels.areasList]: z.undefined(),
  [ipcChannels.areasCreate]: createAreaSchema,
  [ipcChannels.areasUpdate]: updateAreaSchema,

  [ipcChannels.goalsList]: z.undefined(),
  [ipcChannels.goalsCreate]: createGoalSchema,
  [ipcChannels.goalsUpdate]: updateGoalSchema,

  [ipcChannels.milestonesList]: z.object({ goalId: z.string().uuid().optional() }).optional(),
  [ipcChannels.milestonesCreate]: createMilestoneSchema,
  [ipcChannels.milestonesUpdate]: updateMilestoneSchema,

  [ipcChannels.projectsList]: z.undefined(),
  [ipcChannels.projectsCreate]: createProjectSchema,
  [ipcChannels.projectsUpdate]: updateProjectSchema,

  [ipcChannels.workItemTypesList]: z.undefined(),
  [ipcChannels.workItemTypesCreate]: createWorkItemTypeSchema,
  [ipcChannels.workItemTypesUpdate]: updateWorkItemTypeSchema,

  [ipcChannels.customFieldDefsList]: z.object({ workItemTypeId: z.string().uuid().optional() }).optional(),
  [ipcChannels.customFieldDefsCreate]: createCustomFieldDefSchema,
  [ipcChannels.customFieldDefsUpdate]: updateCustomFieldDefSchema,

  [ipcChannels.customFieldValuesGet]: z.object({ workItemId: z.string().uuid() }),
  [ipcChannels.customFieldValuesSet]: setCustomFieldValueSchema,

  [ipcChannels.workItemsList]: z.undefined(),
  [ipcChannels.workItemsCreate]: createWorkItemSchema,
  [ipcChannels.workItemsUpdate]: updateWorkItemSchema,

  [ipcChannels.tagsList]: z.undefined(),
  [ipcChannels.tagsCreate]: createTagSchema,
  [ipcChannels.tagsAttach]: attachTagSchema,
  [ipcChannels.tagsDetach]: attachTagSchema,
  [ipcChannels.tagsGetForEntity]: z.object({ entityType: z.string(), entityId: z.string().uuid() }),

  [ipcChannels.notesList]: z.object({ entityType: z.string(), entityId: z.string().uuid() }),
  [ipcChannels.notesCreate]: createNoteSchema,
  [ipcChannels.notesDelete]: z.object({ id: z.string().uuid() }),

  [ipcChannels.resourcesList]: z.undefined(),
  [ipcChannels.resourcesGet]: z.object({ id: z.string().uuid() }),
  [ipcChannels.resourcesCreate]: createResourceSchema,
  [ipcChannels.resourcesUpdate]: updateResourceSchema,
  [ipcChannels.resourcesDuplicate]: z.object({ id: z.string().uuid() }),

  [ipcChannels.resourceItemsList]: z.object({ resourceId: z.string().uuid() }),
  [ipcChannels.resourceItemsCreate]: createResourceItemSchema,
  [ipcChannels.resourceItemsUpdate]: updateResourceItemSchema,
  [ipcChannels.resourceItemsBulkAdd]: bulkAddResourceItemsSchema,
  [ipcChannels.resourceItemsReorder]: reorderResourceItemsSchema,
  [ipcChannels.resourceItemsLinkWorkItem]: linkResourceItemToWorkItemSchema,

  [ipcChannels.dependenciesList]: z.undefined(),
  [ipcChannels.dependenciesCreate]: createWorkItemDependencySchema,
  [ipcChannels.dependenciesDelete]: deleteWorkItemDependencySchema,

  [ipcChannels.availabilityRulesList]: z.undefined(),
  [ipcChannels.availabilityRulesUpdate]: z.object({ rules: z.array(createAvailabilityRuleSchema) }),
  [ipcChannels.availabilityOverridesList]: z.undefined(),
  [ipcChannels.availabilityOverridesCreate]: createAvailabilityOverrideSchema,
  [ipcChannels.availabilityOverridesDelete]: z.object({ id: z.string().uuid() }),

  [ipcChannels.capacityCalculate]: z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }),

  [ipcChannels.fixedEventsList]: z.undefined(),
  [ipcChannels.fixedEventsCreate]: createFixedEventSchema,
  [ipcChannels.fixedEventsUpdate]: updateFixedEventSchema,

  [ipcChannels.timeBudgetsList]: z.undefined(),
  [ipcChannels.timeBudgetsCreate]: createTimeBudgetSchema,
  [ipcChannels.timeBudgetsUpdate]: updateTimeBudgetSchema,

  [ipcChannels.routinesList]: z.undefined(),
  [ipcChannels.routinesCreate]: createRoutineSchema,
  [ipcChannels.routinesUpdate]: updateRoutineSchema,

  [ipcChannels.habitsList]: z.undefined(),
  [ipcChannels.habitsCreate]: createHabitSchema,
  [ipcChannels.habitsUpdate]: updateHabitSchema,
  [ipcChannels.habitsLog]: logHabitSchema,
  [ipcChannels.habitsListLogs]: z.object({ habitId: z.string().uuid().optional(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() }).optional(),

  [ipcChannels.planningGenerateWeek]: z.object({ startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() }).optional(),
  [ipcChannels.planningGetSchedule]: z.object({ startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }),
  [ipcChannels.planningClearSchedule]: z.object({ startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }),
  [ipcChannels.planningUpdateScheduleItem]: z.object({
    id: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    durationMinutes: z.number().optional(),
    locked: z.boolean().optional(),
    title: z.string().optional()
  }),
  [ipcChannels.planningCreateScheduleItem]: z.object({
    workItemId: z.string().uuid().optional(),
    title: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: z.string(),
    endTime: z.string(),
    durationMinutes: z.number(),
    locked: z.boolean().optional(),
    reason: z.string().optional()
  }),
  [ipcChannels.planningDeleteScheduleItem]: z.object({ id: z.string() }),

  [ipcChannels.entityArchive]: archiveEntitySchema,
  [ipcChannels.entityRestore]: restoreEntitySchema,
  [ipcChannels.entityDelete]: deleteEntitySchema
} as const

export type PlannerApi = {
  settings: {
    get: () => Promise<z.infer<typeof settingsSchema>>
    update: (input: z.input<typeof settingsUpdateSchema>) => Promise<z.infer<typeof settingsSchema>>
  }
  areas: {
    list: () => Promise<Area[]>
    create: (input: z.input<typeof createAreaSchema>) => Promise<Area>
    update: (input: z.input<typeof updateAreaSchema>) => Promise<Area>
  }
  goals: {
    list: () => Promise<Goal[]>
    create: (input: z.input<typeof createGoalSchema>) => Promise<Goal>
    update: (input: z.input<typeof updateGoalSchema>) => Promise<Goal>
  }
  milestones: {
    list: (goalId?: string) => Promise<Milestone[]>
    create: (input: z.input<typeof createMilestoneSchema>) => Promise<Milestone>
    update: (input: z.input<typeof updateMilestoneSchema>) => Promise<Milestone>
  }
  projects: {
    list: () => Promise<Project[]>
    create: (input: z.input<typeof createProjectSchema>) => Promise<Project>
    update: (input: z.input<typeof updateProjectSchema>) => Promise<Project>
  }
  workItemTypes: {
    list: () => Promise<WorkItemType[]>
    create: (input: z.input<typeof createWorkItemTypeSchema>) => Promise<WorkItemType>
    update: (input: z.input<typeof updateWorkItemTypeSchema>) => Promise<WorkItemType>
  }
  customFieldDefs: {
    list: (workItemTypeId?: string) => Promise<CustomFieldDefinition[]>
    create: (input: z.input<typeof createCustomFieldDefSchema>) => Promise<CustomFieldDefinition>
    update: (input: z.input<typeof updateCustomFieldDefSchema>) => Promise<CustomFieldDefinition>
  }
  customFieldValues: {
    get: (workItemId: string) => Promise<CustomFieldValue[]>
    set: (input: z.input<typeof setCustomFieldValueSchema>) => Promise<CustomFieldValue>
  }
  workItems: {
    list: () => Promise<WorkItem[]>
    create: (input: z.input<typeof createWorkItemSchema>) => Promise<WorkItem>
    update: (input: z.input<typeof updateWorkItemSchema>) => Promise<WorkItem>
  }
  tags: {
    list: () => Promise<Tag[]>
    create: (input: z.input<typeof createTagSchema>) => Promise<Tag>
    attach: (input: z.input<typeof attachTagSchema>) => Promise<void>
    detach: (input: z.input<typeof attachTagSchema>) => Promise<void>
    getForEntity: (entityType: string, entityId: string) => Promise<Tag[]>
  }
  notes: {
    list: (entityType: string, entityId: string) => Promise<Note[]>
    create: (input: z.input<typeof createNoteSchema>) => Promise<Note>
    delete: (id: string) => Promise<void>
  }
  resources: {
    list: () => Promise<Resource[]>
    get: (id: string) => Promise<Resource>
    create: (input: z.input<typeof createResourceSchema>) => Promise<Resource>
    update: (input: z.input<typeof updateResourceSchema>) => Promise<Resource>
    duplicate: (id: string) => Promise<Resource>
  }
  resourceItems: {
    list: (resourceId: string) => Promise<ResourceItem[]>
    create: (input: z.input<typeof createResourceItemSchema>) => Promise<ResourceItem>
    update: (input: z.input<typeof updateResourceItemSchema>) => Promise<ResourceItem>
    bulkAdd: (input: z.input<typeof bulkAddResourceItemsSchema>) => Promise<ResourceItem[]>
    reorder: (input: z.input<typeof reorderResourceItemsSchema>) => Promise<void>
    linkWorkItem: (input: z.input<typeof linkResourceItemToWorkItemSchema>) => Promise<WorkItem>
  }
  dependencies: {
    list: () => Promise<WorkItemDependency[]>
    create: (input: z.input<typeof createWorkItemDependencySchema>) => Promise<WorkItemDependency>
    delete: (id: string) => Promise<void>
  }
  availabilityRules: {
    list: () => Promise<AvailabilityRule[]>
    update: (rules: z.input<typeof createAvailabilityRuleSchema>[]) => Promise<AvailabilityRule[]>
  }
  availabilityOverrides: {
    list: () => Promise<AvailabilityOverride[]>
    create: (input: z.input<typeof createAvailabilityOverrideSchema>) => Promise<AvailabilityOverride>
    delete: (id: string) => Promise<void>
  }
  capacity: {
    calculate: (date: string) => Promise<DayCapacityResult>
  }
  fixedEvents: {
    list: () => Promise<FixedEvent[]>
    create: (input: z.input<typeof createFixedEventSchema>) => Promise<FixedEvent>
    update: (input: z.input<typeof updateFixedEventSchema>) => Promise<FixedEvent>
  }
  timeBudgets: {
    list: () => Promise<TimeBudget[]>
    create: (input: z.input<typeof createTimeBudgetSchema>) => Promise<TimeBudget>
    update: (input: z.input<typeof updateTimeBudgetSchema>) => Promise<TimeBudget>
  }
  routines: {
    list: () => Promise<Routine[]>
    create: (input: z.input<typeof createRoutineSchema>) => Promise<Routine>
    update: (input: z.input<typeof updateRoutineSchema>) => Promise<Routine>
  }
  habits: {
    list: () => Promise<Habit[]>
    create: (input: z.input<typeof createHabitSchema>) => Promise<Habit>
    update: (input: z.input<typeof updateHabitSchema>) => Promise<Habit>
    log: (input: z.input<typeof logHabitSchema>) => Promise<HabitLog>
    listLogs: (filter?: { habitId?: string; date?: string } | string) => Promise<HabitLog[]>
  }
  planning: {
    generateWeek: (startDate?: string) => Promise<PlanningResult>
    getSchedule: (startDate: string, endDate: string) => Promise<SchedulerScheduleItem[]>
    clearSchedule: (startDate: string, endDate: string) => Promise<void>
    updateScheduleItem: (input: {
      id: string
      date?: string
      startTime?: string
      endTime?: string
      durationMinutes?: number
      locked?: boolean
      title?: string
    }) => Promise<SchedulerScheduleItem>
    createScheduleItem: (input: {
      workItemId?: string
      title: string
      date: string
      startTime: string
      endTime: string
      durationMinutes: number
      locked?: boolean
      reason?: string
    }) => Promise<SchedulerScheduleItem>
    deleteScheduleItem: (id: string) => Promise<void>
  }
  entities: {
    archive: (input: z.input<typeof archiveEntitySchema>) => Promise<void>
    restore: (input: z.input<typeof restoreEntitySchema>) => Promise<void>
    delete: (input: z.input<typeof deleteEntitySchema>) => Promise<void>
  }
}
