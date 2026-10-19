export interface DotsUser {
  id: string
  auth_user_id: string | null
  telegram_chat_id: number | null
  telegram_username: string | null
  display_name: string
  timezone: string
  created_at: string
}

export interface DotsScheduledSlot {
  id: string
  user_id: string
  work_item_id: string | null
  title: string
  date: string
  start_time: string
  end_time: string
  duration_minutes: number
  session_index: number
  total_sessions: number
  is_split: boolean
  locked: boolean
  completed?: boolean
  reason: string | null
  created_at: string
  updated_at: string
}

export interface DotsFixedEvent {
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

export interface DotsScheduleProposal {
  id: string
  user_id: string
  target_date: string
  trigger_type: string
  status: 'pending' | 'approved' | 'rejected' | 'stale'
  base_schedule_snapshot: Array<{
    id: string
    startTime?: string
    start_time?: string
    endTime?: string
    end_time?: string
    title?: string
    durationMinutes?: number
    duration_minutes?: number
  }>
  proposed_schedule: Array<{
    id: string
    workItemId?: string
    work_item_id?: string
    title: string
    date: string
    startTime?: string
    start_time?: string
    endTime?: string
    end_time?: string
    durationMinutes?: number
    duration_minutes?: number
    locked?: boolean
    reason?: string
  }>
  human_summary: string
  is_overloaded?: boolean
  overload_minutes?: number
  created_at: string
  resolved_at?: string | null
}
