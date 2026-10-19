import { describe, expect, it } from 'vitest'
import {
  captureTask,
  InMemoryScheduleStore,
  generateProposedScheduleRepair,
  approveProposal,
  rejectProposal,
  isProposalStale,
  schedule,
  replan,
  initializeDayCapacity,
  DEFAULT_CAPACITY_SETTINGS,
  type PlanningInput,
  type ScheduleItem,
  type FixedEventItem
} from '../src/engine'

describe('Dots Core Engine — Extraction & Integration Contract (Phase 1)', () => {
  const targetDate = '2026-10-20'

  // Helper to build base store
  function createTestStore(overrides?: {
    schedules?: Record<string, ScheduleItem[]>
    fixedEvents?: Record<string, FixedEventItem[]>
    availableMinutes?: number
  }) {
    const store = new InMemoryScheduleStore({
      schedules: overrides?.schedules || {},
      fixedEvents: overrides?.fixedEvents || {},
      availability: {
        [targetDate]: [
          {
            date: targetDate,
            startTime: '09:00',
            endTime: '17:00',
            availableMinutes: overrides?.availableMinutes ?? 480
          }
        ]
      },
      capacitySettings: {
        planningCapacityPercentage: 75, // 360m usable
        bufferPercentage: 20            // 72m buffer
      }
    })
    return store
  }

  // 1. Task fitting into available time
  it('schedules a captured task cleanly when capacity is available', () => {
    const store = createTestStore()
    const task = captureTask({
      title: 'Write Technical Proposal',
      estimatedMinutes: 60,
      priority: 'high'
    })

    const proposal = generateProposedScheduleRepair({
      store,
      targetDate,
      currentTime: '09:00',
      incomingTask: task
    })

    expect(proposal.status).toBe('pending')
    expect(proposal.isOverloaded).toBe(false)
    expect(proposal.proposedSchedule.length).toBe(1)
    expect(proposal.proposedSchedule[0].title).toBe('Write Technical Proposal')
    expect(proposal.proposedSchedule[0].startTime).toBe('09:00')
    expect(proposal.proposedSchedule[0].endTime).toBe('10:00')
    expect(proposal.humanSummary).toContain('Inserted "Write Technical Proposal" at 09:00 - 10:00')
  })

  // 2. Urgent task conflicting with existing plans
  it('handles urgent task: displaces flexible work, preserves past events, explains changes', () => {
    const existingWork: ScheduleItem[] = [
      {
        id: 's-past',
        workItemId: 'w-past',
        title: 'Morning Standup (Completed)',
        date: targetDate,
        startTime: '09:00',
        endTime: '10:00',
        durationMinutes: 60,
        sessionIndex: 1,
        totalSessions: 1,
        isSplit: false,
        locked: false,
        reason: 'Morning routine'
      },
      {
        id: 's-flexible',
        workItemId: 'w-flexible',
        title: 'Draft Documentation',
        date: targetDate,
        startTime: '10:00',
        endTime: '12:00',
        durationMinutes: 120,
        sessionIndex: 1,
        totalSessions: 1,
        isSplit: false,
        locked: false,
        reason: 'Original slot'
      }
    ]

    const store = createTestStore({
      schedules: { [targetDate]: existingWork }
    })

    const urgentTask = captureTask({
      title: 'Emergency Server Bugfix',
      estimatedMinutes: 60,
      priority: 'critical'
    })

    const proposal = generateProposedScheduleRepair({
      store,
      targetDate,
      currentTime: '10:00',
      incomingTask: urgentTask
    })

    expect(proposal.status).toBe('pending')

    // Completed past item at 09:00 must be preserved
    const pastItem = proposal.proposedSchedule.find((s) => s.workItemId === 'w-past')
    expect(pastItem).toBeDefined()
    expect(pastItem?.startTime).toBe('09:00')
    expect(pastItem?.endTime).toBe('10:00')

    // Urgent task inserted at 10:00
    const urgentItem = proposal.proposedSchedule.find((s) => s.workItemId === urgentTask.id)
    expect(urgentItem).toBeDefined()
    expect(urgentItem?.startTime).toBe('10:00')
    expect(urgentItem?.endTime).toBe('11:00')

    // Flexible documentation shifted to 11:00 and split into 90m + 30m sessions
    const shiftedSessions = proposal.proposedSchedule.filter((s) => s.workItemId === 'w-flexible')
    expect(shiftedSessions.length).toBe(2)
    expect(shiftedSessions[0].startTime).toBe('11:00')
    expect(shiftedSessions[0].endTime).toBe('12:30')
    expect(shiftedSessions[1].startTime).toBe('12:30')
    expect(shiftedSessions[1].endTime).toBe('13:00')

    expect(proposal.humanSummary).toContain('Emergency Server Bugfix')
    expect(proposal.humanSummary).toContain('shifted')
  })

  // 3. Insufficient available capacity (Overload warning & suggestions)
  it('detects insufficient capacity, marks day as overloaded, and generates actionable suggestions', () => {
    // 60 minutes free window between 09:00 and 10:00
    const store = new InMemoryScheduleStore({
      availability: {
        [targetDate]: [
          {
            date: targetDate,
            startTime: '09:00',
            endTime: '10:00',
            availableMinutes: 60
          }
        ]
      },
      capacitySettings: {
        planningCapacityPercentage: 75,
        bufferPercentage: 20
      }
    })

    const bigTask = captureTask({
      title: 'Comprehensive Refactoring',
      estimatedMinutes: 180, // Needs 180m, but window is only 60m!
      priority: 'medium'
    })

    const proposal = generateProposedScheduleRepair({
      store,
      targetDate,
      currentTime: '09:00',
      incomingTask: bigTask
    })

    expect(proposal.isOverloaded).toBe(true)
    expect(proposal.overloadMinutes).toBeGreaterThan(0)
    expect(proposal.warnings.some((w) => w.code === 'DAY_OVERLOADED')).toBe(true)
    expect(proposal.overloadSuggestions.length).toBeGreaterThan(0)
    expect(proposal.humanSummary).toContain('Warning: Day is overbooked')
  })

  // 4. Fixed commitments that must not move
  it('strictly respects fixed commitments and locked items without overlapping or moving them', () => {
    const fixedEvents: FixedEventItem[] = [
      {
        id: 'fe-client-call',
        title: 'Board Meeting',
        startTime: '11:00',
        endTime: '12:00',
        date: targetDate,
        durationMinutes: 60,
        locked: true,
        flexibility: 'fixed'
      }
    ]

    const store = createTestStore({
      fixedEvents: { [targetDate]: fixedEvents }
    })

    const task1 = captureTask({
      id: 'task-1-morning',
      title: 'Morning Prep',
      estimatedMinutes: 90, // 09:00 to 10:30 (fits in single session before 11:00 meeting)
      priority: 'high'
    })
    const task2 = captureTask({
      id: 'task-2-post',
      title: 'Post Meeting Follow-up',
      estimatedMinutes: 60, // must be placed at 12:00 or later
      priority: 'high'
    })

    store.addWorkItem(task1)
    store.addWorkItem(task2)

    const proposal = generateProposedScheduleRepair({
      store,
      targetDate,
      currentTime: '09:00'
    })

    // Task 1 should fit before the meeting (09:00 - 10:30)
    const p1 = proposal.proposedSchedule.find((s) => s.workItemId === task1.id)
    expect(p1?.startTime).toBe('09:00')
    expect(p1?.endTime).toBe('10:30')

    // Task 2 must NOT overlap board meeting (11:00-12:00); must be placed at 12:00 or later
    const p2 = proposal.proposedSchedule.find((s) => s.workItemId === task2.id)
    expect(p2?.startTime).toBe('12:00')
    expect(p2?.endTime).toBe('13:00')
  })

  // 5. Protected buffers and realistic daily capacity (75% load, 20% buffer)
  it('verifies 75% planning capacity and 20% reality buffer math', () => {
    // 480 available minutes (09:00 - 17:00)
    const cap = initializeDayCapacity(
      targetDate,
      2, // Tuesday
      [{ date: targetDate, startTime: '09:00', endTime: '17:00', availableMinutes: 480 }],
      [],
      [],
      [],
      DEFAULT_CAPACITY_SETTINGS // 75% load, 20% buffer
    )

    // 480 * 75% = 360m usable
    expect(cap.usableMinutes).toBe(360)
    // 360 * 20% = 72m buffer
    expect(cap.bufferMinutes).toBe(72)
    // netRemainingMinutes = 360 - 72 = 288m available for flexible work
    expect(cap.netRemainingMinutes).toBe(288)
    expect(cap.isOverloaded).toBe(false)
  })

  // 6. Repeated execution idempotency
  it('is strictly idempotent: repeated repair runs with same input yield identical schedule and zero duplicates', () => {
    const store = createTestStore()
    const task = captureTask({
      title: 'Analyze Performance Metrics',
      estimatedMinutes: 90,
      priority: 'medium'
    })

    const run1 = generateProposedScheduleRepair({
      store,
      targetDate,
      currentTime: '09:00',
      incomingTask: task
    })

    const run2 = generateProposedScheduleRepair({
      store,
      targetDate,
      currentTime: '09:00',
      incomingTask: task
    })

    expect(run1.proposedSchedule.length).toBe(run2.proposedSchedule.length)
    expect(run1.proposedSchedule[0].startTime).toBe(run2.proposedSchedule[0].startTime)
    expect(run1.proposedSchedule[0].endTime).toBe(run2.proposedSchedule[0].endTime)
    expect(run1.changes).toEqual(run2.changes)
  })

  // 7. Proposal approval, rejection, and stale proposal detection
  describe('Proposal Lifecycle & Integration Contract', () => {
    it('approves a proposal, updates the store, and changes status to approved', () => {
      const store = createTestStore()
      const task = captureTask({ title: 'Task to Approve', estimatedMinutes: 60 })

      const proposal = generateProposedScheduleRepair({
        store,
        targetDate,
        currentTime: '09:00',
        incomingTask: task
      })

      expect(proposal.status).toBe('pending')
      expect(store.getCurrentSchedule(targetDate).length).toBe(0)

      const result = approveProposal(proposal, store, task)

      expect(result.success).toBe(true)
      expect(result.status).toBe('approved')
      expect(proposal.status).toBe('approved')

      // Store now holds the committed schedule
      const committed = store.getCurrentSchedule(targetDate)
      expect(committed.length).toBe(1)
      expect(committed[0].title).toBe('Task to Approve')
      expect(store.history.length).toBe(1)
    })

    it('rejects a proposal, leaves store untouched, and changes status to rejected', () => {
      const initialItem: ScheduleItem = {
        id: 'init-1',
        workItemId: 'w-init',
        title: 'Initial Work',
        date: targetDate,
        startTime: '09:00',
        endTime: '10:00',
        durationMinutes: 60,
        sessionIndex: 1,
        totalSessions: 1,
        isSplit: false,
        locked: false,
        reason: 'Initial'
      }

      const store = createTestStore({
        schedules: { [targetDate]: [initialItem] }
      })

      const task = captureTask({ title: 'Task to Reject', estimatedMinutes: 60 })
      const proposal = generateProposedScheduleRepair({
        store,
        targetDate,
        currentTime: '09:00',
        incomingTask: task
      })

      const result = rejectProposal(proposal, store, 'User decided not to reschedule')

      expect(result.success).toBe(true)
      expect(result.status).toBe('rejected')
      expect(proposal.status).toBe('rejected')

      // Store schedule is unchanged
      const current = store.getCurrentSchedule(targetDate)
      expect(current.length).toBe(1)
      expect(current[0].title).toBe('Initial Work')
    })

    it('detects stale proposal when underlying schedule changes before approval', () => {
      const store = createTestStore()
      const taskA = captureTask({ title: 'Task A', estimatedMinutes: 60 })

      const proposal = generateProposedScheduleRepair({
        store,
        targetDate,
        currentTime: '09:00',
        incomingTask: taskA
      })

      // Simulate a concurrent schedule change before approval (e.g. user added another item)
      store.commitSchedule(targetDate, [
        {
          id: 'concurrent-1',
          workItemId: 'w-concurrent',
          title: 'Concurrent Meeting Added',
          date: targetDate,
          startTime: '09:00',
          endTime: '09:30',
          durationMinutes: 30,
          sessionIndex: 1,
          totalSessions: 1,
          isSplit: false,
          locked: true,
          reason: 'Concurrent'
        }
      ])

      // Attempt to approve the stale proposal
      const result = approveProposal(proposal, store, taskA)

      expect(result.success).toBe(false)
      expect(result.status).toBe('stale')
      expect(proposal.status).toBe('stale')
      expect(result.message).toContain('stale')

      // The concurrent schedule was NOT overwritten!
      const finalSchedule = store.getCurrentSchedule(targetDate)
      expect(finalSchedule[0].title).toBe('Concurrent Meeting Added')
    })

    it('prevents re-approving or re-rejecting an already resolved proposal', () => {
      const store = createTestStore()
      const task = captureTask({ title: 'Task 1', estimatedMinutes: 30 })
      const proposal = generateProposedScheduleRepair({
        store,
        targetDate,
        currentTime: '09:00',
        incomingTask: task
      })

      approveProposal(proposal, store, task)
      expect(proposal.status).toBe('approved')

      // Second attempt to approve
      const secondApproval = approveProposal(proposal, store, task)
      expect(secondApproval.success).toBe(false)
      expect(secondApproval.message).toContain('Cannot approve proposal with status "approved"')

      // Attempt to reject already approved proposal
      const rejectAttempt = rejectProposal(proposal, store)
      expect(rejectAttempt.success).toBe(false)
      expect(rejectAttempt.message).toContain('Cannot reject proposal with status "approved"')
    })
  })
})
