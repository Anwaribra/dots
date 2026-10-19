import type { DependencyEdge, WorkItemCandidate, ScheduleItem } from './types'

export type DependencyState = {
  isBlocked: boolean
  blockedByIds: string[]
  blockedByTitles: string[]
}

export function buildDependencyGraph(dependencies: DependencyEdge[]): Map<string, string[]> {
  // successorId -> array of predecessorIds
  const graph = new Map<string, string[]>()
  for (const dep of dependencies) {
    const list = graph.get(dep.successorId) || []
    list.push(dep.predecessorId)
    graph.set(dep.successorId, list)
  }
  return graph
}

export function checkItemDependencyState(
  itemId: string,
  dependencies: DependencyEdge[],
  allWorkItems: WorkItemCandidate[],
  scheduledItems: ScheduleItem[],
  currentDate: string
): DependencyState {
  const predecessorIds: string[] = []
  for (const dep of dependencies) {
    if (dep.successorId === itemId) {
      predecessorIds.push(dep.predecessorId)
    }
  }

  if (predecessorIds.length === 0) {
    return { isBlocked: false, blockedByIds: [], blockedByTitles: [] }
  }

  const blockedByIds: string[] = []
  const blockedByTitles: string[] = []

  for (const predId of predecessorIds) {
    const predItem = allWorkItems.find((w) => w.id === predId)
    if (!predItem) continue

    // Check if prerequisite is completed in database
    const isCompletedInDb =
      predItem.status === 'done' ||
      predItem.status === 'completed' ||
      (predItem.estimatedMinutes > 0 && predItem.actualMinutes >= predItem.estimatedMinutes)

    if (isCompletedInDb) continue

    // If not completed in DB, check if it was scheduled on an earlier date or earlier on the same day
    const predScheduled = scheduledItems.filter((s) => s.workItemId === predId)
    if (predScheduled.length === 0) {
      // Not completed and not scheduled yet -> blocked
      blockedByIds.push(predId)
      blockedByTitles.push(predItem.title)
    } else {
      // Check if scheduled AFTER currentDate or on the same day
      const latestScheduledDate = predScheduled.reduce(
        (max, s) => (s.date > max ? s.date : max),
        predScheduled[0].date
      )
      if (latestScheduledDate >= currentDate) {
        // Prerequisite scheduled on same day or later -> successor cannot be placed on this date
        blockedByIds.push(predId)
        blockedByTitles.push(predItem.title)
      }
    }
  }

  return {
    isBlocked: blockedByIds.length > 0,
    blockedByIds,
    blockedByTitles
  }
}
