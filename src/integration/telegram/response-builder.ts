import type { ScheduleProposal } from '../../engine/types'
import type { OutgoingTelegramMessage, TelegramInlineKeyboardMarkup } from './types'

export function buildProposalMessage(
  chatId: number,
  proposal: ScheduleProposal
): OutgoingTelegramMessage {
  const lines: string[] = []

  lines.push(`📋 *Schedule Proposal (${proposal.targetDate})*\n`)
  lines.push(`${proposal.humanSummary}\n`)

  if (proposal.isOverloaded) {
    lines.push(`⚠️ *Capacity Alert:* Planned work exceeds capacity by ${proposal.overloadMinutes}m.`)
    if (proposal.overloadSuggestions.length > 0) {
      lines.push(`_Suggestions: ${proposal.overloadSuggestions[0]}_`)
    }
  }

  lines.push(`\nWould you like to apply this schedule change?`)

  const replyMarkup: TelegramInlineKeyboardMarkup = {
    inline_keyboard: [
      [
        {
          text: '✅ Approve',
          callback_data: `approve:${proposal.id}`
        },
        {
          text: '❌ Reject',
          callback_data: `reject:${proposal.id}`
        }
      ]
    ]
  }

  return {
    chat_id: chatId,
    text: lines.join('\n'),
    parse_mode: 'Markdown',
    reply_markup: replyMarkup
  }
}

export function buildApprovalSuccessMessage(
  chatId: number,
  targetDate?: string
): OutgoingTelegramMessage {
  return {
    chat_id: chatId,
    text: `✅ *Schedule Approved & Updated*\n\nYour schedule for ${targetDate || 'today'} has been committed. The web app is now synchronized in real time.`,
    parse_mode: 'Markdown'
  }
}

export function buildRejectionMessage(
  chatId: number
): OutgoingTelegramMessage {
  return {
    chat_id: chatId,
    text: `❌ *Proposal Cancelled*\n\nYour existing schedule remains unchanged.`,
    parse_mode: 'Markdown'
  }
}

export function buildStaleProposalMessage(
  chatId: number
): OutgoingTelegramMessage {
  return {
    chat_id: chatId,
    text: `⚠️ *Proposal Expired (Stale)*\n\nYour schedule state changed before this proposal was confirmed. Send your task request again to generate an up-to-date plan.`,
    parse_mode: 'Markdown'
  }
}

export function buildClarificationMessage(
  chatId: number,
  prompt: string
): OutgoingTelegramMessage {
  return {
    chat_id: chatId,
    text: prompt,
    parse_mode: 'Markdown'
  }
}
