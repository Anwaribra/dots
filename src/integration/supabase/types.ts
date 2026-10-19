export interface DotsUserRow {
  id: string
  auth_user_id?: string | null
  telegram_chat_id: number
  telegram_username?: string | null
  display_name: string
  timezone: string
  created_at: string
  updated_at: string
}

export interface DotsWorkItemRow {
  id: string
  user_id: string
  title: string
  estimated_minutes: number
  actual_minutes: number
  priority: 'critical' | 'high' | 'medium' | 'low'
  status: 'todo' | 'in_progress' | 'done' | 'cancelled'
  energy_level?: 'low' | 'medium' | 'high' | null
  deadline?: string | null
  preferred_date?: string | null
  preferred_start_time?: string | null
  flexibility: 'fixed' | 'semi_flexible' | 'flexible'
  created_at: string
  updated_at: string
}

export interface DotsFixedEventRow {
  id: string
  user_id: string
  title: string
  date: string
  start_time: string
  end_time: string
  duration_minutes: number
  locked: boolean
  flexibility: 'fixed' | 'semi_flexible' | 'flexible'
  created_at: string
}

export interface DotsAvailabilityRuleRow {
  id: string
  user_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
  planning_capacity_percentage: number
  buffer_percentage: number
  created_at: string
}

export interface DotsScheduledSlotRow {
  id: string
  user_id: string
  work_item_id?: string | null
  title: string
  date: string
  start_time: string
  end_time: string
  duration_minutes: number
  session_index: number
  total_sessions: number
  is_split: boolean
  locked: boolean
  reason?: string | null
  created_at: string
  updated_at: string
}

export interface DotsScheduleProposalRow {
  id: string
  user_id: string
  target_date: string
  trigger_type: string
  status: 'pending' | 'approved' | 'rejected' | 'stale'
  base_schedule_snapshot: any[]
  proposed_schedule: any[]
  changes: any[]
  explanations: any[]
  human_summary: string
  is_overloaded: boolean
  overload_minutes: number
  created_at: string
  resolved_at?: string | null
}

export interface DotsWebhookUpdateRow {
  update_id: number
  chat_id: number
  processed_at: string
  action_type?: string | null
  status: string
}

export interface RpcProposalResult {
  success: boolean
  status: 'approved' | 'rejected' | 'stale' | 'unauthorized' | 'not_found'
  message: string
  targetDate?: string
}
