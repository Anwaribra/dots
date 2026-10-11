import { describe, it, expect } from 'vitest'
import {
  calculateGoalProgress,
  calculateProjectProgress,
  calculateVelocity,
  ProgressCalculationInput
} from '../src/shared/progress-engine'
import {
  computeAnalyticsOverview,
  AnalyticsRawData,
  AnalyticsFilter
} from '../src/shared/analytics-engine'

describe('Stage 10 - Progress Engine', () => {
  describe('Progress Modes', () => {
    it('percentage mode: calculates direct target vs current percentage', () => {
      const input: ProgressCalculationInput = {
        mode: 'percentage',
        currentValue: 45,
        targetValue: 100,
        workItems: [],
        milestones: [],
        metrics: []
      }
      const result = calculateGoalProgress(input)
      expect(result.percentage).toBe(45)
      expect(result.currentValue).toBe(45)
      expect(result.targetValue).toBe(100)
    })

    it('numeric mode: calculates current / target ratio', () => {
      // Example from spec: Current = 42, Target = 100 -> 42%
      const input: ProgressCalculationInput = {
        mode: 'numeric',
        currentValue: 42,
        targetValue: 100,
        workItems: [],
        milestones: [],
        metrics: []
      }
      const result = calculateGoalProgress(input)
      expect(result.percentage).toBe(42)
      expect(result.currentValue).toBe(42)
      expect(result.targetValue).toBe(100)

      // Generic target like 15 out of 60 km
      const kmInput: ProgressCalculationInput = {
        mode: 'numeric',
        currentValue: 15,
        targetValue: 60,
        workItems: [],
        milestones: [],
        metrics: []
      }
      expect(calculateGoalProgress(kmInput).percentage).toBe(25)
    })

    it('count mode: calculates completed tasks / total tasks', () => {
      const input: ProgressCalculationInput = {
        mode: 'count',
        workItems: [
          { id: '1', completed: true, estimatedMinutes: 10, actualMinutes: 10 },
          { id: '2', completed: true, estimatedMinutes: 20, actualMinutes: 20 },
          { id: '3', completed: false, estimatedMinutes: 30, actualMinutes: 0 },
          { id: '4', completed: false, estimatedMinutes: 40, actualMinutes: 0 }
        ],
        milestones: [],
        metrics: []
      }
      const result = calculateGoalProgress(input)
      expect(result.percentage).toBe(50)
      expect(result.completedItems).toBe(2)
      expect(result.totalItems).toBe(4)
    })

    it('duration mode: Completed Duration / Total Duration (never raw count alone)', () => {
      // 10-minute task completed vs 3-hour task remaining
      // In count mode: 1 / 2 = 50%
      // In duration mode: 10 / (10 + 180) = 10 / 190 = 5.26%
      const input: ProgressCalculationInput = {
        mode: 'duration',
        workItems: [
          { id: '1', completed: true, estimatedMinutes: 10, actualMinutes: 10 },
          { id: '2', completed: false, estimatedMinutes: 180, actualMinutes: 0 }
        ],
        milestones: [],
        metrics: []
      }
      const result = calculateGoalProgress(input)
      expect(result.percentage).toBe(5.26)
      expect(result.completedDurationMinutes).toBe(10)
      expect(result.totalDurationMinutes).toBe(190)
    })

    it('milestone mode: calculates based on milestones completed', () => {
      const input: ProgressCalculationInput = {
        mode: 'milestone',
        milestones: [
          { id: 'm1', title: 'Phase 1', completed: true },
          { id: 'm2', title: 'Phase 2', completed: true },
          { id: 'm3', title: 'Phase 3', completed: false }
        ],
        workItems: [],
        metrics: []
      }
      const result = calculateGoalProgress(input)
      // 2 out of 3 = 66.67%
      expect(result.percentage).toBe(66.67)
      expect(result.breakdown!['m1'].completed).toBe(true)
      expect(result.breakdown!['m3'].completed).toBe(false)
    })

    it('weighted goal example from spec: Launch Business (20/40/20/20)', () => {
      /*
        Example from spec:
        Goal: Launch Business
        Components:
        Validation       20%
        MVP Development  40%
        Marketing        20%
        Launch           20%
      */
      // Suppose Validation (20%) is 100% done, MVP Development (40%) is 50% done, Marketing is 0%, Launch is 0%
      // Expected total progress:
      // (100 * 20 + 50 * 40 + 0 * 20 + 0 * 20) / (20 + 40 + 20 + 20)
      // = (2000 + 2000 + 0 + 0) / 100 = 4000 / 100 = 40%
      const input: ProgressCalculationInput = {
        mode: 'weighted',
        milestones: [
          { id: 'm1', title: 'Validation', completed: true, weight: 20 },
          { id: 'm2', title: 'MVP Development', completed: false, progressPercent: 50, weight: 40 },
          { id: 'm3', title: 'Marketing', completed: false, progressPercent: 0, weight: 20 },
          { id: 'm4', title: 'Launch', completed: false, progressPercent: 0, weight: 20 }
        ],
        workItems: [],
        metrics: []
      }
      const result = calculateGoalProgress(input)
      expect(result.percentage).toBe(40)
      expect(result.breakdown!['m1'].percentage).toBe(100)
      expect(result.breakdown!['m2'].percentage).toBe(50)
      expect(result.breakdown!['m3'].percentage).toBe(0)
    })
  })

  describe('Edge Cases', () => {
    it('empty goal with zero items, milestones, and metrics returns 0%', () => {
      const input: ProgressCalculationInput = {
        mode: 'duration',
        workItems: [],
        milestones: [],
        metrics: []
      }
      const result = calculateGoalProgress(input)
      expect(result.percentage).toBe(0)
      expect(result.totalDurationMinutes).toBe(0)
      expect(result.completedDurationMinutes).toBe(0)
      expect(result.totalItems).toBe(0)
    })

    it('caps progress between 0 and 100%', () => {
      const inputOver: ProgressCalculationInput = {
        mode: 'numeric',
        currentValue: 150,
        targetValue: 100,
        workItems: [],
        milestones: [],
        metrics: []
      }
      expect(calculateGoalProgress(inputOver).percentage).toBe(100)

      const inputNegative: ProgressCalculationInput = {
        mode: 'numeric',
        currentValue: -20,
        targetValue: 100,
        workItems: [],
        milestones: [],
        metrics: []
      }
      expect(calculateGoalProgress(inputNegative).percentage).toBe(0)
    })
  })

  describe('Project Progress and Velocity', () => {
    it('calculates project progress weighted by duration', () => {
      const result = calculateProjectProgress([
        { id: 't1', completed: true, estimatedMinutes: 60, actualMinutes: 50 },
        { id: 't2', completed: false, estimatedMinutes: 60, actualMinutes: 0 }
      ])
      expect(result.percentage).toBe(50)
      expect(result.totalMinutes).toBe(120)
      expect(result.completedMinutes).toBe(60)
    })

    it('calculates velocity and trend across history snapshots', () => {
      const history = [
        { snapshotDate: '2026-10-01', progressPercentage: 10 },
        { snapshotDate: '2026-10-02', progressPercentage: 20 },
        { snapshotDate: '2026-10-03', progressPercentage: 35 }
      ]
      const velocity = calculateVelocity(history)
      expect(velocity.totalGain).toBe(25)
      expect(velocity.velocityPerDay).toBe(12.5) // 25% gain across 2 days
      expect(velocity.trend).toBe('improving')
    })
  })
})

describe('Stage 10 - Analytics Engine', () => {
  const sampleData: AnalyticsRawData = {
    workItems: [
      {
        id: 'w1',
        title: 'Draft proposal',
        areaId: 'area-work',
        goalId: 'goal-1',
        projectId: 'proj-1',
        itemType: 'task',
        tags: ['urgent'],
        estimatedMinutes: 60,
        actualMinutes: 70,
        scheduledMinutes: 60,
        completed: true,
        dueDate: '2026-10-05',
        completedAt: '2026-10-04T12:00:00Z',
        createdAt: '2026-10-01T09:00:00Z'
      },
      {
        id: 'w2',
        title: 'Review proposal',
        areaId: 'area-work',
        goalId: 'goal-1',
        projectId: 'proj-1',
        itemType: 'task',
        tags: ['review'],
        estimatedMinutes: 30,
        actualMinutes: 0,
        scheduledMinutes: 30,
        completed: false,
        dueDate: '2026-10-02', // Overdue
        createdAt: '2026-10-01T09:00:00Z'
      },
      {
        id: 'w3',
        title: 'Gym session',
        areaId: 'area-health',
        itemType: 'habit',
        tags: ['fitness'],
        estimatedMinutes: 45,
        actualMinutes: 45,
        scheduledMinutes: 45,
        completed: true,
        dueDate: '2026-10-05',
        completedAt: '2026-10-06T10:00:00Z', // Completed after due date
        createdAt: '2026-10-01T09:00:00Z'
      }
    ],
    sessions: [
      {
        id: 's1',
        workItemId: 'w1',
        startedAt: '2026-10-04T09:00:00Z',
        endedAt: '2026-10-04T10:10:00Z',
        durationMinutes: 70,
        pausedDurationMinutes: 0
      },
      {
        id: 's2',
        workItemId: 'w3',
        startedAt: '2026-10-05T07:00:00Z',
        endedAt: '2026-10-05T07:45:00Z',
        durationMinutes: 45,
        pausedDurationMinutes: 0
      }
    ],
    areas: [
      { id: 'area-work', name: 'Work', color: '#3b82f6' },
      { id: 'area-health', name: 'Health', color: '#10b981' }
    ],
    goals: [
      { id: 'goal-1', title: 'Q4 Promotion', areaId: 'area-work' }
    ],
    projects: [
      { id: 'proj-1', name: 'Enterprise Pitch', areaId: 'area-work', goalId: 'goal-1' }
    ]
  }

  it('aggregates time by area correctly', () => {
    const overview = computeAnalyticsOverview(sampleData, {})
    expect(overview.timeByArea.length).toBe(2)

    const workArea = overview.timeByArea.find((a) => a.areaId === 'area-work')
    const healthArea = overview.timeByArea.find((a) => a.areaId === 'area-health')

    expect(workArea?.actualMinutes).toBe(70)
    expect(workArea?.plannedMinutes).toBe(90) // w1 (60) + w2 (30)
    expect(healthArea?.actualMinutes).toBe(45)
  })

  it('aggregates planned vs scheduled vs actual totals', () => {
    const overview = computeAnalyticsOverview(sampleData, {})
    expect(overview.plannedVsActual.plannedMinutes).toBe(135) // 60 + 30 + 45
    expect(overview.plannedVsActual.scheduledMinutes).toBe(135)
    expect(overview.plannedVsActual.actualMinutes).toBe(115) // 70 + 45
  })

  it('calculates completion rate and deadline performance', () => {
    const overview = computeAnalyticsOverview(sampleData, {})
    // Total 3, completed 2 -> 66.67%
    expect(overview.completionRate).toBe(66.67)
    expect(overview.completedItemsCount).toBe(2)
    expect(overview.totalItemsCount).toBe(3)

    // Overdue count: w2 is incomplete and due 2026-10-02 (now is default 2026-10-11)
    expect(overview.overdueCount).toBe(1)

    // Deadline performance: of completed with due date:
    // w1 completed 2026-10-04 <= 2026-10-05 (on time)
    // w3 completed 2026-10-06 > 2026-10-05 (late)
    // 1 on time out of 2 = 50%
    expect(overview.deadlinePerformanceRate).toBe(50)
  })

  it('filters data by area, goal, project, and date range', () => {
    const filterArea: AnalyticsFilter = { areaId: 'area-health' }
    const filtered = computeAnalyticsOverview(sampleData, filterArea)
    expect(filtered.totalItemsCount).toBe(1)
    expect(filtered.completedItemsCount).toBe(1)
    expect(filtered.plannedVsActual.actualMinutes).toBe(45)

    const filterGoal: AnalyticsFilter = { goalId: 'goal-1' }
    const filteredGoal = computeAnalyticsOverview(sampleData, filterGoal)
    expect(filteredGoal.totalItemsCount).toBe(2)
    expect(filteredGoal.timeByGoal.length).toBe(1)
    expect(filteredGoal.timeByGoal[0].goalTitle).toBe('Q4 Promotion')
  })

  it('handles empty datasets cleanly without crashing or NaN', () => {
    const emptyData: AnalyticsRawData = {
      workItems: [],
      sessions: [],
      areas: [],
      goals: [],
      projects: []
    }
    const overview = computeAnalyticsOverview(emptyData, {})
    expect(overview.totalItemsCount).toBe(0)
    expect(overview.completionRate).toBe(0)
    expect(overview.deadlinePerformanceRate).toBe(100)
    expect(overview.overdueCount).toBe(0)
    expect(overview.timeByArea).toEqual([])
    expect(overview.timeByGoal).toEqual([])
    expect(overview.timeByProject).toEqual([])
    expect(overview.plannedVsActual.plannedMinutes).toBe(0)
    expect(overview.plannedVsActual.actualMinutes).toBe(0)
  })
})
