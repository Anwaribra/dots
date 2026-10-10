export interface DependencyEdge {
  predecessorId: string
  successorId: string
}

export interface CycleCheckResult {
  hasCycle: boolean
  path?: string[]
}

/**
 * Pure function to detect cycle when adding a proposed dependency (predecessorId -> successorId).
 * Performs Depth First Search (DFS) on graph.
 */
export function detectDependencyCycle(
  existingDependencies: DependencyEdge[],
  proposed: DependencyEdge
): CycleCheckResult {
  // Self dependency check
  if (proposed.predecessorId === proposed.successorId) {
    return { hasCycle: true, path: [proposed.predecessorId, proposed.successorId] }
  }

  // Build graph adjacency list: node -> array of nodes it points to (successors)
  const adj = new Map<string, string[]>()

  const addEdge = (from: string, to: string): void => {
    if (!adj.has(from)) adj.set(from, [])
    adj.get(from)!.push(to)
  }

  for (const dep of existingDependencies) {
    addEdge(dep.predecessorId, dep.successorId)
  }
  // Add proposed edge
  addEdge(proposed.predecessorId, proposed.successorId)

  // To detect if proposed edge creates a cycle, check if there is a path from proposed.successorId to proposed.predecessorId
  const visited = new Set<string>()
  const parentMap = new Map<string, string>()
  const queue: string[] = [proposed.successorId]
  visited.add(proposed.successorId)

  let foundCycle = false

  while (queue.length > 0) {
    const curr = queue.shift()!
    if (curr === proposed.predecessorId) {
      foundCycle = true
      break
    }

    const neighbors = adj.get(curr) || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        parentMap.set(neighbor, curr)
        queue.push(neighbor)
      }
    }
  }

  if (foundCycle) {
    // Reconstruct cycle path
    const path: string[] = [proposed.predecessorId]
    let curr = proposed.predecessorId
    while (curr !== proposed.successorId && parentMap.has(curr)) {
      curr = parentMap.get(curr)!
      path.unshift(curr)
    }
    path.unshift(proposed.predecessorId)
    return { hasCycle: true, path }
  }

  return { hasCycle: false }
}

export interface ResourceItemState {
  id: string
  parentId: string | null
  orderIndex: number
  itemType: string
  status: string
  progress: number
  workItemId: string | null
}

export interface WorkItemState {
  id: string
  status: string
  progress: number
  actualMinutes: number
}

export interface EvaluatedItemState {
  id: string
  effectiveStatus: string
  effectiveProgress: number
  effectiveActualMinutes: number
  isBlocked: boolean
  blockedByTitle?: string
}

/**
 * Pure function implementing Decision A14 (Completion Truth) and Ordering Modes (Sequential / Dependency-Based / Flexible).
 */
export function evaluateResourceItemsState(
  orderingMode: 'sequential' | 'flexible' | 'dependency_based',
  items: ResourceItemState[],
  dependencies: DependencyEdge[],
  workItemsMap: Map<string, WorkItemState>,
  itemTitleMap?: Map<string, string>
): Map<string, EvaluatedItemState> {
  const result = new Map<string, EvaluatedItemState>()

  // 1. Resolve effective status/progress for each item based on Decision A14
  for (const item of items) {
    let effectiveStatus = item.status
    let effectiveProgress = item.progress
    let effectiveActualMinutes = 0

    if (item.workItemId && workItemsMap.has(item.workItemId)) {
      const wi = workItemsMap.get(item.workItemId)!
      effectiveActualMinutes = wi.actualMinutes || 0
      if (wi.status === 'completed' || wi.status === 'done' || wi.progress >= 100) {
        effectiveStatus = 'completed'
        effectiveProgress = 100
      } else if (wi.status === 'in_progress') {
        effectiveStatus = 'in_progress'
        effectiveProgress = wi.progress
      } else {
        effectiveStatus = 'todo'
        effectiveProgress = wi.progress
      }
    }

    result.set(item.id, {
      id: item.id,
      effectiveStatus,
      effectiveProgress,
      effectiveActualMinutes,
      isBlocked: false
    })
  }

  // Sort items by orderIndex for sequential evaluation
  const sortedItems = [...items].sort((a, b) => a.orderIndex - b.orderIndex)

  // 2. Evaluate Blocked state according to Ordering Mode
  if (orderingMode === 'sequential') {
    let previousUncompletedId: string | null = null

    for (const item of sortedItems) {
      // Modules do not get blocked
      if (item.itemType === 'module') continue

      const currentEval = result.get(item.id)!
      const isCompleted = currentEval.effectiveStatus === 'completed' || currentEval.effectiveProgress >= 100

      if (previousUncompletedId && !isCompleted) {
        currentEval.isBlocked = true
        currentEval.effectiveStatus = 'blocked'
        if (itemTitleMap && itemTitleMap.has(previousUncompletedId)) {
          currentEval.blockedByTitle = itemTitleMap.get(previousUncompletedId)
        }
      }

      if (!isCompleted && !previousUncompletedId) {
        previousUncompletedId = item.id
      }
    }
  }

  // 3. Evaluate Dependency-based blocking (applies in dependency_based mode OR explicit dependencies)
  const incomingDeps = new Map<string, string[]>()
  for (const dep of dependencies) {
    if (!incomingDeps.has(dep.successorId)) incomingDeps.set(dep.successorId, [])
    incomingDeps.get(dep.successorId)!.push(dep.predecessorId)
  }

  for (const item of items) {
    const currentEval = result.get(item.id)!
    const isCompleted = currentEval.effectiveStatus === 'completed' || currentEval.effectiveProgress >= 100

    const predecessors = incomingDeps.get(item.id) || []
    if (predecessors.length > 0 && !isCompleted) {
      for (const predId of predecessors) {
        const predEval = result.get(predId)
        if (predEval && predEval.effectiveStatus !== 'completed' && predEval.effectiveProgress < 100) {
          currentEval.isBlocked = true
          currentEval.effectiveStatus = 'blocked'
          if (itemTitleMap && itemTitleMap.has(predId)) {
            currentEval.blockedByTitle = itemTitleMap.get(predId)
          }
          break
        }
      }
    }
  }

  return result
}
