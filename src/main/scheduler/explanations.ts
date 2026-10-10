import type { PlanningExplanation } from './types'

export function createExplanation(
  entityId: string,
  entityTitle: string,
  action: 'scheduled' | 'moved' | 'unscheduled' | 'split' | 'displaced',
  reason: string,
  date?: string
): PlanningExplanation {
  return {
    entityId,
    entityTitle,
    action,
    date,
    reason
  }
}

export function formatMovedReason(
  title: string,
  fromDate: string,
  toDate: string,
  leftMinutes: number,
  requiredMinutes: number,
  extraReason?: string
): string {
  let text = `Moved "${title}" to ${toDate}: ${fromDate} had only ${leftMinutes}m usable capacity remaining, but ${requiredMinutes}m was needed.`
  if (extraReason) {
    text += ` ${extraReason}`
  }
  return text
}

export function formatDisplacedReason(
  title: string,
  displacedByTitle: string,
  date: string,
  reasonStr: string
): string {
  return `Displaced "${title}" on ${date} by higher-priority item "${displacedByTitle}": ${reasonStr}`
}

export function formatUnscheduledReason(
  title: string,
  remainingMinutes: number,
  reasonStr: string
): string {
  return `Could not schedule "${title}" (${remainingMinutes}m remaining): ${reasonStr}`
}
