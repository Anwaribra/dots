import { describe, expect, it } from 'vitest'
import {
  calculateDayCapacity,
  type DayCapacityInput
} from '../src/shared/capacity'

describe('calculateDayCapacity pure engine', () => {
  it('calculates available, usable and buffer minutes with custom percentage', () => {
    // 09:00 to 17:00 = 8 hours = 480 minutes
    // planningCapacityPercentage: 80% => 384 minutes usable
    // bufferPercentage: 15% of usable => round(384 * 0.15) = 58 minutes buffer
    // remainingMinutesForFlexibleWork = 384 - 58 - 0 = 326
    const input: DayCapacityInput = {
      date: '2026-10-10',
      dayOfWeek: 6,
      availabilityRules: [
        { id: 'r1', dayOfWeek: 6, startTime: '09:00', endTime: '17:00', isActive: true }
      ],
      availabilityOverrides: [],
      planningCapacityPercentage: 80,
      bufferPercentage: 15,
      fixedEvents: [],
      timeBudgets: [],
      routines: []
    }

    const result = calculateDayCapacity(input)
    expect(result.availableMinutes).toBe(480)
    expect(result.usableMinutes).toBe(384)
    expect(result.bufferMinutes).toBe(58)
    expect(result.fixedEventMinutes).toBe(0)
    expect(result.remainingMinutesForFlexibleWork).toBe(326)
  })

  it('supports different capacity per weekday (e.g. Sat 8h, Fri 2h)', () => {
    const rules = [
      { id: 'r-sat', dayOfWeek: 6, startTime: '09:00', endTime: '17:00', isActive: true }, // 480m
      { id: 'r-fri', dayOfWeek: 5, startTime: '14:00', endTime: '16:00', isActive: true }  // 120m
    ]

    const satRes = calculateDayCapacity({
      date: '2026-10-10',
      dayOfWeek: 6,
      availabilityRules: rules,
      availabilityOverrides: [],
      planningCapacityPercentage: 100,
      bufferPercentage: 0,
      fixedEvents: [],
      timeBudgets: [],
      routines: []
    })

    const friRes = calculateDayCapacity({
      date: '2026-10-16',
      dayOfWeek: 5,
      availabilityRules: rules,
      availabilityOverrides: [],
      planningCapacityPercentage: 100,
      bufferPercentage: 0,
      fixedEvents: [],
      timeBudgets: [],
      routines: []
    })

    expect(satRes.availableMinutes).toBe(480)
    expect(satRes.usableMinutes).toBe(480)
    expect(friRes.availableMinutes).toBe(120)
    expect(friRes.usableMinutes).toBe(120)
  })

  it('applies daily override over regular rule', () => {
    const input: DayCapacityInput = {
      date: '2026-10-10',
      dayOfWeek: 6,
      availabilityRules: [
        { id: 'r1', dayOfWeek: 6, startTime: '09:00', endTime: '17:00', isActive: true }
      ],
      availabilityOverrides: [
        { id: 'ov1', date: '2026-10-10', startTime: '10:00', endTime: '13:20', isUnavailable: false } // 200m
      ],
      planningCapacityPercentage: 100,
      bufferPercentage: 0,
      fixedEvents: [],
      timeBudgets: [],
      routines: []
    }
    const result = calculateDayCapacity(input)
    expect(result.availableMinutes).toBe(200)
    expect(result.usableMinutes).toBe(200)
  })

  it('deducts fixed events from usable minutes and detects overlaps', () => {
    const input: DayCapacityInput = {
      date: '2026-10-10',
      dayOfWeek: 6,
      availabilityRules: [
        { id: 'r1', dayOfWeek: 6, startTime: '09:00', endTime: '17:00', isActive: true } // 480m
      ],
      availabilityOverrides: [],
      planningCapacityPercentage: 100,
      bufferPercentage: 10, // 48m buffer
      fixedEvents: [
        { id: 'ev1', title: 'Doctor Appointment', startTime: '10:00', endTime: '11:30' }, // 90m
        { id: 'ev2', title: 'Team Sync', startTime: '11:00', endTime: '11:30' } // 30m, overlaps with Doctor
      ],
      timeBudgets: [],
      routines: []
    }

    const result = calculateDayCapacity(input)
    expect(result.fixedEventMinutes).toBe(120)
    expect(result.bufferMinutes).toBe(48)
    expect(result.conflictWarnings.length).toBeGreaterThan(0)
    expect(result.conflictWarnings[0]).toContain('Conflicting fixed events')
    // 480 - 48 - 120 = 312
    expect(result.remainingMinutesForFlexibleWork).toBe(312)
  })

  it('computes budget minutes breakdown including locked and protected modes', () => {
    const input: DayCapacityInput = {
      date: '2026-10-10',
      dayOfWeek: 6,
      availabilityRules: [
        { id: 'r1', dayOfWeek: 6, startTime: '09:00', endTime: '17:00', isActive: true }
      ],
      availabilityOverrides: [],
      planningCapacityPercentage: 100,
      bufferPercentage: 0,
      fixedEvents: [],
      timeBudgets: [
        {
          id: 'b1',
          name: 'Deep Work',
          allocationMode: 'target',
          protection: 'locked',
          minimumMinutes: 120,
          targetMinutes: 120,
          maximumMinutes: 120,
          daysOfWeek: [6]
        },
        {
          id: 'b2',
          name: 'Reading',
          allocationMode: 'minimum',
          protection: 'protected',
          minimumMinutes: 60,
          targetMinutes: 60,
          maximumMinutes: 60,
          daysOfWeek: [6]
        },
        {
          id: 'b3',
          name: 'Admin',
          allocationMode: 'maximum',
          protection: 'flexible',
          minimumMinutes: 30,
          targetMinutes: 30,
          maximumMinutes: 30,
          daysOfWeek: [6]
        }
      ],
      routines: []
    }

    const result = calculateDayCapacity(input)
    expect(result.budgetSummary.lockedMinutes).toBe(120)
    expect(result.budgetSummary.protectedMinutes).toBe(60)
    expect(result.budgetSummary.flexibleMinutes).toBe(30)
    expect(result.budgetSummary.totalTargetMinutes).toBe(210)
  })
})
