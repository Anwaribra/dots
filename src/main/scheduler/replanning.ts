import type {
  ReplanningInput,
  ReplanningResult,
  ReplanningChange,
  ScheduleItem,
  WorkItemCandidate,
  PlanningWarning,
  PlanningExplanation,
  DayCapacityInfo,
  FixedEventItem
} from './types'

import { checkItemDependencyState } from './dependencies'
import { computeItemScore, sortItemsDeterministically } from './scoring'
import { initializeDayCapacity, updateDayScheduledCapacity } from './capacity'
import {
  getFreeIntervalsForDay,
  findNextAvailableSlot,
  formatMinutesToTime,
  parseTimeToMinutes,
  type TimeInterval
} from './constraints'
import { computeSessionSplits, canDisplaceBudget } from './allocation'
import { createExplanation } from './explanations'

export function replan(input: ReplanningInput): ReplanningResult {
  const targetDate = input.nowDate
  const currentM = parseTimeToMinutes(input.currentTime)

  const warnings: PlanningWarning[] = []
  const explanations: PlanningExplanation[] = []
  const changes: ReplanningChange[] = []

  // 1. Initialize day capacity for target date
  const dObj = new Date(targetDate)
  const dayOfWeek = isNaN(dObj.getUTCDay()) ? 0 : dObj.getUTCDay()
  const dayCap = initializeDayCapacity(
    targetDate,
    dayOfWeek,
    input.availability,
    input.fixedEvents,
    input.timeBudgets,
    input.routines,
    input.capacitySettings
  )
  const dayCapacities: Record<string, DayCapacityInfo> = { [targetDate]: dayCap }

  // 2. Identify existing items for today
  const existingToday = (input.existingSchedule || []).filter((s) => s.date === targetDate)

  const completedIds = new Set(input.completedItemIds || [])
  for (const c of input.candidateWorkItems) {
    if (c.status === 'done' || c.status === 'completed' || (c.estimatedMinutes > 0 && c.actualMinutes >= c.estimatedMinutes)) {
      completedIds.add(c.id)
    }
  }

  const preservedPastItems: ScheduleItem[] = []
  let activeItem: ScheduleItem | null = null
  const lockedFutureItems: ScheduleItem[] = []
  const flexibleFutureItems: ScheduleItem[] = []

  for (const item of existingToday) {
    const endM = parseTimeToMinutes(item.endTime)
    const startM = parseTimeToMinutes(item.startTime)

    // Check if item is already completed or in the past
    if (endM <= currentM || completedIds.has(item.workItemId)) {
      preservedPastItems.push(item)
      changes.push({
        entityId: item.workItemId || item.id,
        entityTitle: item.title,
        changeType: 'preserved',
        originalTime: `${item.startTime} - ${item.endTime}`,
        newTime: `${item.startTime} - ${item.endTime}`,
        reason: `Preserved completed/past activity at ${item.startTime} - ${item.endTime}.`
      })
      continue
    }

    // Check if item is active / in-progress
    const isActive =
      input.activeWorkItemId === item.workItemId ||
      (startM < currentM && endM > currentM)

    if (isActive && !activeItem) {
      activeItem = { ...item }
      continue
    }

    // Check if item is locked
    if (item.locked) {
      lockedFutureItems.push(item)
      changes.push({
        entityId: item.workItemId || item.id,
        entityTitle: item.title,
        changeType: 'preserved',
        originalTime: `${item.startTime} - ${item.endTime}`,
        newTime: `${item.startTime} - ${item.endTime}`,
        reason: `Preserved locked schedule item at ${item.startTime} - ${item.endTime}.`
      })
      continue
    }

    // Otherwise it's flexible future work
    flexibleFutureItems.push(item)
  }

  // Handle active item adjustments (e.g. task overrun or finished early)
  if (activeItem) {
    if (input.trigger?.type === 'task_overrun' && input.trigger.details?.overrunMinutes) {
      const om = input.trigger.details.overrunMinutes
      const oldEnd = activeItem.endTime
      const newEndM = parseTimeToMinutes(activeItem.endTime) + om
      activeItem.endTime = formatMinutesToTime(newEndM)
      activeItem.durationMinutes += om
      changes.push({
        entityId: activeItem.workItemId || activeItem.id,
        entityTitle: activeItem.title,
        changeType: 'extended',
        originalTime: `${activeItem.startTime} - ${oldEnd}`,
        newTime: `${activeItem.startTime} - ${activeItem.endTime}`,
        reason: `Task overran by ${om}m, extending duration to ${activeItem.durationMinutes}m.`
      })
    } else if (input.trigger?.type === 'task_finished_early' && input.trigger.details?.savedMinutes) {
      const sm = input.trigger.details.savedMinutes
      const oldEnd = activeItem.endTime
      const newEndM = Math.max(currentM, parseTimeToMinutes(activeItem.endTime) - sm)
      activeItem.endTime = formatMinutesToTime(newEndM)
      activeItem.durationMinutes = Math.max(15, activeItem.durationMinutes - sm)
      changes.push({
        entityId: activeItem.workItemId || activeItem.id,
        entityTitle: activeItem.title,
        changeType: 'shortened',
        originalTime: `${activeItem.startTime} - ${oldEnd}`,
        newTime: `${activeItem.startTime} - ${activeItem.endTime}`,
        reason: `Task finished ${sm}m early, reducing slot.`
      })
    } else {
      changes.push({
        entityId: activeItem.workItemId || activeItem.id,
        entityTitle: activeItem.title,
        changeType: 'preserved',
        originalTime: `${activeItem.startTime} - ${activeItem.endTime}`,
        newTime: `${activeItem.startTime} - ${activeItem.endTime}`,
        reason: `In-progress activity preserved at ${activeItem.startTime} - ${activeItem.endTime}.`
      })
    }
  }

  // 3. Assemble candidate work items to schedule
  const candidatesMap = new Map<string, WorkItemCandidate>()

  // A. All candidates provided in input
  for (const c of input.candidateWorkItems) {
    if (!completedIds.has(c.id)) {
      candidatesMap.set(c.id, { ...c })
    }
  }

  // B. Flexible future items from existing schedule
  for (const f of flexibleFutureItems) {
    if (f.workItemId && !completedIds.has(f.workItemId) && !candidatesMap.has(f.workItemId)) {
      candidatesMap.set(f.workItemId, {
        id: f.workItemId,
        title: f.title,
        priority: 'medium',
        status: 'todo',
        estimatedMinutes: f.durationMinutes,
        actualMinutes: 0,
        flexibility: 'flexible',
        orderIndex: 0
      })
    }
  }

  // C. Urgent item from trigger
  if (input.trigger?.type === 'urgent_work_added' && input.trigger.details?.urgentItem) {
    const urgent = input.trigger.details.urgentItem
    candidatesMap.set(urgent.id, {
      ...urgent,
      priority: 'critical'
    })
  }

  // D. Handle Skipped Item Trigger
  let skippedCandidateId: string | null = null
  if (input.trigger?.type === 'skipped_item' && input.trigger.details?.skippedWorkItemId) {
    const skippedId = input.trigger.details.skippedWorkItemId
    const res = input.trigger.details.skippedResolution || 'skip'
    skippedCandidateId = skippedId
    const cand = candidatesMap.get(skippedId) || input.candidateWorkItems.find((c) => c.id === skippedId)
    const title = cand ? cand.title : 'Item'

    if (res === 'skip' || res === 'cancel') {
      candidatesMap.delete(skippedId)
      changes.push({
        entityId: skippedId,
        entityTitle: title,
        changeType: 'skipped',
        reason: `Item "${title}" skipped/cancelled by user at ${input.currentTime}.`
      })
      explanations.push(
        createExplanation(skippedId, title, 'unscheduled', `Skipped/cancelled per user action at ${input.currentTime}.`, targetDate)
      )
    } else if (res === 'move_tomorrow') {
      candidatesMap.delete(skippedId)
      changes.push({
        entityId: skippedId,
        entityTitle: title,
        changeType: 'moved',
        reason: `Moved "${title}" to tomorrow per user decision.`
      })
      explanations.push(
        createExplanation(skippedId, title, 'moved', `Moved "${title}" to tomorrow per skipped item resolution.`, targetDate)
      )
    } else {
      // 'move_later_today' or 'next_free_slot': keep in candidates, but enforce slot after currentM
      changes.push({
        entityId: skippedId,
        entityTitle: title,
        changeType: 'moved',
        reason: `Rescheduled "${title}" to next free slot today after ${input.currentTime}.`
      })
    }
  }

  // Remove active item from candidate scheduling
  if (activeItem && activeItem.workItemId) {
    candidatesMap.delete(activeItem.workItemId)
  }
  // Remove locked items from candidate scheduling
  for (const l of lockedFutureItems) {
    if (l.workItemId) candidatesMap.delete(l.workItemId)
  }

  // 4. Calculate day availability window for remaining day
  const availSlot = input.availability.find((a) => a.date === targetDate)
  const dayStartAvailM = availSlot ? parseTimeToMinutes(availSlot.startTime) : 540 // 09:00
  const dayEndAvailM = availSlot ? parseTimeToMinutes(availSlot.endTime) : 1020   // 17:00

  // The remaining scheduling window strictly begins at max(currentM, dayStartAvailM)
  const remainingStartM = Math.max(currentM, dayStartAvailM)
  const remainingEndM = dayEndAvailM

  // Occupied items that block time in the remaining window
  const occupiedSchedule: ScheduleItem[] = [
    ...preservedPastItems,
    ...(activeItem ? [activeItem] : []),
    ...lockedFutureItems
  ]

function computeRemainingFreeIntervals(
  windowStart: number,
  windowEnd: number,
  fixedEvents: FixedEventItem[],
  occupiedItems: ScheduleItem[],
  date: string
): TimeInterval[] {
  const occupied: TimeInterval[] = []

  // 1. Fixed Events
  for (const fe of fixedEvents) {
    if (fe.date === date) {
      const s = parseTimeToMinutes(fe.startTime)
      const e = parseTimeToMinutes(fe.endTime)
      if (e > s) occupied.push({ start: s, end: e })
    }
  }

  // 2. All occupied schedule items on this date (past, active, locked, or newly placed)
  for (const item of occupiedItems) {
    if (item.date === date) {
      const s = parseTimeToMinutes(item.startTime)
      const e = parseTimeToMinutes(item.endTime)
      if (e > s) occupied.push({ start: s, end: e })
    }
  }

  occupied.sort((a, b) => a.start - b.start)

  const free: TimeInterval[] = []
  let current = windowStart

  for (const occ of occupied) {
    if (occ.end <= current) continue
    if (occ.start > current) {
      const start = Math.max(current, windowStart)
      const end = Math.min(occ.start, windowEnd)
      if (end > start) {
        free.push({ start, end })
      }
    }
    current = Math.max(current, occ.end)
  }

  if (current < windowEnd) {
    free.push({ start: current, end: windowEnd })
  }

  return free
}

  // Calculate free intervals for the remaining window
  let freeIntervals: TimeInterval[] = []
  if (remainingEndM > remainingStartM) {
    freeIntervals = computeRemainingFreeIntervals(
      remainingStartM,
      remainingEndM,
      input.fixedEvents,
      occupiedSchedule,
      targetDate
    )
  }

  // Total available free minutes remaining
  const totalFreeRemaining = freeIntervals.reduce((acc, f) => acc + (f.end - f.start), 0)

  // 5. Score and sort candidates deterministically
  const candidateList = Array.from(candidatesMap.values()).filter((c) => {
    const rem = Math.max(0, c.estimatedMinutes - c.actualMinutes)
    return rem > 0
  })

  // Calculate total requested demand for remaining candidates
  const totalCandidateDemand = candidateList.reduce((acc, c) => acc + Math.max(0, c.estimatedMinutes - c.actualMinutes), 0)

  const scoredCandidates = candidateList.map((item) =>
    computeItemScore(item, targetDate, targetDate)
  )
  const sortedCandidates = sortItemsDeterministically(scoredCandidates)

  const newlyScheduled: ScheduleItem[] = []
  const maxSession = input.preferences.maxSessionMinutes || 90
  const minSession = input.preferences.minSessionMinutes || 15

  // Map to check if an item was previously scheduled and at what time
  const prevScheduleMap = new Map<string, ScheduleItem>()
  for (const s of existingToday) {
    if (s.workItemId) prevScheduleMap.set(s.workItemId, s)
  }

  let remainingFreeIntervals = [...freeIntervals]

  for (const scored of sortedCandidates) {
    const item = scored.item
    const remDuration = Math.max(0, item.estimatedMinutes - item.actualMinutes)
    if (remDuration <= 0) continue

    // Dependency check (Decision A5 Hard Constraint)
    const depState = checkItemDependencyState(
      item.id,
      input.dependencies,
      input.candidateWorkItems,
      [...occupiedSchedule, ...newlyScheduled],
      targetDate
    )

    if (depState.isBlocked) {
      explanations.push(
        createExplanation(
          item.id,
          item.title,
          'unscheduled',
          `Cannot replan "${item.title}" on ${targetDate}: blocked by prerequisite(s) "${depState.blockedByTitles.join(', ')}".`,
          targetDate
        )
      )
      continue
    }

    // Session splits if necessary
    const splits = computeSessionSplits(remDuration, maxSession, minSession)
    let itemPlacedMinutes = 0

    for (let sIdx = 0; sIdx < splits.length; sIdx++) {
      const dur = splits[sIdx]
      let searchIntervals = remainingFreeIntervals
      if (item.id === skippedCandidateId) {
        const prevItem = prevScheduleMap.get(item.id)
        const minAllowedStart = prevItem ? Math.max(currentM, parseTimeToMinutes(prevItem.endTime)) : currentM + dur
        searchIntervals = remainingFreeIntervals
          .map((int) => ({
            start: Math.max(int.start, minAllowedStart),
            end: int.end
          }))
          .filter((int) => int.end > int.start)
      }
      const slot = findNextAvailableSlot(searchIntervals, dur)
      if (!slot) break

      const schedItem: ScheduleItem = {
        id: `${item.id}-${targetDate}-replan-s${sIdx + 1}`,
        workItemId: item.id,
        title: item.title,
        date: targetDate,
        startTime: formatMinutesToTime(slot.start),
        endTime: formatMinutesToTime(slot.end),
        durationMinutes: dur,
        sessionIndex: sIdx + 1,
        totalSessions: splits.length,
        isSplit: splits.length > 1,
        locked: item.flexibility === 'fixed',
        reason: `Replanned on ${targetDate} at ${formatMinutesToTime(slot.start)} (${dur}m)`
      }

      newlyScheduled.push(schedItem)
      itemPlacedMinutes += dur

      // Update free intervals
      remainingFreeIntervals = computeRemainingFreeIntervals(
        remainingStartM,
        remainingEndM,
        input.fixedEvents,
        [...occupiedSchedule, ...newlyScheduled],
        targetDate
      )
    }

    const prev = prevScheduleMap.get(item.id)
    if (itemPlacedMinutes > 0) {
      const firstPlaced = newlyScheduled.find((s) => s.workItemId === item.id)
      const newTimeStr = firstPlaced ? `${firstPlaced.startTime} - ${firstPlaced.endTime}` : ''

      if (!prev) {
        // Newly inserted item
        changes.push({
          entityId: item.id,
          entityTitle: item.title,
          changeType: 'inserted',
          newTime: newTimeStr,
          reason: `Inserted "${item.title}" at ${firstPlaced?.startTime} (${itemPlacedMinutes}m) due to ${item.priority} priority.`
        })
        explanations.push(
          createExplanation(
            item.id,
            item.title,
            'scheduled',
            `Inserted into remaining schedule at ${firstPlaced?.startTime} (${itemPlacedMinutes}m) due to ${item.priority} priority.`,
            targetDate
          )
        )
      } else {
        const oldTimeStr = `${prev.startTime} - ${prev.endTime}`
        if (oldTimeStr !== newTimeStr) {
          // Moved item
          const reasonStr = `Moved from ${prev.startTime} to ${firstPlaced?.startTime} (${itemPlacedMinutes}m) because higher priority work was inserted.`
          changes.push({
            entityId: item.id,
            entityTitle: item.title,
            changeType: 'moved',
            originalTime: oldTimeStr,
            newTime: newTimeStr,
            reason: reasonStr
          })
          explanations.push(
            createExplanation(item.id, item.title, 'moved', reasonStr, targetDate)
          )
        }
      }
    } else {
      // Could not be placed in remaining day
      const oldTimeStr = prev ? `${prev.startTime} - ${prev.endTime}` : null
      const reasonStr = `Could not fit in remaining capacity (${totalFreeRemaining}m available). Work deferred.`
      changes.push({
        entityId: item.id,
        entityTitle: item.title,
        changeType: 'displaced',
        originalTime: oldTimeStr,
        newTime: null,
        reason: reasonStr
      })
      explanations.push(
        createExplanation(item.id, item.title, 'displaced', reasonStr, targetDate)
      )
    }
  }

  // 6. Assemble complete updated schedule
  const updatedSchedule: ScheduleItem[] = [
    ...preservedPastItems,
    ...(activeItem ? [activeItem] : []),
    ...lockedFutureItems,
    ...newlyScheduled
  ]

  // Sort chronologically
  updatedSchedule.sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime))

  // 7. Overload Detection and Actionable Suggestions
  const isOverloaded = totalCandidateDemand > totalFreeRemaining
  const overloadMinutes = Math.max(0, totalCandidateDemand - totalFreeRemaining)
  const overloadSuggestions: string[] = []

  if (isOverloaded) {
    const flexibleTitles = candidateList
      .filter((c) => c.flexibility === 'flexible')
      .map((c) => `"${c.title}"`)
    const lowPriorityTitles = candidateList
      .filter((c) => c.priority === 'low' || c.priority === 'medium')
      .map((c) => `"${c.title}"`)

    if (flexibleTitles.length > 0) {
      overloadSuggestions.push(`Move flexible work to another day: ${flexibleTitles.slice(0, 3).join(', ')}`)
    }
    if (lowPriorityTitles.length > 0) {
      overloadSuggestions.push(`Move lower-priority work: ${lowPriorityTitles.slice(0, 3).join(', ')}`)
    }
    overloadSuggestions.push('Split large tasks into shorter focus sessions')
    overloadSuggestions.push('Use another day with free capacity (e.g. tomorrow)')
    overloadSuggestions.push('Reduce non-protected time budgets or adjust planning capacity percentage')

    warnings.push({
      code: 'DAY_OVERLOADED',
      message: `Planned demand exceeds available capacity by ${Math.floor(overloadMinutes / 60)}h ${overloadMinutes % 60}m (${overloadMinutes}m).`,
      entityId: targetDate
    })
  }

  // Update day capacity scheduled minutes
  const totalScheduledMinutes = updatedSchedule.reduce((acc, s) => acc + s.durationMinutes, 0)
  dayCapacities[targetDate] = updateDayScheduledCapacity(dayCap, totalScheduledMinutes)

  return {
    updatedSchedule,
    changes,
    explanations,
    warnings,
    dayCapacities,
    overloadSuggestions,
    isOverloaded,
    overloadMinutes
  }
}
