import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Lock,
  Pause,
  Play,
  Plus,
  Square,
  SkipForward,
  Unlock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RotateCcw,
  History,
  FastForward
} from 'lucide-react'
import type { ReplanningResult, ScheduleItem, SkippedItemResolution } from '../../../main/scheduler/types'
import type { DayCapacityResult } from '../../../shared/capacity'
import type { Area, Project, WorkItem } from '../../../shared/entities'
import { ReplanPreviewModal } from '../components/ReplanPreviewModal'
import { PlanHistoryModal } from '../components/PlanHistoryModal'


function getTodayString(d = new Date()): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  return `${m}m`
}

function formatSeconds(secs: number): string {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

type TimerStatus = 'idle' | 'running' | 'paused'

export function TodayPage(): JSX.Element {
  const { t } = useTranslation()
  const planner = window.planner

  const [selectedDate, setSelectedDate] = useState<string>(getTodayString())
  const [scheduledItems, setScheduledItems] = useState<ScheduleItem[]>([])
  const [workItems, setWorkItems] = useState<WorkItem[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [capacity, setCapacity] = useState<DayCapacityResult | null>(null)

  const [timerModalOpen, setTimerModalOpen] = useState(false)
  const [activeItemForTimer, setActiveItemForTimer] = useState<ScheduleItem | null>(null)

  // Timer state
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('idle')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [isOverTarget, setIsOverTarget] = useState(false)
  const timerPollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refreshTimerState = useCallback(async () => {
    if (!planner) return
    try {
      const info = await planner.timer.getState()
      setTimerStatus(info.activeState.status as TimerStatus)
      setElapsedSeconds(info.elapsedSeconds)
      setRemainingSeconds(info.remainingSeconds)
      setIsOverTarget(info.isOverTarget)
    } catch { /* ignore */ }
  }, [planner])

  // Poll timer state every second when modal is open
  useEffect(() => {
    if (timerModalOpen) {
      refreshTimerState()
      timerPollRef.current = setInterval(refreshTimerState, 1000)
    } else {
      if (timerPollRef.current) clearInterval(timerPollRef.current)
    }
    return () => { if (timerPollRef.current) clearInterval(timerPollRef.current) }
  }, [timerModalOpen, refreshTimerState])

  useEffect(() => {
    loadTodayData()
  }, [selectedDate])

  const loadTodayData = async (): Promise<void> => {
    if (!planner) return
    const [sList, wList, pList, aList, capRes] = await Promise.all([
      planner.planning.getSchedule(selectedDate, selectedDate),
      planner.workItems.list(),
      planner.projects.list(),
      planner.areas.list(),
      planner.capacity.calculate(selectedDate)
    ])
    setScheduledItems(sList)
    setWorkItems(wList)
    setProjects(pList)
    setAreas(aList)
    setCapacity(capRes)
  }

  const navigateDate = (days: number): void => {
    const curr = new Date(selectedDate)
    curr.setDate(curr.getDate() + days)
    setSelectedDate(getTodayString(curr))
  }

  // Progress calculations
  const plannedMinutes = scheduledItems.reduce((acc, item) => acc + item.durationMinutes, 0)
  const completedItems = scheduledItems.filter((item) => {
    const wi = workItems.find((w) => w.id === item.workItemId)
    return wi && (wi.status === 'done' || wi.status === 'completed')
  })
  const actualMinutes = completedItems.reduce((acc, item) => {
    const wi = workItems.find((w) => w.id === item.workItemId)
    return acc + (wi ? wi.actualMinutes || item.durationMinutes : item.durationMinutes)
  }, 0)

  const remainingMinutes = Math.max(0, plannedMinutes - actualMinutes)
  const completionPercentage = plannedMinutes > 0 ? Math.round((actualMinutes / plannedMinutes) * 100) : 0

  // Current Item: first uncompleted item or item currently in time slot
  const currentItem = scheduledItems.find((item) => {
    const wi = workItems.find((w) => w.id === item.workItemId)
    return !wi || (wi.status !== 'done' && wi.status !== 'completed')
  }) || scheduledItems[0]

  const currentWorkItem = currentItem ? workItems.find((w) => w.id === currentItem.workItemId) : null
  const currentProject = currentWorkItem ? projects.find((p) => p.id === currentWorkItem.projectId) : null
  const currentArea = currentWorkItem ? areas.find((a) => a.id === currentWorkItem.areaId) : null

  // Analytical status sentence with zero guilt wording
  const usableMinutes = capacity?.usableMinutes || 0
  let analyticalStatus = ''
  if (plannedMinutes === 0) {
    analyticalStatus = 'No scheduled work items for this day.'
  } else if (plannedMinutes > usableMinutes) {
    const diff = plannedMinutes - usableMinutes
    analyticalStatus = `You are ${formatMinutes(diff)} behind usable capacity plan for ${selectedDate}.`
  } else if (actualMinutes >= plannedMinutes) {
    analyticalStatus = 'All planned tasks for today have been completed.'
  } else {
    analyticalStatus = `On track: ${formatMinutes(remainingMinutes)} remaining out of ${formatMinutes(plannedMinutes)} planned.`
  }

  const handleCompleteItem = async (item: ScheduleItem): Promise<void> => {
    if (!planner || !item.workItemId) return
    const wi = workItems.find((w) => w.id === item.workItemId)
    if (wi) {
      await planner.workItems.update({
        id: wi.id,
        status: 'done',
        actualMinutes: Math.max(wi.actualMinutes, item.durationMinutes)
      })
      loadTodayData()
    }
  }

  const handleToggleLock = async (item: ScheduleItem): Promise<void> => {
    if (!planner) return
    await planner.planning.updateScheduleItem({
      id: item.id,
      locked: !item.locked
    })
    loadTodayData()
  }

  // Replanning state
  const [replanModalOpen, setReplanModalOpen] = useState(false)
  const [replanResult, setReplanResult] = useState<ReplanningResult | null>(null)
  const [replanLoading, setReplanLoading] = useState(false)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [skipModalItem, setSkipModalItem] = useState<ScheduleItem | null>(null)

  const handleSkipItem = async (item: ScheduleItem): Promise<void> => {
    setSkipModalItem(item)
  }

  const handleTriggerReplan = async (trigger?: any): Promise<void> => {
    if (!planner) return
    setReplanLoading(true)
    try {
      const activeWorkItemId = currentItem && currentItem.workItemId ? currentItem.workItemId : null
      const res = await planner.replanning.preview({
        targetDate: selectedDate,
        activeWorkItemId,
        trigger
      })
      setReplanResult(res)
      setReplanModalOpen(true)
    } finally {
      setReplanLoading(false)
    }
  }

  const handleApproveReplan = async (): Promise<void> => {
    if (!planner || !replanResult) return
    setReplanLoading(true)
    try {
      await planner.replanning.apply({
        targetDate: selectedDate,
        updatedSchedule: replanResult.updatedSchedule,
        changes: replanResult.changes,
        trigger: 'replan_my_day',
        summary: `Replanned day with ${replanResult.changes.length} change(s).`
      })
      setReplanModalOpen(false)
      setReplanResult(null)
      await loadTodayData()
    } finally {
      setReplanLoading(false)
    }
  }

  const handleUndoPlan = async (): Promise<void> => {
    if (!planner) return
    try {
      const res = await planner.replanning.undo(selectedDate)
      if (res.success) {
        await loadTodayData()
      }
    } catch { /* ignore */ }
  }

  const handleSkipWithResolution = async (
    item: ScheduleItem,
    resolution: SkippedItemResolution
  ): Promise<void> => {
    setSkipModalItem(null)
    if (!planner) return

    if (resolution === 'cancel') {
      return
    }

    if (resolution === 'skip') {
      await planner.planning.deleteScheduleItem(item.id)
      await loadTodayData()
      return
    }

    // Trigger replan preview with the skipped resolution
    await handleTriggerReplan({
      type: 'skipped_item',
      details: {
        skippedWorkItemId: item.workItemId,
        skippedResolution: resolution
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Date Bar Navigator */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center space-x-3 space-x-reverse">
          <Calendar className="text-indigo-600 dark:text-indigo-400" size={22} />
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {selectedDate === getTodayString() ? t('today') : selectedDate}
            </h2>
            <p className="text-xs text-slate-500">{analyticalStatus}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center space-x-2 space-x-reverse">
          <button
            onClick={() => handleTriggerReplan()}
            className="flex items-center space-x-1.5 space-x-reverse rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <Sparkles size={14} />
            <span>{t('replanMyDay')}</span>
          </button>
          <button
            onClick={handleUndoPlan}
            className="flex items-center space-x-1.5 space-x-reverse rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            title={t('undoPlan')}
          >
            <RotateCcw size={14} />
            <span>{t('undoPlan')}</span>
          </button>
          <button
            onClick={() => setHistoryModalOpen(true)}
            className="flex items-center space-x-1.5 space-x-reverse rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            title={t('planHistory')}
          >
            <History size={14} />
            <span>{t('planHistory')}</span>
          </button>

          <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />

          <button
            onClick={() => navigateDate(-1)}
            className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setSelectedDate(getTodayString())}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {t('today')}
          </button>
          <button
            onClick={() => navigateDate(1)}
            className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Today Progress Overview Widgets */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="block text-xs font-semibold text-slate-500">{t('planned')}</span>
          <strong className="mt-1 block text-xl font-bold text-slate-900 dark:text-slate-100">
            {formatMinutes(plannedMinutes)}
          </strong>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="block text-xs font-semibold text-slate-500">{t('actual')}</span>
          <strong className="mt-1 block text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatMinutes(actualMinutes)}
          </strong>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="block text-xs font-semibold text-slate-500">{t('remaining')}</span>
          <strong className="mt-1 block text-xl font-bold text-amber-600 dark:text-amber-400">
            {formatMinutes(remainingMinutes)}
          </strong>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="block text-xs font-semibold text-slate-500">{t('completion')} %</span>
          <strong className="mt-1 block text-xl font-bold text-indigo-600 dark:text-indigo-400">
            {completionPercentage}%
          </strong>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="block text-xs font-semibold text-slate-500">{t('usableCapacity')}</span>
          <strong className="mt-1 block text-xl font-bold text-slate-900 dark:text-slate-100">
            {formatMinutes(capacity?.usableMinutes || 0)}
          </strong>
        </div>
      </div>

      {/* Current Item Card */}
      {currentItem ? (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-6 shadow-sm dark:border-indigo-900/50 dark:bg-indigo-950/20">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
              {t('currentItem')}
            </span>
            <span className="flex items-center space-x-1 space-x-reverse text-xs font-medium text-slate-500">
              <Clock size={14} />
              <span>
                {currentItem.startTime} - {currentItem.endTime} ({formatMinutes(currentItem.durationMinutes)})
              </span>
            </span>
          </div>

          <h3 className="mt-3 text-xl font-bold text-slate-900 dark:text-slate-100">
            {currentItem.title}
          </h3>

          <div className="mt-2 flex items-center space-x-4 space-x-reverse text-xs text-slate-600 dark:text-slate-400">
            {currentProject && (
              <span>
                {t('project')}: <strong>{currentProject.title}</strong>
              </span>
            )}
            {currentArea && (
              <span>
                {t('area')}: <strong>{currentArea.name}</strong>
              </span>
            )}
          </div>

          {/* Main Execution Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => {
                setActiveItemForTimer(currentItem)
                setTimerModalOpen(true)
              }}
              className="flex items-center space-x-2 space-x-reverse rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              <Play size={16} />
              <span>{t('startFocus')}</span>
            </button>

            <button
              onClick={() => handleCompleteItem(currentItem)}
              className="flex items-center space-x-2 space-x-reverse rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              <CheckCircle2 size={16} />
              <span>{t('completed')}</span>
            </button>

            <button
              onClick={() => handleToggleLock(currentItem)}
              className="flex items-center space-x-2 space-x-reverse rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {currentItem.locked ? <Lock size={16} /> : <Unlock size={16} />}
              <span>{currentItem.locked ? t('locked') : t('lock')}</span>
            </button>

            <button
              onClick={() => handleSkipItem(currentItem)}
              className="flex items-center space-x-2 space-x-reverse rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <SkipForward size={16} />
              <span>{t('skipOrRemove')}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-800">
          <p className="text-sm font-medium text-slate-500">{t('noScheduledItems')}</p>
        </div>
      )}

      {/* Timeline Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
          {t('todaysTimeline')}
        </h3>

        {scheduledItems.length === 0 ? (
          <p className="text-xs text-slate-400">{t('noTasksScheduled')}</p>
        ) : (
          <div className="space-y-3">
            {scheduledItems.map((item) => {
              const wi = workItems.find((w) => w.id === item.workItemId)
              const isDone = wi && (wi.status === 'done' || wi.status === 'completed')

              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between rounded-lg border p-3 text-sm transition-colors ${
                    isDone
                      ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-950 dark:bg-emerald-950/20'
                      : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950'
                  }`}
                >
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <span className="font-mono text-xs font-bold text-slate-500">
                      {item.startTime} - {item.endTime}
                    </span>
                    <div>
                      <strong className={`block ${isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                        {item.title}
                      </strong>
                      <small className="text-xs text-slate-500">
                        {formatMinutes(item.durationMinutes)} {item.reason ? `• ${item.reason}` : ''}
                      </small>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 space-x-reverse">
                    {!isDone && (
                      <button
                        onClick={() => handleCompleteItem(item)}
                        className="rounded p-1 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950"
                        title={t('markComplete')}
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleLock(item)}
                      className="rounded p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                      title={item.locked ? 'Unlock' : 'Lock'}
                    >
                      {item.locked ? <Lock size={16} className="text-amber-500" /> : <Unlock size={16} />}
                    </button>
                    {!isDone && (
                      <button
                        onClick={() => handleSkipItem(item)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800"
                        title={t('skipReschedule')}
                      >
                        <SkipForward size={16} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Real Timer Modal */}
      {timerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {t('focusTimer')}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {activeItemForTimer?.title ?? t('focusSession')}
            </p>

            {/* Clock display */}
            <div className={`my-6 rounded-lg p-6 text-center ${isOverTarget ? 'bg-red-50 dark:bg-red-950/40' : 'bg-indigo-50 dark:bg-indigo-950/60'}`}>
              <span className={`block font-mono text-5xl font-bold tabular-nums ${isOverTarget ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'}`}>
                {timerStatus === 'idle'
                  ? formatSeconds((activeItemForTimer?.durationMinutes ?? 30) * 60)
                  : formatSeconds(elapsedSeconds)}
              </span>
              {timerStatus !== 'idle' && (
                <span className="mt-2 block text-sm text-slate-500 dark:text-slate-400">
                  {isOverTarget
                    ? `${t('overTargetBy')} ${formatSeconds(elapsedSeconds - ((activeItemForTimer?.durationMinutes ?? 30) * 60))}`
                    : `${formatSeconds(remainingSeconds)} ${t('remainingTimer')}`}
                </span>
              )}
              <span className="mt-1 block text-xs font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                {timerStatus === 'idle' ? t('ready') : timerStatus === 'running' ? t('running') : t('paused')}
              </span>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap justify-center gap-3">
              {timerStatus === 'idle' && (
                <button
                  onClick={async () => {
                    await planner.timer.start({
                      mode: 'countdown',
                      workItemId: activeItemForTimer?.workItemId ?? null,
                      workItemTitle: activeItemForTimer?.title ?? null,
                      scheduledItemId: activeItemForTimer?.id ?? null,
                      targetDurationMinutes: activeItemForTimer?.durationMinutes ?? 30
                    })
                    await refreshTimerState()
                  }}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  <Play size={16} /> {t('startTimer')}
                </button>
              )}

              {timerStatus === 'running' && (
                <>
                  <button
                    onClick={async () => { await planner.timer.pause(); await refreshTimerState() }}
                    className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-400"
                  >
                    <Pause size={16} /> {t('pauseTimer')}
                  </button>
                  <button
                    onClick={async () => { await planner.timer.addTime(5); await refreshTimerState() }}
                    className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Plus size={14} /> 5m
                  </button>
                </>
              )}

              {timerStatus === 'paused' && (
                <button
                  onClick={async () => { await planner.timer.resume(); await refreshTimerState() }}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  <Play size={16} /> {t('resumeTimer')}
                </button>
              )}

              {timerStatus !== 'idle' && (
                <>
                  <button
                    onClick={async () => {
                      await planner.timer.complete()
                      await refreshTimerState()
                      setTimerModalOpen(false)
                      loadTodayData()
                    }}
                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
                  >
                    <CheckCircle2 size={16} /> {t('completeSession')}
                  </button>
                  <button
                    onClick={async () => { await planner.timer.stop(); await refreshTimerState() }}
                    className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                  >
                    <Square size={16} /> {t('cancel')}
                  </button>
                </>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setTimerModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skip / Missed Item Dialog */}
      {skipModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {t('skipOrMissed')}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              How would you like to handle &ldquo;{skipModalItem.title}&rdquo;?
            </p>

            <div className="mt-5 space-y-2.5">
              <button
                onClick={() => handleSkipWithResolution(skipModalItem, 'move_later_today')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-start text-xs font-semibold text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-indigo-950/40"
              >
                <div className="font-bold text-indigo-600 dark:text-indigo-400">{t('moveLaterToday')}</div>
                <div className="text-[11px] font-normal text-slate-500">{t('postponeLaterTodayHelp')}</div>
              </button>

              <button
                onClick={() => handleSkipWithResolution(skipModalItem, 'next_free_slot')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-start text-xs font-semibold text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-indigo-950/40"
              >
                <div className="font-bold text-indigo-600 dark:text-indigo-400">{t('nextFreeSlot')}</div>
                <div className="text-[11px] font-normal text-slate-500">{t('insertNextWindowHelp')}</div>
              </button>

              <button
                onClick={() => handleSkipWithResolution(skipModalItem, 'move_tomorrow')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-start text-xs font-semibold text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-indigo-950/40"
              >
                <div className="font-bold text-indigo-600 dark:text-indigo-400">{t('moveTomorrow')}</div>
                <div className="text-[11px] font-normal text-slate-500">{t('postponeTomorrowHelp')}</div>
              </button>

              <button
                onClick={() => handleSkipWithResolution(skipModalItem, 'skip')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-start text-xs font-semibold text-slate-800 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <div className="font-bold text-slate-700 dark:text-slate-300">{t('skipTask')}</div>
                <div className="text-[11px] font-normal text-slate-500">{t('removeFromTodayHelp')}</div>
              </button>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSkipModalItem(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replan Preview Modal */}
      <ReplanPreviewModal
        isOpen={replanModalOpen}
        onClose={() => setReplanModalOpen(false)}
        onApprove={handleApproveReplan}
        result={replanResult}
        isLoading={replanLoading}
      />

      {/* Plan History & Versions Modal */}
      <PlanHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        targetDate={selectedDate}
        onRestored={loadTodayData}
      />
    </div>
  )
}

