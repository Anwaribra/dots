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
  goalMetrics,
  goals,
  habitLogs,
  habits,
  milestones,
  notes,
  planVersions,
  profiles,
  progressHistory,
  projects,
  replanningHistory,
  resourceItems,
  resources,
  reviewEvents,
  reviewPolicies,
  routines,
  scheduledItems,
  settings,
  tags,
  templates,
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
    replanningHistory: any[]
    planVersions: any[]
    progressHistory: any[]
    goalMetrics: any[]
    templates: any[]
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
      reviewEvents: db.select().from(reviewEvents).all(),
      replanningHistory: db.select().from(replanningHistory).all(),
      planVersions: db.select().from(planVersions).all(),
      progressHistory: db.select().from(progressHistory).all(),
      goalMetrics: db.select().from(goalMetrics).all(),
      templates: db.select().from(templates).all()
    }
  }
}

export interface BackupIntegrityReport {
  valid: boolean
  errors: string[]
  summary: Record<string, number>
}

export function verifyBackupIntegrity(parsed: any): BackupIntegrityReport {
  const errors: string[] = []
  const summary: Record<string, number> = {}

  if (!parsed || typeof parsed !== 'object') {
    return { valid: false, errors: ['Backup is empty or not a valid JSON object'], summary: {} }
  }

  if (typeof parsed.version !== 'string') {
    errors.push('Missing or invalid schema version string.')
  }

  if (!parsed.data || typeof parsed.data !== 'object') {
    errors.push('Missing or invalid backup data container.')
    return { valid: false, errors, summary: {} }
  }

  const d = parsed.data
  const requiredArrays = ['settings', 'areas', 'goals', 'projects', 'workItems']
  for (const table of requiredArrays) {
    if (!Array.isArray(d[table])) {
      errors.push(`Required table collection "${table}" is missing or not an array.`)
    }
  }

  // Count items across all array keys in d
  for (const [key, value] of Object.entries(d)) {
    if (Array.isArray(value)) {
      summary[key] = value.length
    }
  }

  // Validate critical integrity rules
  if (Array.isArray(d.workItems)) {
    for (let i = 0; i < Math.min(d.workItems.length, 50); i++) {
      const item = d.workItems[i]
      if (!item || typeof item.id !== 'string' || typeof item.title !== 'string') {
        errors.push(`Work item at index ${i} lacks a valid ID or title.`)
        break
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    summary
  }
}

export function validateJsonBackup(parsed: any): boolean {
  return verifyBackupIntegrity(parsed).valid
}

export function restoreJsonData(jsonInput: string | object): void {
  const parsed: BackupJsonExport =
    typeof jsonInput === 'string' ? JSON.parse(jsonInput) : (jsonInput as BackupJsonExport)

  const integrity = verifyBackupIntegrity(parsed)
  if (!integrity.valid) {
    throw new Error(`Invalid or corrupted backup JSON data format: ${integrity.errors.join('; ')}`)
  }

  const db = getDatabase()
  const d = parsed.data

  db.transaction((tx) => {
    // 1. Wipe existing data in reverse dependency order
    tx.delete(goalMetrics).run()
    tx.delete(progressHistory).run()
    tx.delete(planVersions).run()
    tx.delete(replanningHistory).run()
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
    tx.delete(templates).run()
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
    for (const row of d.replanningHistory || []) tx.insert(replanningHistory).values(row).run()
    for (const row of d.planVersions || []) tx.insert(planVersions).values(row).run()
    for (const row of d.progressHistory || []) tx.insert(progressHistory).values(row).run()
    for (const row of d.goalMetrics || []) tx.insert(goalMetrics).values(row).run()
    for (const row of d.templates || []) tx.insert(templates).values(row).run()
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

/**
 * Runs an automatic daily rolling backup.
 * Keeps up to maxBackups (default 7) backups in the backups directory.
 */
export function runDailyRollingBackup(maxBackups = 7): string | null {
  try {
    const userDataFolder = app.getPath('userData')
    const backupsDir = path.join(userDataFolder, 'backups')
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true })
    }

    const todayStr = new Date().toISOString().slice(0, 10)
    const backupFileName = `daily-backup-${todayStr}.json`
    const backupPath = path.join(backupsDir, backupFileName)

    // Only create once per day
    if (!fs.existsSync(backupPath)) {
      const data = exportJsonData()
      fs.writeFileSync(backupPath, JSON.stringify(data, null, 2), 'utf-8')
    }

    // Prune backups beyond maxBackups
    const existing = fs
      .readdirSync(backupsDir)
      .filter((f) => f.startsWith('daily-backup-') && f.endsWith('.json'))
      .sort()

    if (existing.length > maxBackups) {
      const toDelete = existing.slice(0, existing.length - maxBackups)
      for (const f of toDelete) {
        fs.unlinkSync(path.join(backupsDir, f))
      }
    }

    return backupPath
  } catch (err) {
    console.error('Failed to run daily rolling backup:', err)
    return null
  }
}
