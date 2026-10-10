import type { WorkItemCandidate } from '../types'

export type ScoredWorkItem = {
  item: WorkItemCandidate
  score: number
  hasHardDeadline: boolean
  remainingMinutes: number
}

const PRIORITY_SCORES: Record<string, number> = {
  critical: 1000,
  high: 500,
  medium: 200,
  low: 50
}

const FLEXIBILITY_SCORES: Record<string, number> = {
  fixed: 100,
  semi_flexible: 50,
  flexible: 0
}

export function computeItemScore(
  item: WorkItemCandidate,
  targetDate: string,
  nowDate: string
): ScoredWorkItem {
  let score = 0

  // 1. Priority Base Score
  const pScore = PRIORITY_SCORES[item.priority] || 200
  score += pScore

  // 2. Deadline Scoring & Hard Deadline detection
  let hasHardDeadline = false
  if (item.deadline) {
    hasHardDeadline = true
    score += 2000 // Base hard deadline boost

    // If deadline is overdue or today
    if (item.deadline <= nowDate) {
      score += 1500
    } else if (item.deadline === targetDate) {
      score += 1000
    } else if (item.deadline < targetDate) {
      // Past deadline on targetDate
      score += 1200
    } else {
      // Approaching deadline: closer days get higher score
      const dayDiff = Math.max(1, (new Date(item.deadline).getTime() - new Date(targetDate).getTime()) / (1000 * 3600 * 24))
      score += Math.max(0, Math.round(800 / dayDiff))
    }
  }

  // 3. Preferred Date Match
  if (item.preferredDate === targetDate) {
    score += 300
  }

  // 4. Energy Level & Flexibility
  const fScore = FLEXIBILITY_SCORES[item.flexibility] || 0
  score += fScore

  const remainingMinutes = Math.max(0, item.estimatedMinutes - item.actualMinutes)

  return {
    item,
    score,
    hasHardDeadline,
    remainingMinutes
  }
}

export function sortItemsDeterministically(items: ScoredWorkItem[]): ScoredWorkItem[] {
  return [...items].sort((a, b) => {
    // 1. Score descending
    if (b.score !== a.score) {
      return b.score - a.score
    }
    // 2. Order index ascending
    if (a.item.orderIndex !== b.item.orderIndex) {
      return a.item.orderIndex - b.item.orderIndex
    }
    // 3. ID lexicographically ascending for 100% determinism
    return a.item.id.localeCompare(b.item.id)
  })
}
