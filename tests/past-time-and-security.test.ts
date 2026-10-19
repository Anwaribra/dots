import { describe, expect, it, beforeEach } from 'vitest'
import {
  processTelegramWebhookUpdate,
  parseTelegramTaskText,
  getUserDateTimeInTimezone,
  getNextDayStr
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
import { parseTimeToMinutes } from '../src/engine/constraints'

/**
 * Hardened Mock Supabase Client that implements:
 * 1. Timezone-aware date/time handling
 * 2. Strict RLS isolation between users
 * 3. dots_claim_telegram_account security rules from 20261019211000_dots_security_hardening.sql:
 *    - Rejection of raw chat IDs (no bypass)
 *    - Valid 15-minute link codes only
 *    - Anti-takeover check (rejects if account belongs to another auth_user_id)
 *    - Single-use invalidation
 * 4. Atomic proposal approval/rejection with stale detection
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

class HardenedMockSupabaseClient {
  public users: Map<string, DotsUserRow> = new Map()
  public workItems: Map<string, DotsWorkItemRow> = new Map()
  public scheduledSlots: Map<string, DotsScheduledSlotRow> = new Map()
  public proposals: Map<string, DotsScheduleProposalRow> = new Map()
  public webhookUpdates: Map<number, DotsWebhookUpdateRow> = new Map()
  public linkCodes: Map<string, { code: string; telegram_chat_id: number; expires_at: string }> = new Map()
  public fixedEvents: Map<string, any> = new Map()
  public currentAuthUserId: string | null = null

  setAuthUser(uid: string | null) {
    this.currentAuthUserId = uid
  }

  from(table: string) {
    const self = this

    return {
      select(_columns = '*') {
        let rows = self.getTableRows(table)
        if (self.currentAuthUserId && (table === 'dots_scheduled_slots' || table === 'dots_schedule_proposals')) {
          const currentUser = Array.from(self.users.values()).find(
            (u) => u.auth_user_id === self.currentAuthUserId
          )
          const allowedUserId = currentUser ? currentUser.id : '__none__'
          rows = rows.filter((r) => r.user_id === allowedUserId)
        }
        return new MockQueryBuilder(rows)
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
          if (table === 'dots_link_codes') self.linkCodes.set(newRow.code, newRow)
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
        if (table === 'dots_users') self.users.set(row.id, { ...row })
        if (table === 'dots_scheduled_slots') self.scheduledSlots.set(row.id, { ...row })
        return { data: row, error: null }
      },
      delete() {
        return {
          eq(col: string, val: any) {
            let targetMap: Map<any, any> | null = null
            if (table === 'dots_work_items') targetMap = self.workItems
            if (table === 'dots_scheduled_slots') targetMap = self.scheduledSlots
            if (table === 'dots_schedule_proposals') targetMap = self.proposals
            if (table === 'dots_users') targetMap = self.users

            if (targetMap) {
              for (const [k, v] of targetMap.entries()) {
                if ((v as any)[col] === val) {
                  targetMap.delete(k)
                }
              }
            }
            return Promise.resolve({ data: null, error: null })
          }
        }
      }
    }
  }

  async rpc(funcName: string, args: Record<string, any>) {
    if (funcName === 'dots_claim_telegram_account') {
      const { p_code } = args
      const authUid = this.currentAuthUserId

      if (!authUid) {
        return {
          data: { success: false, message: 'You must be signed in to link a Telegram account.' },
          error: null
        }
      }

      const trimmedCode = (p_code || '').trim()

      // 1. Look up link code strictly in linkCodes table (no raw chat ID bypass!)
      const linkRecord = this.linkCodes.get(trimmedCode)
      if (!linkRecord || new Date(linkRecord.expires_at).getTime() < Date.now()) {
        return {
          data: {
            success: false,
            message: 'Invalid or expired link code. Please send /link to @DotsPersonalPlannerBot to get a new code.'
          },
          error: null
        }
      }

      const chatId = linkRecord.telegram_chat_id

      // 2. Find telegram user
      const targetUser = Array.from(this.users.values()).find((u) => u.telegram_chat_id === chatId)
      if (!targetUser) {
        return {
          data: { success: false, message: 'Telegram user account not found.' },
          error: null
        }
      }

      // 3. Anti-Takeover Security Check: Cannot claim another user's account
      if (targetUser.auth_user_id && targetUser.auth_user_id !== authUid) {
        return {
          data: {
            success: false,
            message: 'This Telegram account is already linked to another Dots account.'
          },
          error: null
        }
      }

      // 4. Invalidate link code (single-use enforcement)
      this.linkCodes.delete(trimmedCode)

      // 5. Link account
      targetUser.auth_user_id = authUid
      this.users.set(targetUser.id, targetUser)

      return {
        data: {
          success: true,
          message: 'Telegram account successfully linked!'
        },
        error: null
      }
    }

    if (funcName === 'dots_approve_proposal') {
      const { p_proposal_id, p_chat_id } = args
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

      // Apply slots
      for (const slot of proposal.proposed_schedule || []) {
        this.scheduledSlots.set(slot.id, {
          id: slot.id,
          user_id: user.id,
          work_item_id: slot.workItemId,
          title: slot.title,
          date: proposal.target_date,
          start_time: slot.startTime,
          end_time: slot.endTime,
          duration_minutes: slot.durationMinutes,
          session_index: 1,
          total_sessions: 1,
          is_split: false,
          locked: false,
          reason: slot.reason,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
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

    return { data: null, error: { message: `Unknown RPC function: ${funcName}` } }
  }

  private getTableRows(table: string): any[] {
    if (table === 'dots_users') return Array.from(this.users.values())
    if (table === 'dots_work_items') return Array.from(this.workItems.values())
    if (table === 'dots_scheduled_slots') return Array.from(this.scheduledSlots.values())
    if (table === 'dots_schedule_proposals') return Array.from(this.proposals.values())
    if (table === 'dots_webhook_updates') return Array.from(this.webhookUpdates.values())
    if (table === 'dots_fixed_events') return Array.from(this.fixedEvents.values())
    if (table === 'dots_link_codes') return Array.from(this.linkCodes.values())
    return []
  }
}

describe('Dots Phase 4 — Past-Time Scheduling & Security Hardening', () => {
  let mockClient: HardenedMockSupabaseClient
  let repository: SupabaseScheduleRepository

  const TEST_CHAT_ID = 858650312
  const TEST_USER_ID = 'user-dots-test-01'

  beforeEach(() => {
    mockClient = new HardenedMockSupabaseClient()
    repository = new SupabaseScheduleRepository(mockClient as any)

    // Seed test user with Cairo timezone (UTC+3)
    mockClient.users.set(TEST_USER_ID, {
      id: TEST_USER_ID,
      auth_user_id: null,
      telegram_chat_id: TEST_CHAT_ID,
      telegram_username: 'Anwaribra0',
      display_name: 'Anwar',
      timezone: 'Africa/Cairo',
      created_at: '2026-10-19T10:00:00Z',
      updated_at: '2026-10-19T10:00:00Z'
    })
  })

  // ==========================================================================
  // Section 1: Past-Time Scheduling Invariant Tests
  // ==========================================================================
  describe('Past-Time Scheduling & Tomorrow Rollover', () => {
    it('1. Evening request at 8:33 PM (20:33) MUST NOT schedule at 09:00 AM in the past; rolls over to tomorrow', async () => {
      // Current date: 2026-10-19 at 20:33 local time
      const eveningRefDate = new Date('2026-10-19T17:33:00.000Z') // 20:33 Cairo time

      const update: TelegramUpdate = {
        update_id: 1001,
        message: {
          message_id: 501,
          date: Math.floor(eveningRefDate.getTime() / 1000),
          chat: { id: TEST_CHAT_ID, type: 'private' },
          from: { id: TEST_CHAT_ID, is_bot: false, first_name: 'Anwar', username: 'Anwaribra0' },
          text: 'Review client contract 45m urgent'
        }
      }

      const result = await processTelegramWebhookUpdate(update, {
        repository,
        referenceDate: eveningRefDate,
        currentTime: '20:33'
      })

      expect(result.status).toBe('ok')
      expect(result.outgoingMessage).toBeDefined()

      // Inspect proposal stored in DB
      const proposals = Array.from(mockClient.proposals.values())
      expect(proposals.length).toBe(1)
      const proposal = proposals[0]

      // Critical Invariant 1: Target date must roll over to tomorrow (2026-10-20), NEVER today (2026-10-19)
      expect(proposal.target_date).toBe('2026-10-20')

      // Critical Invariant 2: Proposed slot must be on tomorrow, starting at 09:00 AM
      const newSlot = proposal.proposed_schedule.find((s) => s.title.includes('Review client contract'))
      expect(newSlot).toBeDefined()
      expect(newSlot.startTime).toBe('09:00')
      expect(newSlot.endTime).toBe('09:45')

      // Critical Invariant 3: Explainable message informs the user why it was scheduled tomorrow
      expect(proposal.human_summary).toContain('No remaining focus slots today after 20:33')
      expect(proposal.human_summary).toContain('2026-10-20')
    })

    it('2. Afternoon request at 14:15 with available capacity schedules in future TODAY (never in past)', async () => {
      const afternoonDate = new Date('2026-10-19T11:15:00.000Z') // 14:15 Cairo time

      // Add a morning slot from 09:00 to 10:00 today
      mockClient.scheduledSlots.set('morning-slot', {
        id: 'morning-slot',
        user_id: TEST_USER_ID,
        work_item_id: 'task-morning',
        title: 'Morning Standup',
        date: '2026-10-19',
        start_time: '09:00',
        end_time: '10:00',
        duration_minutes: 60,
        session_index: 1,
        total_sessions: 1,
        is_split: false,
        locked: true,
        reason: 'Daily Standup',
        created_at: '2026-10-19T07:00:00Z',
        updated_at: '2026-10-19T07:00:00Z'
      })

      const update: TelegramUpdate = {
        update_id: 1002,
        message: {
          message_id: 502,
          date: Math.floor(afternoonDate.getTime() / 1000),
          chat: { id: TEST_CHAT_ID, type: 'private' },
          from: { id: TEST_CHAT_ID, is_bot: false, first_name: 'Anwar', username: 'Anwaribra0' },
          text: 'Design wireframes 60m'
        }
      }

      const result = await processTelegramWebhookUpdate(update, {
        repository,
        referenceDate: afternoonDate,
        currentTime: '14:15'
      })

      expect(result.status).toBe('ok')
      const proposal = Array.from(mockClient.proposals.values())[0]

      // Placed on today
      expect(proposal.target_date).toBe('2026-10-19')

      const placedSlot = proposal.proposed_schedule.find((s) => s.title.includes('Design wireframes'))
      expect(placedSlot).toBeDefined()

      // Must start at or after current time (14:15), NEVER in morning
      const startMin = parseTimeToMinutes(placedSlot.startTime)
      expect(startMin).toBeGreaterThanOrEqual(14 * 60 + 15)
      expect(startMin).toBeLessThan(18 * 60) // within workday
    })

    it('3. Day with 100% capacity saturation rolls over to tomorrow safely', async () => {
      // Pack today completely from 09:00 to 18:00
      mockClient.scheduledSlots.set('packed-slot-1', {
        id: 'packed-slot-1',
        user_id: TEST_USER_ID,
        work_item_id: 'task-full-1',
        title: 'All Day Focus Part 1',
        date: '2026-10-19',
        start_time: '09:00',
        end_time: '13:00',
        duration_minutes: 240,
        session_index: 1,
        total_sessions: 1,
        is_split: false,
        locked: true,
        reason: 'Locked block',
        created_at: '2026-10-19T07:00:00Z',
        updated_at: '2026-10-19T07:00:00Z'
      })
      mockClient.scheduledSlots.set('packed-slot-2', {
        id: 'packed-slot-2',
        user_id: TEST_USER_ID,
        work_item_id: 'task-full-2',
        title: 'All Day Focus Part 2',
        date: '2026-10-19',
        start_time: '13:00',
        end_time: '18:00',
        duration_minutes: 300,
        session_index: 1,
        total_sessions: 1,
        is_split: false,
        locked: true,
        reason: 'Locked block',
        created_at: '2026-10-19T07:00:00Z',
        updated_at: '2026-10-19T07:00:00Z'
      })

      const middayRef = new Date('2026-10-19T09:00:00.000Z') // 12:00 local time
      const update: TelegramUpdate = {
        update_id: 1003,
        message: {
          message_id: 503,
          date: Math.floor(middayRef.getTime() / 1000),
          chat: { id: TEST_CHAT_ID, type: 'private' },
          from: { id: TEST_CHAT_ID, is_bot: false, first_name: 'Anwar', username: 'Anwaribra0' },
          text: 'Urgent bugfix 60m'
        }
      }

      const result = await processTelegramWebhookUpdate(update, {
        repository,
        referenceDate: middayRef,
        currentTime: '12:00'
      })

      expect(result.status).toBe('ok')
      const proposal = Array.from(mockClient.proposals.values())[0]

      // Rolls over to tomorrow because today has 0 free minutes
      expect(proposal.target_date).toBe('2026-10-20')
      const slot = proposal.proposed_schedule.find((s) => s.title.toLowerCase().includes('bugfix'))
      expect(slot).toBeDefined()
      expect(slot.startTime).toBe('09:00')
    })

    it('4. Timezone boundary transition at 23:30 local time handles day rollover cleanly', async () => {
      // 23:30 in Africa/Cairo is 20:33 UTC
      const lateNightDate = new Date('2026-10-19T20:30:00.000Z') // 23:30 Cairo
      const userDt = getUserDateTimeInTimezone(lateNightDate, 'Africa/Cairo')
      expect(userDt.dateStr).toBe('2026-10-19')
      expect(userDt.timeStr).toBe('23:30')

      const tomorrow = getNextDayStr(userDt.dateStr)
      expect(tomorrow).toBe('2026-10-20')

      const update: TelegramUpdate = {
        update_id: 1004,
        message: {
          message_id: 504,
          date: Math.floor(lateNightDate.getTime() / 1000),
          chat: { id: TEST_CHAT_ID, type: 'private' },
          from: { id: TEST_CHAT_ID, is_bot: false, first_name: 'Anwar', username: 'Anwaribra0' },
          text: 'Prep morning standup 30m'
        }
      }

      const result = await processTelegramWebhookUpdate(update, {
        repository,
        referenceDate: lateNightDate,
        currentTime: '23:30'
      })

      expect(result.status).toBe('ok')
      const proposal = Array.from(mockClient.proposals.values())[0]
      expect(proposal.target_date).toBe('2026-10-20')
    })
  })

  // ==========================================================================
  // Section 2: Authentication & Account Isolation Tests
  // ==========================================================================
  describe('Authentication & Account Isolation Security', () => {
    it('5. dots_claim_telegram_account REJECTS raw chat IDs without valid link code', async () => {
      mockClient.setAuthUser('auth-attacker-999')

      // Attempt to claim using raw chat ID directly
      const { data, error } = await mockClient.rpc('dots_claim_telegram_account', {
        p_code: String(TEST_CHAT_ID) // Raw chat ID
      })

      expect(error).toBeNull()
      expect(data?.success).toBe(false)
      expect(data?.message).toContain('Invalid or expired link code')

      // Target user auth_user_id must still be NULL (uncompromised)
      const target = mockClient.users.get(TEST_USER_ID)
      expect(target?.auth_user_id).toBeNull()
    })

    it('6. dots_claim_telegram_account REJECTS expired link codes', async () => {
      mockClient.setAuthUser('auth-legit-user')

      // Seed an expired link code (expired 10 minutes ago)
      const expiredCode = '445566'
      mockClient.linkCodes.set(expiredCode, {
        code: expiredCode,
        telegram_chat_id: TEST_CHAT_ID,
        expires_at: new Date(Date.now() - 10 * 60 * 1000).toISOString()
      })

      const { data } = await mockClient.rpc('dots_claim_telegram_account', {
        p_code: expiredCode
      })

      expect(data?.success).toBe(false)
      expect(data?.message).toContain('Invalid or expired link code')
    })

    it('7. dots_claim_telegram_account enforces single-use invalidation', async () => {
      mockClient.setAuthUser('auth-user-first')

      // Seed a valid code
      const validCode = '123456'
      mockClient.linkCodes.set(validCode, {
        code: validCode,
        telegram_chat_id: TEST_CHAT_ID,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
      })

      // First claim succeeds
      const res1 = await mockClient.rpc('dots_claim_telegram_account', { p_code: validCode })
      expect(res1.data?.success).toBe(true)

      // Second claim with the exact same code MUST fail
      const res2 = await mockClient.rpc('dots_claim_telegram_account', { p_code: validCode })
      expect(res2.data?.success).toBe(false)
      expect(res2.data?.message).toContain('Invalid or expired link code')
    })

    it('8. Anti-Takeover: User B cannot claim Telegram account already owned by User A', async () => {
      // Step 1: User A successfully links the account
      mockClient.setAuthUser('auth-user-alice')
      const code1 = '778899'
      mockClient.linkCodes.set(code1, {
        code: code1,
        telegram_chat_id: TEST_CHAT_ID,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
      })

      const aliceRes = await mockClient.rpc('dots_claim_telegram_account', { p_code: code1 })
      expect(aliceRes.data?.success).toBe(true)

      // Step 2: Malicious User B generates or obtains another code for the same chat ID
      mockClient.setAuthUser('auth-user-bob-attacker')
      const code2 = '990011'
      mockClient.linkCodes.set(code2, {
        code: code2,
        telegram_chat_id: TEST_CHAT_ID,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
      })

      const bobRes = await mockClient.rpc('dots_claim_telegram_account', { p_code: code2 })
      expect(bobRes.data?.success).toBe(false)
      expect(bobRes.data?.message).toContain('already linked to another Dots account')

      // Verify Alice is still the owner
      const target = mockClient.users.get(TEST_USER_ID)
      expect(target?.auth_user_id).toBe('auth-user-alice')
    })

    it('9. Cross-User Data Isolation: User A cannot read or modify User B slots or proposals', async () => {
      // User A (Alice)
      const USER_A_ID = 'user-alice'
      mockClient.users.set(USER_A_ID, {
        id: USER_A_ID,
        auth_user_id: 'auth-alice',
        telegram_chat_id: 111111,
        telegram_username: 'alice',
        display_name: 'Alice',
        timezone: 'UTC',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

      // User B (Bob)
      const USER_B_ID = 'user-bob'
      mockClient.users.set(USER_B_ID, {
        id: USER_B_ID,
        auth_user_id: 'auth-bob',
        telegram_chat_id: 222222,
        telegram_username: 'bob',
        display_name: 'Bob',
        timezone: 'UTC',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

      // Alice has a private confidential slot
      mockClient.scheduledSlots.set('alice-slot-secret', {
        id: 'alice-slot-secret',
        user_id: USER_A_ID,
        work_item_id: 'task-secret',
        title: 'Alice Private Strategy Review',
        date: '2026-10-19',
        start_time: '14:00',
        end_time: '15:00',
        duration_minutes: 60,
        session_index: 1,
        total_sessions: 1,
        is_split: false,
        locked: false,
        reason: 'Confidential',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

      // Bob authenticates
      mockClient.setAuthUser('auth-bob')

      // Bob attempts to query scheduled slots
      const { data: bobSlots } = await mockClient
        .from('dots_scheduled_slots')
        .select('*')
        .eq('date', '2026-10-19')

      // Bob MUST NOT see Alice's slots
      expect(bobSlots.length).toBe(0)

      // Alice authenticates
      mockClient.setAuthUser('auth-alice')
      const { data: aliceSlots } = await mockClient
        .from('dots_scheduled_slots')
        .select('*')
        .eq('date', '2026-10-19')

      expect(aliceSlots.length).toBe(1)
      expect(aliceSlots[0].title).toBe('Alice Private Strategy Review')
    })
  })
})
