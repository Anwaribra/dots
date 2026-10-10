import React, { useEffect, useState } from 'react'
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  History,
  Plus,
  RotateCcw,
  Sliders,
  Sparkles,
  Trash2
} from 'lucide-react'
import type { DueReviewsFilterResult, ReviewPolicyData, ReviewableItemState } from '../../../shared/review-engine'

type TabType = 'due' | 'policies' | 'history'

export function ReviewPage(): JSX.Element {
  const planner = window.planner

  const [activeTab, setActiveTab] = useState<TabType>('due')
  const [dueData, setDueData] = useState<DueReviewsFilterResult | null>(null)
  const [policies, setPolicies] = useState<ReviewPolicyData[]>([])
  const [eventsHistory, setEventsHistory] = useState<any[]>([])

  // Modal states
  const [markModalItem, setMarkModalItem] = useState<any | null>(null)
  const [reviewResult, setReviewResult] = useState<'strong' | 'good' | 'weak'>('good')
  const [reviewDuration, setReviewDuration] = useState<number>(15)
  const [reviewNotes, setReviewNotes] = useState<string>('')

  // Policy modal states
  const [policyModalOpen, setPolicyModalOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<ReviewPolicyData | null>(null)
  const [policyName, setPolicyName] = useState('')
  const [policyIntervals, setPolicyIntervals] = useState('1, 3, 7, 14, 30')
  const [shortenOnWeak, setShortenOnWeak] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    if (!planner) return
    const [dueRes, polList, evList] = await Promise.all([
      planner.reviews.getDue(),
      planner.reviews.listPolicies(),
      planner.reviews.listEvents()
    ])
    setDueData(dueRes)
    setPolicies(polList)
    setEventsHistory(evList)
  }

  const handleMarkReviewed = async () => {
    if (!markModalItem || !planner) return
    await planner.reviews.recordEvent({
      workItemId: markModalItem.itemKind === 'workItem' ? markModalItem.id : null,
      resourceItemId: markModalItem.itemKind === 'resourceItem' ? markModalItem.id : null,
      durationMinutes: reviewDuration,
      result: reviewResult,
      notes: reviewNotes.trim() || null
    })
    setMarkModalItem(null)
    setReviewNotes('')
    await loadData()
  }

  const handleSyncToPlanner = async () => {
    if (!planner) return
    await planner.reviews.syncToPlanner()
    await loadData()
  }

  const handleSavePolicy = async () => {
    if (!planner || !policyName.trim()) return
    const intervalsArr = policyIntervals
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0)

    if (editingPolicy) {
      await planner.reviews.updatePolicy({
        id: editingPolicy.id,
        name: policyName.trim(),
        intervalDays: intervalsArr,
        shortenOnWeak
      })
    } else {
      await planner.reviews.createPolicy({
        name: policyName.trim(),
        intervalDays: intervalsArr,
        shortenOnWeak
      })
    }
    setPolicyModalOpen(false)
    setEditingPolicy(null)
    setPolicyName('')
    setPolicyIntervals('1, 3, 7, 14, 30')
    setShortenOnWeak(true)
    await loadData()
  }

  const handleDeletePolicy = async (id: string) => {
    if (!planner) return
    await planner.reviews.deletePolicy(id)
    await loadData()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Review System</h1>
          <p className="text-sm text-slate-500">
            Spaced repetition and periodic review policies across all work items & resources.
          </p>
        </div>

        <div className="flex items-center space-x-3 space-x-reverse">
          <button
            onClick={handleSyncToPlanner}
            className="flex items-center space-x-2 space-x-reverse rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Sparkles size={16} className="text-indigo-500" />
            <span>Feed Due Reviews to Planner</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex space-x-8 space-x-reverse">
          <button
            onClick={() => setActiveTab('due')}
            className={`flex items-center space-x-2 space-x-reverse border-b-2 py-3 text-sm font-medium transition-colors ${
              activeTab === 'due'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Clock size={16} />
            <span>Due Reviews ({dueData?.allDueOrOverdue.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('policies')}
            className={`flex items-center space-x-2 space-x-reverse border-b-2 py-3 text-sm font-medium transition-colors ${
              activeTab === 'policies'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Sliders size={16} />
            <span>Review Policies ({policies.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-2 space-x-reverse border-b-2 py-3 text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <History size={16} />
            <span>Review History ({eventsHistory.length})</span>
          </button>
        </nav>
      </div>

      {/* Tab 1: Due Reviews */}
      {activeTab === 'due' && (
        <div className="space-y-4">
          {dueData?.allDueOrOverdue.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-800">
              <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">All caught up!</p>
              <p className="text-xs text-slate-500">No items are due or overdue for review at this time.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {dueData?.allDueOrOverdue.map((item: ReviewableItemState) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between rounded-xl border p-4 shadow-sm transition-colors ${
                    item.reviewStatus === 'overdue'
                      ? 'border-red-200 bg-red-50/40 dark:border-red-950/60 dark:bg-red-950/20'
                      : 'border-amber-200 bg-amber-50/40 dark:border-amber-950/60 dark:bg-amber-950/20'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          item.reviewStatus === 'overdue'
                            ? 'bg-red-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {item.reviewStatus}
                      </span>
                      <span className="text-xs font-semibold uppercase text-slate-400">
                        {item.itemKind === 'workItem' ? 'Task' : 'Resource Item'}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Completed reviews count: {item.reviewCount || 0}
                    </p>
                  </div>

                  <button
                    onClick={() => setMarkModalItem(item)}
                    className="flex items-center space-x-1.5 space-x-reverse rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                  >
                    <CheckCircle2 size={14} />
                    <span>Mark Reviewed</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Review Policies */}
      {activeTab === 'policies' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEditingPolicy(null)
                setPolicyName('')
                setPolicyIntervals('1, 3, 7, 14, 30')
                setShortenOnWeak(true)
                setPolicyModalOpen(true)
              }}
              className="flex items-center space-x-1.5 space-x-reverse rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              <Plus size={14} />
              <span>Create Policy</span>
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {policies.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">{p.name}</h3>
                  <button
                    onClick={() => handleDeletePolicy(p.id)}
                    className="text-slate-400 hover:text-red-500"
                    title="Delete Policy"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <p>
                    <strong>Intervals (days):</strong> {p.intervalDays.join(' → ')}
                  </p>
                  <p>
                    <strong>Shorten on Weak Recall:</strong> {p.shortenOnWeak ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: History */}
      {activeTab === 'history' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
            Review Event Logs
          </h3>
          {eventsHistory.length === 0 ? (
            <p className="text-xs text-slate-400">No review events logged yet.</p>
          ) : (
            <div className="space-y-2">
              {eventsHistory.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="space-y-1">
                    <span className="font-mono text-slate-400">
                      {new Date(ev.reviewedAt).toLocaleDateString()}{' '}
                      {new Date(ev.reviewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      Duration: {ev.durationMinutes}m {ev.notes ? `• ${ev.notes}` : ''}
                    </p>
                  </div>
                  {ev.result && (
                    <span
                      className={`rounded px-2 py-0.5 font-bold uppercase ${
                        ev.result === 'strong'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : ev.result === 'good'
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {ev.result}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mark Reviewed Modal */}
      {markModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Record Review Event
            </h3>
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              {markModalItem.title}
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Result Quality
              </label>
              <div className="flex gap-2">
                {(['strong', 'good', 'weak'] as const).map((res) => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => setReviewResult(res)}
                    className={`flex-1 rounded-lg border py-2 text-xs font-bold uppercase transition-colors ${
                      reviewResult === res
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300'
                        : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900'
                    }`}
                  >
                    {res}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                value={reviewDuration}
                onChange={(e) => setReviewDuration(parseInt(e.target.value, 10) || 15)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Notes
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Optional review observations..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 space-x-reverse pt-2">
              <button
                onClick={() => setMarkModalItem(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkReviewed}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                Save Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Policy Modal */}
      {policyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {editingPolicy ? 'Edit Policy' : 'Create Review Policy'}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Policy Name
              </label>
              <input
                type="text"
                value={policyName}
                onChange={(e) => setPolicyName(e.target.value)}
                placeholder="e.g. Standard Spaced Repetition"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Interval Progression (comma-separated days)
              </label>
              <input
                type="text"
                value={policyIntervals}
                onChange={(e) => setPolicyIntervals(e.target.value)}
                placeholder="1, 3, 7, 14, 30"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              />
            </div>

            <label className="flex items-center space-x-2 space-x-reverse text-xs font-semibold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={shortenOnWeak}
                onChange={(e) => setShortenOnWeak(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600"
              />
              <span>Shorten interval progression on weak recall</span>
            </label>

            <div className="flex justify-end space-x-2 space-x-reverse pt-2">
              <button
                onClick={() => setPolicyModalOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePolicy}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                Save Policy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
