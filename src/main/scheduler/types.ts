export type DateRange = {
  startDate: string // YYYY-MM-DD
  endDate: string   // YYYY-MM-DD
}

export type AvailabilitySlot = {
  date: string      // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string   // HH:mm
  availableMinutes: number
}

export type FixedEventItem = {
  id: string
  title: string
  startTime: string // YYYY-MM-DD HH:mm or HH:mm
  endTime: string   // YYYY-MM-DD HH:mm or HH:mm
  date: string      // YYYY-MM-DD
  durationMinutes: number
  locked: boolean
  flexibility: 'fixed' | 'semi_flexible' | 'flexible'
}

export type TimeBudgetItem = {
  id: string
  name: string
  allocationMode: 'minimum' | 'target' | 'maximum' | 'range'
  protection: 'flexible' | 'protected' | 'locked'
  minimumMinutes: number
  targetMinutes: number
  maximumMinutes: number
  daysOfWeek: number[]
  areaId?: string | null
  goalId?: string | null
  projectId?: string | null
  workItemTypeId?: string | null
}

export type RoutineItem = {
  id: string
  name: string
  targetDuration: number
  recurrenceRule: string
  preferredTime?: string | null
  flexibility: 'fixed' | 'semi_flexible' | 'flexible'
  protected: boolean
}

export type WorkItemCandidate = {
  id: string
  title: string
  projectId?: string | null
  goalId?: string | null
  areaId?: string | null
  workItemTypeId?: string | null
  priority: 'critical' | 'high' | 'medium' | 'low'
  status: string
  estimatedMinutes: number
  actualMinutes: number
  deadline?: string | null
  preferredDate?: string | null
  preferredStartTime?: string | null
  preferredEndTime?: string | null
  energyLevel?: 'low' | 'medium' | 'high' | null
  flexibility: 'fixed' | 'semi_flexible' | 'flexible'
  orderIndex: number
}

export type DependencyEdge = {
  id: string
  predecessorId: string
  successorId: string
  predecessorType?: string
  successorType?: string
  dependencyType?: string
}

export type PlanningPreferences = {
  minSessionMinutes: number  // default 15
  maxSessionMinutes: number  // default 90
  preferredFocusWindow?: 'morning' | 'afternoon' | 'evening' | 'anytime'
}

export type CapacitySettings = {
  planningCapacityPercentage: number // e.g. 75
  bufferPercentage: number            // e.g. 20
}

export type ExistingScheduleItem = {
  id: string
  workItemId: string
  title?: string
  date: string
  startTime: string
  endTime: string
  durationMinutes: number
  locked?: boolean
}

export type PlanningInput = {
  nowDate: string // YYYY-MM-DD (passed in for 100% determinism)
  dateRange: DateRange
  availability: AvailabilitySlot[]
  fixedEvents: FixedEventItem[]
  timeBudgets: TimeBudgetItem[]
  routines: RoutineItem[]
  workItems: WorkItemCandidate[]
  dependencies: DependencyEdge[]
  preferences: PlanningPreferences
  capacitySettings: CapacitySettings
  existingSchedule?: ExistingScheduleItem[]
}

export type ScheduleItem = {
  id: string
  workItemId: string
  title: string
  date: string        // YYYY-MM-DD
  startTime: string   // HH:mm
  endTime: string     // HH:mm
  durationMinutes: number
  sessionIndex: number
  totalSessions: number
  isSplit: boolean
  locked: boolean
  reason: string
}

export type UnscheduledItem = {
  workItemId: string
  title: string
  remainingMinutes: number
  reason: string
}

export type MovedItem = {
  workItemId: string
  title: string
  originalDate?: string | null
  newDate: string
  reason: string
}

export type PlanningWarning = {
  code: string
  message: string
  entityId?: string
}

export type PlanningExplanation = {
  entityId: string
  entityTitle: string
  action: 'scheduled' | 'moved' | 'unscheduled' | 'split' | 'displaced'
  date?: string
  reason: string
}

export type DayCapacityInfo = {
  date: string
  dayOfWeek: number
  availableMinutes: number
  usableMinutes: number
  bufferMinutes: number
  fixedMinutes: number
  budgetMinutes: number
  scheduledMinutes: number
  netRemainingMinutes: number
  isOverloaded: boolean
}

export type PlanningResult = {
  scheduledItems: ScheduleItem[]
  unscheduledItems: UnscheduledItem[]
  movedItems: MovedItem[]
  warnings: PlanningWarning[]
  explanations: PlanningExplanation[]
  dayCapacities: Record<string, DayCapacityInfo>
}

export type ReplanningTriggerType =
  | 'urgent_work_added'
  | 'task_overrun'
  | 'task_finished_early'
  | 'skipped_item'
  | 'availability_changed'
  | 'deadline_changed'
  | 'fixed_event_added'
  | 'manual_replan'

export type SkippedItemResolution =
  | 'move_later_today'
  | 'move_tomorrow'
  | 'next_free_slot'
  | 'skip'
  | 'cancel'

export type ReplanningChangeType =
  | 'inserted'
  | 'moved'
  | 'split'
  | 'displaced'
  | 'cancelled'
  | 'skipped'
  | 'preserved'
  | 'extended'
  | 'shortened'

export type ReplanningChange = {
  entityId: string
  entityTitle: string
  changeType: ReplanningChangeType
  originalTime?: string | null
  newTime?: string | null
  reason: string
}

export type ReplanningInput = {
  nowDate: string
  currentTime: string
  existingSchedule: ScheduleItem[]
  completedItemIds?: string[]
  activeWorkItemId?: string | null
  candidateWorkItems: WorkItemCandidate[]
  dependencies: DependencyEdge[]
  availability: AvailabilitySlot[]
  fixedEvents: FixedEventItem[]
  timeBudgets: TimeBudgetItem[]
  routines: RoutineItem[]
  preferences: PlanningPreferences
  capacitySettings: CapacitySettings
  trigger?: {
    type: ReplanningTriggerType
    details?: {
      overrunMinutes?: number
      savedMinutes?: number
      skippedWorkItemId?: string
      skippedResolution?: SkippedItemResolution
      urgentItem?: WorkItemCandidate
    }
  }
}

export type ReplanningResult = {
  updatedSchedule: ScheduleItem[]
  changes: ReplanningChange[]
  explanations: PlanningExplanation[]
  warnings: PlanningWarning[]
  dayCapacities: Record<string, DayCapacityInfo>
  overloadSuggestions: string[]
  isOverloaded: boolean
  overloadMinutes: number
}

export type ReplanningHistoryItem = {
  id: string
  targetDate: string
  timestamp: number
  trigger: string
  summary: string
  changes: ReplanningChange[]
  createdAt: number
  updatedAt: number
}

export type PlanVersionItem = {
  id: string
  planDate: string
  versionName: string
  versionIndex: number
  scheduleSnapshot: ScheduleItem[]
  trigger?: string | null
  createdAt: number
  updatedAt: number
}

