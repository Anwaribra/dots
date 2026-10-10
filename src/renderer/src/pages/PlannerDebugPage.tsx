import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Play, AlertTriangle, CheckCircle, ArrowRight, ShieldAlert, Cpu } from 'lucide-react'
import type { PlanningResult } from '../../../main/scheduler/types'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'

export function PlannerDebugPage(): JSX.Element {
  const { t } = useTranslation()
  const planner = window.planner

  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  )
  const [result, setResult] = useState<PlanningResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRunScheduler = async (): Promise<void> => {
    if (!planner) return
    setLoading(true)
    try {
      const res = await planner.planning.generateWeek(startDate)
      setResult(res)
    } catch (err) {
      console.error('Failed to run planning engine', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center">
            <Cpu size={16} className="me-1" /> [Developer Debug View]
          </span>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Planning Engine Raw Output Inspector
          </h1>
          <p className="text-xs text-slate-500">
            Deterministic scheduling algorithm debugger. Pure engine test & execution environment.
          </p>
        </div>
        <div className="flex items-center space-x-3 space-x-reverse">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40 text-xs"
          />
          <Button onClick={() => void handleRunScheduler()} disabled={loading}>
            <Play size={14} className="me-1" /> {loading ? 'Running...' : 'Generate Plan'}
          </Button>
        </div>
      </div>

      {!result ? (
        <Card className="py-12 text-center text-slate-400">
          Click "Generate Plan" to execute the pure deterministic scheduler engine for the selected week.
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Daily Capacity Overloads Summary */}
          {result.warnings.length > 0 && (
            <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 space-y-2">
              <h3 className="font-bold text-amber-800 dark:text-amber-300 text-sm flex items-center">
                <AlertTriangle size={16} className="me-2" /> Warnings & Overload Reports ({result.warnings.length})
              </h3>
              <div className="space-y-1">
                {result.warnings.map((w, i) => (
                  <div key={i} className="text-xs text-amber-700 dark:text-amber-300 font-mono bg-white/60 dark:bg-slate-900/60 p-2 rounded border border-amber-200/50">
                    <strong className="uppercase font-bold me-2">{w.code}:</strong> {w.message}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Scheduled Items */}
          <Card className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center">
              <CheckCircle size={16} className="me-2 text-emerald-500" /> Scheduled Items ({result.scheduledItems.length})
            </h3>

            {result.scheduledItems.length === 0 ? (
              <p className="text-xs text-slate-400">No items scheduled</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                      <th className="p-2 text-start">Date</th>
                      <th className="p-2 text-start">Time</th>
                      <th className="p-2 text-start">Item Title</th>
                      <th className="p-2 text-start">Duration</th>
                      <th className="p-2 text-start">Session</th>
                      <th className="p-2 text-start">Reason / Explanation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {result.scheduledItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-2 font-mono text-indigo-600 dark:text-indigo-400">{item.date}</td>
                        <td className="p-2 font-mono">{item.startTime} - {item.endTime}</td>
                        <td className="p-2 font-semibold text-slate-900 dark:text-slate-100">{item.title}</td>
                        <td className="p-2">{item.durationMinutes}m</td>
                        <td className="p-2">
                          {item.isSplit ? (
                            <Badge variant="secondary" className="text-[10px]">
                              Split ({item.sessionIndex}/{item.totalSessions})
                            </Badge>
                          ) : (
                            <span className="text-slate-400">Full</span>
                          )}
                        </td>
                        <td className="p-2 text-slate-500 max-w-xs truncate">{item.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Unscheduled & Moved Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center">
                <ShieldAlert size={16} className="me-2 text-rose-500" /> Unscheduled Items ({result.unscheduledItems.length})
              </h3>
              {result.unscheduledItems.length === 0 ? (
                <p className="text-xs text-slate-400">All candidate items were scheduled</p>
              ) : (
                <div className="space-y-2">
                  {result.unscheduledItems.map((u) => (
                    <div key={u.workItemId} className="p-2.5 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-lg text-xs space-y-1">
                      <strong className="text-rose-900 dark:text-rose-300 block">{u.title} ({u.remainingMinutes}m)</strong>
                      <p className="text-rose-700 dark:text-rose-400">{u.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center">
                <ArrowRight size={16} className="me-2 text-indigo-500" /> Moved Items ({result.movedItems.length})
              </h3>
              {result.movedItems.length === 0 ? (
                <p className="text-xs text-slate-400">No items required rescheduling</p>
              ) : (
                <div className="space-y-2">
                  {result.movedItems.map((m) => (
                    <div key={m.workItemId} className="p-2.5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900 rounded-lg text-xs space-y-1">
                      <strong className="text-indigo-900 dark:text-indigo-300 block">{m.title}</strong>
                      <p className="text-slate-600 dark:text-slate-400">{m.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Structured Explanations Log */}
          <Card className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Structured Engine Decision Explanations ({result.explanations.length})
            </h3>
            <div className="space-y-1.5 max-h-80 overflow-y-auto font-mono text-xs">
              {result.explanations.map((e, idx) => (
                <div key={idx} className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-800 flex items-start space-x-2 space-x-reverse">
                  <Badge variant={e.action === 'scheduled' ? 'active' : e.action === 'displaced' ? 'critical' : 'secondary'} className="text-[10px] uppercase shrink-0">
                    {e.action}
                  </Badge>
                  <div className="flex-1">
                    <strong className="text-slate-900 dark:text-slate-100">{e.entityTitle}:</strong> {e.reason}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
