import { describe, expect, it } from 'vitest'
import { detectDependencyCycle } from '../src/shared/dependency-utils'

describe('Dependency Cycle Detection (pure function)', () => {
  it('detects self-dependency cycle (A -> A)', () => {
    const res = detectDependencyCycle([], { predecessorId: 'node-A', successorId: 'node-A' })
    expect(res.hasCycle).toBe(true)
  })

  it('detects 2-cycle (A -> B -> A)', () => {
    const existing = [{ predecessorId: 'node-A', successorId: 'node-B' }]
    const res = detectDependencyCycle(existing, { predecessorId: 'node-B', successorId: 'node-A' })
    expect(res.hasCycle).toBe(true)
  })

  it('detects long cycle (A -> B -> C -> D -> A)', () => {
    const existing = [
      { predecessorId: 'node-A', successorId: 'node-B' },
      { predecessorId: 'node-B', successorId: 'node-C' },
      { predecessorId: 'node-C', successorId: 'node-D' }
    ]
    const res = detectDependencyCycle(existing, { predecessorId: 'node-D', successorId: 'node-A' })
    expect(res.hasCycle).toBe(true)
  })

  it('allows valid acyclic graph (A -> B -> C and A -> C)', () => {
    const existing = [
      { predecessorId: 'node-A', successorId: 'node-B' },
      { predecessorId: 'node-B', successorId: 'node-C' }
    ]
    const res = detectDependencyCycle(existing, { predecessorId: 'node-A', successorId: 'node-C' })
    expect(res.hasCycle).toBe(false)
  })
})
