import { createTimeSession } from './session-service'
import { getSettings } from './settings-service'
import { showDesktopNotification } from './notification-service'
import type { TimeSessionItem } from './session-service'

export type TimerMode = 'countdown' | 'stopwatch' | 'pomodoro' | 'custom'
export type TimerStatus = 'idle' | 'running' | 'paused'

export type ActiveTimerState = {
  mode: TimerMode
  status: TimerStatus
  workItemId: string | null
  workItemTitle: string | null
  scheduledItemId: string | null
  projectId: string | null
  goalId: string | null
  areaId: string | null
  targetDurationMinutes: number
  startTimeMs: number | null
  pausedMs: number
  lastPauseStartMs: number | null
  interruptionsCount: number
  notes: string | null
}

export type TimerInfoResponse = {
  activeState: ActiveTimerState
  elapsedSeconds: number
  remainingSeconds: number
  isOverTarget: boolean
}

let timerState: ActiveTimerState = {
  mode: 'stopwatch',
  status: 'idle',
  workItemId: null,
  workItemTitle: null,
  scheduledItemId: null,
  projectId: null,
  goalId: null,
  areaId: null,
  targetDurationMinutes: 30,
  startTimeMs: null,
  pausedMs: 0,
  lastPauseStartMs: null,
  interruptionsCount: 0,
  notes: null
}

export function getTimerState(): TimerInfoResponse {
  const now = Date.now()
  let elapsedMs = 0

  if (timerState.status === 'running' && timerState.startTimeMs) {
    elapsedMs = Math.max(0, now - timerState.startTimeMs - timerState.pausedMs)
  } else if (timerState.status === 'paused' && timerState.startTimeMs && timerState.lastPauseStartMs) {
    const pauseDur = now - timerState.lastPauseStartMs
    elapsedMs = Math.max(0, timerState.lastPauseStartMs - timerState.startTimeMs - timerState.pausedMs)
  }

  const elapsedSeconds = Math.floor(elapsedMs / 1000)
  const targetSeconds = timerState.targetDurationMinutes * 60
  const remainingSeconds = Math.max(0, targetSeconds - elapsedSeconds)
  const isOverTarget = elapsedSeconds > targetSeconds && targetSeconds > 0

  return {
    activeState: { ...timerState },
    elapsedSeconds,
    remainingSeconds,
    isOverTarget
  }
}

export function startTimer(input: {
  mode?: TimerMode
  workItemId?: string | null
  workItemTitle?: string | null
  scheduledItemId?: string | null
  projectId?: string | null
  goalId?: string | null
  areaId?: string | null
  targetDurationMinutes?: number
  notes?: string | null
}): TimerInfoResponse {
  const now = Date.now()
  timerState = {
    mode: input.mode ?? 'stopwatch',
    status: 'running',
    workItemId: input.workItemId ?? null,
    workItemTitle: input.workItemTitle ?? null,
    scheduledItemId: input.scheduledItemId ?? null,
    projectId: input.projectId ?? null,
    goalId: input.goalId ?? null,
    areaId: input.areaId ?? null,
    targetDurationMinutes: input.targetDurationMinutes ?? 30,
    startTimeMs: now,
    pausedMs: 0,
    lastPauseStartMs: null,
    interruptionsCount: 0,
    notes: input.notes ?? null
  }

  return getTimerState()
}

export function pauseTimer(): TimerInfoResponse {
  if (timerState.status === 'running') {
    timerState.status = 'paused'
    timerState.lastPauseStartMs = Date.now()
    timerState.interruptionsCount += 1
  }
  return getTimerState()
}

export function resumeTimer(): TimerInfoResponse {
  if (timerState.status === 'paused' && timerState.lastPauseStartMs) {
    const pauseDur = Date.now() - timerState.lastPauseStartMs
    timerState.pausedMs += pauseDur
    timerState.status = 'running'
    timerState.lastPauseStartMs = null
  }
  return getTimerState()
}

export function stopTimer(): TimerInfoResponse {
  timerState = {
    mode: 'stopwatch',
    status: 'idle',
    workItemId: null,
    workItemTitle: null,
    scheduledItemId: null,
    projectId: null,
    goalId: null,
    areaId: null,
    targetDurationMinutes: 30,
    startTimeMs: null,
    pausedMs: 0,
    lastPauseStartMs: null,
    interruptionsCount: 0,
    notes: null
  }
  return getTimerState()
}

export function addTimerTime(minutes: number): TimerInfoResponse {
  timerState.targetDurationMinutes += minutes
  return getTimerState()
}

export function completeTimer(): { session: TimeSessionItem; timerInfo: TimerInfoResponse } {
  const now = Date.now()
  const info = getTimerState()

  const startMs = timerState.startTimeMs ?? now
  const endMs = now
  const pausedMins = Math.floor(timerState.pausedMs / 60000)
  const durationMins = Math.max(1, Math.floor(info.elapsedSeconds / 60))

  const session = createTimeSession({
    workItemId: timerState.workItemId,
    scheduledItemId: timerState.scheduledItemId,
    projectId: timerState.projectId,
    goalId: timerState.goalId,
    areaId: timerState.areaId,
    startTime: startMs,
    endTime: endMs,
    durationMinutes: durationMins + pausedMins,
    pausedDurationMinutes: pausedMins,
    interruptionsCount: timerState.interruptionsCount,
    mode: timerState.mode,
    notes: timerState.notes
  })

  // Desktop Notification
  const setts = getSettings()
  if (setts.notificationsEnabled !== false) {
    const taskName = timerState.workItemTitle || 'Focus Session'
    showDesktopNotification(
      'Timer Completed',
      `Finished "${taskName}" session (${durationMins}m completed).`
    )
  }

  // Reset timer
  stopTimer()

  return { session, timerInfo: getTimerState() }
}
