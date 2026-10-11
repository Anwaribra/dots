import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Clock, History, RotateCcw, X, Layers, AlertCircle } from 'lucide-react'
import type { PlanVersionItem, ReplanningHistoryItem } from '../../../main/scheduler/types'

interface PlanHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  targetDate: string
  onRestored: () => void
}

export function PlanHistoryModal({
  isOpen,
  onClose,
  targetDate,
  onRestored
}: PlanHistoryModalProps): JSX.Element | null {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<'history' | 'versions'>('history')
  const [historyList, setHistoryList] = useState<ReplanningHistoryItem[]>([])
  const [versionList, setVersionList] = useState<PlanVersionItem[]>([])
  const [loading, setLoading] = useState(false)

  const planner = window.planner

  const loadData = async (): Promise<void> => {
    if (!planner || !isOpen) return
    setLoading(true)
    try {
      const [hist, vers] = await Promise.all([
        planner.replanning.getHistory(targetDate),
        planner.replanning.getVersions(targetDate)
      ])
      setHistoryList(hist)
      setVersionList(vers)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen, targetDate])

  if (!isOpen) return null

  const handleUndo = async (): Promise<void> => {
    if (!planner) return
    setLoading(true)
    try {
      const res = await planner.replanning.undo(targetDate)
      if (res.success) {
        onRestored()
        onClose()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400">
              <History size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {t('planHistory')} ({targetDate})
              </h2>
              <p className="text-xs text-slate-500">
                {t('planHistorySubtitle')}
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 pt-3 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('history')}
            className={`border-b-2 pb-2.5 text-xs font-bold transition-colors ${
              activeTab === 'history'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {t('replanningLog')} ({historyList.length})
          </button>
          <button
            onClick={() => setActiveTab('versions')}
            className={`ms-6 border-b-2 pb-2.5 text-xs font-bold transition-colors ${
              activeTab === 'versions'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {t('snapshotsAndVersions')} ({versionList.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-400">{t('loadingHistory')}</div>
          ) : activeTab === 'history' ? (
            historyList.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                {t('noReplanningOps', { date: targetDate })}
              </div>
            ) : (
              <div className="space-y-3">
                {historyList.map((hist) => {
                  const timeStr = new Date(hist.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                  return (
                    <div
                      key={hist.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-xs dark:border-slate-800 dark:bg-slate-800/40"
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-slate-900 dark:text-slate-100">{hist.summary}</span>
                        <span className="flex items-center space-x-1 space-x-reverse text-slate-400">
                          <Clock size={12} />
                          <span>{timeStr}</span>
                        </span>
                      </div>

                      {hist.changes.length > 0 && (
                        <div className="mt-2 space-y-1 border-t border-slate-200/60 pt-2 dark:border-slate-700/60">
                          {hist.changes.map((c, idx) => (
                            <div key={idx} className="text-slate-600 dark:text-slate-400">
                              • <strong>{c.entityTitle}</strong>: {c.reason}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          ) : versionList.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              {t('noPlanVersions')}
            </div>
          ) : (
            <div className="space-y-3">
              {versionList.map((ver, idx) => {
                const isLatest = idx === versionList.length - 1
                return (
                  <div
                    key={ver.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-xs dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <div>
                      <div className="flex items-center space-x-2 space-x-reverse font-bold text-slate-900 dark:text-slate-100">
                        <Layers size={14} className="text-indigo-500" />
                        <span>{ver.versionName}</span>
                        {isLatest && (
                          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                            {t('currentLabel')}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-slate-500">
                        {t('scheduledItemsTrigger', { count: ver.scheduleSnapshot.length, trigger: ver.trigger || 'manual' })}
                      </p>
                    </div>

                    {!isLatest && idx === versionList.length - 2 && (
                      <button
                        onClick={handleUndo}
                        className="flex items-center space-x-1.5 space-x-reverse rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300"
                      >
                        <RotateCcw size={13} />
                        <span>{t('revertToThis')}</span>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center space-x-1.5 space-x-reverse text-xs text-slate-500">
            <AlertCircle size={14} />
            <span>{t('undoReplanHelp')}</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  )
}
