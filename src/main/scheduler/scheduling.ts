import type {
  PlanningInput,
  PlanningResult,
  ScheduleItem,
  UnscheduledItem,
  MovedItem,
  PlanningWarning,
  PlanningExplanation,
  DayCapacityInfo,
  WorkItemCandidate
} from './types'

import { checkItemDependencyState } from './dependencies'
import { computeItemScore, sortItemsDeterministically } from './scoring'
import { initializeDayCapacity, updateDayScheduledCapacity } from './capacity'
import { getFreeIntervalsForDay, findNextAvailableSlot, formatMinutesToTime } from './constraints'
import { computeSessionSplits, canDisplaceBudget } from './allocation'
import { createExplanation, formatMovedReason, formatUnscheduledReason } from './explanations'

export function schedule(input: PlanningInput): PlanningResult {
  const scheduledItems: ScheduleItem[] = []
  const unscheduledItems: UnscheduledItem[] = []
  const movedItems: MovedItem[] = []
  const warnings: PlanningWarning[] = []
  const explanations: PlanningExplanation[] = []
  const dayCapacities: Record<string, DayCapacityInfo> = {}

  // 1. Deterministically generate date list within dateRange
  const dates: string[] = []
  const start = new Date(input.dateRange.startDate)
  const end = new Date(input.dateRange.endDate)
  const curr = new Date(start)

  while (curr <= end) {
    dates.push(curr.toISOString().substring(0, 10))
    curr.setUTCDate(curr.getUTCDate() + 1)
  }

  // 2. Initialize Day Capacities & detect conflicting fixed events
  for (const dateStr of dates) {
    const dObj = new Date(dateStr)
    const dayOfWeek = isNaN(dObj.getUTCDay()) ? 0 : dObj.getUTCDay()

    const cap = initializeDayCapacity(
      dateStr,
      dayOfWeek,
      input.availability,
      input.fixedEvents,
      input.timeBudgets,
      input.routines,
      input.capacitySettings
    )
    dayCapacities[dateStr] = cap

    // Check fixed event conflicts on date
    const dateFixed = input.fixedEvents.filter((f) => f.date === dateStr)
    for (let i = 0; i < dateFixed.length; i++) {
      for (let j = i + 1; j < dateFixed.length; j++) {
        const e1 = dateFixed[i]
        const e2 = dateFixed[j]
        if (
          Math.max(parseTime(e1.startTime), parseTime(e2.startTime)) <
          Math.min(parseTime(e1.endTime), parseTime(e2.endTime))
        ) {
          warnings.push({
            code: 'FIXED_EVENT_CONFLICT',
            message: `Conflicting fixed events on ${dateStr}: "${e1.title}" overlaps with "${e2.title}"`,
            entityId: e1.id
          })
        }
      }
    }
  }

  // 3. Filter active work item candidates and log zero-duration/completed items
  const validItems: WorkItemCandidate[] = []
  for (const item of input.workItems) {
    const isCompleted =
      item.status === 'done' ||
      item.status === 'completed' ||
      (item.estimatedMinutes > 0 && item.actualMinutes >= item.estimatedMinutes)

    const remaining = Math.max(0, item.estimatedMinutes - item.actualMinutes)

    if (isCompleted || remaining <= 0) {
      explanations.push(
        createExplanation(
          item.id,
          item.title,
          'unscheduled',
          `Skipped "${item.title}": 0m remaining duration.`
        )
      )
    } else {
      validItems.push(item)
    }
  }

  // Track remaining work items & their remaining duration
  const remainingWorkItemMap = new Map<string, { item: WorkItemCandidate; remainingMinutes: number }>()
  for (const item of validItems) {
    const rem = Math.max(0, item.estimatedMinutes - item.actualMinutes)
    remainingWorkItemMap.set(item.id, { item, remainingMinutes: rem })
  }

  const maxSession = input.preferences.maxSessionMinutes || 90
  const minSession = input.preferences.minSessionMinutes || 15

  // Total requested demand per day (for overload calculations)
  const totalRequestedDemandPerDay: Record<string, number> = {}
  for (const d of dates) {
    totalRequestedDemandPerDay[d] = 0
  }

  for (const item of validItems) {
    const targetDate = item.preferredDate && dates.includes(item.preferredDate) ? item.preferredDate : dates[0]
    if (targetDate) {
      totalRequestedDemandPerDay[targetDate] = (totalRequestedDemandPerDay[targetDate] || 0) + Math.max(0, item.estimatedMinutes - item.actualMinutes)
    }
  }

  // 4. Process scheduling day by day
  for (const dateStr of dates) {
    const cap = dayCapacities[dateStr]
    if (!cap || cap.usableMinutes <= 0) {
      continue
    }

    const availSlot = input.availability.find((a) => a.date === dateStr)
    const dayStartM = availSlot ? parseTime(availSlot.startTime) : 540 // 09:00
    const dayEndM = availSlot ? parseTime(availSlot.endTime) : 1020 // 17:00

    let freeIntervals = getFreeIntervalsForDay(
      dayStartM,
      dayEndM,
      input.fixedEvents,
      [...(input.existingSchedule || []), ...scheduledItems],
      dateStr
    )

    // Score and sort remaining items for this date deterministically
    const candidates: WorkItemCandidate[] = []
    for (const entry of remainingWorkItemMap.values()) {
      if (entry.remainingMinutes > 0) {
        candidates.push(entry.item)
      }
    }

    const scoredCandidates = candidates.map((item) =>
      computeItemScore(item, dateStr, input.nowDate)
    )
    const sortedCandidates = sortItemsDeterministically(scoredCandidates)

    for (const scored of sortedCandidates) {
      const item = scored.item
      const entry = remainingWorkItemMap.get(item.id)
      if (!entry || entry.remainingMinutes <= 0) continue

      // HARD CONSTRAINT CHECK (Decision A5): Dependencies
      const depState = checkItemDependencyState(
        item.id,
        input.dependencies,
        input.workItems,
        scheduledItems,
        dateStr
      )

      if (depState.isBlocked) {
        explanations.push(
          createExplanation(
            item.id,
            item.title,
            'unscheduled',
            `Cannot schedule "${item.title}" on ${dateStr}: blocked by unfinished prerequisite(s) "${depState.blockedByTitles.join(', ')}".`,
            dateStr
          )
        )
        if (item.deadline && item.deadline <= dateStr) {
          warnings.push({
            code: 'DEPENDENCY_DEADLINE_CONFLICT',
            message: `Hard deadline for "${item.title}" cannot be met on ${dateStr} without breaking dependency constraint "${depState.blockedByTitles.join(', ')}".`,
            entityId: item.id
          })
        }
        continue
      }

      // Dynamic capacity check for date
      const currentCap = dayCapacities[dateStr]
      let availableCapacityForGeneralWork = Math.max(
        0,
        currentCap.usableMinutes - currentCap.bufferMinutes - currentCap.fixedMinutes - currentCap.budgetMinutes - currentCap.scheduledMinutes
      )

      // Active budgets on this day
      const activeBudget = input.timeBudgets.find((b) => b.daysOfWeek.includes(currentCap.dayOfWeek))

      if (availableCapacityForGeneralWork < entry.remainingMinutes && activeBudget) {
        if (scored.hasHardDeadline) {
          const disp = canDisplaceBudget(activeBudget.protection, true)
          if (disp.allowed) {
            availableCapacityForGeneralWork += activeBudget.targetMinutes || activeBudget.minimumMinutes || 0
            explanations.push(
              createExplanation(
                item.id,
                item.title,
                'displaced',
                `Hard deadline item "${item.title}" displaced ${activeBudget.protection} budget "${activeBudget.name}" on ${dateStr}: ${disp.reason}`,
                dateStr
              )
            )
          }
        }
      }

      if (availableCapacityForGeneralWork <= 0) {
        continue
      }

      const minutesToSchedule = Math.min(entry.remainingMinutes, availableCapacityForGeneralWork)
      if (minutesToSchedule <= 0) continue

      const sessionSplits = computeSessionSplits(minutesToSchedule, maxSession, minSession)
      let curFreeIntervals = [...freeIntervals]
      let itemScheduledMinutesOnDay = 0

      for (let sIdx = 0; sIdx < sessionSplits.length; sIdx++) {
        const sessionDur = sessionSplits[sIdx]
        const slot = findNextAvailableSlot(curFreeIntervals, sessionDur)
        if (!slot) break

        const schedItem: ScheduleItem = {
          id: `${item.id}-${dateStr}-s${sIdx + 1}`,
          workItemId: item.id,
          title: item.title,
          date: dateStr,
          startTime: formatMinutesToTime(slot.start),
          endTime: formatMinutesToTime(slot.end),
          durationMinutes: sessionDur,
          sessionIndex: sIdx + 1,
          totalSessions: sessionSplits.length,
          isSplit: sessionSplits.length > 1,
          locked: item.flexibility === 'fixed',
          reason: `Scheduled on ${dateStr} (${sessionDur}m session ${sIdx + 1}/${sessionSplits.length})`
        }

        scheduledItems.push(schedItem)
        itemScheduledMinutesOnDay += sessionDur
        dayCapacities[dateStr] = updateDayScheduledCapacity(dayCapacities[dateStr], sessionDur)

        explanations.push(
          createExplanation(
            item.id,
            item.title,
            sessionSplits.length > 1 ? 'split' : 'scheduled',
            schedItem.reason,
            dateStr
          )
        )

        curFreeIntervals = getFreeIntervalsForDay(
          dayStartM,
          dayEndM,
          input.fixedEvents,
          [...(input.existingSchedule || []), ...scheduledItems],
          dateStr
        )
      }

      entry.remainingMinutes -= itemScheduledMinutesOnDay
      freeIntervals = curFreeIntervals
    }
  }

  // 5. Unscheduled / Moved items post-pass
  for (const entry of remainingWorkItemMap.values()) {
    const item = entry.item
    const rem = entry.remainingMinutes
    const itemSched = scheduledItems.filter((s) => s.workItemId === item.id)

    if (rem > 0) {
      const reason = formatUnscheduledReason(
        item.title,
        rem,
        itemSched.length > 0
          ? `Partially scheduled (${item.estimatedMinutes - rem}m scheduled, ${rem}m remaining unscheduled due to capacity limits).`
          : `No available capacity slot of duration ${rem}m across target range.`
      )
      unscheduledItems.push({
        workItemId: item.id,
        title: item.title,
        remainingMinutes: rem,
        reason
      })
      explanations.push(createExplanation(item.id, item.title, 'unscheduled', reason))
    }

    if (itemSched.length > 0 && item.preferredDate && item.preferredDate !== itemSched[0].date) {
      const firstSched = itemSched[0]
      const firstCap = dayCapacities[item.preferredDate]
      const leftMinutes = firstCap ? Math.max(0, firstCap.usableMinutes - firstCap.scheduledMinutes) : 0
      const reason = formatMovedReason(
        item.title,
        item.preferredDate,
        firstSched.date,
        leftMinutes,
        item.estimatedMinutes
      )
      movedItems.push({
        workItemId: item.id,
        title: item.title,
        originalDate: item.preferredDate,
        newDate: firstSched.date,
        reason
      })
      explanations.push(createExplanation(item.id, item.title, 'moved', reason, firstSched.date))
    }
  }

  // 6. Overload Report per day
  for (const dateStr of dates) {
    const cap = dayCapacities[dateStr]
    if (cap) {
      const totalDemand = cap.fixedMinutes + (totalRequestedDemandPerDay[dateStr] || cap.scheduledMinutes)
      if (totalDemand > cap.usableMinutes) {
        const overloadDiff = totalDemand - cap.usableMinutes
        warnings.push({
          code: 'DAY_OVERLOADED',
          message: `Day ${dateStr}: Planned demand (${totalDemand}m) exceeds available usable capacity (${cap.usableMinutes}m) by ${overloadDiff}m. Suggested actions: move flexible work, split large items, or adjust planning capacity percentage.`,
          entityId: dateStr
        })
      }
    }
  }

  return {
    scheduledItems,
    unscheduledItems,
    movedItems,
    warnings,
    explanations,
    dayCapacities
  }
}

function parseTime(str: string): number {
  if (!str) return 0
  const timePart = str.includes(' ') ? str.split(' ')[1] : str
  const [h, m] = timePart.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}
