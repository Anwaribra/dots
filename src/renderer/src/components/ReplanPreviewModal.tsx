import React from 'react'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  HelpCircle,
  Sparkles,
  X
} from 'lucide-react'
import type { ReplanningChange, ReplanningResult } from '../../../main/scheduler/types'

interface ReplanPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  onApprove: () => Promise<void>
  result: ReplanningResult | null
  isLoading?: boolean
}

export function ReplanPreviewModal({
  isOpen,
  onClose,
  onApprove,
  result,
  isLoading = false
}: ReplanPreviewModalProps): JSX.Element | null {
  if (!isOpen || !result) return null

  const renderChangeBadge = (type: ReplanningChange['changeType']) => {
    switch (type) {
      case 'inserted':
        return (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            INSERTED
          </span>
        )
      case 'moved':
        return (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
            MOVED
          </span>
        )
      case 'extended':
        return (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            EXTENDED
          </span>
        )
      case 'shortened':
        return (
          <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
            SHORTENED
          </span>
        )
      case 'displaced':
        return (
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
            DISPLACED
          </span>
        )
      case 'skipped':
        return (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-300">
            SKIPPED
          </span>
        )
      default:
        return (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            PRESERVED
          </span>
        )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Replan My Day — Preview & Diff
              </h2>
              <p className="text-xs text-slate-500">
                Review automated schedule adjustments before applying them to your day.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {/* Overload Alert & Suggestions */}
          {result.isOverloaded ? (
            <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-4 dark:border-amber-900/60 dark:bg-amber-950/30">
              <div className="flex items-start space-x-3 space-x-reverse">
                <AlertTriangle className="mt-0.5 text-amber-600 dark:text-amber-400" size={18} />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    Day Overloaded by {result.overloadMinutes} minutes
                  </h4>
                  <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">
                    Planned demand exceeds usable capacity. The engine adjusted what it could and suggests:
                  </p>
                  <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-amber-900 dark:text-amber-200">
                    {result.overloadSuggestions.map((sug, idx) => (
                      <li key={idx}>{sug}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 space-x-reverse rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300">
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
              <span>All remaining tasks fit comfortably within your available capacity window.</span>
            </div>
          )}

          {/* Planned Changes Diff */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Plan Changes ({result.changes.length})
            </h3>
            <div className="space-y-2">
              {result.changes.map((change, idx) => (
                <div
                  key={idx}
                  className="flex flex-col rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-sm dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 space-x-reverse font-semibold text-slate-900 dark:text-slate-100">
                      <span>{change.entityTitle}</span>
                      {renderChangeBadge(change.changeType)}
                    </div>

                    {(change.originalTime || change.newTime) && (
                      <div className="flex items-center space-x-1 space-x-reverse text-xs text-slate-500">
                        <Clock size={13} />
                        {change.originalTime && change.newTime && change.originalTime !== change.newTime ? (
                          <span className="flex items-center space-x-1 space-x-reverse">
                            <span className="line-through">{change.originalTime}</span>
                            <ArrowRight size={12} />
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                              {change.newTime}
                            </span>
                          </span>
                        ) : (
                          <span>{change.newTime || change.originalTime}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{change.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Explanations */}
          {result.explanations.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Analytical Explanations
              </h3>
              <div className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50/40 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-400">
                {result.explanations.map((exp, idx) => (
                  <div key={idx} className="flex items-start space-x-2 space-x-reverse">
                    <HelpCircle size={14} className="mt-0.5 text-indigo-500 shrink-0" />
                    <span>{exp.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 space-x-reverse border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={onApprove}
            disabled={isLoading}
            className="flex items-center space-x-2 space-x-reverse rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
          >
            <Sparkles size={16} />
            <span>{isLoading ? 'Applying...' : 'Approve & Apply Plan'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
