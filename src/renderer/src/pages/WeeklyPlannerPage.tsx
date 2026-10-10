import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lock,
  Plus,
  RefreshCw,
  Split,
  Trash2,
  Unlock,
  AlertTriangle,
  MoveLeft,
  MoveRight,
  Bug
} from 'lucide-react'
import type { PlanningResult, ScheduleItem } from '../../../main/scheduler/types'
import type { DayCapacityResult } from '../../../shared/capacity'
import type { FixedEvent } from '../../../shared/entities'
import type { Settings } from '../../../shared/settings'
import { PlannerDebugPage } from './PlannerDebugPage'

function formatDate(d: Date): string {
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

function getWeekDates(startDateStr: string, weekStartsOn = 6): { dateStr: string; dayName: string }[] {
  const start = new Date(startDateStr)
  const dates: { dateStr: string; dayName: string }[] = []
  const dayNamesEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  for (let i = 0; i < 7; i++) {
    const curr = new Date(start)
    curr.setDate(curr.getDate() + i)
    const dStr = formatDate(curr)
    const dayName = dayNamesEn[curr.getDay()]
    dates.push({ dateStr: dStr, dayName })
  }

  return dates
}

export function WeeklyPlannerPage(): JSX.Element {
  const { t } = useTranslation()
  const planner = window.planner

  const [settings, setSettings] = useState<Settings | null>(null)
  const [startDateStr, setStartDateStr] = useState<string>(formatDate(new Date()))
  const [scheduledItems, setScheduledItems] = useState<ScheduleItem[]>([])
  const [dayCapacities, setDayCapacities] = useState<Record<string, DayCapacityResult>>({})
  const [fixedEvents, setFixedEvents] = useState<FixedEvent[]>([])
  const [planningResult, setPlanningResult] = useState<PlanningResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [showDebugView, setShowDebugView] = useState(false)

  // Edit / Add modal state
  const [addModalDate, setAddModalDate] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newStartTime, setNewStartTime] = useState('09:00')
  const [newEndTime, setNewEndTime] = useState('10:00')

  useEffect(() => {
    if (planner) {
      planner.settings.get().then(setSettings)
    }
  }, [planner])

  useEffect(() => {
    loadWeekData()
  }, [startDateStr])

  const loadWeekData = async (): Promise<void> => {
    if (!planner) return
    setLoading(true)
    try {
      const weekDates = getWeekDates(startDateStr, settings?.weekStartsOn ?? 6)
      const start = weekDates[0].dateStr
      const end = weekDates[6].dateStr

      const [sItems, fList] = await Promise.all([
        planner.planning.getSchedule(start, end),
        planner.fixedEvents.list()
      ])

      setScheduledItems(sItems)
      setFixedEvents(fList)

      // Calculate capacities for each day in week
      const capMap: Record<string, DayCapacityResult> = {}
      for (const d of weekDates) {
        capMap[d.dateStr] = await planner.capacity.calculate(d.dateStr)
      }
      setDayCapacities(capMap)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateWeek = async (): Promise<void> => {
    if (!planner) return
    setLoading(true)
    try {
      const result = await planner.planning.generateWeek(startDateStr)
      setPlanningResult(result)
      await loadWeekData()
    } finally {
      setLoading(false)
    }
  }

  const navigateWeek = (weeks: number): void => {
    const curr = new Date(startDateStr)
    curr.setDate(curr.getDate() + weeks * 7)
    setStartDateStr(formatDate(curr))
  }

  const handleToggleLock = async (item: ScheduleItem): Promise<void> => {
    if (!planner) return
    await planner.planning.updateScheduleItem({
      id: item.id,
      locked: !item.locked
    })
    loadWeekData()
  }

  const handleMoveItemDay = async (item: ScheduleItem, targetDate: string): Promise<void> => {
    if (!planner) return
    await planner.planning.updateScheduleItem({
      id: item.id,
      date: targetDate
    })
    loadWeekData()
  }

  const handleSplitItem = async (item: ScheduleItem): Promise<void> => {
    if (!planner || item.durationMinutes <= 20) return
    const half = Math.floor(item.durationMinutes / 2)
    // Update first session
    const [sh, sm] = item.startTime.split(':').map(Number)
    const midMins = sh * 60 + sm + half
    const midH = String(Math.floor(midMins / 60)).padStart(2, '0')
    const midM = String(midMins % 60).padStart(2, '0')
    const midTime = `${midH}:${midM}`

    await planner.planning.updateScheduleItem({
      id: item.id,
      endTime: midTime,
      durationMinutes: half
    })

    // Create second session
    await planner.planning.createScheduleItem({
      workItemId: item.workItemId || undefined,
      title: `${item.title} (Part 2)`,
      date: item.date,
      startTime: midTime,
      endTime: item.endTime,
      durationMinutes: item.durationMinutes - half,
      locked: item.locked,
      reason: 'Split from previous session'
    })

    loadWeekData()
  }

  const handleDeleteItem = async (id: string): Promise<void> => {
    if (!planner) return
    await planner.planning.deleteScheduleItem(id)
    loadWeekData()
  }

  const handleAddManualItem = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!planner || !addModalDate || !newTitle.trim()) return

    const [sh, sm] = newStartTime.split(':').map(Number)
    const [eh, em] = newEndTime.split(':').map(Number)
    const dur = Math.max(15, (eh * 60 + em) - (sh * 60 + sm))

    await planner.planning.createScheduleItem({
      title: newTitle.trim(),
      date: addModalDate,
      startTime: newStartTime,
      endTime: newEndTime,
      durationMinutes: dur,
      locked: true,
      reason: 'Manually added to schedule'
    })

    setAddModalDate(null)
    setNewTitle('')
    loadWeekData()
  }

  const weekDates = getWeekDates(startDateStr, settings?.weekStartsOn ?? 6)

  if (showDebugView) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <button
            onClick={() => setShowDebugView(false)}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300"
          >
            Back to Planner Grid
          </button>
        </div>
        <PlannerDebugPage />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center space-x-3 space-x-reverse">
          <Calendar className="text-indigo-600 dark:text-indigo-400" size={24} />
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Weekly Planner ({weekDates[0].dateStr} - {weekDates[6].dateStr})
            </h1>
            <p className="text-xs text-slate-500">
              Interactive 7-day adaptive timeline grid with manual override control.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1 space-x-reverse rounded-lg border border-slate-300 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950">
            <button
              onClick={() => navigateWeek(-1)}
              className="rounded p-1 text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setStartDateStr(formatDate(new Date()))}
              className="px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Current Week
            </button>
            <button
              onClick={() => navigateWeek(1)}
              className="rounded p-1 text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={handleGenerateWeek}
            disabled={loading}
            className="flex items-center space-x-2 space-x-reverse rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
            <span>{loading ? 'Planning...' : 'Generate Week'}</span>
          </button>

          <button
            onClick={() => setShowDebugView(true)}
            className="flex items-center space-x-1.5 space-x-reverse rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <Bug size={14} />
            <span>Debug Log</span>
          </button>
        </div>
      </div>

      {/* Warnings & Overload Summary */}
      {planningResult && planningResult.warnings.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          <div className="flex items-center space-x-2 space-x-reverse font-bold text-sm">
            <AlertTriangle size={18} />
            <span>Engine Warnings & Overload Recommendations</span>
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
            {planningResult.warnings.map((w, idx) => (
              <li key={idx}>{w.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 7-Day Columns Timeline Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        {weekDates.map((day, dIdx) => {
          const dCap = dayCapacities[day.dateStr]
          const dItems = scheduledItems.filter((s) => s.date === day.dateStr)
          const dFixed = fixedEvents.filter((f) => f.startTime.startsWith(day.dateStr))

          const scheduledMins = dItems.reduce((acc, i) => acc + i.durationMinutes, 0)
          const usableMins = dCap?.usableMinutes || 0
          const availableMins = dCap?.availableMinutes || 0

          // Capacity status: Healthy / Heavy / Overloaded
          let capStatus: 'Healthy' | 'Heavy' | 'Overloaded' = 'Healthy'
          let capBg = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
          if (scheduledMins > availableMins && availableMins > 0) {
            capStatus = 'Overloaded'
            capBg = 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
          } else if (scheduledMins > usableMins) {
            capStatus = 'Heavy'
            capBg = 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
          }

          return (
            <div
              key={day.dateStr}
              className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              {/* Day Header */}
              <div className="border-b border-slate-200 p-3 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {t(day.dayName.toLowerCase()) || day.dayName}
                  </span>
                  <span className="text-[10px] text-slate-400">{day.dateStr.substring(5)}</span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${capBg}`}>
                    {capStatus}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">
                    {scheduledMins}m / {usableMins}m
                  </span>
                </div>
              </div>

              {/* Day Column Body */}
              <div className="flex-1 p-2 space-y-2 min-h-[350px]">
                {/* Fixed Events */}
                {dFixed.map((fe) => (
                  <div
                    key={fe.id}
                    className="rounded-lg border border-purple-200 bg-purple-50 p-2 text-xs text-purple-900 dark:border-purple-900 dark:bg-purple-950/40 dark:text-purple-200"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>{fe.title}</span>
                      <Lock size={12} />
                    </div>
                    <span className="font-mono text-[10px] opacity-80">
                      {fe.startTime.substring(11)} - {fe.endTime.substring(11)}
                    </span>
                  </div>
                ))}

                {/* Scheduled Items */}
                {dItems.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-lg border p-2 text-xs transition-shadow hover:shadow-sm ${
                      item.locked
                        ? 'border-indigo-300 bg-indigo-50/70 dark:border-indigo-800 dark:bg-indigo-950/40'
                        : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <strong className="font-semibold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </strong>
                      <button
                        onClick={() => handleToggleLock(item)}
                        className="text-slate-400 hover:text-indigo-600"
                        title={item.locked ? 'Locked (Will not move during replanning)' : 'Lock item'}
                      >
                        {item.locked ? <Lock size={12} className="text-amber-500" /> : <Unlock size={12} />}
                      </button>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                      <span className="font-mono">
                        {item.startTime} - {item.endTime}
                      </span>
                      <span>{item.durationMinutes}m</span>
                    </div>

                    {/* Actions Row */}
                    <div className="mt-2 flex items-center justify-between border-t border-slate-200/60 pt-1.5 dark:border-slate-800">
                      <div className="flex items-center space-x-1 space-x-reverse">
                        {dIdx > 0 && (
                          <button
                            onClick={() => handleMoveItemDay(item, weekDates[dIdx - 1].dateStr)}
                            className="rounded p-0.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                            title="Move to previous day"
                          >
                            <MoveLeft size={12} />
                          </button>
                        )}
                        {dIdx < 6 && (
                          <button
                            onClick={() => handleMoveItemDay(item, weekDates[dIdx + 1].dateStr)}
                            className="rounded p-0.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                            title="Move to next day"
                          >
                            <MoveRight size={12} />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center space-x-1 space-x-reverse">
                        {item.durationMinutes > 20 && (
                          <button
                            onClick={() => handleSplitItem(item)}
                            className="rounded p-0.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                            title="Split session"
                          >
                            <Split size={12} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="rounded p-0.5 text-slate-400 hover:text-red-500"
                          title="Remove from schedule"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Item Button */}
                <button
                  onClick={() => setAddModalDate(day.dateStr)}
                  className="flex w-full items-center justify-center space-x-1 space-x-reverse rounded-lg border border-dashed border-slate-300 py-1.5 text-[11px] font-medium text-slate-500 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-800 dark:hover:border-indigo-600"
                >
                  <Plus size={12} />
                  <span>Add Item</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Manual Add Item Modal */}
      {addModalDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Add Schedule Block ({addModalDate})
            </h3>

            <form onSubmit={handleAddManualItem} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('title')}
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Task title"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 space-x-reverse pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalDate(null)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Add Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
