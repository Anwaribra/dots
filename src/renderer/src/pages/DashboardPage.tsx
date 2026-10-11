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
  ArrowUpRight,
  Sliders,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  RotateCcw,
  X
} from 'lucide-react'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'

export interface DashboardWidgetConfig {
  id: string
  title: string
  visible: boolean
}

const DEFAULT_WIDGETS: DashboardWidgetConfig[] = [
  { id: 'summary_stats', title: 'Summary KPI Cards', visible: true },
  { id: 'goal_progress', title: 'Goal Progress Engine', visible: true },
  { id: 'planned_vs_actual', title: 'Planned vs Actual Time', visible: true },
  { id: 'time_by_area', title: 'Time by Area Breakdown', visible: true },
  { id: 'upcoming_deadlines', title: 'Upcoming Deadlines', visible: true },
  { id: 'recent_sessions', title: 'Recent Sessions', visible: true }
]

const STORAGE_KEY = 'clarity_dashboard_widgets'

export function DashboardPage({
  onNavigate
}: {
  onNavigate?: (page: string) => void
}): JSX.Element {
  const { t } = useTranslation()
  const [data, setData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with defaults to ensure all exist
          const map = new Map(parsed.map((w: DashboardWidgetConfig) => [w.id, w]))
          const result: DashboardWidgetConfig[] = []
          for (const item of parsed) {
            if (DEFAULT_WIDGETS.some((d) => d.id === item.id)) {
              result.push({ ...item, title: DEFAULT_WIDGETS.find((d) => d.id === item.id)!.title })
            }
          }
          for (const d of DEFAULT_WIDGETS) {
            if (!result.some((r) => r.id === d.id)) result.push(d)
          }
          return result
        }
      }
    } catch {}
    return DEFAULT_WIDGETS
  })

  const saveWidgets = (next: DashboardWidgetConfig[]): void => {
    setWidgets(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {}
  }

  const moveWidget = (index: number, direction: 'up' | 'down'): void => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= widgets.length) return
    const next = [...widgets]
    const temp = next[index]
    next[index] = next[targetIndex]
    next[targetIndex] = temp
    saveWidgets(next)
  }

  const toggleWidget = (id: string): void => {
    const next = widgets.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w))
    saveWidgets(next)
  }

  const resetWidgets = (): void => {
    saveWidgets(DEFAULT_WIDGETS)
  }

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

  const isVisible = (id: string): boolean => {
    const w = widgets.find((x) => x.id === id)
    return w ? w.visible : true
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t('dashboard', 'Dashboard')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('dashboardDesc', 'Customizable workspace overview: focus, goal velocity, and time allocation.')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCustomizeOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Sliders size={14} />
            <span>{t('customize', 'Customize')}</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => void loadData()}>
            {t('refresh', 'Refresh')}
          </Button>
        </div>
      </div>

      {/* 4 Summary Stat Cards Widget */}
      {isVisible('summary_stats') && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Today's Tasks */}
          <Card className="p-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{t('todaysExecution', "Today's Execution")}</span>
              <CheckCircle2 size={16} className="text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2 space-x-reverse">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {today.completedCount}
              </span>
              <span className="text-xs text-slate-500">{t('completedOf', 'completed of')} {today.totalCount}</span>
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
              <span>{t('goalProgressAvg', 'Goal Progress Avg')}</span>
              <Compass size={16} className="text-indigo-500" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2 space-x-reverse">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {avgGoalProgress}%
              </span>
              <span className="text-xs text-slate-500">{t('acrossGoals', 'across goals')}: {goalProgresses.length}</span>
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
              <span>{t('timeTracked', 'Time Tracked')}</span>
              <Clock size={16} className="text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2 space-x-reverse">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {plannedVsActual.actualMinutes}m
              </span>
              <span className="text-xs text-slate-500">
                / {plannedVsActual.scheduledMinutes || plannedVsActual.plannedMinutes}m {t('planned', 'planned')}
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
              <span>{t('pendingDeadlines', 'Pending Deadlines')}</span>
              <AlertTriangle size={16} className="text-rose-500" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2 space-x-reverse">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {upcomingDeadlines.length}
              </span>
              <span className="text-xs text-slate-500">{t('upcomingOrDue', 'upcoming or due')}</span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              {upcomingDeadlines.length === 0 ? t('allCaughtUp', 'All caught up') : t('needsAttention', 'Needs attention')}
            </p>
          </Card>
        </div>
      )}

      {/* Main Grid for other widgets */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (Span 2): Goal Progress & Planned vs Actual */}
        <div className="space-y-6 lg:col-span-2">
          {/* Goal Progress Widget */}
          {isVisible('goal_progress') && (
            <Card className="p-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Compass size={18} className="text-indigo-600" />
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    {t('goalProgressEngine', 'Goal Progress Engine')}
                  </h3>
                </div>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('goals')}
                    className="flex items-center text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    <span>{t('viewGoals', 'View Goals')}</span>
                    <ArrowUpRight size={14} className="ms-1" />
                  </button>
                )}
              </div>

              <div className="mt-4 space-y-4">
                {goalProgresses.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    {t('noActiveGoals', 'No active goals created yet. Create a goal to begin tracking progress.')}
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
                              <span className="capitalize">{t('type')}: {g.measurementType || 'duration'}</span>
                              {g.targetDate && <span>• {t('deadline')}: {g.targetDate}</span>}
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
                            {p.completedWorkloadMinutes}m / {p.totalWorkloadMinutes}m
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </Card>
          )}

          {/* Planned vs Actual Breakdown Widget */}
          {isVisible('planned_vs_actual') && (
            <Card className="p-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Clock size={18} className="text-amber-500" />
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    {t('plannedVsScheduledVsActual', 'Planned vs Scheduled vs Actual Time')}
                  </h3>
                </div>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('analytics')}
                    className="flex items-center text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    <span>{t('analyticsPage', 'Analytics Page')}</span>
                    <ArrowUpRight size={14} className="ms-1" />
                  </button>
                )}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/60">
                  <div className="text-xs text-slate-500">{t('planned', 'Planned')}</div>
                  <div className="mt-1 text-xl font-bold text-slate-800 dark:text-slate-200">
                    {plannedVsActual.plannedMinutes}m
                  </div>
                  <div className="mt-1 text-[10px] text-slate-400">{t('totalEstimated', 'Total estimated')}</div>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/60">
                  <div className="text-xs text-slate-500">{t('scheduled', 'Scheduled')}</div>
                  <div className="mt-1 text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    {plannedVsActual.scheduledMinutes}m
                  </div>
                  <div className="mt-1 text-[10px] text-slate-400">{t('placedOnCalendar', 'Placed on calendar')}</div>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/60">
                  <div className="text-xs text-slate-500">{t('actual', 'Actual')}</div>
                  <div className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {plannedVsActual.actualMinutes}m
                  </div>
                  <div className="mt-1 text-[10px] text-slate-400">{t('executedSessions', 'Executed timer/sessions')}</div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column (Span 1): Time by Area, Upcoming Deadlines, Recent Sessions */}
        <div className="space-y-6">
          {/* Time by Area Widget */}
          {isVisible('time_by_area') && (
            <Card className="p-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Layers size={18} className="text-indigo-500" />
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">{t('timeByArea', 'Time by Area')}</h3>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {timeByArea.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    {t('noTimeRecorded', 'No time recorded for any area yet.')}
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
          )}

          {/* Upcoming Deadlines Widget */}
          {isVisible('upcoming_deadlines') && (
            <Card className="p-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <AlertTriangle size={18} className="text-rose-500" />
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    {t('upcomingDeadlines', 'Upcoming Deadlines')}
                  </h3>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {upcomingDeadlines.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    {t('noPendingDeadlines', 'No pending tasks with upcoming deadlines.')}
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
          )}

          {/* Recent Sessions Widget */}
          {isVisible('recent_sessions') && (
            <Card className="p-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Clock size={18} className="text-emerald-500" />
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    {t('recentSessions', 'Recent Sessions')}
                  </h3>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {recentSessions.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    {t('noRecentSessions', 'No sessions recorded yet. Start a timer to log time.')}
                  </div>
                ) : (
                  recentSessions.slice(0, 4).map((s: any) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-md bg-slate-50 p-2 text-xs dark:bg-slate-900/50"
                    >
                      <div>
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {s.durationMinutes} min
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <Badge variant="secondary">{t('done', 'Logged')}</Badge>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Customize Widgets Modal */}
      {customizeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {t('customizeDashboard', 'Customize Dashboard')}
                </h3>
              </div>
              <button
                onClick={() => setCustomizeOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('customizeModalDesc', 'Toggle widget visibility and rearrange display order. Changes are saved automatically.')}
            </p>

            <div className="space-y-2">
              {widgets.map((w, index) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50"
                >
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => toggleWidget(w.id)}
                      className={`p-1 rounded ${
                        w.visible
                          ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950'
                          : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                      title={w.visible ? 'Hide widget' : 'Show widget'}
                    >
                      {w.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <span
                      className={`text-xs font-medium ${
                        w.visible ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 line-through'
                      }`}
                    >
                      {t(w.id, w.title)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      disabled={index === 0}
                      onClick={() => moveWidget(index, 'up')}
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20"
                      title="Move up"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      disabled={index === widgets.length - 1}
                      onClick={() => moveWidget(index, 'down')}
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20"
                      title="Move down"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={resetWidgets}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <RotateCcw size={13} />
                <span>{t('resetToDefault', 'Reset to Default')}</span>
              </button>
              <Button size="sm" onClick={() => setCustomizeOpen(false)}>
                {t('done', 'Done')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
