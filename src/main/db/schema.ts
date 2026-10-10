import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const settings = sqliteTable('settings', {
  id: text('id').primaryKey(),
  locale: text('locale').notNull().default('en'),
  theme: text('theme').notNull().default('system'),
  weekStartsOn: integer('week_starts_on').notNull().default(6),
  timezone: text('timezone').notNull().default('UTC'),
  use24HourTime: integer('use_24_hour_time', { mode: 'boolean' }).notNull().default(true),
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
export const workItems = sqliteTable('work_items', { id: text('id').primaryKey(), projectId: text('project_id').references(() => projects.id, { onDelete: 'set null' }), goalId: text('goal_id').references(() => goals.id, { onDelete: 'set null' }), areaId: text('area_id').references(() => areas.id, { onDelete: 'set null' }), parentId: text('parent_id'), title: text('title').notNull(), description: text('description'), workItemTypeId: text('work_item_type_id').references(() => workItemTypes.id, { onDelete: 'set null' }), status: text('status').notNull().default('todo'), priority: text('priority').notNull().default('medium'), estimatedMinutes: integer('estimated_minutes').notNull().default(0), actualMinutes: integer('actual_minutes').notNull().default(0), deadline: text('deadline'), preferredDate: text('preferred_date'), preferredStartTime: text('preferred_start_time'), preferredEndTime: text('preferred_end_time'), energyLevel: text('energy_level'), flexibility: text('flexibility').notNull().default('flexible'), progress: integer('progress').notNull().default(0), orderIndex: integer('order_index').notNull().default(0), recurrenceRule: text('recurrence_rule'), ...audit })
export const customFieldValues = sqliteTable('custom_field_values', { id: text('id').primaryKey(), workItemId: text('work_item_id').notNull().references(() => workItems.id, { onDelete: 'cascade' }), definitionId: text('definition_id').notNull().references(() => customFieldDefinitions.id, { onDelete: 'cascade' }), textValue: text('text_value'), numberValue: integer('number_value'), booleanValue: integer('boolean_value', { mode: 'boolean' }), dateValue: text('date_value'), selectValue: text('select_value'), createdAt: integer('created_at').notNull(), updatedAt: integer('updated_at').notNull() })
export const tags = sqliteTable('tags', { id: text('id').primaryKey(), name: text('name').notNull().unique(), color: text('color'), ...audit })
export const entityTags = sqliteTable('entity_tags', { id: text('id').primaryKey(), entityType: text('entity_type').notNull(), entityId: text('entity_id').notNull(), tagId: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }), createdAt: integer('created_at').notNull(), updatedAt: integer('updated_at').notNull() })
export const notes = sqliteTable('notes', { id: text('id').primaryKey(), entityType: text('entity_type').notNull(), entityId: text('entity_id').notNull(), content: text('content').notNull(), ...audit })
