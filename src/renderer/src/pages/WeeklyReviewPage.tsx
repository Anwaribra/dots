import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AlertTriangle,
  BarChart2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Goal as GoalIcon,
  Layers,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Zap
} from 'lucide-react'
import type { WeeklyReviewResult } from '../../../main/services/weekly-review-service'

function getISOWeekDates(offset = 0): { startDate: string; endDate: string; label: string } {
  const now = new Date()
  // Monday of current week
  const day = now.getDay()
  const diffToMon = (day === 0 ? -6 : 1 - day) + offset * 7
  const mon = new Date(now)
  mon.setDate(now.getDate() + diffToMon)
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)

  const fmt = (d: Date): string => d.toISOString().substring(0, 10)
  const label = `${fmt(mon)} – ${fmt(sun)}`
  return { startDate: fmt(mon), endDate: fmt(sun), label }
}

function pct(n: number): string { return `${Math.round(n)}%` }
function mins(m: number): string {
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60); const rm = m % 60
  return rm > 0 ? `${h}h ${rm}m` : `${h}h`
}

function StatCard({ label, value, sub, icon: Icon, color = 'indigo' }: {
  label: string; value: string; sub?: string
  icon: React.ElementType; color?: string
}): JSX.Element {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
  }
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-start gap-3">
      <div className={`p-2 rounded-lg ${colors[color]}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{label}</p>
        <p className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-none">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

function PriorityBadge({ p }: { p: string }): JSX.Element {
  const { t } = useTranslation()
  const cls = p === 'high' || p === 'critical'
    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
    : p === 'medium'
    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
    : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
  return <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wide ${cls}`}>{t(p)}</span>
}

export function WeeklyReviewPage(): JSX.Element {
  const { t } = useTranslation()
  const [weekOffset, setWeekOffset] = useState(-1) // default: last week
  const [review, setReview] = useState<WeeklyReviewResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const planner = window.planner

  const period = useMemo(() => getISOWeekDates(weekOffset), [weekOffset])

  const load = useCallback(async () => {
    if (!planner) return
    setLoading(true)
    setError(null)
    try {
      const res = await (planner as any).weeklyReview.generate({ startDate: period.startDate, endDate: period.endDate })
      setReview(res)
    } catch (e: any) {
      setError(e?.message ?? t('failedToGenerateReview'))
    } finally {
      setLoading(false)
    }
  }, [planner, period, t])

  useEffect(() => { load() }, [load])

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setWeekOffset((w) => w - 1)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            id="review-prev-week"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{period.label}</p>
            <p className="text-xs text-slate-400">{weekOffset === -1 ? t('lastWeek') : weekOffset === 0 ? t('thisWeek') : t('weeksAgoCount', { count: Math.abs(weekOffset) })}</p>
          </div>
          <button
            onClick={() => setWeekOffset((w) => Math.min(w + 1, 0))}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors disabled:opacity-30"
            id="review-next-week"
            disabled={weekOffset >= 0}
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <button
          onClick={load}
          id="review-refresh-btn"
          className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-500 font-medium"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          {loading ? t('generating') : t('refresh')}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      {!review && !loading && !error && (
        <div className="py-16 text-center text-slate-400 text-sm">{t('selectPeriodAndRefresh')}</div>
      )}

      {loading && (
        <div className="py-16 flex items-center justify-center gap-3 text-slate-400 text-sm">
          <RefreshCw size={16} className="animate-spin" />
          {t('analyzingWeek')}
        </div>
      )}

      {review && !loading && (
        <div className="space-y-6">
          {/* Key stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={CheckCircle2} label={t('tasksCompleted')} value={String(review.totalCompletedItems)} sub={t('ofScheduled', { count: review.totalScheduledItems })} color="emerald" />
            <StatCard icon={BarChart2} label={t('completionRate')} value={pct(review.completionRate)} color={review.completionRate >= 70 ? 'emerald' : 'amber'} />
            <StatCard icon={Clock} label={t('timeWorked')} value={mins(review.totalActualMinutes)} sub={t('plannedMinutesSub', { time: mins(review.totalPlannedMinutes) })} color="indigo" />
            <StatCard icon={Zap} label={t('avgPerActiveDay')} value={mins(review.avgDailyActualMinutes)} color="indigo" />
          </div>

          {/* Observations */}
          {review.observations.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">{t('observations')}</h3>
              <ul className="space-y-2">
                {review.observations.map((obs, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="text-indigo-500 mt-0.5 flex-shrink-0">•</span>
                    {obs}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Two-column: by area + goal progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* By area */}
            {review.byArea.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                  <Layers size={13} /> {t('timeByArea')}
                </h3>
                <div className="space-y-3">
                  {review.byArea.map((a) => {
                    const ratio = review.totalActualMinutes > 0 ? (a.actualMinutes / review.totalActualMinutes) * 100 : 0
                    return (
                      <div key={a.id}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                            {a.color && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: a.color }} />}
                            {a.name}
                          </span>
                          <span className="text-slate-400">{mins(a.actualMinutes)} · {a.completedItems}/{a.totalItems} {t('tasks')}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                            style={{ width: `${ratio}%`, backgroundColor: a.color ?? undefined }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Goal progress */}
            {review.goalProgress.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                  <GoalIcon size={13} /> {t('goalProgress')}
                </h3>
                <div className="space-y-3">
                  {review.goalProgress.map((g) => (
                    <div key={g.id}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200 truncate">
                          <PriorityBadge p={g.priority} />
                          <span className="truncate">{g.title}</span>
                        </span>
                        <span className="font-semibold text-slate-600 dark:text-slate-300 ml-2 flex-shrink-0">{pct(g.progressPercentage)}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: pct(g.progressPercentage) }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Habits */}
          {review.habitsSummary.totalHabits > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4">
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{t('habits')}</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {t('habitsSummaryLine', { count: review.habitsSummary.totalHabits })} <strong>{pct(review.habitsSummary.avgCompletionRate)}</strong>
                </p>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {pct(review.habitsSummary.avgCompletionRate)}
              </div>
            </div>
          )}

          {/* Friction signals */}
          {review.friction.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-3 flex items-center gap-1.5">
                <AlertTriangle size={13} /> {t('frictionSignals')} ({review.friction.length})
              </h3>
              <div className="space-y-2">
                {review.friction.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-amber-400 mt-0.5 flex-shrink-0">
                      {f.kind === 'missed_deadline' ? <TrendingDown size={13} /> : f.kind === 'overloaded_day' ? <AlertTriangle size={13} /> : <TrendingUp size={13} />}
                    </span>
                    <span className="text-slate-600 dark:text-slate-300">{f.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missed deadlines */}
          {review.missedDeadlines.length > 0 && (
            <div className="bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-800 p-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-rose-500 mb-3">{t('missedDeadlines')}</h3>
              <div className="space-y-2">
                {review.missedDeadlines.map((d) => (
                  <div key={d.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700 dark:text-slate-300">{d.title}</span>
                    <span className="text-xs text-rose-500 font-mono">{d.deadline} · {d.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed this week */}
          {review.completedThisWeek.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-3 flex items-center gap-1.5">
                <CheckCircle2 size={13} /> {t('completedThisWeek')} ({review.completedThisWeek.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {review.completedThisWeek.slice(0, 20).map((w) => (
                  <div key={w.id} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{w.title}</span>
                  </div>
                ))}
                {review.completedThisWeek.length > 20 && (
                  <p className="text-xs text-slate-400 col-span-2">+{review.completedThisWeek.length - 20} {t('more')}</p>
                )}
              </div>
            </div>
          )}

          {/* Generation time */}
          <p className="text-[10px] text-slate-400 text-right">
            {t('generatedAtPrefix')} {new Date(review.generatedAt).toLocaleTimeString()} · <CalendarDays size={10} className="inline mb-0.5" /> {period.label}
          </p>
        </div>
      )}
    </div>
  )
}
