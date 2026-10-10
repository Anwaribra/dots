import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'
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
  profiles,
  projects,
  resourceItems,
  resources,
  reviewEvents,
  reviewPolicies,
  routines,
  scheduledItems,
  settings,
  tags,
  timeBudgets,
  timeSessions,
  workItemDependencies,
  workItems,
  workItemTypes
} from '../db/schema'

export type BackupJsonExport = {
  version: string
  exportedAt: number
  data: {
    settings: any[]
    profiles: any[]
    areas: any[]
    goals: any[]
    milestones: any[]
    projects: any[]
    workItemTypes: any[]
    customFieldDefinitions: any[]
    workItems: any[]
    customFieldValues: any[]
    tags: any[]
    entityTags: any[]
    notes: any[]
    resources: any[]
    resourceItems: any[]
    workItemDependencies: any[]
    availabilityRules: any[]
    availabilityOverrides: any[]
    fixedEvents: any[]
    timeBudgets: any[]
    routines: any[]
    habits: any[]
    habitLogs: any[]
    scheduledItems: any[]
    timeSessions: any[]
    reviewPolicies: any[]
    reviewEvents: any[]
  }
}

export function exportJsonData(): BackupJsonExport {
  const db = getDatabase()
  return {
    version: '1.0',
    exportedAt: Date.now(),
    data: {
      settings: db.select().from(settings).all(),
      profiles: db.select().from(profiles).all(),
      areas: db.select().from(areas).all(),
      goals: db.select().from(goals).all(),
      milestones: db.select().from(milestones).all(),
      projects: db.select().from(projects).all(),
      workItemTypes: db.select().from(workItemTypes).all(),
      customFieldDefinitions: db.select().from(customFieldDefinitions).all(),
      workItems: db.select().from(workItems).all(),
      customFieldValues: db.select().from(customFieldValues).all(),
      tags: db.select().from(tags).all(),
      entityTags: db.select().from(entityTags).all(),
      notes: db.select().from(notes).all(),
      resources: db.select().from(resources).all(),
      resourceItems: db.select().from(resourceItems).all(),
      workItemDependencies: db.select().from(workItemDependencies).all(),
      availabilityRules: db.select().from(availabilityRules).all(),
      availabilityOverrides: db.select().from(availabilityOverrides).all(),
      fixedEvents: db.select().from(fixedEvents).all(),
      timeBudgets: db.select().from(timeBudgets).all(),
      routines: db.select().from(routines).all(),
      habits: db.select().from(habits).all(),
      habitLogs: db.select().from(habitLogs).all(),
      scheduledItems: db.select().from(scheduledItems).all(),
      timeSessions: db.select().from(timeSessions).all(),
      reviewPolicies: db.select().from(reviewPolicies).all(),
      reviewEvents: db.select().from(reviewEvents).all()
    }
  }
}

export function validateJsonBackup(parsed: any): boolean {
  if (!parsed || typeof parsed !== 'object') return false
  if (typeof parsed.version !== 'string' || !parsed.data || typeof parsed.data !== 'object') return false
  const d = parsed.data
  return (
    Array.isArray(d.settings) &&
    Array.isArray(d.areas) &&
    Array.isArray(d.workItems) &&
    Array.isArray(d.projects)
  )
}

export function restoreJsonData(jsonInput: string | object): void {
  const parsed: BackupJsonExport =
    typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput

  if (!validateJsonBackup(parsed)) {
    throw new Error('Invalid or corrupted backup JSON data format.')
  }

  const db = getDatabase()
  const d = parsed.data

  db.transaction((tx) => {
    // 1. Wipe existing data in reverse dependency order
    tx.delete(reviewEvents).run()
    tx.delete(timeSessions).run()
    tx.delete(scheduledItems).run()
    tx.delete(habitLogs).run()
    tx.delete(habits).run()
    tx.delete(routines).run()
    tx.delete(timeBudgets).run()
    tx.delete(fixedEvents).run()
    tx.delete(availabilityOverrides).run()
    tx.delete(availabilityRules).run()
    tx.delete(workItemDependencies).run()
    tx.delete(resourceItems).run()
    tx.delete(resources).run()
    tx.delete(notes).run()
    tx.delete(entityTags).run()
    tx.delete(tags).run()
    tx.delete(customFieldValues).run()
    tx.delete(workItems).run()
    tx.delete(customFieldDefinitions).run()
    tx.delete(workItemTypes).run()
    tx.delete(reviewPolicies).run()
    tx.delete(projects).run()
    tx.delete(milestones).run()
    tx.delete(goals).run()
    tx.delete(areas).run()
    tx.delete(profiles).run()
    tx.delete(settings).run()

    // 2. Re-insert restored records
    for (const row of d.settings || []) tx.insert(settings).values(row).run()
    for (const row of d.profiles || []) tx.insert(profiles).values(row).run()
    for (const row of d.areas || []) tx.insert(areas).values(row).run()
    for (const row of d.goals || []) tx.insert(goals).values(row).run()
    for (const row of d.milestones || []) tx.insert(milestones).values(row).run()
    for (const row of d.projects || []) tx.insert(projects).values(row).run()
    for (const row of d.reviewPolicies || []) tx.insert(reviewPolicies).values(row).run()
    for (const row of d.workItemTypes || []) tx.insert(workItemTypes).values(row).run()
    for (const row of d.customFieldDefinitions || []) tx.insert(customFieldDefinitions).values(row).run()
    for (const row of d.workItems || []) tx.insert(workItems).values(row).run()
    for (const row of d.customFieldValues || []) tx.insert(customFieldValues).values(row).run()
    for (const row of d.tags || []) tx.insert(tags).values(row).run()
    for (const row of d.entityTags || []) tx.insert(entityTags).values(row).run()
    for (const row of d.notes || []) tx.insert(notes).values(row).run()
    for (const row of d.resources || []) tx.insert(resources).values(row).run()
    for (const row of d.resourceItems || []) tx.insert(resourceItems).values(row).run()
    for (const row of d.workItemDependencies || []) tx.insert(workItemDependencies).values(row).run()
    for (const row of d.availabilityRules || []) tx.insert(availabilityRules).values(row).run()
    for (const row of d.availabilityOverrides || []) tx.insert(availabilityOverrides).values(row).run()
    for (const row of d.fixedEvents || []) tx.insert(fixedEvents).values(row).run()
    for (const row of d.timeBudgets || []) tx.insert(timeBudgets).values(row).run()
    for (const row of d.routines || []) tx.insert(routines).values(row).run()
    for (const row of d.habits || []) tx.insert(habits).values(row).run()
    for (const row of d.habitLogs || []) tx.insert(habitLogs).values(row).run()
    for (const row of d.scheduledItems || []) tx.insert(scheduledItems).values(row).run()
    for (const row of d.timeSessions || []) tx.insert(timeSessions).values(row).run()
    for (const row of d.reviewEvents || []) tx.insert(reviewEvents).values(row).run()
  })
}

export function createDatabaseBackupFile(destPath?: string): string {
  const userDataFolder = app.getPath('userData')
  const dbFile = path.join(userDataFolder, 'data', 'clarity-planner.db')

  const targetPath =
    destPath || path.join(userDataFolder, 'data', `backup_${Date.now()}.db`)

  if (fs.existsSync(dbFile)) {
    fs.copyFileSync(dbFile, targetPath)
  }
  return targetPath
}
