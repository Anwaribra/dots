import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  AlertTriangle,
  Play,
  TrendingUp,
  FolderKanban,
  Layers,
  ArrowUpRight
} from 'lucide-react'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'

export function DashboardPage({
  onNavigate
}: {
  onNavigate?: (page: string) => void
}): JSX.Element {
  const { t } = useTranslation()
  const [data, setData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  const planner = window.planner

  const loadData = async (): Promise<void> => {
    if (!planner?.dashboard) return
    setLoading(true)
    try {
      const res = await planner.dashboard.getData()
      setData(res)
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        <Clock className="me-2 animate-spin" size={20} />
        <span>Loading dashboard...</span>
      </div>
    )
  }

  const today = data?.today || { scheduledItems: [], sessions: [], completedCount: 0, totalCount: 0 }
  const goalProgresses = data?.goalProgresses || []
  const timeByArea = data?.timeByArea || []
  const plannedVsActual = data?.plannedVsActual || { plannedMinutes: 0, scheduledMinutes: 0, actualMinutes: 0 }
  const upcomingDeadlines = data?.upcomingDeadlines || []
  const recentSessions = data?.recentSessions || []

  // Overall goal completion average
  const avgGoalProgress =
    goalProgresses.length > 0
      ? Math.round(
          goalProgresses.reduce((acc: number, g: any) => acc + g.progress.progressPercentage, 0) /
            goalProgresses.length
        )
      : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t('dashboard', 'Dashboard')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Overview of today's focus, goal velocity, and time allocation (Fixed Layout).
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void loadData()}>
          Refresh
        </Button>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Tasks */}
        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Today's Execution</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2 space-x-reverse">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {today.completedCount}
            </span>
            <span className="text-xs text-slate-500">of {today.totalCount} completed</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{
                width: `${today.totalCount > 0 ? (today.completedCount / today.totalCount) * 100 : 0}%`
              }}
            />
          </div>
        </Card>

        {/* Goal Progress Average */}
        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Goal Progress Avg</span>
            <Compass size={16} className="text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2 space-x-reverse">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {avgGoalProgress}%
            </span>
            <span className="text-xs text-slate-500">across {goalProgresses.length} goals</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${avgGoalProgress}%` }}
            />
          </div>
        </Card>

        {/* Planned vs Actual Today */}
        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Time Tracked</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2 space-x-reverse">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {plannedVsActual.actualMinutes}m
            </span>
            <span className="text-xs text-slate-500">
              / {plannedVsActual.scheduledMinutes || plannedVsActual.plannedMinutes}m planned
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{
                width: `${
                  plannedVsActual.plannedMinutes > 0
                    ? Math.min(100, (plannedVsActual.actualMinutes / plannedVsActual.plannedMinutes) * 100)
                    : 0
                }%`
              }}
            />
          </div>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Pending Deadlines</span>
            <AlertTriangle size={16} className="text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2 space-x-reverse">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {upcomingDeadlines.length}
            </span>
            <span className="text-xs text-slate-500">upcoming or due</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            {upcomingDeadlines.length === 0 ? 'All caught up' : 'Needs attention'}
          </p>
        </Card>
      </div>

      {/* Main Grid: Fixed 3-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (Span 2): Goal Progress & Planned vs Actual */}
        <div className="space-y-6 lg:col-span-2">
          {/* Goal Progress Widget */}
          <Card className="p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Compass size={18} className="text-indigo-600" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Goal Progress Engine
                </h3>
              </div>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('goals')}
                  className="flex items-center text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  <span>View Goals</span>
                  <ArrowUpRight size={14} className="ms-1" />
                </button>
              )}
            </div>

            <div className="mt-4 space-y-4">
              {goalProgresses.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No active goals created yet. Create a goal to begin tracking progress.
                </div>
              ) : (
                goalProgresses.map((item: any) => {
                  const g = item.goal
                  const p = item.progress
                  return (
                    <div
                      key={g.id}
                      className="rounded-lg border border-slate-100 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/40"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {g.title}
                          </h4>
                          <div className="mt-1 flex items-center space-x-2 space-x-reverse text-xs text-slate-400">
                            <span className="capitalize">Mode: {g.measurementType || 'duration'}</span>
                            {g.targetDate && <span>• Due {g.targetDate}</span>}
                          </div>
                        </div>
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                          {p.progressPercentage}%
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                          style={{ width: `${p.progressPercentage}%` }}
                        />
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                        <span>{p.details}</span>
                        <span>
                          Workload: {p.completedWorkloadMinutes}m / {p.totalWorkloadMinutes}m
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </Card>

          {/* Planned vs Actual Breakdown Widget */}
          <Card className="p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Clock size={18} className="text-amber-500" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Planned vs Scheduled vs Actual Time
                </h3>
              </div>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('analytics')}
                  className="flex items-center text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  <span>Analytics Page</span>
                  <ArrowUpRight size={14} className="ms-1" />
                </button>
              )}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/60">
                <div className="text-xs text-slate-500">Planned</div>
                <div className="mt-1 text-xl font-bold text-slate-800 dark:text-slate-200">
                  {plannedVsActual.plannedMinutes}m
                </div>
                <div className="mt-1 text-[10px] text-slate-400">Total estimated</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/60">
                <div className="text-xs text-slate-500">Scheduled</div>
                <div className="mt-1 text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  {plannedVsActual.scheduledMinutes}m
                </div>
                <div className="mt-1 text-[10px] text-slate-400">Placed on calendar</div>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/60">
                <div className="text-xs text-slate-500">Actual</div>
                <div className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {plannedVsActual.actualMinutes}m
                </div>
                <div className="mt-1 text-[10px] text-slate-400">Executed timer/sessions</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (Span 1): Time by Area, Upcoming Deadlines, Recent Sessions */}
        <div className="space-y-6">
          {/* Time by Area Widget */}
          <Card className="p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Layers size={18} className="text-indigo-500" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Time by Area</h3>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {timeByArea.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No time recorded for any area yet.
                </div>
              ) : (
                timeByArea.map((a: any) => (
                  <div key={a.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {a.name}
                      </span>
                      <span className="text-slate-500">
                        {a.minutes}m ({a.percentage}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${a.percentage}%`,
                          backgroundColor: a.color || '#6366f1'
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Upcoming Deadlines Widget */}
          <Card className="p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center space-x-2 space-x-reverse">
                <AlertTriangle size={18} className="text-rose-500" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Upcoming Deadlines
                </h3>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {upcomingDeadlines.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No pending tasks with upcoming deadlines.
                </div>
              ) : (
                upcomingDeadlines.slice(0, 5).map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-md border border-slate-100 p-2 text-xs dark:border-slate-800"
                  >
                    <span className="truncate font-medium text-slate-700 dark:text-slate-300">
                      {item.title}
                    </span>
                    <Badge variant={item.deadline < new Date().toISOString().substring(0, 10) ? 'critical' : 'medium'}>
                      {item.deadline}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Recent Sessions Widget */}
          <Card className="p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Clock size={18} className="text-emerald-500" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Recent Sessions
                </h3>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {recentSessions.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No sessions recorded yet. Start a timer to log time.
                </div>
              ) : (
                recentSessions.slice(0, 4).map((s: any) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-md bg-slate-50 p-2 text-xs dark:bg-slate-900/50"
                  >
                    <div>
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {s.durationMinutes} min session
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <Badge variant="secondary">Logged</Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
