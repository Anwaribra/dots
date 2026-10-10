import { describe, expect, it } from 'vitest'
import { parseBulkResourceText, parseDurationMinutes } from '../src/shared/bulk-parser'

describe('Bulk Resource Parser (pure function)', () => {
  it('parses standard lines with pipe separator', () => {
    const raw = `Video 1 | 35
Video 2 | 42m
Video 3 | 1h 15m`
    const parsed = parseBulkResourceText(raw)
    expect(parsed).toEqual([
      { title: 'Video 1', estimatedMinutes: 35, orderIndex: 0 },
      { title: 'Video 2', estimatedMinutes: 42, orderIndex: 1 },
      { title: 'Video 3', estimatedMinutes: 75, orderIndex: 2 }
    ])
  })

  it('handles extra spaces and blank lines', () => {
    const raw = `   
   Lesson A   |   25 min   

   Lesson B - 40   `
    const parsed = parseBulkResourceText(raw)
    expect(parsed.length).toBe(2)
    expect(parsed[0]).toEqual({ title: 'Lesson A', estimatedMinutes: 25, orderIndex: 0 })
    expect(parsed[1]).toEqual({ title: 'Lesson B', estimatedMinutes: 40, orderIndex: 1 })
  })

  it('handles missing duration gracefully', () => {
    const raw = 'Chapter 1'
    const parsed = parseBulkResourceText(raw)
    expect(parsed).toEqual([{ title: 'Chapter 1', estimatedMinutes: 0, orderIndex: 0 }])
  })

  it('handles Arabic digits correctly', () => {
    const raw = 'فيديو 1 | ٣٥\nفيديو 2 — ٤٢ دقيقة'
    const parsed = parseBulkResourceText(raw)
    expect(parsed).toEqual([
      { title: 'فيديو 1', estimatedMinutes: 35, orderIndex: 0 },
      { title: 'فيديو 2', estimatedMinutes: 42, orderIndex: 1 }
    ])
  })

  it('handles 20 lines pasted at once', () => {
    const lines = Array.from({ length: 20 }, (_, i) => `Item ${i + 1} | ${(i + 1) * 5}`)
    const parsed = parseBulkResourceText(lines.join('\n'))
    expect(parsed.length).toBe(20)
    expect(parsed[0].title).toBe('Item 1')
    expect(parsed[0].estimatedMinutes).toBe(5)
    expect(parsed[19].title).toBe('Item 20')
    expect(parsed[19].estimatedMinutes).toBe(100)
  })
})
