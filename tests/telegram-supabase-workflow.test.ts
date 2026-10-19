import { describe, expect, it, beforeEach } from 'vitest'
import {
  processTelegramWebhookUpdate,
  verifyWebhookSecret,
  parseTelegramTaskText
} from '../src/integration'
import { SupabaseScheduleRepository } from '../src/integration/supabase/store'
import type {
  DotsUserRow,
  DotsWorkItemRow,
  DotsScheduledSlotRow,
  DotsScheduleProposalRow,
  DotsWebhookUpdateRow
} from '../src/integration/supabase/types'
import type { TelegramUpdate } from '../src/integration/telegram/types'

/**
 * In-memory Mock Supabase Client that implements the exact SQL table schemas,
 * RLS user isolation, and atomic RPC functions (dots_approve_proposal, dots_reject_proposal).
 */
class MockQueryBuilder {
  constructor(private rows: any[]) {}

  eq(column: string, val: any): MockQueryBuilder {
    return new MockQueryBuilder(this.rows.filter((r) => r[column] === val))
  }

  neq(column: string, val: any): MockQueryBuilder {
    return new MockQueryBuilder(this.rows.filter((r) => r[column] !== val))
  }

  order(orderCol: string, { ascending = true } = {}): MockQueryBuilder {
    const sorted = [...this.rows].sort((a, b) =>
      ascending ? (a[orderCol] > b[orderCol] ? 1 : -1) : (a[orderCol] < b[orderCol] ? 1 : -1)
    )
    return new MockQueryBuilder(sorted)
  }

  async maybeSingle() {
    return { data: this.rows[0] || null, error: null }
  }

  async single() {
    return { data: this.rows[0] || null, error: this.rows[0] ? null : { message: 'Not found' } }
  }

  then(resolve: any) {
    return Promise.resolve({ data: this.rows, error: null }).then(resolve)
  }
}

class MockSupabaseClient {
  public users: Map<string, DotsUserRow> = new Map()
  public workItems: Map<string, DotsWorkItemRow> = new Map()
  public scheduledSlots: Map<string, DotsScheduledSlotRow> = new Map()
  public proposals: Map<string, DotsScheduleProposalRow> = new Map()
  public webhookUpdates: Map<number, DotsWebhookUpdateRow> = new Map()
  public availabilityRules: Map<string, any> = new Map()
  public fixedEvents: Map<string, any> = new Map()

  from(table: string) {
    const self = this

    return {
      select(_columns = '*') {
        return new MockQueryBuilder(self.getTableRows(table))
      },
      insert(rows: any | any[]) {
        const rowArray = Array.isArray(rows) ? rows : [rows]
        const inserted: any[] = []
        for (const row of rowArray) {
          const id = row.id || `gen-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
          const newRow = { ...row, id }
          if (table === 'dots_users') self.users.set(newRow.id, newRow)
          if (table === 'dots_work_items') self.workItems.set(newRow.id, newRow)
          if (table === 'dots_scheduled_slots') self.scheduledSlots.set(newRow.id, newRow)
          if (table === 'dots_schedule_proposals') self.proposals.set(newRow.id, newRow)
          if (table === 'dots_webhook_updates') self.webhookUpdates.set(newRow.update_id, newRow)
          inserted.push(newRow)
        }
        const resultData = Array.isArray(rows) ? inserted : inserted[0]
        return {
          select() {
            return {
              single() {
                return Promise.resolve({ data: inserted[0], error: null })
              },
              then(resolve: any) {
                return Promise.resolve({ data: resultData, error: null }).then(resolve)
              }
            }
          },
          then(resolve: any) {
            return Promise.resolve({ data: resultData, error: null }).then(resolve)
          }
        }
      },
      async upsert(row: any) {
        if (table === 'dots_work_items') self.workItems.set(row.id, { ...row })
        return { data: row, error: null }
      },
      delete() {
        const filters: Array<{ col: string; val: any }> = []
        const deleteBuilder = {
          eq(column: string, val: any) {
            filters.push({ col: column, val })
            return deleteBuilder
          },
          then(resolve: any) {
            let targetMap: Map<any, any> | null = null
            if (table === 'dots_work_items') targetMap = self.workItems
            if (table === 'dots_scheduled_slots') targetMap = self.scheduledSlots
            if (table === 'dots_schedule_proposals') targetMap = self.proposals
            if (table === 'dots_users') targetMap = self.users

            if (targetMap) {
              for (const [id, row] of targetMap.entries()) {
                const matches = filters.every((f) => (row as any)[f.col] === f.val)
                if (matches) {
                  targetMap.delete(id)
                }
              }
            }
            return Promise.resolve({ data: null, error: null }).then(resolve)
          }
        }
        return deleteBuilder
      }
    }
  }

  // Exact reproduction of the PostgreSQL RPC functions
  async rpc(funcName: string, args: Record<string, any>) {
    if (funcName === 'dots_approve_proposal') {
      const { p_proposal_id, p_chat_id } = args

      // 1. Resolve user
      const user = Array.from(this.users.values()).find((u) => u.telegram_chat_id === p_chat_id)
      if (!user) {
        return { data: { success: false, status: 'unauthorized', message: 'User not found.' }, error: null }
      }

      // 2. Lock proposal
      const proposal = this.proposals.get(p_proposal_id)
      if (!proposal || proposal.user_id !== user.id) {
        return { data: { success: false, status: 'not_found', message: 'Proposal not found.' }, error: null }
      }

      if (proposal.status !== 'pending') {
        return {
          data: { success: false, status: proposal.status, message: `Proposal is already ${proposal.status}.` },
          error: null
        }
      }

      // 3. Stale Detection Check (deep comparison of slot schedules)
      const currentSlotsSorted = Array.from(this.scheduledSlots.values())
        .filter((s) => s.user_id === user.id && s.date === proposal.target_date)
        .sort((a, b) => a.start_time.localeCompare(b.start_time))
        .map((s) => ({
          id: s.id,
          startTime: s.start_time,
          endTime: s.end_time,
          workItemId: s.work_item_id,
          title: s.title
        }))

      const baseSnapshotSorted = [...(proposal.base_schedule_snapshot || [])]
        .sort((a: any, b: any) => (a.startTime || '').localeCompare(b.startTime || ''))
        .map((s: any) => ({
          id: s.id,
          startTime: s.startTime,
          endTime: s.endTime,
          workItemId: s.workItemId,
          title: s.title
        }))

      if (JSON.stringify(currentSlotsSorted) !== JSON.stringify(baseSnapshotSorted)) {
        proposal.status = 'stale'
        return {
          data: { success: false, status: 'stale', message: 'Schedule changed before approval. Proposal is stale.' },
          error: null
        }
      }

      // 4. Atomically apply proposed schedule: Delete unlocked slots on target date
      for (const [id, s] of this.scheduledSlots.entries()) {
        if (s.user_id === user.id && s.date === proposal.target_date && !s.locked) {
          this.scheduledSlots.delete(id)
        }
      }

      // Insert new non-locked slots
      for (const slot of proposal.proposed_schedule) {
        if (!slot.locked) {
          this.scheduledSlots.set(slot.id, {
            id: slot.id,
            user_id: user.id,
            work_item_id: slot.workItemId,
            title: slot.title,
            date: proposal.target_date,
            start_time: slot.startTime,
            end_time: slot.endTime,
            duration_minutes: slot.durationMinutes,
            session_index: slot.sessionIndex || 1,
            total_sessions: slot.totalSessions || 1,
            is_split: slot.isSplit || false,
            locked: false,
            reason: slot.reason,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        }
      }

      proposal.status = 'approved'
      return {
        data: {
          success: true,
          status: 'approved',
          message: 'Schedule successfully updated and committed.',
          targetDate: proposal.target_date
        },
        error: null
      }
    }

    if (funcName === 'dots_reject_proposal') {
      const { p_proposal_id, p_chat_id, p_reason } = args
      const user = Array.from(this.users.values()).find((u) => u.telegram_chat_id === p_chat_id)
      if (!user) {
        return { data: { success: false, status: 'unauthorized', message: 'User not found.' }, error: null }
      }

      const proposal = this.proposals.get(p_proposal_id)
      if (!proposal || proposal.user_id !== user.id) {
        return { data: { success: false, status: 'not_found', message: 'Proposal not found.' }, error: null }
      }

      if (proposal.status !== 'pending') {
        return {
          data: { success: false, status: proposal.status, message: `Proposal is already ${proposal.status}.` },
          error: null
        }
      }

      proposal.status = 'rejected'
      return {
        data: { success: true, status: 'rejected', message: p_reason || 'Rejected by user' },
        error: null
      }
    }

    return { data: null, error: { message: `Unknown RPC function: ${funcName}` } }
  }

  private getTableRows(table: string): any[] {
    if (table === 'dots_users') return Array.from(this.users.values())
    if (table === 'dots_work_items') return Array.from(this.workItems.values())
    if (table === 'dots_scheduled_slots') return Array.from(this.scheduledSlots.values())
    if (table === 'dots_schedule_proposals') return Array.from(this.proposals.values())
    if (table === 'dots_webhook_updates') return Array.from(this.webhookUpdates.values())
    return []
  }
}

describe('Dots Phase 2 — Supabase Foundation & Telegram Text-to-Approval Workflow', () => {
  let mockSupabase: MockSupabaseClient
  let repository: SupabaseScheduleRepository
  const fixedDate = new Date('2026-10-21T09:00:00Z')
  const secretToken = 'secure-dots-webhook-secret-token-12345'

  beforeEach(() => {
    mockSupabase = new MockSupabaseClient()
    repository = new SupabaseScheduleRepository(mockSupabase as any)
  })

  // 1. Webhook Secret Authenticity
  it('enforces webhook secret token verification', () => {
    expect(verifyWebhookSecret('wrong-secret', secretToken)).toBe(false)
    expect(verifyWebhookSecret(null, secretToken)).toBe(false)
    expect(verifyWebhookSecret(secretToken, secretToken)).toBe(true)
  })

  // 2. Natural language parsing & clarification questions
  describe('Natural Language Task Parser', () => {
    it('returns greeting on /start or hello', () => {
      const res = parseTelegramTaskText('/start', fixedDate)
      expect(res.type).toBe('greeting')
      if (res.type === 'greeting') {
        expect(res.message).toContain('Welcome to **Dots**')
      }
    })

    it('asks for clarification when input is empty or vague', () => {
      const emptyRes = parseTelegramTaskText('   ', fixedDate)
      expect(emptyRes.type).toBe('clarification')

      const vagueRes = parseTelegramTaskText('schedule', fixedDate)
      expect(vagueRes.type).toBe('clarification')
      if (vagueRes.type === 'clarification') {
        expect(vagueRes.message).toContain('What task would you like to schedule?')
      }
    })

    it('extracts duration, priority, and title from natural language text', () => {
      const res = parseTelegramTaskText('Security audit 90m urgent today', fixedDate)
      expect(res.type).toBe('task')
      if (res.type === 'task') {
        expect(res.task.title).toBe('Security audit')
        expect(res.task.estimatedMinutes).toBe(90)
        expect(res.task.priority).toBe('critical')
        expect(res.targetDate).toBe('2026-10-21')
      }
    })

    it('handles tomorrow and preferred start times', () => {
      const res = parseTelegramTaskText('Team architecture sync 45m tomorrow at 14:00', fixedDate)
      expect(res.type).toBe('task')
      if (res.type === 'task') {
        expect(res.task.title).toBe('Team architecture sync')
        expect(res.task.estimatedMinutes).toBe(45)
        expect(res.task.preferredStartTime).toBe('14:00')
        expect(res.targetDate).toBe('2026-10-22')
      }
    })
  })

  // 3. User Data Isolation
  it('enforces strict user isolation: User A cannot access User B data or proposals', async () => {
    const userA = await repository.getOrCreateTelegramUser(1001, 'user_a', 'Alice')
    const userB = await repository.getOrCreateTelegramUser(2002, 'user_b', 'Bob')

    expect(userA.id).not.toBe(userB.id)

    // User A has a proposal
    const updateA: TelegramUpdate = {
      update_id: 101,
      message: {
        message_id: 1,
        chat: { id: 1001, type: 'private' },
        date: Math.floor(fixedDate.getTime() / 1000),
        text: 'Finish pitch deck 60m'
      }
    }

    const resA = await processTelegramWebhookUpdate(
      updateA,
      { repository, secretToken, currentTime: '09:00', referenceDate: fixedDate },
      secretToken
    )

    expect(resA.status).toBe('ok')
    expect(resA.outgoingMessage?.reply_markup?.inline_keyboard[0][0].callback_data).toBeDefined()

    const proposalId = resA.outgoingMessage!.reply_markup!.inline_keyboard[0][0].callback_data.replace('approve:', '')

    // User B attempts to approve User A's proposal
    const updateBApprove: TelegramUpdate = {
      update_id: 102,
      callback_query: {
        id: 'cb-1',
        from: { id: 2002, first_name: 'Bob' },
        data: `approve:${proposalId}`
      }
    }

    const resB = await processTelegramWebhookUpdate(
      updateBApprove,
      { repository, secretToken, currentTime: '09:00', referenceDate: fixedDate },
      secretToken
    )

    // Must be rejected with not_found/unauthorized for User B
    expect(resB.outgoingMessage?.text).toContain('Cannot approve proposal: Proposal not found')
  })

  // 4. Duplicate webhook updates & strict idempotency
  it('handles Telegram webhook retries idempotently without duplicate tasks or proposals', async () => {
    const update: TelegramUpdate = {
      update_id: 5555,
      message: {
        message_id: 20,
        chat: { id: 9999, type: 'private' },
        date: Math.floor(fixedDate.getTime() / 1000),
        text: 'Code review for PR 45m'
      }
    }

    // First arrival
    const run1 = await processTelegramWebhookUpdate(
      update,
      { repository, secretToken, currentTime: '09:00', referenceDate: fixedDate },
      secretToken
    )
    expect(run1.status).toBe('ok')
    expect(mockSupabase.workItems.size).toBe(1)
    expect(mockSupabase.proposals.size).toBe(1)

    // Second retry from Telegram network with same update_id
    const run2 = await processTelegramWebhookUpdate(
      update,
      { repository, secretToken, currentTime: '09:00', referenceDate: fixedDate },
      secretToken
    )
    expect(run2.status).toBe('already_processed')

    // No duplicate work items or proposals created
    expect(mockSupabase.workItems.size).toBe(1)
    expect(mockSupabase.proposals.size).toBe(1)
  })

  // 5. Proposal Approval & Atomic Schedule Persistence
  it('approves a proposal via callback query, commits schedule atomically, and updates status', async () => {
    const chatId = 7777

    // 1. Text message arrives
    const textUpdate: TelegramUpdate = {
      update_id: 601,
      message: {
        message_id: 31,
        chat: { id: chatId, type: 'private' },
        date: Math.floor(fixedDate.getTime() / 1000),
        text: 'Write release notes 60m'
      }
    }

    const textRes = await processTelegramWebhookUpdate(
      textUpdate,
      { repository, secretToken, currentTime: '09:00', referenceDate: fixedDate },
      secretToken
    )

    expect(textRes.status).toBe('ok')
    const proposalId = textRes.outgoingMessage!.reply_markup!.inline_keyboard[0][0].callback_data.replace('approve:', '')

    // Schedule should be empty before approval
    expect(mockSupabase.scheduledSlots.size).toBe(0)

    // 2. User taps Approve in Telegram
    const approveUpdate: TelegramUpdate = {
      update_id: 602,
      callback_query: {
        id: 'cb-approve-1',
        from: { id: chatId, first_name: 'Test' },
        message: {
          message_id: 32,
          chat: { id: chatId, type: 'private' },
          date: Math.floor(fixedDate.getTime() / 1000)
        },
        data: `approve:${proposalId}`
      }
    }

    const approveRes = await processTelegramWebhookUpdate(
      approveUpdate,
      { repository, secretToken, currentTime: '09:00', referenceDate: fixedDate },
      secretToken
    )

    expect(approveRes.status).toBe('ok')
    expect(approveRes.outgoingMessage?.text).toContain('Schedule Approved & Updated')
    expect(approveRes.callbackAnswer?.text).toContain('successfully updated')

    // Scheduled slot is now committed in Supabase!
    expect(mockSupabase.scheduledSlots.size).toBe(1)
    const slot = Array.from(mockSupabase.scheduledSlots.values())[0]
    expect(slot.title).toBe('Write release notes')
    expect(slot.start_time).toBe('09:00')
    expect(slot.end_time).toBe('10:00')

    // Proposal row marked as approved
    const prop = mockSupabase.proposals.get(proposalId)
    expect(prop?.status).toBe('approved')
  })

  // 6. Proposal Rejection
  it('rejects a proposal via callback query, leaves schedule unchanged, and updates status', async () => {
    const chatId = 8888

    const textUpdate: TelegramUpdate = {
      update_id: 701,
      message: {
        message_id: 41,
        chat: { id: chatId, type: 'private' },
        date: Math.floor(fixedDate.getTime() / 1000),
        text: 'Clean inbox 30m'
      }
    }

    const textRes = await processTelegramWebhookUpdate(
      textUpdate,
      { repository, secretToken, currentTime: '09:00', referenceDate: fixedDate },
      secretToken
    )

    const proposalId = textRes.outgoingMessage!.reply_markup!.inline_keyboard[0][1].callback_data.replace('reject:', '')

    // User taps Reject
    const rejectUpdate: TelegramUpdate = {
      update_id: 702,
      callback_query: {
        id: 'cb-reject-1',
        from: { id: chatId, first_name: 'Test' },
        data: `reject:${proposalId}`
      }
    }

    const rejectRes = await processTelegramWebhookUpdate(
      rejectUpdate,
      { repository, secretToken, currentTime: '09:00', referenceDate: fixedDate },
      secretToken
    )

    expect(rejectRes.status).toBe('ok')
    expect(rejectRes.outgoingMessage?.text).toContain('Proposal Cancelled')
    expect(mockSupabase.scheduledSlots.size).toBe(0)

    const prop = mockSupabase.proposals.get(proposalId)
    expect(prop?.status).toBe('rejected')
  })

  // 7. Double Approval Prevention
  it('prevents double approval of an already resolved proposal', async () => {
    const chatId = 3333

    const textUpdate: TelegramUpdate = {
      update_id: 801,
      message: {
        message_id: 51,
        chat: { id: chatId, type: 'private' },
        date: Math.floor(fixedDate.getTime() / 1000),
        text: 'Quick task 30m'
      }
    }

    const textRes = await processTelegramWebhookUpdate(
      textUpdate,
      { repository, secretToken, currentTime: '09:00', referenceDate: fixedDate },
      secretToken
    )

    const proposalId = textRes.outgoingMessage!.reply_markup!.inline_keyboard[0][0].callback_data.replace('approve:', '')

    // First approval
    await processTelegramWebhookUpdate(
      {
        update_id: 802,
        callback_query: { id: 'cb-1', from: { id: chatId, first_name: 'Test' }, data: `approve:${proposalId}` }
      },
      { repository, secretToken, currentTime: '09:00', referenceDate: fixedDate },
      secretToken
    )

    // Second accidental tap on approve
    const secondRes = await processTelegramWebhookUpdate(
      {
        update_id: 803,
        callback_query: { id: 'cb-2', from: { id: chatId, first_name: 'Test' }, data: `approve:${proposalId}` }
      },
      { repository, secretToken, currentTime: '09:00', referenceDate: fixedDate },
      secretToken
    )

    expect(secondRes.outgoingMessage?.text).toContain('Proposal is already approved')
  })

  // 8. Stale Proposal Detection & Concurrent Schedule Changes
  it('detects stale proposal when calendar changes before user approval and aborts safely', async () => {
    const chatId = 4444

    // 1. User generates proposal based on an empty schedule
    const textUpdate: TelegramUpdate = {
      update_id: 901,
      message: {
        message_id: 61,
        chat: { id: chatId, type: 'private' },
        date: Math.floor(fixedDate.getTime() / 1000),
        text: 'Prepare financial report 60m'
      }
    }

    const textRes = await processTelegramWebhookUpdate(
      textUpdate,
      { repository, secretToken, currentTime: '09:00', referenceDate: fixedDate },
      secretToken
    )

    const proposalId = textRes.outgoingMessage!.reply_markup!.inline_keyboard[0][0].callback_data.replace('approve:', '')
    const user = Array.from(mockSupabase.users.values()).find((u) => u.telegram_chat_id === chatId)!

    // 2. Concurrent change occurs: An external meeting is synced into scheduled_slots before approval
    mockSupabase.scheduledSlots.set('concurrent-slot-1', {
      id: 'concurrent-slot-1',
      user_id: user.id,
      title: 'Urgent Executive Call',
      date: '2026-10-21',
      start_time: '09:00',
      end_time: '09:30',
      duration_minutes: 30,
      session_index: 1,
      total_sessions: 1,
      is_split: false,
      locked: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

    // 3. User attempts to approve the stale proposal
    const approveUpdate: TelegramUpdate = {
      update_id: 902,
      callback_query: {
        id: 'cb-stale-1',
        from: { id: chatId, first_name: 'Test' },
        data: `approve:${proposalId}`
      }
    }

    const approveRes = await processTelegramWebhookUpdate(
      approveUpdate,
      { repository, secretToken, currentTime: '09:00', referenceDate: fixedDate },
      secretToken
    )

    expect(approveRes.outgoingMessage?.text).toContain('Proposal Expired (Stale)')
    expect(approveRes.callbackAnswer?.text).toContain('Proposal is stale')

    // The concurrent meeting was NOT deleted or overwritten!
    expect(mockSupabase.scheduledSlots.has('concurrent-slot-1')).toBe(true)

    // Proposal row status set to stale
    const prop = mockSupabase.proposals.get(proposalId)
    expect(prop?.status).toBe('stale')
  })

  // 12. Phase 2.1 Audit: Deep Slot-Shift Stale Detection (same count, shifted time)
  it('detects stale proposal when slot count is identical but slot times shifted', async () => {
    const chatId = 998811
    const textUpdate: TelegramUpdate = {
      update_id: 950,
      message: {
        message_id: 1,
        date: Math.floor(Date.now() / 1000),
        chat: { id: chatId, type: 'private' },
        from: { id: chatId, first_name: 'StaleTimeTester' },
        text: 'Prep slides 60m urgent today'
      }
    }

    const textRes = await processTelegramWebhookUpdate(
      textUpdate,
      { repository, secretToken, currentTime: '09:00', referenceDate: fixedDate },
      secretToken
    )

    const proposalId = textRes.outgoingMessage!.reply_markup!.inline_keyboard[0][0].callback_data.replace('approve:', '')
    const user = Array.from(mockSupabase.users.values()).find((u) => u.telegram_chat_id === chatId)!

    // Setup an initial slot that was captured in snapshot
    const initialSlot: DotsScheduledSlotRow = {
      id: 'existing-slot-a',
      user_id: user.id,
      title: 'Morning Sync',
      date: '2026-10-21',
      start_time: '10:00',
      end_time: '10:30',
      duration_minutes: 30,
      session_index: 1,
      total_sessions: 1,
      is_split: false,
      locked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    mockSupabase.scheduledSlots.set(initialSlot.id, initialSlot)

    // Update proposal snapshot to include this initial slot
    const proposal = mockSupabase.proposals.get(proposalId)!
    proposal.base_schedule_snapshot = [
      { id: initialSlot.id, startTime: '10:00', endTime: '10:30', title: initialSlot.title }
    ]

    // Now slot time is moved from 10:00 to 10:30 (slot count is still 1, but timing changed!)
    initialSlot.start_time = '10:30'
    initialSlot.end_time = '11:00'

    const approveUpdate: TelegramUpdate = {
      update_id: 951,
      callback_query: {
        id: 'cb-stale-shift',
        from: { id: chatId, first_name: 'StaleTimeTester' },
        data: `approve:${proposalId}`
      }
    }

    const approveRes = await processTelegramWebhookUpdate(
      approveUpdate,
      { repository, secretToken, currentTime: '09:00', referenceDate: fixedDate },
      secretToken
    )

    expect(approveRes.outgoingMessage?.text).toContain('Proposal Expired (Stale)')
    expect(mockSupabase.proposals.get(proposalId)?.status).toBe('stale')
  })

  // 13. Phase 2.1 Audit: Rollback candidate task when proposal generation fails downstream
  it('rolls back candidate work item if proposal generation fails downstream', async () => {
    const chatId = 998822
    const textUpdate: TelegramUpdate = {
      update_id: 960,
      message: {
        message_id: 1,
        date: Math.floor(Date.now() / 1000),
        chat: { id: chatId, type: 'private' },
        from: { id: chatId, first_name: 'RollbackTester' },
        text: 'Broken task 45m today'
      }
    }

    // Temporarily sabotage saveProposal to throw
    const originalSaveProposal = repository.saveProposal.bind(repository)
    repository.saveProposal = async () => {
      throw new Error('Simulated database connection failure during proposal save')
    }

    await expect(
      processTelegramWebhookUpdate(
        textUpdate,
        { repository, secretToken, currentTime: '09:00', referenceDate: fixedDate },
        secretToken
      )
    ).rejects.toThrow('Simulated database connection failure')

    // Restore method
    repository.saveProposal = originalSaveProposal

    // Confirm candidate task was cleanly deleted from user backlog (no orphan tasks left!)
    const user = Array.from(mockSupabase.users.values()).find((u) => u.telegram_chat_id === chatId)!
    const userWorkItems = Array.from(mockSupabase.workItems.values()).filter(
      (w) => w.user_id === user.id && w.title === 'Broken task'
    )
    expect(userWorkItems.length).toBe(0)
  })

  // 14. Phase 2.1 Audit: Malformed callback data validation
  it('rejects malformed callback query data gracefully', async () => {
    const chatId = 998833
    const emptyApproveUpdate: TelegramUpdate = {
      update_id: 970,
      callback_query: {
        id: 'cb-malformed-1',
        from: { id: chatId, first_name: 'MalTester' },
        data: 'approve:    '
      }
    }

    const emptyRejectUpdate: TelegramUpdate = {
      update_id: 971,
      callback_query: {
        id: 'cb-malformed-2',
        from: { id: chatId, first_name: 'MalTester' },
        data: 'reject:'
      }
    }

    const res1 = await processTelegramWebhookUpdate(
      emptyApproveUpdate,
      { repository, secretToken, currentTime: '09:00', referenceDate: fixedDate },
      secretToken
    )
    expect(res1.status).toBe('error')
    expect(res1.errorMessage).toContain('Malformed callback data')

    const res2 = await processTelegramWebhookUpdate(
      emptyRejectUpdate,
      { repository, secretToken, currentTime: '09:00', referenceDate: fixedDate },
      secretToken
    )
    expect(res2.status).toBe('error')
    expect(res2.errorMessage).toContain('Malformed callback data')
  })

  // 15. Phase 2.1 Audit: Cross-user authorization isolation
  it('prevents another user from approving a proposal they do not own', async () => {
    // User A creates a proposal
    const chatA = 111000
    const textA: TelegramUpdate = {
      update_id: 980,
      message: {
        message_id: 1,
        date: Math.floor(Date.now() / 1000),
        chat: { id: chatA, type: 'private' },
        from: { id: chatA, first_name: 'UserA' },
        text: 'Private task 30m today'
      }
    }

    const resA = await processTelegramWebhookUpdate(
      textA,
      { repository, secretToken, currentTime: '09:00', referenceDate: fixedDate },
      secretToken
    )
    const proposalId = resA.outgoingMessage!.reply_markup!.inline_keyboard[0][0].callback_data.replace('approve:', '')

    // User B attempts to approve User A's proposal
    const chatB = 222000
    const hackUpdate: TelegramUpdate = {
      update_id: 981,
      callback_query: {
        id: 'cb-hack-1',
        from: { id: chatB, first_name: 'UserB' },
        data: `approve:${proposalId}`
      }
    }

    const hackRes = await processTelegramWebhookUpdate(
      hackUpdate,
      { repository, secretToken, currentTime: '09:00', referenceDate: fixedDate },
      secretToken
    )

    // Should fail with not_found/unauthorized and NOT approve proposal
    expect(hackRes.outgoingMessage?.text).toContain('Cannot approve proposal')
    expect(mockSupabase.proposals.get(proposalId)?.status).toBe('pending')
  })
})

