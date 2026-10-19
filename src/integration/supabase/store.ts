import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  ScheduleItem,
  WorkItemCandidate,
  AvailabilitySlot,
  FixedEventItem,
  CapacitySettings,
  ScheduleProposal
} from '../../engine/types'
import { DEFAULT_CAPACITY_SETTINGS } from '../../engine/capacity'
import type {
  DotsUserRow,
  DotsWorkItemRow,
  DotsFixedEventRow,
  DotsScheduledSlotRow,
  DotsAvailabilityRuleRow,
  DotsScheduleProposalRow,
  RpcProposalResult
} from './types'

export class SupabaseScheduleRepository {
  constructor(private client: SupabaseClient) {}

  /** Resolves or creates a user by Telegram chat ID */
  async getOrCreateTelegramUser(
    chatId: number,
    username?: string,
    displayName?: string
  ): Promise<DotsUserRow> {
    const { data: existing, error: findError } = await this.client
      .from('dots_users')
      .select('*')
      .eq('telegram_chat_id', chatId)
      .maybeSingle()

    if (findError) {
      throw new Error(`Failed to query user by chat_id ${chatId}: ${findError.message}`)
    }

    if (existing) {
      return existing as DotsUserRow
    }

    // Auto-create user
    const { data: created, error: insertError } = await this.client
      .from('dots_users')
      .insert({
        telegram_chat_id: chatId,
        telegram_username: username || null,
        display_name: displayName || username || 'Telegram User',
        timezone: 'UTC'
      })
      .select()
      .single()

    if (insertError) {
      throw new Error(`Failed to create user for chat_id ${chatId}: ${insertError.message}`)
    }

    // Initialize default Monday-Sunday availability rules
    const defaultRules = []
    for (let day = 0; day <= 6; day++) {
      defaultRules.push({
        user_id: created.id,
        day_of_week: day,
        start_time: '09:00',
        end_time: '17:00',
        is_active: day >= 1 && day <= 5, // Active Mon-Fri by default
        planning_capacity_percentage: 75,
        buffer_percentage: 20
      })
    }

    await this.client.from('dots_availability_rules').insert(defaultRules)

    return created as DotsUserRow
  }

  /** Checks if a webhook update was already processed (strict idempotency) */
  async isUpdateProcessed(updateId: number): Promise<boolean> {
    const { data, error } = await this.client
      .from('dots_webhook_updates')
      .select('update_id')
      .eq('update_id', updateId)
      .maybeSingle()

    if (error) {
      return false
    }

    return Boolean(data)
  }

  /** Records processed webhook update */
  async recordWebhookUpdate(
    updateId: number,
    chatId: number,
    actionType = 'message'
  ): Promise<void> {
    await this.client.from('dots_webhook_updates').insert({
      update_id: updateId,
      chat_id: chatId,
      action_type: actionType,
      status: 'processed'
    })
  }

  /** Fetches current persisted schedule for a given date */
  async getScheduleForDate(userId: string, date: string): Promise<ScheduleItem[]> {
    const { data, error } = await this.client
      .from('dots_scheduled_slots')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('start_time', { ascending: true })

    if (error) {
      throw new Error(`Failed to load schedule for ${date}: ${error.message}`)
    }

    return (data as DotsScheduledSlotRow[]).map((row) => ({
      id: row.id,
      workItemId: row.work_item_id || row.id,
      title: row.title,
      date: row.date,
      startTime: row.start_time,
      endTime: row.end_time,
      durationMinutes: row.duration_minutes,
      sessionIndex: row.session_index,
      totalSessions: row.total_sessions,
      isSplit: row.is_split,
      locked: row.locked,
      reason: row.reason || ''
    }))
  }

  /** Fetches candidate work items for planning */
  async getCandidateWorkItems(userId: string): Promise<WorkItemCandidate[]> {
    const { data, error } = await this.client
      .from('dots_work_items')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'done')
      .neq('status', 'cancelled')

    if (error) {
      throw new Error(`Failed to load work items: ${error.message}`)
    }

    return (data as DotsWorkItemRow[]).map((row) => ({
      id: row.id,
      title: row.title,
      estimatedMinutes: row.estimated_minutes,
      actualMinutes: row.actual_minutes,
      priority: row.priority,
      status: row.status,
      energyLevel: row.energy_level,
      deadline: row.deadline,
      preferredDate: row.preferred_date,
      preferredStartTime: row.preferred_start_time,
      flexibility: row.flexibility,
      orderIndex: 0
    }))
  }

  /** Adds a newly captured work item */
  async addWorkItem(userId: string, task: WorkItemCandidate): Promise<void> {
    const { error } = await this.client.from('dots_work_items').upsert({
      id: task.id,
      user_id: userId,
      title: task.title,
      estimated_minutes: task.estimatedMinutes,
      actual_minutes: task.actualMinutes || 0,
      priority: task.priority,
      status: task.status || 'todo',
      energy_level: task.energyLevel || null,
      deadline: task.deadline || null,
      preferred_date: task.preferredDate || null,
      preferred_start_time: task.preferredStartTime || null,
      flexibility: task.flexibility || 'flexible'
    })

    if (error) {
      throw new Error(`Failed to save task: ${error.message}`)
    }
  }

  /** Deletes a work item (e.g. rollback if proposal generation fails) */
  async deleteWorkItem(userId: string, taskId: string): Promise<void> {
    const { error } = await this.client
      .from('dots_work_items')
      .delete()
      .eq('user_id', userId)
      .eq('id', taskId)

    if (error) {
      throw new Error(`Failed to delete work item ${taskId}: ${error.message}`)
    }
  }

  /** Fetches availability slots and capacity settings for date */
  async getAvailabilityAndCapacity(
    userId: string,
    date: string
  ): Promise<{ availability: AvailabilitySlot[]; capacitySettings: CapacitySettings }> {
    const dObj = new Date(date)
    const dayOfWeek = isNaN(dObj.getUTCDay()) ? 0 : dObj.getUTCDay()

    const { data, error } = await this.client
      .from('dots_availability_rules')
      .select('*')
      .eq('user_id', userId)
      .eq('day_of_week', dayOfWeek)
      .maybeSingle()

    if (error || !data) {
      // Default fallback
      return {
        availability: [
          { date, startTime: '09:00', endTime: '17:00', availableMinutes: 480 }
        ],
        capacitySettings: { ...DEFAULT_CAPACITY_SETTINGS }
      }
    }

    const rule = data as DotsAvailabilityRuleRow
    const [sh, sm] = rule.start_time.split(':').map(Number)
    const [eh, em] = rule.end_time.split(':').map(Number)
    const availableMinutes = rule.is_active ? Math.max(0, (eh * 60 + em) - (sh * 60 + sm)) : 0

    return {
      availability: [
        {
          date,
          startTime: rule.start_time,
          endTime: rule.end_time,
          availableMinutes
        }
      ],
      capacitySettings: {
        planningCapacityPercentage: rule.planning_capacity_percentage,
        bufferPercentage: rule.buffer_percentage
      }
    }
  }

  /** Fetches fixed events for date */
  async getFixedEvents(userId: string, date: string): Promise<FixedEventItem[]> {
    const { data, error } = await this.client
      .from('dots_fixed_events')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)

    if (error || !data) return []

    return (data as DotsFixedEventRow[]).map((row) => ({
      id: row.id,
      title: row.title,
      startTime: row.start_time,
      endTime: row.end_time,
      date: row.date,
      durationMinutes: row.duration_minutes,
      locked: row.locked,
      flexibility: row.flexibility
    }))
  }

  /** Persists a newly generated ScheduleProposal */
  async saveProposal(userId: string, proposal: ScheduleProposal): Promise<void> {
    const { error } = await this.client.from('dots_schedule_proposals').insert({
      id: proposal.id,
      user_id: userId,
      target_date: proposal.targetDate,
      trigger_type: proposal.trigger,
      status: proposal.status,
      base_schedule_snapshot: proposal.baseScheduleSnapshot,
      proposed_schedule: proposal.proposedSchedule,
      changes: proposal.changes,
      explanations: proposal.explanations,
      human_summary: proposal.humanSummary,
      is_overloaded: proposal.isOverloaded,
      overload_minutes: proposal.overloadMinutes
    })

    if (error) {
      throw new Error(`Failed to persist proposal ${proposal.id}: ${error.message}`)
    }
  }

  /** Approves proposal atomically using database RPC */
  async approveProposalAtomic(
    proposalId: string,
    chatId: number
  ): Promise<RpcProposalResult> {
    const { data, error } = await this.client.rpc('dots_approve_proposal', {
      p_proposal_id: proposalId,
      p_chat_id: chatId
    })

    if (error) {
      throw new Error(`RPC dots_approve_proposal failed: ${error.message}`)
    }

    return data as RpcProposalResult
  }

  /** Rejects proposal atomically using database RPC */
  async rejectProposalAtomic(
    proposalId: string,
    chatId: number,
    reason?: string
  ): Promise<RpcProposalResult> {
    const { data, error } = await this.client.rpc('dots_reject_proposal', {
      p_proposal_id: proposalId,
      p_chat_id: chatId,
      p_reason: reason || 'Rejected by user'
    })

    if (error) {
      throw new Error(`RPC dots_reject_proposal failed: ${error.message}`)
    }

    return data as RpcProposalResult
  }
}
