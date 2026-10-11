/**
 * Shared types for the Template system (Stage 11).
 *
 * A TemplatePayload is a pure data description of what gets created when
 * a template is applied.  It maps directly to the existing entity services —
 * no changes to the scheduler or any engine are required.
 */

export interface TemplateArea {
  /** Stable local key used as a reference within this template only */
  _key: string
  name: string
  description?: string
  color?: string
  icon?: string
}

export interface TemplateGoal {
  _key: string
  areaKey?: string
  title: string
  description?: string
  progressMode?: 'manual' | 'weighted' | 'calculated'
  measurementType?: string
}

export interface TemplateMilestone {
  _key: string
  goalKey: string
  title: string
  description?: string
}

export interface TemplateWorkItemType {
  _key: string
  name: string
  color?: string
  icon?: string
}

export interface TemplateRoutine {
  _key: string
  name: string
  description?: string
  targetDuration: number // minutes
  recurrenceRule: string // RRULE string, e.g. FREQ=DAILY
  preferredTime?: string // HH:mm
  flexibility?: string
}

export interface TemplateTimeBudget {
  _key: string
  name: string
  areaKey?: string
  goalKey?: string
  allocationMode?: string
  protection?: string
  targetMinutes: number
  daysOfWeek?: number[]
  priority?: string
}

export interface TemplateReviewPolicy {
  _key: string
  name: string
  intervalDays?: number[]
  shortenOnWeak?: boolean
}

export interface TemplateResource {
  _key: string
  areaKey?: string
  goalKey?: string
  title: string
  resourceType?: string
  orderingMode?: string
  items: Array<{
    _key: string
    title: string
    estimatedMinutes?: number
    itemType?: string
    children?: Array<{ title: string; estimatedMinutes?: number; itemType?: string }>
  }>
}

export interface TemplatePayload {
  areas?: TemplateArea[]
  goals?: TemplateGoal[]
  milestones?: TemplateMilestone[]
  workItemTypes?: TemplateWorkItemType[]
  routines?: TemplateRoutine[]
  timeBudgets?: TemplateTimeBudget[]
  reviewPolicies?: TemplateReviewPolicy[]
  resources?: TemplateResource[]
}

export interface TemplateRecord {
  id: string
  name: string
  description?: string | null
  category: string
  builtin: boolean
  payload: TemplatePayload
  createdAt: number
  updatedAt: number
}

export interface ApplyTemplateOptions {
  /** If true, skip items that already exist (matched by name) instead of erroring */
  skipDuplicates?: boolean
}

export interface ApplyTemplateResult {
  created: Record<string, number> // entityType -> count
  skipped: Record<string, number>
}

export interface SaveCustomTemplateInput {
  name: string
  description?: string
  includeAreas?: boolean
  includeGoals?: boolean
  includeMilestones?: boolean
  includeWorkItemTypes?: boolean
  includeRoutines?: boolean
  includeTimeBudgets?: boolean
  includeReviewPolicies?: boolean
}
