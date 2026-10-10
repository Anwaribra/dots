import { describe, expect, it } from 'vitest'
import { createGoalSchema, createWorkItemSchema } from '../src/shared/entities'

describe('core entity schemas', () => {
  it('accepts a parentless goal', () => {
    expect(createGoalSchema.parse({ title: 'Learn something useful' })).toMatchObject({ priority: 'medium' })
  })
  it('rejects a negative work estimate', () => {
    expect(() => createWorkItemSchema.parse({ title: 'Task', estimatedMinutes: -1 })).toThrow()
  })
})
