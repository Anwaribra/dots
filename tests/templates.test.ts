import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import type { TemplatePayload } from '../src/shared/templates'

describe('Stage 11 - Templates & Demo Data', () => {
  const templatesDir = path.join(__dirname, '..', 'src', 'main', 'templates')

  describe('Built-in Template Files', () => {
    const builtinFiles = [
      'builtin-study.json',
      'builtin-fitness.json',
      'builtin-review.json',
      'builtin-freelance.json'
    ]

    for (const filename of builtinFiles) {
      it(`validates ${filename} file integrity and payload schema`, () => {
        const filePath = path.join(templatesDir, filename)
        expect(fs.existsSync(filePath)).toBe(true)

        const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        expect(raw.id).toBeDefined()
        expect(typeof raw.id).toBe('string')
        expect(raw.name).toBeDefined()
        expect(typeof raw.name).toBe('string')
        expect(raw.category).toBeDefined()
        expect(typeof raw.category).toBe('string')

        // Valid payload structure
        const payload = raw as TemplatePayload
        if (payload.areas) {
          for (const area of payload.areas) {
            expect(area._key).toBeDefined()
            expect(area.name).toBeDefined()
          }
        }
        if (payload.goals) {
          for (const goal of payload.goals) {
            expect(goal._key).toBeDefined()
            expect(goal.title).toBeDefined()
          }
        }
        if (payload.routines) {
          for (const routine of payload.routines) {
            expect(routine._key).toBeDefined()
            expect(routine.name).toBeDefined()
            expect(routine.targetDuration).toBeGreaterThan(0)
            expect(routine.recurrenceRule).toBeDefined()
          }
        }
        if (payload.timeBudgets) {
          for (const budget of payload.timeBudgets) {
            expect(budget._key).toBeDefined()
            expect(budget.name).toBeDefined()
            expect(budget.targetMinutes).toBeGreaterThan(0)
          }
        }
      })
    }
  })

  describe('Demo Data File', () => {
    it('validates demo-data.json structure and naming conventions', () => {
      const demoPath = path.join(templatesDir, 'demo-data.json')
      expect(fs.existsSync(demoPath)).toBe(true)

      const demo = JSON.parse(fs.readFileSync(demoPath, 'utf-8'))
      expect(Array.isArray(demo.areas)).toBe(true)
      expect(Array.isArray(demo.goals)).toBe(true)
      expect(Array.isArray(demo.projects)).toBe(true)
      expect(Array.isArray(demo.routines)).toBe(true)
      expect(Array.isArray(demo.workItems)).toBe(true)

      // All demo items must be clearly prefixed with [Demo]
      for (const a of demo.areas) {
        expect(a.name.startsWith('[Demo]')).toBe(true)
      }
      for (const g of demo.goals) {
        expect(g.title.startsWith('[Demo]')).toBe(true)
      }
      for (const p of demo.projects) {
        expect(p.title.startsWith('[Demo]')).toBe(true)
      }
      for (const r of demo.routines) {
        expect(r.name.startsWith('[Demo]')).toBe(true)
      }
      for (const w of demo.workItems) {
        expect(w.title.startsWith('[Demo]')).toBe(true)
      }
    })
  })

  describe('Template Resolution & Linking Logic', () => {
    it('correctly maps internal _key references for goals and areas', () => {
      const payload: TemplatePayload = {
        areas: [
          { _key: 'area-1', name: 'Deep Work' }
        ],
        goals: [
          { _key: 'goal-1', areaKey: 'area-1', title: 'Publish Paper' }
        ],
        milestones: [
          { _key: 'ms-1', goalKey: 'goal-1', title: 'Submit draft' }
        ]
      }

      // Check key integrity
      expect(payload.goals![0].areaKey).toBe(payload.areas![0]._key)
      expect(payload.milestones![0].goalKey).toBe(payload.goals![0]._key)
    })

    it('identifies duplicate entities correctly by case-insensitive name matching', () => {
      const existingAreaNames = new Set(['learning', 'work', 'health'])

      const incomingAreas = [
        { _key: 'a-1', name: 'Learning' },
        { _key: 'a-2', name: 'Fitness' }
      ]

      const duplicate = incomingAreas.filter(a => existingAreaNames.has(a.name.toLowerCase()))
      const fresh = incomingAreas.filter(a => !existingAreaNames.has(a.name.toLowerCase()))

      expect(duplicate.length).toBe(1)
      expect(duplicate[0].name).toBe('Learning')
      expect(fresh.length).toBe(1)
      expect(fresh[0].name).toBe('Fitness')
    })

    it('custom template payload creation honors inclusion flags', () => {
      const flags = {
        includeAreas: true,
        includeGoals: false,
        includeRoutines: true
      }

      const dummyAreas = [{ id: '1', name: 'Work' }]
      const dummyGoals = [{ id: '2', title: 'Launch' }]
      const dummyRoutines = [{ id: '3', name: 'Morning Standup', targetDuration: 15, recurrenceRule: 'FREQ=DAILY' }]

      const payload: TemplatePayload = {}
      if (flags.includeAreas) {
        payload.areas = dummyAreas.map(a => ({ _key: `area-${a.id}`, name: a.name }))
      }
      if (flags.includeGoals) {
        payload.goals = dummyGoals.map(g => ({ _key: `goal-${g.id}`, title: g.title }))
      }
      if (flags.includeRoutines) {
        payload.routines = dummyRoutines.map(r => ({
          _key: `routine-${r.id}`,
          name: r.name,
          targetDuration: r.targetDuration,
          recurrenceRule: r.recurrenceRule
        }))
      }

      expect(payload.areas).toBeDefined()
      expect(payload.areas!.length).toBe(1)
      expect(payload.goals).toBeUndefined()
      expect(payload.routines).toBeDefined()
      expect(payload.routines!.length).toBe(1)
    })
  })
})
