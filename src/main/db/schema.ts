import { check, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

export const settings = sqliteTable('settings', {
  id: text('id').primaryKey(),
  locale: text('locale').notNull().default('en'),
  theme: text('theme').notNull().default('system'),
  weekStartsOn: integer('week_starts_on').notNull().default(6),
  timezone: text('timezone').notNull().default('UTC'),
  use24HourTime: integer('use_24_hour_time', { mode: 'boolean' }).notNull().default(true),
  planningCapacityPercentage: integer('planning_capacity_percentage').notNull().default(75),
  bufferPercentage: integer('buffer_percentage').notNull().default(20),
  notificationsEnabled: integer('notifications_enabled', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull()
})

export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(),
  displayName: text('display_name'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  archivedAt: integer('archived_at')
})

const audit = { createdAt: integer('created_at').notNull(), updatedAt: integer('updated_at').notNull(), archivedAt: integer('archived_at') }

export const areas = sqliteTable('areas', { id: text('id').primaryKey(), name: text('name').notNull(), description: text('description'), icon: text('icon'), color: text('color'), sortOrder: integer('sort_order').notNull().default(0), ...audit })
export const goals = sqliteTable('goals', { id: text('id').primaryKey(), areaId: text('area_id').references(() => areas.id, { onDelete: 'set null' }), title: text('title').notNull(), description: text('description'), priority: text('priority').notNull().default('medium'), status: text('status').notNull().default('active'), startDate: text('start_date'), targetDate: text('target_date'), measurementType: text('measurement_type').notNull().default('percentage'), progressMode: text('progress_mode').notNull().default('manual'), targetValue: integer('target_value'), currentValue: integer('current_value').notNull().default(0), unit: text('unit'), ...audit })
export const milestones = sqliteTable('milestones', { id: text('id').primaryKey(), goalId: text('goal_id').notNull().references(() => goals.id, { onDelete: 'cascade' }), title: text('title').notNull(), description: text('description'), orderIndex: integer('order_index').notNull().default(0), targetDate: text('target_date'), status: text('status').notNull().default('active'), progress: integer('progress').notNull().default(0), ...audit })
export const projects = sqliteTable('projects', { id: text('id').primaryKey(), areaId: text('area_id').references(() => areas.id, { onDelete: 'set null' }), goalId: text('goal_id').references(() => goals.id, { onDelete: 'set null' }), milestoneId: text('milestone_id').references(() => milestones.id, { onDelete: 'set null' }), parentProjectId: text('parent_project_id'), title: text('title').notNull(), description: text('description'), priority: text('priority').notNull().default('medium'), status: text('status').notNull().default('active'), startDate: text('start_date'), deadline: text('deadline'), estimatedMinutes: integer('estimated_minutes').notNull().default(0), completedMinutes: integer('completed_minutes').notNull().default(0), progress: integer('progress').notNull().default(0), ...audit })
export const workItemTypes = sqliteTable('work_item_types', { id: text('id').primaryKey(), name: text('name').notNull(), builtIn: integer('built_in', { mode: 'boolean' }).notNull().default(false), color: text('color'), icon: text('icon'), sortOrder: integer('sort_order').notNull().default(0), ...audit })
export const customFieldDefinitions = sqliteTable('custom_field_definitions', { id: text('id').primaryKey(), workItemTypeId: text('work_item_type_id').notNull().references(() => workItemTypes.id, { onDelete: 'cascade' }), name: text('name').notNull(), fieldType: text('field_type').notNull(), options: text('options'), required: integer('required', { mode: 'boolean' }).notNull().default(false), sortOrder: integer('sort_order').notNull().default(0), createdAt: integer('created_at').notNull(), updatedAt: integer('updated_at').notNull() })
export const workItems = sqliteTable('work_items', { id: text('id').primaryKey(), projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }), goalId: text('goal_id').references(() => goals.id, { onDelete: 'set null' }), areaId: text('area_id').references(() => areas.id, { onDelete: 'set null' }), parentId: text('parent_id'), title: text('title').notNull(), description: text('description'), workItemTypeId: text('work_item_type_id').references(() => workItemTypes.id, { onDelete: 'set null' }), status: text('status').notNull().default('todo'), priority: text('priority').notNull().default('medium'), estimatedMinutes: integer('estimated_minutes').notNull().default(0), actualMinutes: integer('actual_minutes').notNull().default(0), deadline: text('deadline'), preferredDate: text('preferred_date'), preferredStartTime: text('preferred_start_time'), preferredEndTime: text('preferred_end_time'), energyLevel: text('energy_level'), flexibility: text('flexibility').notNull().default('flexible'), progress: integer('progress').notNull().default(0), orderIndex: integer('order_index').notNull().default(0), recurrenceRule: text('recurrence_rule'), reviewPolicyId: text('review_policy_id'), lastReviewedAt: integer('last_reviewed_at'), nextReviewAt: integer('next_review_at'), reviewCount: integer('review_count').notNull().default(0), reviewStatus: text('review_status').notNull().default('none'), ...audit })
export const customFieldValues = sqliteTable('custom_field_values', { id: text('id').primaryKey(), workItemId: text('work_item_id').notNull().references(() => workItems.id, { onDelete: 'cascade' }), definitionId: text('definition_id').notNull().references(() => customFieldDefinitions.id, { onDelete: 'cascade' }), textValue: text('text_value'), numberValue: integer('number_value'), booleanValue: integer('boolean_value', { mode: 'boolean' }), dateValue: text('date_value'), selectValue: text('select_value'), createdAt: integer('created_at').notNull(), updatedAt: integer('updated_at').notNull() })
export const tags = sqliteTable('tags', { id: text('id').primaryKey(), name: text('name').notNull().unique(), color: text('color'), ...audit })
export const entityTags = sqliteTable('entity_tags', { id: text('id').primaryKey(), entityType: text('entity_type').notNull(), entityId: text('entity_id').notNull(), tagId: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }), createdAt: integer('created_at').notNull(), updatedAt: integer('updated_at').notNull() })
export const notes = sqliteTable('notes', { id: text('id').primaryKey(), entityType: text('entity_type').notNull(), entityId: text('entity_id').notNull(), content: text('content').notNull(), ...audit })

// Stage 03 Tables
export const resources = sqliteTable('resources', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  resourceType: text('resource_type').notNull().default('course'),
  orderingMode: text('ordering_mode').notNull().default('sequential'),
  areaId: text('area_id').references(() => areas.id, { onDelete: 'set null' }),
  goalId: text('goal_id').references(() => goals.id, { onDelete: 'set null' }),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }),
  ...audit
})

export const resourceItems = sqliteTable('resource_items', {
  id: text('id').primaryKey(),
  resourceId: text('resource_id').notNull().references(() => resources.id, { onDelete: 'cascade' }),
  parentId: text('parent_id'),
  title: text('title').notNull(),
  itemType: text('item_type').notNull().default('item'),
  sourceUrl: text('source_url'),
  estimatedMinutes: integer('estimated_minutes').notNull().default(0),
  orderIndex: integer('order_index').notNull().default(0),
  status: text('status').notNull().default('todo'),
  progress: integer('progress').notNull().default(0),
  notes: text('notes'),
  workItemId: text('work_item_id').references(() => workItems.id, { onDelete: 'set null' }),
  reviewPolicyId: text('review_policy_id'),
  lastReviewedAt: integer('last_reviewed_at'),
  nextReviewAt: integer('next_review_at'),
  reviewCount: integer('review_count').notNull().default(0),
  reviewStatus: text('review_status').notNull().default('none'),
  ...audit
})

export const workItemDependencies = sqliteTable('work_item_dependencies', {
  id: text('id').primaryKey(),
  predecessorId: text('predecessor_id').notNull(),
  successorId: text('successor_id').notNull(),
  predecessorType: text('predecessor_type').notNull().default('work_item'),
  successorType: text('successor_type').notNull().default('work_item'),
  dependencyType: text('dependency_type').notNull().default('finish_to_start'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull()
})

// Stage 04 Tables: Time Model
export const availabilityRules = sqliteTable('availability_rules', {
  id: text('id').primaryKey(),
  dayOfWeek: integer('day_of_week').notNull(), // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: text('start_time').notNull().default('09:00'),
  endTime: text('end_time').notNull().default('17:00'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull()
})

export const availabilityOverrides = sqliteTable('availability_overrides', {
  id: text('id').primaryKey(),
  date: text('date').notNull(), // YYYY-MM-DD
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  isUnavailable: integer('is_unavailable', { mode: 'boolean' }).notNull().default(false),
  notes: text('notes'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull()
})

export const fixedEvents = sqliteTable('fixed_events', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  startTime: text('start_time').notNull(), // HH:mm or YYYY-MM-DD HH:mm
  endTime: text('end_time').notNull(),
  recurrenceRule: text('recurrence_rule'),
  flexibility: text('flexibility').notNull().default('fixed'),
  locked: integer('locked', { mode: 'boolean' }).notNull().default(true),
  notes: text('notes'),
  ...audit
})

export const timeBudgets = sqliteTable('time_budgets', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  allocationMode: text('allocation_mode').notNull().default('target'), // minimum | target | maximum | range
  protection: text('protection').notNull().default('flexible'), // flexible | protected | locked
  minimumMinutes: integer('minimum_minutes').notNull().default(0),
  targetMinutes: integer('target_minutes').notNull().default(0),
  maximumMinutes: integer('maximum_minutes').notNull().default(0),
  daysOfWeek: text('days_of_week').notNull().default('[0,1,2,3,4,5,6]'),
  priority: text('priority').notNull().default('medium'),
  startDate: text('start_date'),
  endDate: text('end_date'),
  areaId: text('area_id').references(() => areas.id, { onDelete: 'cascade' }),
  goalId: text('goal_id').references(() => goals.id, { onDelete: 'cascade' }),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  workItemTypeId: text('work_item_type_id').references(() => workItemTypes.id, { onDelete: 'cascade' }),
  ...audit
}, (table) => [
  check('exactly_one_scope', sql`((CASE WHEN ${table.areaId} IS NOT NULL THEN 1 ELSE 0 END) + (CASE WHEN ${table.goalId} IS NOT NULL THEN 1 ELSE 0 END) + (CASE WHEN ${table.projectId} IS NOT NULL THEN 1 ELSE 0 END) + (CASE WHEN ${table.workItemTypeId} IS NOT NULL THEN 1 ELSE 0 END)) = 1`)
])

export const routines = sqliteTable('routines', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  itemType: text('item_type').notNull().default('routine'),
  targetDuration: integer('target_duration').notNull().default(30),
  recurrenceRule: text('recurrence_rule').notNull().default('FREQ=DAILY'),
  preferredTime: text('preferred_time'),
  flexibility: text('flexibility').notNull().default('semi_flexible'),
  protected: integer('protected', { mode: 'boolean' }).notNull().default(false),
  priority: text('priority').notNull().default('medium'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  ...audit
})

export const habits = sqliteTable('habits', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  targetType: text('target_type').notNull().default('binary'), // binary | count | duration | frequency
  targetValue: integer('target_value').notNull().default(1),
  targetFrequencyDays: integer('target_frequency_days').notNull().default(7),
  unit: text('unit'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  ...audit
})

export const habitLogs = sqliteTable('habit_logs', {
  id: text('id').primaryKey(),
  habitId: text('habit_id').notNull().references(() => habits.id, { onDelete: 'cascade' }),
  date: text('date').notNull(), // YYYY-MM-DD
  value: integer('value').notNull().default(1),
  notes: text('notes'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull()
})

export const scheduledItems = sqliteTable('scheduled_items', {
  id: text('id').primaryKey(),
  workItemId: text('work_item_id').references(() => workItems.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  date: text('date').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  sessionIndex: integer('session_index').notNull().default(1),
  totalSessions: integer('total_sessions').notNull().default(1),
  isSplit: integer('is_split', { mode: 'boolean' }).notNull().default(false),
  locked: integer('locked', { mode: 'boolean' }).notNull().default(false),
  reason: text('reason'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull()
})

export const timeSessions = sqliteTable('time_sessions', {
  id: text('id').primaryKey(),
  workItemId: text('work_item_id').references(() => workItems.id, { onDelete: 'cascade' }),
  scheduledItemId: text('scheduled_item_id').references(() => scheduledItems.id, { onDelete: 'set null' }),
  projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }),
  goalId: text('goal_id').references(() => goals.id, { onDelete: 'set null' }),
  areaId: text('area_id').references(() => areas.id, { onDelete: 'set null' }),
  startTime: integer('start_time').notNull(),
  endTime: integer('end_time').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  pausedDurationMinutes: integer('paused_duration_minutes').notNull().default(0),
  interruptionsCount: integer('interruptions_count').notNull().default(0),
  mode: text('mode').notNull().default('stopwatch'),
  notes: text('notes'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull()
})

// Stage 08 Tables: Review System

export const reviewPolicies = sqliteTable('review_policies', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  /** 'fixed' = use intervalDays list; 'custom' treated same but stored differently */
  intervalStrategy: text('interval_strategy').notNull().default('fixed'),
  /** JSON array of integers representing days between reviews, e.g. [1,3,7,14,30] */
  intervalDays: text('interval_days').notNull().default('[1,3,7,14,30]'),
  /** If true, a 'weak' result on a review shortens the next interval to the previous step */
  shortenOnWeak: integer('shorten_on_weak', { mode: 'boolean' }).notNull().default(false),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull()
})

export const reviewEvents = sqliteTable('review_events', {
  id: text('id').primaryKey(),
  workItemId: text('work_item_id').references(() => workItems.id, { onDelete: 'cascade' }),
  resourceItemId: text('resource_item_id').references(() => resourceItems.id, { onDelete: 'cascade' }),
  reviewedAt: integer('reviewed_at').notNull(),
  durationMinutes: integer('duration_minutes').notNull().default(0),
  /** 'strong' | 'good' | 'weak' | null */
  result: text('result'),
  notes: text('notes'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull()
}, (table) => [
  check('exactly_one_ref', sql`((CASE WHEN ${table.workItemId} IS NOT NULL THEN 1 ELSE 0 END) + (CASE WHEN ${table.resourceItemId} IS NOT NULL THEN 1 ELSE 0 END)) = 1`)
])
