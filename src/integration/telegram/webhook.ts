import type { TelegramUpdate, OutgoingTelegramMessage, OutgoingCallbackAnswer } from './types'
import type { SupabaseScheduleRepository } from '../supabase/store'
import { parseTelegramTaskText } from './parser'
import {
  buildProposalMessage,
  buildApprovalSuccessMessage,
  buildRejectionMessage,
  buildStaleProposalMessage,
  buildClarificationMessage
} from './response-builder'
import { captureTask } from '../../engine/contracts/task-capture'
import { InMemoryScheduleStore } from '../../engine/contracts/schedule-store'
import { generateProposedScheduleRepair } from '../../engine/contracts/schedule-proposal'
import { parseTimeToMinutes } from '../../engine/constraints'

export interface WebhookHandlerOptions {
  repository: SupabaseScheduleRepository
  secretToken?: string
  currentTime?: string // e.g. "09:00" for determinism in testing
  referenceDate?: Date
}

export interface WebhookProcessResult {
  status: 'ok' | 'ignored' | 'already_processed' | 'unauthorized' | 'error'
  outgoingMessage?: OutgoingTelegramMessage
  callbackAnswer?: OutgoingCallbackAnswer
  errorMessage?: string
}

export function verifyWebhookSecret(
  incomingSecret: string | null | undefined,
  expectedSecret?: string
): boolean {
  const secret =
    expectedSecret ||
    (typeof process !== 'undefined' ? process.env?.TELEGRAM_WEBHOOK_SECRET : undefined)
  if (!secret) {
    // If no secret configured in environment, allow in non-production/test mode
    return true
  }

  if (!incomingSecret) {
    return false
  }

  if (incomingSecret.length !== secret.length) {
    return false
  }

  let mismatch = 0
  for (let i = 0; i < incomingSecret.length; i++) {
    mismatch |= incomingSecret.charCodeAt(i) ^ secret.charCodeAt(i)
  }

  return mismatch === 0
}

export function getUserDateTimeInTimezone(
  d: Date,
  timezone = 'UTC'
): { dateStr: string; timeStr: string; minutes: number } {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    const parts = formatter.formatToParts(d)
    const map: Record<string, string> = {}
    for (const p of parts) map[p.type] = p.value
    const dateStr = `${map.year}-${map.month}-${map.day}`
    const rawH = parseInt(map.hour, 10)
    const hour = rawH === 24 ? 0 : rawH
    const minute = parseInt(map.minute, 10)
    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    return { dateStr, timeStr, minutes: hour * 60 + minute }
  } catch {
    const year = d.getUTCFullYear()
    const month = String(d.getUTCMonth() + 1).padStart(2, '0')
    const day = String(d.getUTCDate()).padStart(2, '0')
    const hour = d.getUTCHours()
    const minute = d.getUTCMinutes()
    return {
      dateStr: `${year}-${month}-${day}`,
      timeStr: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      minutes: hour * 60 + minute
    }
  }
}

export function getNextDayStr(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + 1)
  const ny = dt.getUTCFullYear()
  const nm = String(dt.getUTCMonth() + 1).padStart(2, '0')
  const nd = String(dt.getUTCDate()).padStart(2, '0')
  return `${ny}-${nm}-${nd}`
}

export async function processTelegramWebhookUpdate(
  update: TelegramUpdate,
  options: WebhookHandlerOptions,
  incomingSecretHeader?: string | null
): Promise<WebhookProcessResult> {
  const { repository, secretToken, currentTime, referenceDate } = options

  // 1. Authenticity Verification
  if (!verifyWebhookSecret(incomingSecretHeader, secretToken)) {
    return {
      status: 'unauthorized',
      errorMessage: 'Invalid Telegram secret token header.'
    }
  }

  // 2. Strict Idempotency Check
  if (update.update_id) {
    const alreadyProcessed = await repository.isUpdateProcessed(update.update_id)
    if (alreadyProcessed) {
      return {
        status: 'already_processed'
      }
    }
  }

  const now = referenceDate || new Date()

  // --------------------------------------------------------------------------
  // 3. Handle Callback Query (Approval or Rejection of a Proposal)
  // --------------------------------------------------------------------------
  if (update.callback_query) {
    const cb = update.callback_query
    const chatId = cb.message?.chat.id || cb.from.id
    const data = cb.data || ''

    if (data.startsWith('approve:')) {
      const proposalId = data.replace('approve:', '').trim()
      if (!proposalId) {
        return {
          status: 'error',
          errorMessage: 'Malformed callback data: missing proposal ID.'
        }
      }

      const rpcResult = await repository.approveProposalAtomic(proposalId, chatId)
      await repository.recordWebhookUpdate(update.update_id, chatId, 'approve')

      if (rpcResult.status === 'stale') {
        return {
          status: 'ok',
          outgoingMessage: buildStaleProposalMessage(chatId),
          callbackAnswer: {
            callback_query_id: cb.id,
            text: 'Proposal is stale! Schedule changed before approval.'
          }
        }
      }

      if (!rpcResult.success) {
        return {
          status: 'ok',
          outgoingMessage: {
            chat_id: chatId,
            text: `⚠️ Cannot approve proposal: ${rpcResult.message}`,
            parse_mode: 'Markdown'
          },
          callbackAnswer: {
            callback_query_id: cb.id,
            text: rpcResult.message
          }
        }
      }

      return {
        status: 'ok',
        outgoingMessage: buildApprovalSuccessMessage(chatId, rpcResult.targetDate),
        callbackAnswer: {
          callback_query_id: cb.id,
          text: 'Schedule successfully updated!'
        }
      }
    }

    if (data.startsWith('reject:')) {
      const proposalId = data.replace('reject:', '').trim()
      if (!proposalId) {
        return {
          status: 'error',
          errorMessage: 'Malformed callback data: missing proposal ID.'
        }
      }

      const rpcResult = await repository.rejectProposalAtomic(
        proposalId,
        chatId,
        'Rejected by user'
      )

      await repository.recordWebhookUpdate(update.update_id, chatId, 'reject')

      return {
        status: 'ok',
        outgoingMessage: buildRejectionMessage(chatId),
        callbackAnswer: {
          callback_query_id: cb.id,
          text: 'Proposal rejected.'
        }
      }
    }

    return { status: 'ignored' }
  }

  // --------------------------------------------------------------------------
  // 4. Handle Text Message
  // --------------------------------------------------------------------------
  if (update.message && update.message.text) {
    const msg = update.message
    const chatId = msg.chat.id
    const text = msg.text || ''

    // Identify or register user
    const user = await repository.getOrCreateTelegramUser(
      chatId,
      msg.from?.username,
      msg.from?.first_name
    )

    const userDateTime = getUserDateTimeInTimezone(now, user.timezone)
    const nowTimeStr = currentTime || userDateTime.timeStr
    const nowMinutes = parseTimeToMinutes(nowTimeStr)

    // Parse natural language task with user's timezone
    const parsed = parseTelegramTaskText(text, now, user.timezone)

    if (parsed.type === 'greeting') {
      await repository.recordWebhookUpdate(update.update_id, chatId, 'greeting')
      return {
        status: 'ok',
        outgoingMessage: {
          chat_id: chatId,
          text: parsed.message,
          parse_mode: 'Markdown'
        }
      }
    }

    if (parsed.type === 'clarification') {
      await repository.recordWebhookUpdate(update.update_id, chatId, 'clarification')
      return {
        status: 'ok',
        outgoingMessage: buildClarificationMessage(chatId, parsed.message)
      }
    }

    // Valid task extracted
    const targetDate = parsed.targetDate
    const candidateTask = captureTask(parsed.task)

    // Persist captured task to user backlog
    await repository.addWorkItem(user.id, candidateTask)

    let proposal
    try {
      let attemptDate = targetDate
      let attemptCurrentTime = attemptDate === userDateTime.dateStr ? nowTimeStr : '09:00'

      // Load user schedule and capacity context from Supabase
      const existingSchedule = await repository.getScheduleForDate(user.id, attemptDate)
      const { availability, capacitySettings } = await repository.getAvailabilityAndCapacity(
        user.id,
        attemptDate
      )
      const fixedEvents = await repository.getFixedEvents(user.id, attemptDate)
      const existingCandidates = await repository.getCandidateWorkItems(user.id)

      // Instantiate isolated engine runner
      const store = new InMemoryScheduleStore({
        schedules: { [attemptDate]: existingSchedule },
        workItems: existingCandidates,
        availability: { [attemptDate]: availability },
        fixedEvents: { [attemptDate]: fixedEvents },
        capacitySettings
      })

      // Run deterministic engine
      proposal = generateProposedScheduleRepair({
        store,
        targetDate: attemptDate,
        currentTime: attemptCurrentTime,
        incomingTask: candidateTask
      })

      const isPlacedToday = proposal.proposedSchedule.some((s) => s.workItemId === candidateTask.id)

      // Fallback: If no valid slot remains today, propose tomorrow
      if (!isPlacedToday && attemptDate === userDateTime.dateStr) {
        const tomorrowDate = getNextDayStr(userDateTime.dateStr)
        const tomorrowSchedule = await repository.getScheduleForDate(user.id, tomorrowDate)
        const { availability: tomorrowAvail } = await repository.getAvailabilityAndCapacity(
          user.id,
          tomorrowDate
        )
        const tomorrowFixed = await repository.getFixedEvents(user.id, tomorrowDate)

        const tomorrowStore = new InMemoryScheduleStore({
          schedules: { [tomorrowDate]: tomorrowSchedule },
          workItems: existingCandidates,
          availability: { [tomorrowDate]: tomorrowAvail },
          fixedEvents: { [tomorrowDate]: tomorrowFixed },
          capacitySettings
        })

        const tomorrowProposal = generateProposedScheduleRepair({
          store: tomorrowStore,
          targetDate: tomorrowDate,
          currentTime: '09:00',
          incomingTask: candidateTask
        })

        const placedTomorrow = tomorrowProposal.proposedSchedule.find(
          (s) => s.workItemId === candidateTask.id
        )

        if (placedTomorrow) {
          proposal = tomorrowProposal
          proposal.humanSummary = `No remaining focus slots today after ${nowTimeStr} (workday ended). Proposed for tomorrow (${tomorrowDate}) at ${placedTomorrow.startTime} - ${placedTomorrow.endTime}.`
        }
      }

      // Strict Invariant Verification: Never propose a slot that has already ended
      for (const slot of proposal.proposedSchedule) {
        if (proposal.targetDate === userDateTime.dateStr && slot.workItemId === candidateTask.id) {
          const slotEndMin = parseTimeToMinutes(slot.endTime)
          if (slotEndMin <= nowMinutes) {
            throw new Error(
              `Critical Scheduling Invariant Violation: Proposed slot ${slot.startTime} - ${slot.endTime} on ${slot.date} has already ended in the past (current time: ${nowTimeStr}).`
            )
          }
        }
      }

      // Persist proposal to Supabase
      await repository.saveProposal(user.id, proposal)
    } catch (err) {
      // Rollback candidate task to prevent orphaned backlog items if proposal generation fails
      await repository.deleteWorkItem(user.id, candidateTask.id).catch(() => {})
      throw err
    }

    // Build Telegram response with inline buttons
    const outgoingMessage = buildProposalMessage(chatId, proposal)

    // Record webhook update
    await repository.recordWebhookUpdate(update.update_id, chatId, 'task_captured')

    return {
      status: 'ok',
      outgoingMessage
    }
  }

  return { status: 'ignored' }
}
