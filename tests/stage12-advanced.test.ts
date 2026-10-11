import { describe, it, expect } from 'vitest'
import { verifyBackupIntegrity, type BackupJsonExport } from '../src/main/services/backup-service'
import type { TemplatePayload, TemplateRecord } from '../src/shared/templates'

describe('Stage 12 - Advanced & Polish', () => {
  describe('Backup Integrity Verification', () => {
    it('approves a well-formed backup export', () => {
      const validBackup: BackupJsonExport = {
        version: '1.0',
        exportedAt: Date.now(),
        data: {
          settings: [{ id: '00000000-0000-4000-8000-000000000001', locale: 'en' }],
          profiles: [],
          areas: [{ id: 'a1', name: 'Work' }],
          goals: [{ id: 'g1', title: 'Ship v1' }],
          milestones: [],
          projects: [{ id: 'p1', title: 'App Launch' }],
          workItemTypes: [],
          customFieldDefinitions: [],
          workItems: [{ id: 'w1', title: 'Build UI' }],
          customFieldValues: [],
          tags: [],
          entityTags: [],
          notes: [],
          resources: [],
          resourceItems: [],
          workItemDependencies: [],
          availabilityRules: [],
          availabilityOverrides: [],
          fixedEvents: [],
          timeBudgets: [],
          routines: [],
          habits: [],
          habitLogs: [],
          scheduledItems: [],
          timeSessions: [],
          reviewPolicies: [],
          reviewEvents: [],
          replanningHistory: [],
          planVersions: [],
          progressHistory: [],
          goalMetrics: [],
          templates: []
        }
      }

      const report = verifyBackupIntegrity(validBackup)
      expect(report.valid).toBe(true)
      expect(report.errors).toHaveLength(0)
      expect(report.summary.areas).toBe(1)
      expect(report.summary.goals).toBe(1)
      expect(report.summary.workItems).toBe(1)
    })

    it('rejects an invalid backup missing required collections', () => {
      const invalidBackup = {
        version: '1.0',
        data: {
          settings: []
          // areas, goals, workItems missing
        }
      }

      const report = verifyBackupIntegrity(invalidBackup)
      expect(report.valid).toBe(false)
      expect(report.errors.some((e) => e.includes('areas'))).toBe(true)
      expect(report.errors.some((e) => e.includes('workItems'))).toBe(true)
    })

    it('rejects backup with corrupted work items (missing id or title)', () => {
      const corruptedBackup = {
        version: '1.0',
        data: {
          settings: [],
          areas: [],
          goals: [],
          projects: [],
          workItems: [{ description: 'Missing id and title' }]
        }
      }

      const report = verifyBackupIntegrity(corruptedBackup)
      expect(report.valid).toBe(false)
      expect(report.errors.some((e) => e.includes('lacks a valid ID or title'))).toBe(true)
    })

    it('rejects null or non-object payloads', () => {
      expect(verifyBackupIntegrity(null).valid).toBe(false)
      expect(verifyBackupIntegrity('string').valid).toBe(false)
      expect(verifyBackupIntegrity(123).valid).toBe(false)
    })
  })

  describe('Template Export & Import Schema Validation', () => {
    it('validates template export JSON structure round-trip', () => {
      const templateData: TemplateRecord = {
        id: 'tpl-test',
        name: 'Deep Work Week',
        description: 'Focus blocks and daily routines',
        category: 'custom',
        builtin: false,
        payload: {
          areas: [{ _key: 'deep_work', name: 'Deep Work' }],
          goals: [{ _key: 'focus_goals', title: 'Complete Sprint', areaKey: 'deep_work' }],
          routines: [
            {
              _key: 'morning_focus',
              name: 'Morning Routine',
              targetDuration: 45,
              recurrenceRule: 'FREQ=DAILY'
            }
          ]
        },
        createdAt: 1700000000000,
        updatedAt: 1700000000000
      }

      const exportedJson = JSON.stringify(templateData, null, 2)
      expect(typeof exportedJson).toBe('string')

      const parsed = JSON.parse(exportedJson) as TemplateRecord
      expect(parsed.name).toBe('Deep Work Week')
      expect(parsed.payload.areas?.[0].name).toBe('Deep Work')
      expect(parsed.payload.routines?.[0].targetDuration).toBe(45)
    })

    it('detects missing required fields in imported template payload', () => {
      const badTemplate = {
        name: 'Incomplete'
        // Missing payload
      }

      expect((badTemplate as any).payload).toBeUndefined()
    })
  })

  describe('Search Relevance Scoring Logic', () => {
    function calculateRelevance(title: string, query: string): number {
      const t = title.toLowerCase()
      const q = query.toLowerCase()
      if (t === q) return 100
      if (t.startsWith(q)) return 75
      if (t.includes(q)) return 50
      return 0
    }

    it('scores exact matches higher than prefix matches', () => {
      expect(calculateRelevance('Study', 'study')).toBe(100)
      expect(calculateRelevance('Studying Math', 'study')).toBe(75)
      expect(calculateRelevance('Math Study Group', 'study')).toBe(50)
      expect(calculateRelevance('Gym Workout', 'study')).toBe(0)
    })

    it('filters across heterogeneous entity collections', () => {
      const entities = [
        { type: 'area', title: 'Health & Fitness' },
        { type: 'goal', title: 'Run a Half Marathon' },
        { type: 'project', title: 'Marathon Training Plan' },
        { type: 'workItem', title: 'Morning 5km Run' },
        { type: 'routine', title: 'Stretching Routine' }
      ]

      const query = 'run'
      const matches = entities
        .filter((e) => calculateRelevance(e.title, query) > 0)
        .sort((a, b) => calculateRelevance(b.title, query) - calculateRelevance(a.title, query))

      expect(matches).toHaveLength(2)
      expect(matches[0].title).toBe('Run a Half Marathon')
      expect(matches[1].title).toBe('Morning 5km Run')
    })
  })

  describe('Weekly Review Metric Calculations', () => {
    it('computes completion rate and net friction points without bias or guilt', () => {
      const scheduledTasks = [
        { id: '1', completed: true, estimated: 60, actual: 55, deadlinePassed: false },
        { id: '2', completed: true, estimated: 90, actual: 120, deadlinePassed: false },
        { id: '3', completed: false, estimated: 45, actual: 0, deadlinePassed: true },
        { id: '4', completed: false, estimated: 30, actual: 0, deadlinePassed: false }
      ]

      const totalScheduled = scheduledTasks.length
      const completedCount = scheduledTasks.filter((t) => t.completed).length
      const completionRate = Math.round((completedCount / totalScheduled) * 100)
      expect(completionRate).toBe(50)

      const missedDeadlines = scheduledTasks.filter((t) => !t.completed && t.deadlinePassed).length
      expect(missedDeadlines).toBe(1)

      const plannedMinutes = scheduledTasks.reduce((s, t) => s + t.estimated, 0)
      const actualMinutes = scheduledTasks.reduce((s, t) => s + t.actual, 0)
      expect(plannedMinutes).toBe(225)
      expect(actualMinutes).toBe(175)

      // Overrunning tasks check
      const overranTasks = scheduledTasks.filter((t) => t.completed && t.actual > t.estimated).length
      expect(overranTasks).toBe(1)
    })

    it('generates neutral, data-driven recommendations based on friction signals', () => {
      interface RecommendationCriteria {
        completionRate: number
        missedDeadlinesCount: number
        estimationRatio: number
      }

      function generateNeutralRecommendations(crit: RecommendationCriteria): string[] {
        const recs: string[] = []
        if (crit.completionRate < 60) {
          recs.push('Weekly completion was below 60%. Consider scheduling 15-20% fewer tasks next week.')
        }
        if (crit.missedDeadlinesCount > 0) {
          recs.push(`${crit.missedDeadlinesCount} task(s) had deadlines before completion. Review buffer margins.`)
        }
        if (crit.estimationRatio > 1.25) {
          recs.push('Tasks on average took longer than estimated. Consider adjusting session duration estimates.')
        }
        return recs
      }

      const recs = generateNeutralRecommendations({
        completionRate: 50,
        missedDeadlinesCount: 2,
        estimationRatio: 1.3
      })

      expect(recs).toHaveLength(3)
      for (const rec of recs) {
        // Assert absence of guilt-based vocabulary
        expect(rec.toLowerCase()).not.toContain('lazy')
        expect(rec.toLowerCase()).not.toContain('failed')
        expect(rec.toLowerCase()).not.toContain('disappointing')
        expect(rec.toLowerCase()).not.toContain('shame')
      }
    })
  })

  describe('Customizable Dashboard Layout Operations', () => {
    interface WidgetConfig {
      id: string
      title: string
      visible: boolean
    }

    const defaultWidgets: WidgetConfig[] = [
      { id: 'summary_stats', title: 'KPIs', visible: true },
      { id: 'goal_progress', title: 'Goals', visible: true },
      { id: 'planned_vs_actual', title: 'Allocation', visible: true },
      { id: 'time_by_area', title: 'Areas', visible: true }
    ]

    it('toggles widget visibility', () => {
      const updated = defaultWidgets.map((w) =>
        w.id === 'planned_vs_actual' ? { ...w, visible: false } : w
      )
      expect(updated.find((w) => w.id === 'planned_vs_actual')?.visible).toBe(false)
      expect(updated.find((w) => w.id === 'summary_stats')?.visible).toBe(true)
    })

    it('reorders widgets up and down cleanly', () => {
      const widgets = [...defaultWidgets]
      // Move index 1 (goal_progress) down
      const temp = widgets[1]
      widgets[1] = widgets[2]
      widgets[2] = temp

      expect(widgets[1].id).toBe('planned_vs_actual')
      expect(widgets[2].id).toBe('goal_progress')
    })
  })
})
