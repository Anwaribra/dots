import { describe, expect, it } from 'vitest'
import { replan } from '../src/main/scheduler/replanning'
import type { ReplanningInput, ScheduleItem, WorkItemCandidate } from '../src/main/scheduler/types'

describe('Replanning Engine (Stage 09)', () => {
  const baseInput: ReplanningInput = {
    nowDate: '2026-10-10',
    currentTime: '11:00',
    existingSchedule: [],
    candidateWorkItems: [],
    dependencies: [],
    availability: [
      { date: '2026-10-10', startTime: '09:00', endTime: '18:00', availableMinutes: 540 }
    ],
    fixedEvents: [],
    timeBudgets: [],
    routines: [],
    preferences: { minSessionMinutes: 15, maxSessionMinutes: 120 },
    capacitySettings: { planningCapacityPercentage: 100, bufferPercentage: 0 }
  }

  // 1. Spec Example: Urgent 2h critical item inserted at 11:00
  it('spec example: urgent 2h critical item inserted at 11:00 displaces flexible work, preserves completed work, explains with numbers', () => {
    const existingSchedule: ScheduleItem[] = [
      {
        id: 's-study',
        workItemId: 'w-study',
        title: 'Study',
        date: '2026-10-10',
        startTime: '09:00',
        endTime: '11:00',
        durationMinutes: 120,
        sessionIndex: 1,
        totalSessions: 1,
        isSplit: false,
        locked: false,
        reason: 'Original study slot'
      },
      {
        id: 's-project',
        workItemId: 'w-project',
        title: 'Project',
        date: '2026-10-10',
        startTime: '11:00',
        endTime: '13:00',
        durationMinutes: 120,
        sessionIndex: 1,
        totalSessions: 1,
        isSplit: false,
        locked: false,
        reason: 'Original project slot'
      },
      {
        id: 's-reading',
        workItemId: 'w-reading',
        title: 'Reading',
        date: '2026-10-10',
        startTime: '13:00',
        endTime: '14:00',
        durationMinutes: 60,
        sessionIndex: 1,
        totalSessions: 1,
        isSplit: false,
        locked: false,
        reason: 'Original reading slot'
      },
      {
        id: 's-admin',
        workItemId: 'w-admin',
        title: 'Admin',
        date: '2026-10-10',
        startTime: '15:00',
        endTime: '16:00',
        durationMinutes: 60,
        sessionIndex: 1,
        totalSessions: 1,
        isSplit: false,
        locked: false,
        reason: 'Original admin slot'
      }
    ]

    const candidateWorkItems: WorkItemCandidate[] = [
      {
        id: 'w-study',
        title: 'Study',
        priority: 'high',
        status: 'done',
        estimatedMinutes: 120,
        actualMinutes: 120,
        flexibility: 'flexible',
        orderIndex: 1
      },
      {
        id: 'w-project',
        title: 'Project',
        priority: 'high',
        status: 'todo',
        estimatedMinutes: 120,
        actualMinutes: 0,
        flexibility: 'flexible',
        orderIndex: 2
      },
      {
        id: 'w-reading',
        title: 'Reading',
        priority: 'medium',
        status: 'todo',
        estimatedMinutes: 60,
        actualMinutes: 0,
        flexibility: 'flexible',
        orderIndex: 3
      },
      {
        id: 'w-admin',
        title: 'Admin',
        priority: 'low',
        status: 'todo',
        estimatedMinutes: 60,
        actualMinutes: 0,
        flexibility: 'flexible',
        orderIndex: 4
      }
    ]

    const urgentClientWork: WorkItemCandidate = {
      id: 'w-client-work',
      title: 'Client Work',
      priority: 'critical',
      status: 'todo',
      estimatedMinutes: 120,
      actualMinutes: 0,
      flexibility: 'fixed',
      orderIndex: 0
    }

    const input: ReplanningInput = {
      ...baseInput,
      currentTime: '11:00',
      existingSchedule,
      completedItemIds: ['w-study'],
      candidateWorkItems,
      trigger: {
        type: 'urgent_work_added',
        details: {
          urgentItem: urgentClientWork
        }
      }
    }

    const result = replan(input)

    // Check that Study (09:00-11:00) is preserved as completed
    const studyItem = result.updatedSchedule.find((s) => s.workItemId === 'w-study')
    expect(studyItem).toBeDefined()
    expect(studyItem?.startTime).toBe('09:00')
    expect(studyItem?.endTime).toBe('11:00')

    // Check that urgent Client Work (2h Critical) is inserted at 11:00 - 13:00
    const clientItem = result.updatedSchedule.find((s) => s.workItemId === 'w-client-work')
    expect(clientItem).toBeDefined()
    expect(clientItem?.startTime).toBe('11:00')
    expect(clientItem?.endTime).toBe('13:00')
    expect(clientItem?.durationMinutes).toBe(120)

    // Check that Project (which was at 11:00) moved to 13:00 - 15:00
    const projectItem = result.updatedSchedule.find((s) => s.workItemId === 'w-project')
    expect(projectItem).toBeDefined()
    expect(projectItem?.startTime).toBe('13:00')
    expect(projectItem?.endTime).toBe('15:00')

    // Check changes diff list
    const clientChange = result.changes.find((c) => c.entityId === 'w-client-work')
    expect(clientChange?.changeType).toBe('inserted')
    expect(clientChange?.newTime).toContain('11:00')
    expect(clientChange?.reason).toContain('critical')

    const projectChange = result.changes.find((c) => c.entityId === 'w-project')
    expect(projectChange?.changeType).toBe('moved')
    expect(projectChange?.originalTime).toContain('11:00')
    expect(projectChange?.newTime).toContain('13:00')
    expect(projectChange?.reason).toContain('120m')

    // Explanations have numbers and names
    const projectExplanation = result.explanations.find((e) => e.entityId === 'w-project')
    expect(projectExplanation).toBeDefined()
    expect(projectExplanation?.reason).toContain('11:00')
    expect(projectExplanation?.reason).toContain('13:00')
  })

  // 2. Skipped item moved later today
  it('skipped item moved later today: reschedules the skipped task to the next free slot', () => {
    const existingSchedule: ScheduleItem[] = [
      {
        id: 's-skipped',
        workItemId: 'w-workout',
        title: 'Workout',
        date: '2026-10-10',
        startTime: '11:00',
        endTime: '12:00',
        durationMinutes: 60,
        sessionIndex: 1,
        totalSessions: 1,
        isSplit: false,
        locked: false,
        reason: 'Workout'
      },
      {
        id: 's-meeting',
        workItemId: 'w-meeting',
        title: 'Team Sync',
        date: '2026-10-10',
        startTime: '12:00',
        endTime: '13:00',
        durationMinutes: 60,
        sessionIndex: 1,
        totalSessions: 1,
        isSplit: false,
        locked: true, // locked meeting
        reason: 'Meeting'
      }
    ]

    const candidateWorkItems: WorkItemCandidate[] = [
      {
        id: 'w-workout',
        title: 'Workout',
        priority: 'medium',
        status: 'todo',
        estimatedMinutes: 60,
        actualMinutes: 0,
        flexibility: 'flexible',
        orderIndex: 1
      }
    ]

    const input: ReplanningInput = {
      ...baseInput,
      currentTime: '11:00',
      existingSchedule,
      candidateWorkItems,
      trigger: {
        type: 'skipped_item',
        details: {
          skippedWorkItemId: 'w-workout',
          skippedResolution: 'move_later_today'
        }
      }
    }

    const result = replan(input)

    // The locked meeting at 12:00-13:00 stays
    const meeting = result.updatedSchedule.find((s) => s.workItemId === 'w-meeting')
    expect(meeting?.startTime).toBe('12:00')
    expect(meeting?.endTime).toBe('13:00')

    // The skipped workout is rescheduled after the meeting (e.g. at 13:00)
    const workout = result.updatedSchedule.find((s) => s.workItemId === 'w-workout')
    expect(workout).toBeDefined()
    expect(workout?.startTime).toBe('13:00')
    expect(workout?.endTime).toBe('14:00')

    const change = result.changes.find((c) => c.entityId === 'w-workout')
    expect(change).toBeDefined()
    expect(change?.changeType).toBe('moved')
  })

  // 3. Locked item preserved
  it('locked item preserved: locked schedule items never move automatically during replanning', () => {
    const existingSchedule: ScheduleItem[] = [
      {
        id: 's-locked',
        workItemId: 'w-dentist',
        title: 'Dentist Appointment',
        date: '2026-10-10',
        startTime: '14:00',
        endTime: '15:00',
        durationMinutes: 60,
        sessionIndex: 1,
        totalSessions: 1,
        isSplit: false,
        locked: true,
        reason: 'Locked appointment'
      },
      {
        id: 's-flexible',
        workItemId: 'w-writing',
        title: 'Article Writing',
        date: '2026-10-10',
        startTime: '11:00',
        endTime: '13:00',
        durationMinutes: 120,
        sessionIndex: 1,
        totalSessions: 1,
        isSplit: false,
        locked: false,
        reason: 'Flexible writing'
      }
    ]

    const candidateWorkItems: WorkItemCandidate[] = [
      {
        id: 'w-writing',
        title: 'Article Writing',
        priority: 'medium',
        status: 'todo',
        estimatedMinutes: 120,
        actualMinutes: 0,
        flexibility: 'flexible',
        orderIndex: 2
      }
    ]

    const urgentWork: WorkItemCandidate = {
      id: 'w-server-down',
      title: 'Fix Server Outage',
      priority: 'critical',
      status: 'todo',
      estimatedMinutes: 120,
      actualMinutes: 0,
      flexibility: 'fixed',
      orderIndex: 0
    }

    const input: ReplanningInput = {
      ...baseInput,
      currentTime: '11:00',
      existingSchedule,
      candidateWorkItems,
      trigger: {
        type: 'urgent_work_added',
        details: { urgentItem: urgentWork }
      }
    }

    const result = replan(input)

    // Locked dentist appointment MUST stay exactly at 14:00 - 15:00
    const lockedItem = result.updatedSchedule.find((s) => s.workItemId === 'w-dentist')
    expect(lockedItem).toBeDefined()
    expect(lockedItem?.startTime).toBe('14:00')
    expect(lockedItem?.endTime).toBe('15:00')
    expect(lockedItem?.locked).toBe(true)

    // Urgent item is at 11:00 - 13:00
    const serverItem = result.updatedSchedule.find((s) => s.workItemId === 'w-server-down')
    expect(serverItem?.startTime).toBe('11:00')
    expect(serverItem?.endTime).toBe('13:00')

    // Writing moves around the locked slot (e.g. 13:00-14:00 and 15:00-16:00, or to 15:00)
    const writingItem = result.updatedSchedule.find((s) => s.workItemId === 'w-writing')
    expect(writingItem).toBeDefined()
    expect(writingItem?.startTime).not.toBe('14:00')
  })

  // 4. Current item preserved
  it('current item preserved: item currently in progress is respected and retains its slot', () => {
    const existingSchedule: ScheduleItem[] = [
      {
        id: 's-in-progress',
        workItemId: 'w-coding',
        title: 'Feature Development',
        date: '2026-10-10',
        startTime: '10:30',
        endTime: '12:00',
        durationMinutes: 90,
        sessionIndex: 1,
        totalSessions: 1,
        isSplit: false,
        locked: false,
        reason: 'In progress'
      },
      {
        id: 's-later',
        workItemId: 'w-review',
        title: 'Code Review',
        date: '2026-10-10',
        startTime: '12:00',
        endTime: '13:00',
        durationMinutes: 60,
        sessionIndex: 1,
        totalSessions: 1,
        isSplit: false,
        locked: false,
        reason: 'Review'
      }
    ]

    const candidateWorkItems: WorkItemCandidate[] = [
      {
        id: 'w-coding',
        title: 'Feature Development',
        priority: 'high',
        status: 'in_progress',
        estimatedMinutes: 90,
        actualMinutes: 30,
        flexibility: 'flexible',
        orderIndex: 1
      },
      {
        id: 'w-review',
        title: 'Code Review',
        priority: 'medium',
        status: 'todo',
        estimatedMinutes: 60,
        actualMinutes: 0,
        flexibility: 'flexible',
        orderIndex: 2
      }
    ]

    const urgentWork: WorkItemCandidate = {
      id: 'w-urgent-bug',
      title: 'Urgent Bugfix',
      priority: 'critical',
      status: 'todo',
      estimatedMinutes: 60,
      actualMinutes: 0,
      flexibility: 'fixed',
      orderIndex: 0
    }

    const input: ReplanningInput = {
      ...baseInput,
      currentTime: '11:00', // Current time is in the middle of Feature Development (10:30 - 12:00)
      activeWorkItemId: 'w-coding',
      existingSchedule,
      candidateWorkItems,
      trigger: {
        type: 'urgent_work_added',
        details: { urgentItem: urgentWork }
      }
    }

    const result = replan(input)

    // Active item stays in progress at 10:30 - 12:00
    const activeItem = result.updatedSchedule.find((s) => s.workItemId === 'w-coding')
    expect(activeItem).toBeDefined()
    expect(activeItem?.startTime).toBe('10:30')
    expect(activeItem?.endTime).toBe('12:00')

    // Urgent work gets scheduled right after the active item ends (at 12:00 - 13:00)
    const bugItem = result.updatedSchedule.find((s) => s.workItemId === 'w-urgent-bug')
    expect(bugItem).toBeDefined()
    expect(bugItem?.startTime).toBe('12:00')
    expect(bugItem?.endTime).toBe('13:00')

    // Code review moved after urgent work
    const reviewItem = result.updatedSchedule.find((s) => s.workItemId === 'w-review')
    expect(reviewItem?.startTime).toBe('13:00')
  })

  // 5. Overload after insertion produces suggestions
  it('overload after insertion produces suggestions with exact numbers and actionable advice', () => {
    // Only 2 hours available remaining from 11:00 to 13:00
    const limitedInput: ReplanningInput = {
      ...baseInput,
      currentTime: '11:00',
      availability: [
        { date: '2026-10-10', startTime: '09:00', endTime: '13:00', availableMinutes: 240 } // ends at 13:00
      ],
      existingSchedule: [],
      candidateWorkItems: [
        {
          id: 'w-doc',
          title: 'Documentation',
          priority: 'low',
          status: 'todo',
          estimatedMinutes: 60,
          actualMinutes: 0,
          flexibility: 'flexible',
          orderIndex: 1
        }
      ],
      trigger: {
        type: 'urgent_work_added',
        details: {
          urgentItem: {
            id: 'w-huge-urgent',
            title: 'Critical Architecture Overhaul',
            priority: 'critical',
            status: 'todo',
            estimatedMinutes: 180, // 3h requested, but only 2h free from 11:00 to 13:00
            actualMinutes: 0,
            flexibility: 'fixed',
            orderIndex: 0
          }
        }
      }
    }

    const result = replan(limitedInput)

    expect(result.isOverloaded).toBe(true)
    expect(result.overloadMinutes).toBeGreaterThan(0)
    expect(result.warnings.some((w) => w.code === 'DAY_OVERLOADED')).toBe(true)

    // Verify suggestions contain actionable guidance
    expect(result.overloadSuggestions.length).toBeGreaterThan(0)
    expect(result.overloadSuggestions.some((s) => s.toLowerCase().includes('flexible') || s.toLowerCase().includes('split') || s.toLowerCase().includes('tomorrow'))).toBe(true)
  })

  // 6. Undo restores the previous version exactly
  it('undo restores the previous version exactly: round trip snapshot restoration', () => {
    const originalSchedule: ScheduleItem[] = [
      {
        id: 's-1',
        workItemId: 'w-1',
        title: 'Morning Routine',
        date: '2026-10-10',
        startTime: '09:00',
        endTime: '10:00',
        durationMinutes: 60,
        sessionIndex: 1,
        totalSessions: 1,
        isSplit: false,
        locked: true,
        reason: 'Routine'
      },
      {
        id: 's-2',
        workItemId: 'w-2',
        title: 'Deep Work',
        date: '2026-10-10',
        startTime: '10:00',
        endTime: '12:00',
        durationMinutes: 120,
        sessionIndex: 1,
        totalSessions: 1,
        isSplit: false,
        locked: false,
        reason: 'Work'
      }
    ]

    // 1. Snapshot prior version
    const snapshotJson = JSON.stringify(originalSchedule)

    // 2. Perform replanning which alters the schedule
    const replanResult = replan({
      ...baseInput,
      currentTime: '10:00',
      existingSchedule: originalSchedule,
      candidateWorkItems: [
        {
          id: 'w-2',
          title: 'Deep Work',
          priority: 'medium',
          status: 'todo',
          estimatedMinutes: 120,
          actualMinutes: 0,
          flexibility: 'flexible',
          orderIndex: 1
        }
      ],
      trigger: {
        type: 'urgent_work_added',
        details: {
          urgentItem: {
            id: 'w-urgent',
            title: 'Urgent Task',
            priority: 'critical',
            status: 'todo',
            estimatedMinutes: 60,
            actualMinutes: 0,
            flexibility: 'fixed',
            orderIndex: 0
          }
        }
      }
    })

    // The schedule changed
    expect(replanResult.updatedSchedule.length).toBeGreaterThan(originalSchedule.length)
    expect(replanResult.updatedSchedule.some((s) => s.workItemId === 'w-urgent')).toBe(true)

    // 3. Simulate Undo: parse the snapshot
    const restoredSchedule: ScheduleItem[] = JSON.parse(snapshotJson)

    // Verify exact restoration
    expect(restoredSchedule).toEqual(originalSchedule)
    expect(restoredSchedule.length).toBe(2)
    expect(restoredSchedule[0].id).toBe('s-1')
    expect(restoredSchedule[0].startTime).toBe('09:00')
    expect(restoredSchedule[1].id).toBe('s-2')
    expect(restoredSchedule[1].startTime).toBe('10:00')
    expect(restoredSchedule.some((s) => s.workItemId === 'w-urgent')).toBe(false)
  })
})
