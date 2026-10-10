import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Lock,
  Play,
  SkipForward,
  Unlock,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import type { ScheduleItem } from '../../../main/scheduler/types'
import type { DayCapacityResult } from '../../../shared/capacity'
import type { Area, Project, WorkItem } from '../../../shared/entities'

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

  const handleSkipItem = async (item: ScheduleItem): Promise<void> => {
    if (!planner) return
    await planner.planning.deleteScheduleItem(item.id)
    loadTodayData()
  }

  return (
    <div className="space-y-6">
      {/* Date Bar Navigator */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center space-x-3 space-x-reverse">
          <Calendar className="text-indigo-600 dark:text-indigo-400" size={22} />
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {selectedDate === getTodayString() ? t('today') : selectedDate}
            </h2>
            <p className="text-xs text-slate-500">{analyticalStatus}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
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
          <span className="block text-xs font-semibold text-slate-500">Planned</span>
          <strong className="mt-1 block text-xl font-bold text-slate-900 dark:text-slate-100">
            {formatMinutes(plannedMinutes)}
          </strong>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="block text-xs font-semibold text-slate-500">Actual</span>
          <strong className="mt-1 block text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatMinutes(actualMinutes)}
          </strong>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="block text-xs font-semibold text-slate-500">Remaining</span>
          <strong className="mt-1 block text-xl font-bold text-amber-600 dark:text-amber-400">
            {formatMinutes(remainingMinutes)}
          </strong>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="block text-xs font-semibold text-slate-500">Completion %</span>
          <strong className="mt-1 block text-xl font-bold text-indigo-600 dark:text-indigo-400">
            {completionPercentage}%
          </strong>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="block text-xs font-semibold text-slate-500">Usable Capacity</span>
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
              CURRENT ITEM
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
                Project: <strong>{currentProject.title}</strong>
              </span>
            )}
            {currentArea && (
              <span>
                Area: <strong>{currentArea.name}</strong>
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
              <span>Start Focus</span>
            </button>

            <button
              onClick={() => handleCompleteItem(currentItem)}
              className="flex items-center space-x-2 space-x-reverse rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              <CheckCircle2 size={16} />
              <span>Complete</span>
            </button>

            <button
              onClick={() => handleToggleLock(currentItem)}
              className="flex items-center space-x-2 space-x-reverse rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {currentItem.locked ? <Lock size={16} /> : <Unlock size={16} />}
              <span>{currentItem.locked ? 'Locked' : 'Lock'}</span>
            </button>

            <button
              onClick={() => handleSkipItem(currentItem)}
              className="flex items-center space-x-2 space-x-reverse rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <SkipForward size={16} />
              <span>Skip / Remove</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-800">
          <p className="text-sm font-medium text-slate-500">No scheduled items for this day.</p>
        </div>
      )}

      {/* Timeline Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
          Today's Timeline
        </h3>

        {scheduledItems.length === 0 ? (
          <p className="text-xs text-slate-400">No tasks scheduled on this timeline.</p>
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
                        title="Mark Complete"
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
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Timer Placeholder Modal */}
      {timerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Focus Timer
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Focus session for: <strong>{activeItemForTimer?.title}</strong>
            </p>
            <div className="my-6 rounded-lg bg-indigo-50 p-4 text-center dark:bg-indigo-950/60">
              <span className="block text-xs font-bold text-indigo-600 dark:text-indigo-400">
                [Timer Placeholder - Arriving Stage 7]
              </span>
              <span className="mt-1 block font-mono text-3xl font-bold text-slate-900 dark:text-slate-100">
                {formatMinutes(activeItemForTimer?.durationMinutes || 30)}
              </span>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setTimerModalOpen(false)}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
