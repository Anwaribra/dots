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
import {
  getFreeIntervalsForDay,
  findNextAvailableSlot,
  formatMinutesToTime,
  parseTimeToMinutes
} from './constraints'
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
          Math.max(parseTimeToMinutes(e1.startTime), parseTimeToMinutes(e2.startTime)) <
          Math.min(parseTimeToMinutes(e1.endTime), parseTimeToMinutes(e2.endTime))
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
      totalRequestedDemandPerDay[targetDate] =
        (totalRequestedDemandPerDay[targetDate] || 0) +
        Math.max(0, item.estimatedMinutes - item.actualMinutes)
    }
  }

  // 4. Process scheduling day by day
  for (const dateStr of dates) {
    const cap = dayCapacities[dateStr]
    if (!cap || cap.usableMinutes <= 0) {
      continue
    }

    const availSlot = input.availability.find((a) => a.date === dateStr)
    const dayStartM = availSlot ? parseTimeToMinutes(availSlot.startTime) : 540 // 09:00
    const dayEndM = availSlot ? parseTimeToMinutes(availSlot.endTime) : 1020 // 17:00

    let freeIntervals = getFreeIntervalsForDay(
      dayStartM,
      dayEndM,
      input.fixedEvents,
      [...(input.existingSchedule || []), ...scheduledItems],
      dateStr
    )

    // Items with remaining work to be placed
    const candidatesForDay = Array.from(remainingWorkItemMap.values())
      .filter((entry) => entry.remainingMinutes > 0)
      .map((entry) => entry.item)

    const scored = candidatesForDay.map((item) =>
      computeItemScore(item, dateStr, input.nowDate)
    )
    const sorted = sortItemsDeterministically(scored)

    for (const scoredItem of sorted) {
      const item = scoredItem.item
      const remainingEntry = remainingWorkItemMap.get(item.id)
      if (!remainingEntry || remainingEntry.remainingMinutes <= 0) {
        continue
      }

      // Check dependency state (Decision A5 Hard Constraint)
      const depState = checkItemDependencyState(
        item.id,
        input.dependencies,
        input.workItems,
        scheduledItems,
        dateStr
      )

      if (depState.isBlocked) {
        continue
      }

      // Check time budgets
      const itemBudget = input.timeBudgets.find(
        (b) =>
          (b.areaId && b.areaId === item.areaId) ||
          (b.goalId && b.goalId === item.goalId) ||
          (b.projectId && b.projectId === item.projectId) ||
          (b.workItemTypeId && b.workItemTypeId === item.workItemTypeId)
      )

      if (itemBudget) {
        const canDisplace = canDisplaceBudget(itemBudget.protection, scoredItem.hasHardDeadline)
        if (!canDisplace.allowed) {
          continue
        }
      }

      // Session splits
      const splits = computeSessionSplits(remainingEntry.remainingMinutes, maxSession, minSession)
      let itemAllocatedMinutes = 0

      for (let sIdx = 0; sIdx < splits.length; sIdx++) {
        const dur = splits[sIdx]
        const slot = findNextAvailableSlot(freeIntervals, dur)

        if (!slot) {
          break
        }

        const scheduledItem: ScheduleItem = {
          id: `${item.id}-${dateStr}-s${sIdx + 1}`,
          workItemId: item.id,
          title: item.title,
          date: dateStr,
          startTime: formatMinutesToTime(slot.start),
          endTime: formatMinutesToTime(slot.end),
          durationMinutes: dur,
          sessionIndex: sIdx + 1,
          totalSessions: splits.length,
          isSplit: splits.length > 1,
          locked: item.flexibility === 'fixed',
          reason: `Scheduled on ${dateStr} at ${formatMinutesToTime(slot.start)} (${dur}m)`
        }

        scheduledItems.push(scheduledItem)
        itemAllocatedMinutes += dur

        // Update day capacity
        dayCapacities[dateStr] = updateDayScheduledCapacity(dayCapacities[dateStr], dur)

        // Refresh free intervals
        freeIntervals = getFreeIntervalsForDay(
          dayStartM,
          dayEndM,
          input.fixedEvents,
          [...(input.existingSchedule || []), ...scheduledItems],
          dateStr
        )
      }

      // Deduct placed minutes from remaining work map
      if (itemAllocatedMinutes > 0) {
        remainingEntry.remainingMinutes -= itemAllocatedMinutes
        explanations.push(
          createExplanation(
            item.id,
            item.title,
            'scheduled',
            `Allocated ${itemAllocatedMinutes}m on ${dateStr}.`,
            dateStr
          )
        )
      }
    }
  }

  // 5. Post-processing: Unscheduled items and moved items explanations
  for (const [id, entry] of remainingWorkItemMap.entries()) {
    const item = entry.item
    const rem = entry.remainingMinutes

    if (rem > 0) {
      const depState = checkItemDependencyState(
        item.id,
        input.dependencies,
        input.workItems,
        scheduledItems,
        dates[dates.length - 1]
      )
      let reason = 'Insufficient free capacity in planning window.'
      if (depState.isBlocked) {
        reason = `Blocked by prerequisites: ${depState.blockedByTitles.join(', ')}.`
      }

      unscheduledItems.push({
        workItemId: item.id,
        title: item.title,
        remainingMinutes: rem,
        reason: formatUnscheduledReason(item.title, rem, reason)
      })

      explanations.push(
        createExplanation(
          item.id,
          item.title,
          'unscheduled',
          `Could not schedule remaining ${rem}m: ${reason}`
        )
      )
    }

    // Check if item was moved from preferred date
    const itemSched = scheduledItems.filter((s) => s.workItemId === id)
    if (item.preferredDate && itemSched.length > 0 && !itemSched.some((s) => s.date === item.preferredDate)) {
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
