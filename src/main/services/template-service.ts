/**
 * Template Service (Stage 11)
 *
 * Responsibilities:
 * - Seed built-in templates from JSON files into the `templates` table once.
 * - List all templates (built-in + custom).
 * - Apply a template: iterate payload sections, call the existing entity
 *   services, handle duplicate detection, and return a result summary.
 * - Save custom templates from the current database state.
 * - Delete custom templates.
 *
 * IMPORTANT: This service MUST NOT touch the scheduler or any planning engine.
 * Templates are pure data creation through the existing entity services.
 */

import { eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import fs from 'node:fs'
import { app } from 'electron'
import { getDatabase } from '../db/database'
import { templates, reviewPolicies, resourceItems } from '../db/schema'
import type {
  TemplatePayload,
  TemplateRecord,
  ApplyTemplateOptions,
  ApplyTemplateResult,
  SaveCustomTemplateInput
} from '../../shared/templates'
import {
  createArea,
  listAreas,
  createGoal,
  listGoals,
  createMilestone,
  listMilestones,
  createRoutine,
  listRoutines,
  createTimeBudget,
  listTimeBudgets,
  createWorkItemType,
  listWorkItemTypes,
  createResource,
  listResources
} from './entity-service'
import { createReviewPolicy } from './review-service'

const now = (): number => Date.now()

// ---------------------------------------------------------------------------
// Built-in template seeding
// ---------------------------------------------------------------------------

const BUILTIN_FILES = [
  'builtin-study.json',
  'builtin-fitness.json',
  'builtin-review.json',
  'builtin-freelance.json'
]

export function seedBuiltInTemplates(): void {
  const db = getDatabase()
  const existing = db.select().from(templates).where(eq(templates.builtin, true)).all()
  if (existing.length >= BUILTIN_FILES.length) return

  const existingIds = new Set(existing.map((t) => t.id))
  const appPath = typeof app?.getAppPath === 'function' ? app.getAppPath() : process.cwd()
  const templateDir = path.join(appPath, 'src', 'main', 'templates')

  for (const file of BUILTIN_FILES) {
    const filePath = path.join(templateDir, file)
    if (!fs.existsSync(filePath)) continue
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    if (existingIds.has(raw.id)) continue

    const { id, name, description, category, ...rest } = raw
    const payload: TemplatePayload = rest as TemplatePayload
    const ts = now()
    db.insert(templates).values({
      id,
      name,
      description: description ?? null,
      category: category ?? 'custom',
      builtin: true,
      payloadJson: JSON.stringify(payload),
      createdAt: ts,
      updatedAt: ts
    }).run()
  }
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export function listTemplates(): TemplateRecord[] {
  const db = getDatabase()
  return db.select().from(templates).all().map(rowToRecord)
}

export function getTemplate(id: string): TemplateRecord | undefined {
  const db = getDatabase()
  const row = db.select().from(templates).where(eq(templates.id, id)).get()
  return row ? rowToRecord(row) : undefined
}

export function deleteTemplate(id: string): void {
  const db = getDatabase()
  const row = db.select().from(templates).where(eq(templates.id, id)).get()
  if (!row) throw new Error('Template not found')
  if (row.builtin) throw new Error('Cannot delete a built-in template')
  db.delete(templates).where(eq(templates.id, id)).run()
}

// ---------------------------------------------------------------------------
// Apply a template
// ---------------------------------------------------------------------------

export function applyTemplate(
  id: string,
  options: ApplyTemplateOptions = {}
): ApplyTemplateResult {
  const tpl = getTemplate(id)
  if (!tpl) throw new Error(`Template not found: ${id}`)
  return applyPayload(tpl.payload, options)
}

export function applyPayload(
  payload: TemplatePayload,
  options: ApplyTemplateOptions = {}
): ApplyTemplateResult {
  const skipDuplicates = options.skipDuplicates ?? true
  const created: Record<string, number> = {}
  const skipped: Record<string, number> = {}

  const inc = (obj: Record<string, number>, key: string): void => {
    obj[key] = (obj[key] ?? 0) + 1
  }

  // Track created entity IDs so later sections can reference them by _key
  const areaIdByKey: Record<string, string> = {}
  const goalIdByKey: Record<string, string> = {}

  // --- Areas ---
  if (payload.areas?.length) {
    const existingAreaNames = new Set(listAreas().map((a) => a.name.toLowerCase()))
    for (const tArea of payload.areas) {
      if (skipDuplicates && existingAreaNames.has(tArea.name.toLowerCase())) {
        // Try to resolve the existing ID for downstream references
        const match = listAreas().find((a) => a.name.toLowerCase() === tArea.name.toLowerCase())
        if (match) areaIdByKey[tArea._key] = match.id
        inc(skipped, 'areas')
        continue
      }
      const created_ = createArea({ name: tArea.name, description: tArea.description, color: tArea.color, icon: tArea.icon })
      areaIdByKey[tArea._key] = created_.id
      inc(created, 'areas')
    }
  }

  // --- Goals ---
  if (payload.goals?.length) {
    const existingGoalTitles = new Set(listGoals().map((g) => g.title.toLowerCase()))
    for (const tGoal of payload.goals) {
      if (skipDuplicates && existingGoalTitles.has(tGoal.title.toLowerCase())) {
        const match = listGoals().find((g) => g.title.toLowerCase() === tGoal.title.toLowerCase())
        if (match) goalIdByKey[tGoal._key] = match.id
        inc(skipped, 'goals')
        continue
      }
      const areaId = tGoal.areaKey ? (areaIdByKey[tGoal.areaKey] ?? null) : null
      const created_ = createGoal({
        title: tGoal.title,
        description: tGoal.description,
        areaId,
        progressMode: tGoal.progressMode ?? 'manual',
        measurementType: tGoal.measurementType ?? 'percentage'
      })
      goalIdByKey[tGoal._key] = created_.id
      inc(created, 'goals')
    }
  }

  // --- Milestones ---
  if (payload.milestones?.length) {
    for (const tMs of payload.milestones) {
      const goalId = goalIdByKey[tMs.goalKey]
      if (!goalId) { inc(skipped, 'milestones'); continue }
      const existing = listMilestones(goalId)
      if (skipDuplicates && existing.some((m) => m.title.toLowerCase() === tMs.title.toLowerCase())) {
        inc(skipped, 'milestones')
        continue
      }
      createMilestone({ goalId, title: tMs.title, description: tMs.description })
      inc(created, 'milestones')
    }
  }

  // --- Work Item Types ---
  if (payload.workItemTypes?.length) {
    const existingTypeNames = new Set(listWorkItemTypes().map((t) => t.name.toLowerCase()))
    for (const tWit of payload.workItemTypes) {
      if (skipDuplicates && existingTypeNames.has(tWit.name.toLowerCase())) {
        inc(skipped, 'workItemTypes')
        continue
      }
      createWorkItemType({ name: tWit.name, color: tWit.color, icon: tWit.icon })
      inc(created, 'workItemTypes')
    }
  }

  // --- Routines ---
  if (payload.routines?.length) {
    const existingRoutineNames = new Set(listRoutines().map((r) => r.name.toLowerCase()))
    for (const tR of payload.routines) {
      if (skipDuplicates && existingRoutineNames.has(tR.name.toLowerCase())) {
        inc(skipped, 'routines')
        continue
      }
      createRoutine({
        name: tR.name,
        description: tR.description,
        targetDuration: tR.targetDuration,
        recurrenceRule: tR.recurrenceRule,
        preferredTime: tR.preferredTime,
        flexibility: tR.flexibility ?? 'semi_flexible'
      })
      inc(created, 'routines')
    }
  }

  // --- Time Budgets ---
  if (payload.timeBudgets?.length) {
    const existingBudgetNames = new Set(listTimeBudgets().map((b) => b.name.toLowerCase()))
    for (const tBudget of payload.timeBudgets) {
      if (skipDuplicates && existingBudgetNames.has(tBudget.name.toLowerCase())) {
        inc(skipped, 'timeBudgets')
        continue
      }
      const areaId = tBudget.areaKey ? (areaIdByKey[tBudget.areaKey] ?? null) : null
      const goalId = tBudget.goalKey ? (goalIdByKey[tBudget.goalKey] ?? null) : null
      // timeBudgets require exactly one scope — use areaId if available, else goalId
      const scope = areaId ? { areaId } : goalId ? { goalId } : null
      if (!scope) { inc(skipped, 'timeBudgets'); continue }
      createTimeBudget({
        name: tBudget.name,
        allocationMode: tBudget.allocationMode ?? 'target',
        protection: tBudget.protection ?? 'flexible',
        minimumMinutes: 0,
        targetMinutes: tBudget.targetMinutes,
        maximumMinutes: tBudget.targetMinutes,
        daysOfWeek: tBudget.daysOfWeek ?? [0, 1, 2, 3, 4, 5, 6],
        priority: tBudget.priority ?? 'medium',
        ...scope
      })
      inc(created, 'timeBudgets')
    }
  }

  // --- Review Policies ---
  if (payload.reviewPolicies?.length) {
    const existingPolicyNames = new Set(
      getDatabase().select().from(reviewPolicies).all().map((p) => p.name.toLowerCase())
    )
    for (const tPolicy of payload.reviewPolicies) {
      if (skipDuplicates && existingPolicyNames.has(tPolicy.name.toLowerCase())) {
        inc(skipped, 'reviewPolicies')
        continue
      }
      createReviewPolicy({
        name: tPolicy.name,
        intervalDays: tPolicy.intervalDays ?? [1, 3, 7, 14, 30],
        shortenOnWeak: tPolicy.shortenOnWeak ?? false
      })
      inc(created, 'reviewPolicies')
    }
  }

  // --- Resources & Resource Items ---
  if (payload.resources?.length) {
    const existingResourceTitles = new Set(listResources().map((r) => r.title.toLowerCase()))
    for (const tRes of payload.resources) {
      if (skipDuplicates && existingResourceTitles.has(tRes.title.toLowerCase())) {
        inc(skipped, 'resources')
        continue
      }
      const areaId = tRes.areaKey ? (areaIdByKey[tRes.areaKey] ?? null) : null
      const goalId = tRes.goalKey ? (goalIdByKey[tRes.goalKey] ?? null) : null
      const createdRes = createResource({
        title: tRes.title,
        resourceType: tRes.resourceType ?? 'custom',
        orderingMode: tRes.orderingMode ?? 'sequential',
        areaId,
        goalId
      })
      inc(created, 'resources')

      // Create top-level items and children
      let orderIdx = 0
      for (const item of tRes.items ?? []) {
        const parentId = randomUUID()
        const ts = now()
        getDatabase().insert(resourceItems).values({
          id: parentId,
          resourceId: createdRes.id,
          parentId: null,
          title: item.title,
          itemType: item.itemType ?? 'section',
          estimatedMinutes: item.estimatedMinutes ?? 0,
          orderIndex: orderIdx++,
          status: 'todo',
          progress: 0,
          notes: null,
          workItemId: null,
          reviewPolicyId: null,
          lastReviewedAt: null,
          nextReviewAt: null,
          reviewCount: 0,
          reviewStatus: 'none',
          sourceUrl: null,
          createdAt: ts,
          updatedAt: ts,
          archivedAt: null
        }).run()
        inc(created, 'resourceItems')

        let childIdx = 0
        for (const child of item.children ?? []) {
          const childTs = now()
          getDatabase().insert(resourceItems).values({
            id: randomUUID(),
            resourceId: createdRes.id,
            parentId,
            title: child.title,
            itemType: child.itemType ?? 'item',
            estimatedMinutes: child.estimatedMinutes ?? 0,
            orderIndex: childIdx++,
            status: 'todo',
            progress: 0,
            notes: null,
            workItemId: null,
            reviewPolicyId: null,
            lastReviewedAt: null,
            nextReviewAt: null,
            reviewCount: 0,
            reviewStatus: 'none',
            sourceUrl: null,
            createdAt: childTs,
            updatedAt: childTs,
            archivedAt: null
          }).run()
          inc(created, 'resourceItems')
        }
      }
    }
  }

  return { created, skipped }
}

// ---------------------------------------------------------------------------
// Save current setup as a custom template
// ---------------------------------------------------------------------------

export function saveCustomTemplate(input: SaveCustomTemplateInput): TemplateRecord {
  const db = getDatabase()
  const payload: TemplatePayload = {}

  if (input.includeAreas) {
    payload.areas = listAreas().map((a) => ({
      _key: `area-${a.id}`,
      name: a.name,
      description: a.description ?? undefined,
      color: a.color ?? undefined,
      icon: a.icon ?? undefined
    }))
  }

  if (input.includeGoals) {
    // Build area key map from payload.areas
    const areaKeyById: Record<string, string> = {}
    for (const a of payload.areas ?? []) {
      areaKeyById[a._key.replace('area-', '')] = a._key
    }
    payload.goals = listGoals().map((g) => ({
      _key: `goal-${g.id}`,
      areaKey: g.areaId ? areaKeyById[g.areaId] ?? undefined : undefined,
      title: g.title,
      description: g.description ?? undefined,
      progressMode: (g as any).progressMode ?? 'manual',
      measurementType: (g as any).measurementType ?? 'percentage'
    }))
  }

  if (input.includeMilestones && payload.goals?.length) {
    const goalKeyById: Record<string, string> = {}
    for (const g of payload.goals) {
      goalKeyById[g._key.replace('goal-', '')] = g._key
    }
    const allGoalIds = Object.keys(goalKeyById)
    const allMilestones: any[] = []
    for (const gid of allGoalIds) {
      const ms = listMilestones(gid)
      for (const m of ms) {
        allMilestones.push({
          _key: `ms-${m.id}`,
          goalKey: goalKeyById[gid],
          title: m.title,
          description: m.description ?? undefined
        })
      }
    }
    payload.milestones = allMilestones
  }

  if (input.includeWorkItemTypes) {
    payload.workItemTypes = listWorkItemTypes()
      .filter((t) => !(t as any).builtIn)
      .map((t) => ({
        _key: `wit-${t.id}`,
        name: t.name,
        color: t.color ?? undefined,
        icon: t.icon ?? undefined
      }))
  }

  if (input.includeRoutines) {
    payload.routines = listRoutines().map((r) => ({
      _key: `routine-${r.id}`,
      name: r.name,
      description: r.description ?? undefined,
      targetDuration: r.targetDuration,
      recurrenceRule: r.recurrenceRule,
      preferredTime: r.preferredTime ?? undefined,
      flexibility: r.flexibility
    }))
  }

  if (input.includeTimeBudgets) {
    const areaKeyById: Record<string, string> = {}
    for (const a of payload.areas ?? []) {
      areaKeyById[a._key.replace('area-', '')] = a._key
    }
    const goalKeyById: Record<string, string> = {}
    for (const g of payload.goals ?? []) {
      goalKeyById[g._key.replace('goal-', '')] = g._key
    }
    payload.timeBudgets = listTimeBudgets().map((b: any) => ({
      _key: `budget-${b.id}`,
      name: b.name,
      areaKey: b.areaId ? areaKeyById[b.areaId] ?? undefined : undefined,
      goalKey: b.goalId ? goalKeyById[b.goalId] ?? undefined : undefined,
      allocationMode: b.allocationMode,
      protection: b.protection,
      targetMinutes: b.targetMinutes,
      daysOfWeek: JSON.parse(b.daysOfWeek ?? '[0,1,2,3,4,5,6]'),
      priority: b.priority
    }))
  }

  if (input.includeReviewPolicies) {
    const rows = db.select().from(reviewPolicies).all()
    payload.reviewPolicies = rows.map((p) => ({
      _key: `policy-${p.id}`,
      name: p.name,
      intervalDays: JSON.parse(p.intervalDays),
      shortenOnWeak: p.shortenOnWeak ?? false
    }))
  }

  const ts = now()
  const id = randomUUID()
  db.insert(templates).values({
    id,
    name: input.name,
    description: input.description ?? null,
    category: 'custom',
    builtin: false,
    payloadJson: JSON.stringify(payload),
    createdAt: ts,
    updatedAt: ts
  }).run()

  return rowToRecord(db.select().from(templates).where(eq(templates.id, id)).get()!)
}

// ---------------------------------------------------------------------------
// Stage 12: Template JSON export / import
// ---------------------------------------------------------------------------

export function exportTemplateJson(id: string): string {
  const db = getDatabase()
  const row = db.select().from(templates).where(eq(templates.id, id)).get()
  if (!row) throw new Error(`Template ${id} not found`)
  const record = rowToRecord(row)
  return JSON.stringify(record, null, 2)
}

export function importTemplateJson(jsonStr: string): TemplateRecord {
  let parsed: any
  try {
    parsed = JSON.parse(jsonStr)
  } catch {
    throw new Error('Invalid JSON: could not parse template file.')
  }
  if (!parsed || typeof parsed !== 'object' || !parsed.name || !parsed.payload) {
    throw new Error('Invalid template format: missing required fields (name, payload).')
  }

  const db = getDatabase()
  const ts = Date.now()
  const id = randomUUID()

  db.insert(templates).values({
    id,
    name: String(parsed.name),
    description: parsed.description ? String(parsed.description) : null,
    category: parsed.category ? String(parsed.category) : 'custom',
    builtin: false,
    payloadJson: JSON.stringify(parsed.payload),
    createdAt: ts,
    updatedAt: ts
  }).run()

  return rowToRecord(db.select().from(templates).where(eq(templates.id, id)).get()!)
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function rowToRecord(row: typeof templates.$inferSelect): TemplateRecord {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    builtin: row.builtin,
    payload: JSON.parse(row.payloadJson) as TemplatePayload,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}
