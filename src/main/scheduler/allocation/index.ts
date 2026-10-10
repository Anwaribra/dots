export function computeSessionSplits(
  totalMinutes: number,
  maxSessionMinutes: number,
  minSessionMinutes: number
): number[] {
  if (totalMinutes <= 0) return []
  if (totalMinutes <= maxSessionMinutes) {
    return [totalMinutes]
  }

  const sessions: number[] = []
  let remaining = totalMinutes

  while (remaining > 0) {
    if (remaining <= maxSessionMinutes) {
      if (remaining < minSessionMinutes && sessions.length > 0) {
        // Add tiny leftover to previous session if possible
        sessions[sessions.length - 1] += remaining
      } else {
        sessions.push(remaining)
      }
      break
    } else {
      sessions.push(maxSessionMinutes)
      remaining -= maxSessionMinutes
    }
  }

  return sessions
}

export function canDisplaceBudget(
  budgetProtection: 'flexible' | 'protected' | 'locked',
  hasHardDeadline: boolean
): { allowed: boolean; reason?: string } {
  if (budgetProtection === 'locked') {
    return {
      allowed: false,
      reason: 'Budget is locked and cannot be displaced under any circumstances.'
    }
  }

  if (budgetProtection === 'protected') {
    if (hasHardDeadline) {
      return {
        allowed: true,
        reason: 'Protected budget was displaced because the incoming work item has a hard deadline.'
      }
    } else {
      return {
        allowed: false,
        reason: 'Budget is protected and can only be displaced by an item with a hard deadline.'
      }
    }
  }

  return {
    allowed: true,
    reason: 'Flexible budget displaced by higher priority work.'
  }
}
