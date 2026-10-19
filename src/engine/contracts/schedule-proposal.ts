import type {
  ScheduleItem,
  WorkItemCandidate,
  ScheduleProposal,
  ProposalResolutionResult,
  ReplanningTriggerType,
  ReplanningInput,
  ReplanningChange
} from '../types'
import type { IScheduleStore } from './schedule-store'
import { replan } from '../replanner'

export interface ScheduleRepairRequest {
  store: IScheduleStore
  targetDate: string
  currentTime: string
  incomingTask?: WorkItemCandidate
  triggerType?: ReplanningTriggerType
  activeWorkItemId?: string | null
  completedItemIds?: string[]
}

export function generateHumanSummary(
  changes: ReplanningChange[],
  bufferRemainingMinutes: number,
  isOverloaded: boolean,
  overloadMinutes: number
): string {
  const parts: string[] = []

  const inserted = changes.filter((c) => c.changeType === 'inserted')
  const moved = changes.filter((c) => c.changeType === 'moved')
  const displaced = changes.filter((c) => c.changeType === 'displaced')
  const preserved = changes.filter((c) => c.changeType === 'preserved')

  if (inserted.length > 0) {
    const insertedStr = inserted
      .map((i) => `"${i.entityTitle}" at ${i.newTime}`)
      .join(', ')
    parts.push(`Inserted ${insertedStr}.`)
  }

  if (moved.length > 0) {
    const movedStr = moved
      .map((m) => `"${m.entityTitle}" shifted to ${m.newTime}`)
      .join(', ')
    parts.push(`Shifted ${movedStr}.`)
  }

  if (displaced.length > 0) {
    const displacedStr = displaced.map((d) => `"${d.entityTitle}"`).join(', ')
    parts.push(`Deferred ${displacedStr} due to capacity limits.`)
  }

  if (isOverloaded) {
    parts.push(`Warning: Day is overbooked by ${overloadMinutes}m beyond available capacity.`)
  } else if (bufferRemainingMinutes > 0) {
    parts.push(`Reality buffer remaining: ${bufferRemainingMinutes}m.`)
  } else {
    parts.push(`Preserved ${preserved.length} existing commitments.`)
  }

  return parts.join(' ')
}

export function isProposalStale(
  proposal: ScheduleProposal,
  currentSchedule: ScheduleItem[]
): boolean {
  if (proposal.baseScheduleSnapshot.length !== currentSchedule.length) {
    return true
  }

  for (let i = 0; i < currentSchedule.length; i++) {
    const base = proposal.baseScheduleSnapshot[i]
    const curr = currentSchedule[i]
    if (
      base.id !== curr.id ||
      base.startTime !== curr.startTime ||
      base.endTime !== curr.endTime ||
      base.durationMinutes !== curr.durationMinutes
    ) {
      return true
    }
  }

  return false
}

export function generateProposedScheduleRepair(
  request: ScheduleRepairRequest
): ScheduleProposal {
  const { store, targetDate, currentTime, incomingTask, triggerType, activeWorkItemId, completedItemIds } =
    request

  const baseScheduleSnapshot = store.getCurrentSchedule(targetDate)
  const candidateWorkItems = [...store.getCandidateWorkItems()]

  if (incomingTask && !candidateWorkItems.some((c) => c.id === incomingTask.id)) {
    candidateWorkItems.push(incomingTask)
  }

  const effectiveTriggerType: ReplanningTriggerType =
    triggerType || (incomingTask?.priority === 'critical' ? 'urgent_work_added' : 'manual_replan')

  const replanningInput: ReplanningInput = {
    nowDate: targetDate,
    currentTime,
    existingSchedule: baseScheduleSnapshot,
    candidateWorkItems,
    completedItemIds: completedItemIds || [],
    activeWorkItemId: activeWorkItemId || null,
    dependencies: store.getDependencies(),
    availability: store.getAvailability(targetDate),
    fixedEvents: store.getFixedEvents(targetDate),
    timeBudgets: store.getTimeBudgets(),
    routines: store.getRoutines(),
    preferences: {
      minSessionMinutes: 15,
      maxSessionMinutes: 90
    },
    capacitySettings: store.getCapacitySettings(),
    trigger: {
      type: effectiveTriggerType,
      details: incomingTask
        ? {
            urgentItem: incomingTask.priority === 'critical' ? incomingTask : undefined
          }
        : undefined
    }
  }

  const result = replan(replanningInput)
  const dayCap = result.dayCapacities[targetDate]
  const bufferRemaining = dayCap ? dayCap.netRemainingMinutes : 0

  const humanSummary = generateHumanSummary(
    result.changes,
    bufferRemaining,
    result.isOverloaded,
    result.overloadMinutes
  )

  const proposalId = `prop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

  return {
    id: proposalId,
    createdAt: Date.now(),
    targetDate,
    trigger: effectiveTriggerType,
    status: 'pending',
    baseScheduleSnapshot,
    proposedSchedule: result.updatedSchedule,
    changes: result.changes,
    explanations: result.explanations,
    humanSummary,
    warnings: result.warnings,
    overloadSuggestions: result.overloadSuggestions,
    isOverloaded: result.isOverloaded,
    overloadMinutes: result.overloadMinutes
  }
}

export function approveProposal(
  proposal: ScheduleProposal,
  store: IScheduleStore,
  incomingTaskToPersist?: WorkItemCandidate
): ProposalResolutionResult {
  if (proposal.status !== 'pending') {
    return {
      success: false,
      proposalId: proposal.id,
      status: proposal.status,
      message: `Cannot approve proposal with status "${proposal.status}".`
    }
  }

  // Check if schedule has changed underneath
  const currentSchedule = store.getCurrentSchedule(proposal.targetDate)
  if (isProposalStale(proposal, currentSchedule)) {
    proposal.status = 'stale'
    return {
      success: false,
      proposalId: proposal.id,
      status: 'stale',
      message: 'Proposal is stale: schedule state has changed since this proposal was created. Please request a fresh proposal.'
    }
  }

  // Commit proposed schedule to store
  store.commitSchedule(
    proposal.targetDate,
    proposal.proposedSchedule,
    `Approved proposal: ${proposal.humanSummary}`
  )

  if (incomingTaskToPersist) {
    store.addWorkItem(incomingTaskToPersist)
  }

  proposal.status = 'approved'

  return {
    success: true,
    proposalId: proposal.id,
    status: 'approved',
    message: 'Proposal approved and schedule successfully updated.',
    committedSchedule: proposal.proposedSchedule
  }
}

export function rejectProposal(
  proposal: ScheduleProposal,
  store: IScheduleStore,
  reason = 'Proposal rejected by user'
): ProposalResolutionResult {
  if (proposal.status !== 'pending') {
    return {
      success: false,
      proposalId: proposal.id,
      status: proposal.status,
      message: `Cannot reject proposal with status "${proposal.status}".`
    }
  }

  proposal.status = 'rejected'

  return {
    success: true,
    proposalId: proposal.id,
    status: 'rejected',
    message: reason,
    committedSchedule: store.getCurrentSchedule(proposal.targetDate)
  }
}
