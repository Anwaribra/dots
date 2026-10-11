/**
 * Demo Data Service (Stage 11)
 *
 * Loads demo data into the CURRENT database (not a separate file).
 * Demo items are clearly prefixed with "[Demo]" and flagged via the
 * `demoMode` settings flag. Deleting demo data removes all [Demo]-prefixed
 * rows and resets the flag.
 *
 * A separate database file approach would require switching the Drizzle
 * singleton at runtime (complex). Instead we keep demo data in the main DB
 * but clearly labelled, which is simpler and more maintainable.
 */

import { like, or } from 'drizzle-orm'
import path from 'node:path'
import fs from 'node:fs'
import { app } from 'electron'
import { getDatabase } from '../db/database'
import { areas, goals, projects, routines, workItems } from '../db/schema'
import { createArea, createGoal, createProject, createRoutine, createWorkItem } from './entity-service'
import { updateSettings, getSettings } from './settings-service'

const DEMO_PREFIX = '[Demo]'

export function isDemoLoaded(): boolean {
  return getSettings().demoMode
}

export function loadDemoData(): void {
  if (isDemoLoaded()) return // already loaded

  const appPath = typeof app?.getAppPath === 'function' ? app.getAppPath() : process.cwd()
  const dataPath = path.join(appPath, 'src', 'main', 'templates', 'demo-data.json')
  const raw = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

  const areaIds: string[] = []
  const goalIds: string[] = []
  const projectIds: string[] = []

  // Create areas
  for (const a of raw.areas ?? []) {
    const created = createArea({ name: a.name, description: a.description, color: a.color, icon: a.icon })
    areaIds.push(created.id)
  }

  // Create goals
  for (const g of raw.goals ?? []) {
    const areaId = typeof g.areaKey === 'number' ? (areaIds[g.areaKey] ?? null) : null
    const created = createGoal({
      title: g.title,
      description: g.description,
      areaId,
      progressMode: g.progressMode ?? 'manual',
      measurementType: g.measurementType ?? 'percentage'
    })
    goalIds.push(created.id)
  }

  // Create projects
  for (const p of raw.projects ?? []) {
    const areaId = typeof p.areaKey === 'number' ? (areaIds[p.areaKey] ?? null) : null
    const goalId = typeof p.goalKey === 'number' ? (goalIds[p.goalKey] ?? null) : null
    const created = createProject({
      title: p.title,
      description: p.description,
      areaId,
      goalId
    })
    projectIds.push(created.id)
  }

  // Create routines
  for (const r of raw.routines ?? []) {
    createRoutine({
      name: r.name,
      description: r.description,
      targetDuration: r.targetDuration ?? 30,
      recurrenceRule: r.recurrenceRule ?? 'FREQ=DAILY',
      preferredTime: r.preferredTime
    })
  }

  // Create work items
  for (const w of raw.workItems ?? []) {
    const areaId = typeof w.areaKey === 'number' ? (areaIds[w.areaKey] ?? null) : null
    const goalId = typeof w.goalKey === 'number' ? (goalIds[w.goalKey] ?? null) : null
    const projectId = typeof w.projectKey === 'number' ? (projectIds[w.projectKey] ?? null) : null
    createWorkItem({
      title: w.title,
      estimatedMinutes: w.estimatedMinutes ?? 45,
      status: w.status ?? 'todo',
      areaId,
      goalId,
      projectId
    })
  }

  updateSettings({ demoMode: true })
}

export function deleteDemoData(): void {
  const db = getDatabase()
  const LIKE = `${DEMO_PREFIX}%`

  // Delete in dependency-safe order: workItems → projects → goals → areas → routines
  // We use `like` to match names starting with [Demo]
  db.delete(workItems).where(like(workItems.title, LIKE)).run()
  db.delete(projects).where(like(projects.title, LIKE)).run()
  db.delete(goals).where(like(goals.title, LIKE)).run()
  db.delete(areas).where(like(areas.name, LIKE)).run()
  db.delete(routines).where(like(routines.name, LIKE)).run()

  updateSettings({ demoMode: false })
}
