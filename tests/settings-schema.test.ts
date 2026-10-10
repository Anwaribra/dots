import { describe, expect, it } from 'vitest'
import { settingsSchema, settingsUpdateSchema } from '../src/shared/settings'

describe('settings validation', () => {
  it('applies foundation defaults', () => {
    expect(settingsSchema.parse({ timezone: 'Africa/Cairo' })).toMatchObject({ locale: 'en', weekStartsOn: 6, theme: 'system' })
  })
  it('rejects an invalid week start', () => {
    expect(() => settingsSchema.parse({ weekStartsOn: 7, timezone: 'UTC' })).toThrow()
  })
  it('allows a partial IPC update only', () => {
    expect(settingsUpdateSchema.parse({ locale: 'ar' })).toEqual({ locale: 'ar' })
  })
})
