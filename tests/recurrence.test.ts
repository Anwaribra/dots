import { describe, expect, it } from 'vitest'
import { expandRecurrenceRule } from '../src/shared/recurrence'

describe('expandRecurrenceRule pure engine', () => {
  it('expands daily recurrence correctly', () => {
    const dates = expandRecurrenceRule(
      'FREQ=DAILY;INTERVAL=1',
      '2026-10-10',
      '2026-10-14',
      '2026-10-10'
    )
    expect(dates).toEqual([
      '2026-10-10',
      '2026-10-11',
      '2026-10-12',
      '2026-10-13',
      '2026-10-14'
    ])
  })

  it('honors interval for daily frequency', () => {
    const dates = expandRecurrenceRule(
      'FREQ=DAILY;INTERVAL=2',
      '2026-10-10',
      '2026-10-16',
      '2026-10-10'
    )
    expect(dates).toEqual(['2026-10-10', '2026-10-12', '2026-10-14', '2026-10-16'])
  })

  it('expands weekly recurrence on specific days', () => {
    // 2026-10-10 is Saturday (SA), 11 is Sun (SU), 12 is Mon (MO), 13 is Tue (TU), 14 is Wed (WE), 15 is Thu (TH), 16 is Fri (FR), 17 is Sat (SA)
    const dates = expandRecurrenceRule(
      'FREQ=WEEKLY;BYDAY=SA,MO',
      '2026-10-10',
      '2026-10-18',
      '2026-10-10'
    )
    expect(dates).toEqual([
      '2026-10-10', // Sat
      '2026-10-12', // Mon
      '2026-10-17'  // Sat
    ])
  })

  it('expands monthly recurrence on day of month', () => {
    const dates = expandRecurrenceRule(
      'FREQ=MONTHLY;BYMONTHDAY=15',
      '2026-01-01',
      '2026-04-30',
      '2026-01-15'
    )
    expect(dates).toEqual([
      '2026-01-15',
      '2026-02-15',
      '2026-03-15',
      '2026-04-15'
    ])
  })

  it('does not produce dates outside given range', () => {
    const dates = expandRecurrenceRule(
      'FREQ=DAILY;INTERVAL=1',
      '2026-10-10',
      '2026-10-12',
      '2026-10-10'
    )
    expect(dates).toEqual(['2026-10-10', '2026-10-11', '2026-10-12'])
  })
})
