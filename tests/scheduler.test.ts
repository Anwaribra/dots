import { describe, expect, it } from 'vitest'
import { schedule } from '../src/main/scheduler/scheduling'
import type { PlanningInput } from '../src/main/scheduler/types'

describe('Pure Deterministic Scheduler Engine (Stage 05)', () => {
  const baseInput: PlanningInput = {
    nowDate: '2026-10-10',
    dateRange: { startDate: '2026-10-10', endDate: '2026-10-10' },
    availability: [
      { date: '2026-10-10', startTime: '09:00', endTime: '17:00', availableMinutes: 480 } // 8 hours
    ],
    fixedEvents: [],
    timeBudgets: [],
    routines: [],
    workItems: [],
    dependencies: [],
    preferences: { minSessionMinutes: 15, maxSessionMinutes: 90 },
    capacitySettings: { planningCapacityPercentage: 75, bufferPercentage: 0 } // 480 * 0.75 = 360m usable
  }

  it('spec example: 360m available; A 120m Critical, B 120m High, C 180m Low -> A+B scheduled, C unscheduled', () => {
    const input: PlanningInput = {
      ...baseInput,
      workItems: [
        {
          id: 'item-c',
          title: 'Task C',
          priority: 'low',
          status: 'todo',
          estimatedMinutes: 180,
          actualMinutes: 0,
          flexibility: 'flexible',
          orderIndex: 3
        },
        {
          id: 'item-a',
          title: 'Task A',
          priority: 'critical',
          status: 'todo',
          estimatedMinutes: 120,
          actualMinutes: 0,
          flexibility: 'flexible',
          orderIndex: 1
        },
        {
          id: 'item-b',
          title: 'Task B',
          priority: 'high',
          status: 'todo',
          estimatedMinutes: 120,
          actualMinutes: 0,
          flexibility: 'flexible',
          orderIndex: 2
        }
      ]
    }

    const result = schedule(input)

    // Check scheduled items: Task A and Task B must be scheduled (120m + 120m = 240m)
    const schedA = result.scheduledItems.filter((s) => s.workItemId === 'item-a')
    const schedB = result.scheduledItems.filter((s) => s.workItemId === 'item-b')

    expect(schedA.length).toBeGreaterThan(0)
    expect(schedB.length).toBeGreaterThan(0)

    // Remaining capacity is 120m, Task C needs 180m, so Task C appears in unscheduledItems
    expect(result.unscheduledItems.some((u) => u.workItemId === 'item-c')).toBe(true)
    expect(result.explanations.some((e) => e.entityId === 'item-c' && e.action === 'unscheduled')).toBe(true)
  })

  it('overload report: 6h available (360m), 9h requested (540m) -> generates overload warning with exact numbers', () => {
    const input: PlanningInput = {
      ...baseInput,
      workItems: [
        {
          id: 'item-1',
          title: 'Task 1',
          priority: 'high',
          status: 'todo',
          estimatedMinutes: 270,
          actualMinutes: 0,
          flexibility: 'flexible',
          orderIndex: 1
        },
        {
          id: 'item-2',
          title: 'Task 2',
          priority: 'medium',
          status: 'todo',
          estimatedMinutes: 270,
          actualMinutes: 0,
          flexibility: 'flexible',
          orderIndex: 2
        }
      ]
    }

    const result = schedule(input)
    const dayCap = result.dayCapacities['2026-10-10']

    expect(dayCap.usableMinutes).toBe(360)
    expect(result.warnings.some((w) => w.code === 'DAY_OVERLOADED')).toBe(true)
    const overloadWarn = result.warnings.find((w) => w.code === 'DAY_OVERLOADED')
    expect(overloadWarn?.message).toContain('360m')
    expect(overloadWarn?.message).toContain('180m')
  })

  it('locked item / budget is never moved or displaced', () => {
    const input: PlanningInput = {
      ...baseInput,
      fixedEvents: [
        {
          id: 'locked-evt',
          title: 'Locked Meeting',
          startTime: '10:00',
          endTime: '12:00',
          date: '2026-10-10',
          durationMinutes: 120,
          locked: true,
          flexibility: 'fixed'
        }
      ],
      timeBudgets: [
        {
          id: 'locked-b',
          name: 'Locked Budget',
          allocationMode: 'target',
          protection: 'locked',
          minimumMinutes: 120,
          targetMinutes: 120,
          maximumMinutes: 120,
          daysOfWeek: [6] // Saturday
        }
      ],
      workItems: [
        {
          id: 'critical-deadline',
          title: 'Critical Task with Deadline',
          priority: 'critical',
          status: 'todo',
          estimatedMinutes: 300,
          actualMinutes: 0,
          deadline: '2026-10-10',
          flexibility: 'flexible',
          orderIndex: 1
        }
      ]
    }

    const result = schedule(input)
    // Fixed event must remain at 10:00 - 12:00
    const fixedCap = result.dayCapacities['2026-10-10'].fixedMinutes
    expect(fixedCap).toBe(120)
    expect(result.explanations.some((e) => e.reason.includes('locked'))).toBe(false)
  })

  it('dependency blocking: higher-priority / hard-deadline item is NEVER scheduled before prerequisite (Decision A5)', () => {
    const input: PlanningInput = {
      ...baseInput,
      workItems: [
        {
          id: 'prereq',
          title: 'Prerequisite Task',
          priority: 'low',
          status: 'todo',
          estimatedMinutes: 60,
          actualMinutes: 0,
          flexibility: 'flexible',
          orderIndex: 2
        },
        {
          id: 'successor-critical',
          title: 'Successor Critical Task',
          priority: 'critical',
          status: 'todo',
          estimatedMinutes: 60,
          actualMinutes: 0,
          deadline: '2026-10-10',
          flexibility: 'flexible',
          orderIndex: 1
        }
      ],
      dependencies: [
        {
          id: 'dep-1',
          predecessorId: 'prereq',
          successorId: 'successor-critical'
        }
      ]
    }

    const result = schedule(input)

    // Critical successor CANNOT be scheduled on 2026-10-10 before prereq is completed
    const successorSched = result.scheduledItems.filter((s) => s.workItemId === 'successor-critical')
    expect(successorSched.length).toBe(0)

    // Check warning & explanation
    expect(result.explanations.some((e) => e.entityId === 'successor-critical' && e.reason.includes('blocked by unfinished prerequisite'))).toBe(true)
    expect(result.warnings.some((w) => w.code === 'DEPENDENCY_DEADLINE_CONFLICT')).toBe(true)
  })

  it('splits large 4h (240m) task into maxSession 90m sessions (90/90/60)', () => {
    const input: PlanningInput = {
      ...baseInput,
      availability: [
        { date: '2026-10-10', startTime: '09:00', endTime: '17:00', availableMinutes: 480 }
      ],
      capacitySettings: { planningCapacityPercentage: 100, bufferPercentage: 0 }, // 480m usable
      workItems: [
        {
          id: 'large-task',
          title: 'Large 4-hour Task',
          priority: 'high',
          status: 'todo',
          estimatedMinutes: 240,
          actualMinutes: 0,
          flexibility: 'flexible',
          orderIndex: 1
        }
      ]
    }

    const result = schedule(input)
    const sessions = result.scheduledItems.filter((s) => s.workItemId === 'large-task')

    expect(sessions).toHaveLength(3)
    expect(sessions[0].durationMinutes).toBe(90)
    expect(sessions[1].durationMinutes).toBe(90)
    expect(sessions[2].durationMinutes).toBe(60) // 90 + 90 + 60 = 240m
    expect(sessions[0].isSplit).toBe(true)
    expect(sessions[0].totalSessions).toBe(3)
  })

  it('hard deadline displaces protected-but-unlocked budget with explanation', () => {
    const input: PlanningInput = {
      ...baseInput,
      capacitySettings: { planningCapacityPercentage: 25, bufferPercentage: 0 }, // 120m usable
      timeBudgets: [
        {
          id: 'protected-study',
          name: 'Study Budget',
          allocationMode: 'target',
          protection: 'protected',
          minimumMinutes: 120,
          targetMinutes: 120,
          maximumMinutes: 120,
          daysOfWeek: [6]
        }
      ],
      workItems: [
        {
          id: 'tax-filing',
          title: 'Tax Filing (Hard Deadline)',
          priority: 'critical',
          status: 'todo',
          estimatedMinutes: 120,
          actualMinutes: 0,
          deadline: '2026-10-10',
          flexibility: 'flexible',
          orderIndex: 1
        }
      ]
    }

    const result = schedule(input)
    const schedTax = result.scheduledItems.filter((s) => s.workItemId === 'tax-filing')
    expect(schedTax.length).toBeGreaterThan(0)

    const dispExplanation = result.explanations.find((e) => e.action === 'displaced')
    expect(dispExplanation).toBeDefined()
    expect(dispExplanation?.reason).toContain('Tax Filing (Hard Deadline)')
    expect(dispExplanation?.reason).toContain('Study Budget')
  })

  it('skips zero-duration items with explanation', () => {
    const input: PlanningInput = {
      ...baseInput,
      workItems: [
        {
          id: 'zero-item',
          title: 'Already Completed Item',
          priority: 'medium',
          status: 'todo',
          estimatedMinutes: 60,
          actualMinutes: 60, // 0m remaining
          flexibility: 'flexible',
          orderIndex: 1
        }
      ]
    }

    const result = schedule(input)
    expect(result.scheduledItems).toHaveLength(0)
    expect(result.explanations.some((e) => e.reason.includes('0m remaining duration'))).toBe(true)
  })

  it('handles zero availability day without error', () => {
    const input: PlanningInput = {
      ...baseInput,
      availability: [
        { date: '2026-10-10', startTime: '09:00', endTime: '09:00', availableMinutes: 0 }
      ],
      workItems: [
        {
          id: 'task-1',
          title: 'Task 1',
          priority: 'high',
          status: 'todo',
          estimatedMinutes: 60,
          actualMinutes: 0,
          flexibility: 'flexible',
          orderIndex: 1
        }
      ]
    }

    const result = schedule(input)
    expect(result.scheduledItems).toHaveLength(0)
    expect(result.unscheduledItems).toHaveLength(1)
  })

  it('detects conflicting fixed events and generates warnings', () => {
    const input: PlanningInput = {
      ...baseInput,
      fixedEvents: [
        {
          id: 'ev-1',
          title: 'Meeting 1',
          startTime: '10:00',
          endTime: '11:00',
          date: '2026-10-10',
          durationMinutes: 60,
          locked: true,
          flexibility: 'fixed'
        },
        {
          id: 'ev-2',
          title: 'Meeting 2',
          startTime: '10:30',
          endTime: '11:30',
          date: '2026-10-10',
          durationMinutes: 60,
          locked: true,
          flexibility: 'fixed'
        }
      ]
    }

    const result = schedule(input)
    expect(result.warnings.some((w) => w.code === 'FIXED_EVENT_CONFLICT')).toBe(true)
  })

  it('determinism test: running schedule twice with identical input gives 100% byte-identical output', () => {
    const input: PlanningInput = {
      ...baseInput,
      workItems: [
        {
          id: 'task-b',
          title: 'Task B',
          priority: 'medium',
          status: 'todo',
          estimatedMinutes: 90,
          actualMinutes: 0,
          flexibility: 'flexible',
          orderIndex: 2
        },
        {
          id: 'task-a',
          title: 'Task A',
          priority: 'high',
          status: 'todo',
          estimatedMinutes: 120,
          actualMinutes: 0,
          flexibility: 'flexible',
          orderIndex: 1
        }
      ]
    }

    const result1 = schedule(input)
    const result2 = schedule(input)

    expect(JSON.stringify(result1)).toBe(JSON.stringify(result2))
  })
})
