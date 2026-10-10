export type ReviewResultType = 'strong' | 'good' | 'weak'

export type ReviewPolicyData = {
  id: string
  name: string
  intervalStrategy: string
  intervalDays: number[]
  shortenOnWeak: boolean
  enabled: boolean
}

export type ReviewableItemState = {
  id: string
  title: string
  itemKind: 'workItem' | 'resourceItem'
  reviewPolicyId?: string | null
  lastReviewedAt?: number | null
  nextReviewAt?: number | null
  reviewCount: number
  reviewStatus: 'none' | 'scheduled' | 'due' | 'overdue'
  estimatedMinutes?: number
}

export type ReviewStatusResult = 'none' | 'scheduled' | 'due' | 'overdue'

/**
 * Parses interval days string or returns default [1, 3, 7, 14, 30]
 */
export function parseIntervalDays(intervalDaysInput: string | number[]): number[] {
  if (Array.isArray(intervalDaysInput)) {
    return intervalDaysInput.length > 0 ? intervalDaysInput : [1, 3, 7, 14, 30]
  }
  try {
    const parsed = JSON.parse(intervalDaysInput)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((n) => Math.max(1, Math.floor(Number(n) || 1)))
    }
  } catch {
    // fallback
  }
  return [1, 3, 7, 14, 30]
}

/**
 * Calculates the next review timestamp given a policy, review count, previous result, and reviewedAt timestamp.
 */
export function calculateNextReviewAt(
  policy: ReviewPolicyData,
  currentCount: number,
  lastResult: ReviewResultType | null | undefined,
  reviewedAtMs: number
): number {
  const intervals = parseIntervalDays(policy.intervalDays)
  
  let stepIndex = Math.min(currentCount, intervals.length - 1)
  if (stepIndex < 0) stepIndex = 0

  if (lastResult === 'weak' && policy.shortenOnWeak) {
    // Step back in the interval progression on weak recall
    stepIndex = Math.max(0, stepIndex - 1)
  }

  const days = intervals[stepIndex] ?? 1
  const dayMs = 24 * 60 * 60 * 1000
  return reviewedAtMs + days * dayMs
}

/**
 * Determines whether an item is 'none', 'scheduled', 'due', or 'overdue' relative to nowMs.
 */
export function evaluateReviewStatus(
  nextReviewAtMs: number | null | undefined,
  nowMs: number
): ReviewStatusResult {
  if (!nextReviewAtMs) return 'none'

  const dayMs = 24 * 60 * 60 * 1000
  if (nowMs >= nextReviewAtMs + dayMs) {
    return 'overdue'
  }
  if (nowMs >= nextReviewAtMs) {
    return 'due'
  }
  return 'scheduled'
}

export type DueReviewsFilterResult = {
  dueItems: ReviewableItemState[]
  overdueItems: ReviewableItemState[]
  allDueOrOverdue: ReviewableItemState[]
}

/**
 * Filters and categorizes reviewable items by due and overdue status.
 */
export function getDueReviews(
  items: ReviewableItemState[],
  policiesMap: Record<string, ReviewPolicyData>,
  nowMs: number
): DueReviewsFilterResult {
  const dueItems: ReviewableItemState[] = []
  const overdueItems: ReviewableItemState[] = []
  const allDueOrOverdue: ReviewableItemState[] = []

  for (const item of items) {
    if (!item.reviewPolicyId) continue
    const policy = policiesMap[item.reviewPolicyId]
    if (!policy || !policy.enabled) continue

    const status = evaluateReviewStatus(item.nextReviewAt, nowMs)
    const updatedItem = { ...item, reviewStatus: status }

    if (status === 'overdue') {
      overdueItems.push(updatedItem)
      allDueOrOverdue.push(updatedItem)
    } else if (status === 'due') {
      dueItems.push(updatedItem)
      allDueOrOverdue.push(updatedItem)
    }
  }

  return { dueItems, overdueItems, allDueOrOverdue }
}
