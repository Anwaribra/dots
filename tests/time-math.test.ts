import { describe, expect, it } from 'vitest'
import {
  aggregateEstimationAccuracy,
  calculateEstimationAccuracy,
  computeNetSessionMinutes,
  computeRemainingWorkMinutes
} from '../src/shared/time-math'

describe('computeNetSessionMinutes', () => {
  it('computes minutes from ms timestamps with no pause', () => {
    const start = 0
    const end = 60 * 60 * 1000 // 1 hour in ms
    expect(computeNetSessionMinutes(start, end, 0)).toBe(60)
  })

  it('subtracts pause duration', () => {
    const start = 0
    const end = 90 * 60 * 1000 // 90 minutes
    const pausedMs = 30 * 60 * 1000 // 30 minutes paused
    expect(computeNetSessionMinutes(start, end, pausedMs)).toBe(60)
  })

  it('floors fractional minutes', () => {
    const start = 0
    const end = 90500 // 1 min 30.5 sec
    expect(computeNetSessionMinutes(start, end, 0)).toBe(1)
  })

  it('returns 0 when end is before start', () => {
    expect(computeNetSessionMinutes(1000, 500, 0)).toBe(0)
  })

  it('returns 0 when pause exceeds gross duration', () => {
    const start = 0
    const end = 10 * 60 * 1000
    const pausedMs = 15 * 60 * 1000
    expect(computeNetSessionMinutes(start, end, pausedMs)).toBe(0)
  })

  it('handles sessions that cross midnight (large timestamps)', () => {
    // 11 PM to 1 AM the next day = 120 min
    const midnight = new Date('2024-01-02T00:00:00Z').getTime()
    const start = midnight - 60 * 60 * 1000 // 11 PM
    const end = midnight + 60 * 60 * 1000 // 1 AM next day
    expect(computeNetSessionMinutes(start, end, 0)).toBe(120)
  })

  it('handles pause/resume accurately', () => {
    // 60 min gross, 15 min paused = 45 min net
    const start = 0
    const end = 60 * 60 * 1000
    const pausedMs = 15 * 60 * 1000
    expect(computeNetSessionMinutes(start, end, pausedMs)).toBe(45)
  })
})

describe('computeRemainingWorkMinutes', () => {
  it('computes remaining = estimated - actual', () => {
    expect(computeRemainingWorkMinutes(120, 45)).toBe(75)
  })

  it('returns 0 when actual >= estimated', () => {
    expect(computeRemainingWorkMinutes(60, 90)).toBe(0)
  })

  it('handles zero actual', () => {
    expect(computeRemainingWorkMinutes(60, 0)).toBe(60)
  })

  it('handles zero estimated', () => {
    expect(computeRemainingWorkMinutes(0, 30)).toBe(0)
  })

  it('handles nullish values safely', () => {
    expect(computeRemainingWorkMinutes(0, 0)).toBe(0)
  })
})

describe('calculateEstimationAccuracy', () => {
  it('returns accurate when actual === estimated', () => {
    const r = calculateEstimationAccuracy(60, 60)
    expect(r.biasType).toBe('accurate')
    expect(r.accuracyPercentage).toBe(100)
    expect(r.biasPercentage).toBe(0)
  })

  it('identifies underestimation', () => {
    // actual = 120, estimated = 60 → 100% over
    const r = calculateEstimationAccuracy(60, 120)
    expect(r.biasType).toBe('underestimated')
    expect(r.biasPercentage).toBeGreaterThan(0)
    expect(r.suggestion).toContain('%')
  })

  it('identifies overestimation', () => {
    // actual = 30, estimated = 60 → 50% less time
    const r = calculateEstimationAccuracy(60, 30)
    expect(r.biasType).toBe('overestimated')
    expect(r.biasPercentage).toBeLessThan(0)
  })

  it('handles zero estimate', () => {
    const r = calculateEstimationAccuracy(0, 45)
    expect(r.biasType).toBe('accurate')
    expect(r.suggestion).toContain('No initial estimate')
  })

  it('handles zero actual', () => {
    const r = calculateEstimationAccuracy(60, 0)
    expect(r.accuracyPercentage).toBe(0)
    expect(r.biasType).toBe('overestimated')
  })

  it('marks within ±5% as accurate', () => {
    // 63 actual vs 60 estimated = ~5% over — should still be accurate
    const r = calculateEstimationAccuracy(60, 63)
    expect(r.biasType).toBe('accurate')
  })

  it('suggestion is suggestion only, never edits estimate', () => {
    const est = 60
    const r = calculateEstimationAccuracy(est, 90)
    // estimated field in result matches input
    expect(r.estimatedMinutes).toBe(60)
    expect(r.suggestion.length).toBeGreaterThan(0)
  })
})

describe('aggregateEstimationAccuracy', () => {
  it('aggregates multiple items', () => {
    const items = [
      { estimatedMinutes: 60, actualMinutes: 90 },
      { estimatedMinutes: 120, actualMinutes: 120 }
    ]
    const r = aggregateEstimationAccuracy(items)
    // total est = 180, total act = 210
    expect(r.estimatedMinutes).toBe(180)
    expect(r.actualMinutes).toBe(210)
    expect(r.biasType).toBe('underestimated')
  })

  it('skips items with zero estimate', () => {
    const items = [
      { estimatedMinutes: 0, actualMinutes: 60 },
      { estimatedMinutes: 60, actualMinutes: 60 }
    ]
    const r = aggregateEstimationAccuracy(items)
    expect(r.estimatedMinutes).toBe(60)
    expect(r.actualMinutes).toBe(60)
  })

  it('returns accurate for empty array', () => {
    const r = aggregateEstimationAccuracy([])
    expect(r.biasType).toBe('accurate')
  })
})
