import { z } from 'zod'
import { settingsSchema, settingsUpdateSchema } from './settings'
import type { SearchQuery, SearchResponse } from './search-types'
import type { WeeklyReviewPeriod, WeeklyReviewResult } from '../main/services/weekly-review-service'
import type {
  PlanningResult,
  ScheduleItem as SchedulerScheduleItem,
  ReplanningResult,
  ReplanningChange,
  ReplanningHistoryItem,
  PlanVersionItem
} from '../main/scheduler/types'
import type { GoalProgressResult } from './progress-engine'
import type { AnalyticsFilter, AnalyticsOverview } from './analytics-engine'
import type { DashboardData } from '../main/services/analytics-service'
import type { TemplateRecord, ApplyTemplateResult, SaveCustomTemplateInput } from './templates'
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
import type {
  TimeSessionItem,
  TimeSessionInput,
  TimeSessionUpdateInput
} from '../main/services/session-service'
import type { TimerInfoResponse } from '../main/services/timer-service'
import type { EstimationAccuracyResult, AggregatedAccuracyResult } from './time-math'
import type { BackupJsonExport } from '../main/services/backup-service'
import type { ReviewPolicyData, DueReviewsFilterResult } from './review-engine'
import type { ReviewPolicyInput, ReviewPolicyUpdateInput, ReviewEventInput } from '../main/services/review-service'

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

  // Stage 07 Channels: Execution Engine, Timer, Sessions, Accuracy & Backup
  sessionsList: 'sessions:list',
  sessionsCreate: 'sessions:create',
  sessionsUpdate: 'sessions:update',
  sessionsDelete: 'sessions:delete',

  timerGetState: 'timer:get-state',
  timerStart: 'timer:start',
  timerPause: 'timer:pause',
  timerResume: 'timer:resume',
  timerStop: 'timer:stop',
  timerComplete: 'timer:complete',
  timerAddTime: 'timer:add-time',

  accuracyGetForWorkItem: 'accuracy:get-for-work-item',
  accuracyGetOverall: 'accuracy:get-overall',

  backupExportJson: 'backup:export-json',
  backupRestore: 'backup:restore',
  backupCreateDb: 'backup:create-db',

  // Stage 08 Channels: Review System
  reviewPoliciesList: 'review-policies:list',
  reviewPoliciesCreate: 'review-policies:create',
  reviewPoliciesUpdate: 'review-policies:update',
  reviewPoliciesDelete: 'review-policies:delete',
  reviewAttach: 'review:attach',
  reviewDetach: 'review:detach',
  reviewEventsRecord: 'review-events:record',
  reviewEventsList: 'review-events:list',
  reviewGetDue: 'review:get-due',
  reviewSyncToPlanner: 'review:sync-to-planner',

  // Stage 09 Channels: Replanning Engine, History & Versions
  replanningPreview: 'replanning:preview',
  replanningApply: 'replanning:apply',
  replanningUndo: 'replanning:undo',
  replanningGetHistory: 'replanning:get-history',
  replanningGetVersions: 'replanning:get-versions',

  // Stage 10 Channels: Progress Engine, Metrics, Analytics & Dashboard
  progressGetGoal: 'progress:get-goal',
  progressRecordSnapshot: 'progress:record-snapshot',
  progressGetHistory: 'progress:get-history',
  goalMetricsList: 'goal-metrics:list',
  goalMetricsCreate: 'goal-metrics:create',
  goalMetricsUpdate: 'goal-metrics:update',
  goalMetricsDelete: 'goal-metrics:delete',
  analyticsGetOverview: 'analytics:get-overview',
  dashboardGetData: 'dashboard:get-data',

  // Stage 11 Channels: Templates, Onboarding & Demo
  templatesList: 'templates:list',
  templatesApply: 'templates:apply',
  templatesSaveCustom: 'templates:save-custom',
  templatesDelete: 'templates:delete',
  demoLoad: 'demo:load',
  demoDelete: 'demo:delete',

  entityArchive: 'entities:archive',
  entityRestore: 'entities:restore',
  entityDelete: 'entities:delete',

  // Stage 12 Channels: Search, Weekly Review, Template Export/Import
  searchGlobal: 'search:global',
  weeklyReviewGenerate: 'weekly-review:generate',
  templatesExportJson: 'templates:export-json',
  templatesImportJson: 'templates:import-json'
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

  // Stage 07: Sessions
  [ipcChannels.sessionsList]: z.object({ workItemId: z.string().uuid().optional() }).optional(),
  [ipcChannels.sessionsCreate]: z.object({
    workItemId: z.string().uuid().optional().nullable(),
    scheduledItemId: z.string().optional().nullable(),
    projectId: z.string().uuid().optional().nullable(),
    goalId: z.string().uuid().optional().nullable(),
    areaId: z.string().uuid().optional().nullable(),
    startTime: z.number(),
    endTime: z.number(),
    durationMinutes: z.number().optional(),
    pausedDurationMinutes: z.number().optional(),
    interruptionsCount: z.number().int().optional(),
    mode: z.enum(['countdown', 'stopwatch', 'pomodoro', 'custom']).optional(),
    notes: z.string().optional().nullable()
  }),
  [ipcChannels.sessionsUpdate]: z.object({
    id: z.string().uuid(),
    startTime: z.number().optional(),
    endTime: z.number().optional(),
    durationMinutes: z.number().optional(),
    pausedDurationMinutes: z.number().optional(),
    interruptionsCount: z.number().int().optional(),
    notes: z.string().optional().nullable()
  }),
  [ipcChannels.sessionsDelete]: z.object({ id: z.string().uuid() }),

  // Stage 07: Timer
  [ipcChannels.timerGetState]: z.undefined(),
  [ipcChannels.timerStart]: z.object({
    mode: z.enum(['countdown', 'stopwatch', 'pomodoro', 'custom']).optional(),
    workItemId: z.string().uuid().optional().nullable(),
    workItemTitle: z.string().optional().nullable(),
    scheduledItemId: z.string().optional().nullable(),
    projectId: z.string().uuid().optional().nullable(),
    goalId: z.string().uuid().optional().nullable(),
    areaId: z.string().uuid().optional().nullable(),
    targetDurationMinutes: z.number().optional(),
    notes: z.string().optional().nullable()
  }),
  [ipcChannels.timerPause]: z.undefined(),
  [ipcChannels.timerResume]: z.undefined(),
  [ipcChannels.timerStop]: z.undefined(),
  [ipcChannels.timerComplete]: z.undefined(),
  [ipcChannels.timerAddTime]: z.object({ minutes: z.number() }),

  // Stage 07: Accuracy
  [ipcChannels.accuracyGetForWorkItem]: z.object({ workItemId: z.string().uuid() }),
  [ipcChannels.accuracyGetOverall]: z.undefined(),

  // Stage 07: Backup
  [ipcChannels.backupExportJson]: z.undefined(),
  [ipcChannels.backupRestore]: z.object({ jsonData: z.string() }),
  [ipcChannels.backupCreateDb]: z.object({ destPath: z.string().optional() }).optional(),

  // Stage 08: Review System
  [ipcChannels.reviewPoliciesList]: z.undefined(),
  [ipcChannels.reviewPoliciesCreate]: z.object({
    name: z.string().trim().min(1),
    intervalStrategy: z.string().optional(),
    intervalDays: z.union([z.array(z.number()), z.string()]).optional(),
    shortenOnWeak: z.boolean().optional(),
    enabled: z.boolean().optional()
  }),
  [ipcChannels.reviewPoliciesUpdate]: z.object({
    id: z.string().uuid(),
    name: z.string().trim().min(1).optional(),
    intervalStrategy: z.string().optional(),
    intervalDays: z.union([z.array(z.number()), z.string()]).optional(),
    shortenOnWeak: z.boolean().optional(),
    enabled: z.boolean().optional()
  }),
  [ipcChannels.reviewPoliciesDelete]: z.object({ id: z.string().uuid() }),
  [ipcChannels.reviewAttach]: z.object({
    itemKind: z.enum(['workItem', 'resourceItem']),
    itemId: z.string().uuid(),
    policyId: z.string().uuid()
  }),
  [ipcChannels.reviewDetach]: z.object({
    itemKind: z.enum(['workItem', 'resourceItem']),
    itemId: z.string().uuid()
  }),
  [ipcChannels.reviewEventsRecord]: z.object({
    workItemId: z.string().uuid().optional().nullable(),
    resourceItemId: z.string().uuid().optional().nullable(),
    reviewedAt: z.number().optional(),
    durationMinutes: z.number().optional(),
    result: z.enum(['strong', 'good', 'weak']).optional().nullable(),
    notes: z.string().optional().nullable()
  }),
  [ipcChannels.reviewEventsList]: z.object({
    workItemId: z.string().uuid().optional(),
    resourceItemId: z.string().uuid().optional()
  }).optional(),
  [ipcChannels.reviewGetDue]: z.object({ nowMs: z.number().optional() }).optional(),
  [ipcChannels.reviewSyncToPlanner]: z.object({ nowMs: z.number().optional() }).optional(),

  // Stage 09: Replanning Engine
  [ipcChannels.replanningPreview]: z.object({
    targetDate: z.string(),
    currentTime: z.string().optional(),
    activeWorkItemId: z.string().nullable().optional(),
    trigger: z.any().optional()
  }),
  [ipcChannels.replanningApply]: z.object({
    targetDate: z.string(),
    updatedSchedule: z.array(z.any()),
    changes: z.array(z.any()),
    trigger: z.string().optional(),
    summary: z.string().optional()
  }),
  [ipcChannels.replanningUndo]: z.object({
    targetDate: z.string()
  }),
  [ipcChannels.replanningGetHistory]: z.object({
    targetDate: z.string().optional()
  }).optional(),
  [ipcChannels.replanningGetVersions]: z.object({
    targetDate: z.string()
  }),

  // Stage 10: Progress, Metrics, Analytics & Dashboard
  [ipcChannels.progressGetGoal]: z.object({ goalId: z.string().uuid() }),
  [ipcChannels.progressRecordSnapshot]: z.object({
    entityType: z.enum(['goal', 'project', 'milestone']),
    entityId: z.string().uuid(),
    progress: z.number().optional(),
    notes: z.string().optional()
  }),
  [ipcChannels.progressGetHistory]: z.object({
    entityType: z.string(),
    entityId: z.string().uuid()
  }),
  [ipcChannels.goalMetricsList]: z.object({ goalId: z.string().uuid() }),
  [ipcChannels.goalMetricsCreate]: z.object({
    goalId: z.string().uuid(),
    name: z.string().trim().min(1),
    unit: z.string().optional(),
    currentValue: z.number().optional(),
    targetValue: z.number().optional()
  }),
  [ipcChannels.goalMetricsUpdate]: z.object({
    id: z.string().uuid(),
    name: z.string().trim().min(1).optional(),
    unit: z.string().optional(),
    currentValue: z.number().optional(),
    targetValue: z.number().optional()
  }),
  [ipcChannels.goalMetricsDelete]: z.object({ id: z.string().uuid() }),
  [ipcChannels.analyticsGetOverview]: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    areaId: z.string().optional(),
    goalId: z.string().optional(),
    projectId: z.string().optional(),
    tagId: z.string().optional(),
    itemType: z.string().optional()
  }).optional(),
  [ipcChannels.dashboardGetData]: z.object({
    nowDate: z.string().optional()
  }).optional(),

  // Stage 11: Templates, Onboarding & Demo
  [ipcChannels.templatesList]: z.undefined(),
  [ipcChannels.templatesApply]: z.object({
    id: z.string(),
    skipDuplicates: z.boolean().optional()
  }),
  [ipcChannels.templatesSaveCustom]: z.object({
    name: z.string().trim().min(1),
    description: z.string().optional(),
    includeAreas: z.boolean().optional(),
    includeGoals: z.boolean().optional(),
    includeMilestones: z.boolean().optional(),
    includeWorkItemTypes: z.boolean().optional(),
    includeRoutines: z.boolean().optional(),
    includeTimeBudgets: z.boolean().optional(),
    includeReviewPolicies: z.boolean().optional()
  }),
  [ipcChannels.templatesDelete]: z.object({ id: z.string() }),
  [ipcChannels.demoLoad]: z.undefined(),
  [ipcChannels.demoDelete]: z.undefined(),

  [ipcChannels.entityArchive]: archiveEntitySchema,
  [ipcChannels.entityRestore]: restoreEntitySchema,
  [ipcChannels.entityDelete]: deleteEntitySchema,

  // Stage 12 schemas
  [ipcChannels.searchGlobal]: z.object({
    q: z.string(),
    limit: z.number().int().positive().optional(),
    types: z.array(z.string()).optional(),
    includeArchived: z.boolean().optional()
  }),
  [ipcChannels.weeklyReviewGenerate]: z.object({
    startDate: z.string(),
    endDate: z.string()
  }),
  [ipcChannels.templatesExportJson]: z.object({ id: z.string() }),
  [ipcChannels.templatesImportJson]: z.object({ jsonStr: z.string() })
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
  sessions: {
    list: (workItemId?: string) => Promise<TimeSessionItem[]>
    create: (input: TimeSessionInput) => Promise<TimeSessionItem>
    update: (input: TimeSessionUpdateInput) => Promise<TimeSessionItem>
    delete: (id: string) => Promise<void>
  }
  timer: {
    getState: () => Promise<TimerInfoResponse>
    start: (input: {
      mode?: 'countdown' | 'stopwatch' | 'pomodoro' | 'custom'
      workItemId?: string | null
      workItemTitle?: string | null
      scheduledItemId?: string | null
      projectId?: string | null
      goalId?: string | null
      areaId?: string | null
      targetDurationMinutes?: number
      notes?: string | null
    }) => Promise<TimerInfoResponse>
    pause: () => Promise<TimerInfoResponse>
    resume: () => Promise<TimerInfoResponse>
    stop: () => Promise<TimerInfoResponse>
    complete: () => Promise<{ session: TimeSessionItem; timerInfo: TimerInfoResponse }>
    addTime: (minutes: number) => Promise<TimerInfoResponse>
  }
  accuracy: {
    getForWorkItem: (workItemId: string) => Promise<EstimationAccuracyResult>
    getOverall: () => Promise<AggregatedAccuracyResult>
  }
  backup: {
    exportJson: () => Promise<BackupJsonExport>
    restore: (jsonData: string) => Promise<void>
    createDb: (destPath?: string) => Promise<string>
  }
  reviews: {
    listPolicies: () => Promise<ReviewPolicyData[]>
    createPolicy: (input: ReviewPolicyInput) => Promise<ReviewPolicyData>
    updatePolicy: (input: ReviewPolicyUpdateInput) => Promise<ReviewPolicyData>
    deletePolicy: (id: string) => Promise<void>
    attachPolicy: (itemKind: 'workItem' | 'resourceItem', itemId: string, policyId: string) => Promise<void>
    detachPolicy: (itemKind: 'workItem' | 'resourceItem', itemId: string) => Promise<void>
    recordEvent: (input: ReviewEventInput) => Promise<any>
    listEvents: (filter?: { workItemId?: string; resourceItemId?: string }) => Promise<any[]>
    getDue: (nowMs?: number) => Promise<DueReviewsFilterResult>
    syncToPlanner: (nowMs?: number) => Promise<string[]>
  }
  replanning: {
    preview: (input: {
      targetDate: string
      currentTime?: string
      activeWorkItemId?: string | null
      trigger?: any
    }) => Promise<ReplanningResult>
    apply: (input: {
      targetDate: string
      updatedSchedule: SchedulerScheduleItem[]
      changes: ReplanningChange[]
      trigger?: string
      summary?: string
    }) => Promise<{ success: boolean; versionId: string; historyId: string }>
    undo: (targetDate: string) => Promise<{ success: boolean; restoredSchedule: SchedulerScheduleItem[] }>
    getHistory: (targetDate?: string) => Promise<ReplanningHistoryItem[]>
    getVersions: (targetDate: string) => Promise<PlanVersionItem[]>
  }
  progress: {
    getGoal: (goalId: string) => Promise<GoalProgressResult>
    recordSnapshot: (input: { entityType: 'goal' | 'project' | 'milestone'; entityId: string; progress?: number; notes?: string }) => Promise<void>
    getHistory: (entityType: string, entityId: string) => Promise<any[]>
  }
  goalMetrics: {
    list: (goalId: string) => Promise<any[]>
    create: (input: { goalId: string; name: string; unit?: string; currentValue?: number; targetValue?: number }) => Promise<any>
    update: (input: { id: string; name?: string; unit?: string; currentValue?: number; targetValue?: number }) => Promise<any>
    delete: (id: string) => Promise<void>
  }
  analytics: {
    getOverview: (filter?: AnalyticsFilter) => Promise<AnalyticsOverview>
  }
  dashboard: {
    getData: (nowDate?: string) => Promise<DashboardData>
  }
  templates: {
    list: () => Promise<TemplateRecord[]>
    apply: (id: string, skipDuplicates?: boolean) => Promise<ApplyTemplateResult>
    saveCustom: (input: SaveCustomTemplateInput) => Promise<TemplateRecord>
    delete: (id: string) => Promise<void>
    exportJson: (id: string) => Promise<string>
    importJson: (jsonStr: string) => Promise<TemplateRecord>
  }
  demo: {
    load: () => Promise<void>
    delete: () => Promise<void>
  }
  search: {
    global: (query: SearchQuery) => Promise<SearchResponse>
  }
  weeklyReview: {
    generate: (period: WeeklyReviewPeriod) => Promise<WeeklyReviewResult>
  }
}
