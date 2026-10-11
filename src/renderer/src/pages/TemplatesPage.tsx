import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Sparkles,
  BookOpen,
  Dumbbell,
  Repeat,
  Briefcase,
  Layers,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Copy,
  Sliders
} from 'lucide-react'
import type { TemplateRecord, ApplyTemplateResult } from '../../../shared/templates'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'

export function TemplatesPage(): JSX.Element {
  const { t } = useTranslation()
  const planner = window.planner

  const [templates, setTemplates] = useState<TemplateRecord[]>([])
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [loading, setLoading] = useState<boolean>(false)
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Save Custom Template modal state
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customDesc, setCustomDesc] = useState('')
  const [includeAreas, setIncludeAreas] = useState(true)
  const [includeGoals, setIncludeGoals] = useState(true)
  const [includeMilestones, setIncludeMilestones] = useState(true)
  const [includeWorkItemTypes, setIncludeWorkItemTypes] = useState(true)
  const [includeRoutines, setIncludeRoutines] = useState(true)
  const [includeTimeBudgets, setIncludeTimeBudgets] = useState(true)
  const [includeReviewPolicies, setIncludeReviewPolicies] = useState(true)

  // Apply confirmation state
  const [applyTarget, setApplyTarget] = useState<TemplateRecord | null>(null)
  const [skipDuplicates, setSkipDuplicates] = useState(true)

  const loadTemplates = async (): Promise<void> => {
    if (!planner) return
    setLoading(true)
    try {
      const list = await planner.templates.list()
      setTemplates(list)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [])

  const handleApply = async (): Promise<void> => {
    if (!planner || !applyTarget) return
    setLoading(true)
    setResultMessage(null)
    try {
      const res: ApplyTemplateResult = await planner.templates.apply(applyTarget.id, skipDuplicates)
      const createdCount = Object.values(res.created).reduce((a, b) => a + b, 0)
      const skippedCount = Object.values(res.skipped).reduce((a, b) => a + b, 0)

      setResultMessage({
        type: 'success',
        text: `Template "${applyTarget.name}" applied successfully! Created ${createdCount} items (${skippedCount} skipped as duplicates).`
      })
      setApplyTarget(null)
    } catch (err: any) {
      setResultMessage({
        type: 'error',
        text: `Failed to apply template: ${err?.message || String(err)}`
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string): Promise<void> => {
    if (!planner) return
    if (!confirm(`Delete template "${name}"? This cannot be undone.`)) return
    try {
      await planner.templates.delete(id)
      loadTemplates()
      setResultMessage({ type: 'success', text: `Template "${name}" deleted.` })
    } catch (err: any) {
      setResultMessage({ type: 'error', text: err?.message || String(err) })
    }
  }

  const handleSaveCustom = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!planner || !customName.trim()) return
    setLoading(true)
    try {
      await planner.templates.saveCustom({
        name: customName.trim(),
        description: customDesc.trim() || undefined,
        includeAreas,
        includeGoals,
        includeMilestones,
        includeWorkItemTypes,
        includeRoutines,
        includeTimeBudgets,
        includeReviewPolicies
      })
      setSaveModalOpen(false)
      setCustomName('')
      setCustomDesc('')
      loadTemplates()
      setResultMessage({ type: 'success', text: `Custom template "${customName}" saved!` })
    } catch (err: any) {
      setResultMessage({ type: 'error', text: err?.message || String(err) })
    } finally {
      setLoading(false)
    }
  }

  const categoryIcons: Record<string, JSX.Element> = {
    study: <BookOpen className="text-indigo-500" size={20} />,
    fitness: <Dumbbell className="text-emerald-500" size={20} />,
    review: <Repeat className="text-amber-500" size={20} />,
    freelance: <Briefcase className="text-blue-500" size={20} />,
    custom: <Layers className="text-purple-500" size={20} />
  }

  const filteredTemplates = templates.filter((tpl) => {
    if (filterCategory === 'all') return true
    if (filterCategory === 'builtin') return tpl.builtin
    if (filterCategory === 'custom') return !tpl.builtin
    return tpl.category === filterCategory
  })

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="text-indigo-600 dark:text-indigo-400" size={24} />
            {t('templates')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ready-made planning architectures and custom blueprints you can apply anytime.
          </p>
        </div>

        <button
          onClick={() => setSaveModalOpen(true)}
          className="inline-flex items-center space-x-1.5 space-x-reverse rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          <Plus size={16} />
          <span>Save Current Setup as Template</span>
        </button>
      </div>

      {/* Result feedback */}
      {resultMessage && (
        <div
          className={`flex items-center space-x-2 space-x-reverse rounded-lg p-3 text-sm ${
            resultMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
              : 'bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
          }`}
        >
          {resultMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{resultMessage.text}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          ['all', 'All Templates'],
          ['builtin', 'Built-in'],
          ['study', 'Study'],
          ['fitness', 'Fitness'],
          ['review', 'Spaced Review'],
          ['freelance', 'Freelance'],
          ['custom', 'Custom']
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilterCategory(key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              filterCategory === key
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredTemplates.map((tpl) => (
          <Card key={tpl.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5 space-x-reverse">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                    {categoryIcons[tpl.category] || <Sparkles size={20} />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                      {tpl.name}
                    </h3>
                    <div className="flex items-center space-x-2 space-x-reverse text-xs text-slate-400">
                      <span className="capitalize">{tpl.category}</span>
                      {tpl.builtin ? (
                        <Badge variant="outline" className="text-[10px] py-0 border-indigo-200 text-indigo-600 dark:border-indigo-800 dark:text-indigo-400">
                          Built-in
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] py-0 border-purple-200 text-purple-600 dark:border-purple-800 dark:text-purple-400">
                          Custom
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {!tpl.builtin && (
                  <button
                    onClick={() => handleDelete(tpl.id, tpl.name)}
                    className="text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete custom template"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {tpl.description && (
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {tpl.description}
                </p>
              )}

              {/* Payload Contents Summary */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Includes
                </span>
                <div className="flex flex-wrap gap-1 text-[11px]">
                  {tpl.payload.areas?.length ? (
                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-slate-600 dark:text-slate-300">
                      {tpl.payload.areas.length} Areas
                    </span>
                  ) : null}
                  {tpl.payload.goals?.length ? (
                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-slate-600 dark:text-slate-300">
                      {tpl.payload.goals.length} Goals
                    </span>
                  ) : null}
                  {tpl.payload.routines?.length ? (
                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-slate-600 dark:text-slate-300">
                      {tpl.payload.routines.length} Routines
                    </span>
                  ) : null}
                  {tpl.payload.timeBudgets?.length ? (
                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-slate-600 dark:text-slate-300">
                      {tpl.payload.timeBudgets.length} Budgets
                    </span>
                  ) : null}
                  {tpl.payload.reviewPolicies?.length ? (
                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-slate-600 dark:text-slate-300">
                      {tpl.payload.reviewPolicies.length} Review Policy
                    </span>
                  ) : null}
                  {tpl.payload.resources?.length ? (
                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-slate-600 dark:text-slate-300">
                      {tpl.payload.resources.length} Resource Course
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setApplyTarget(tpl)}
                className="w-full flex items-center justify-center space-x-1.5 space-x-reverse rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-400 dark:hover:bg-indigo-900/60 transition-colors"
              >
                <Sparkles size={14} />
                <span>{t('applyTemplate')}</span>
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Confirmation Modal to Apply Template */}
      {applyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Apply Template: {applyTarget.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Applying this template will create ordinary areas, goals, routines, and budgets in your workspace.
            </p>

            <label className="flex items-center space-x-2 space-x-reverse text-xs text-slate-700 dark:text-slate-300 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={skipDuplicates}
                onChange={(e) => setSkipDuplicates(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Skip entities that already exist (match by name)</span>
            </label>

            <div className="flex items-center justify-end space-x-2 space-x-reverse pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setApplyTarget(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400"
              >
                {t('cancel')}
              </button>
              <button
                disabled={loading}
                onClick={handleApply}
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-sm disabled:opacity-50"
              >
                {loading ? 'Applying...' : 'Apply Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Custom Template Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Copy size={18} className="text-indigo-600" />
              Save Current Setup as Template
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Capture your existing structure so you can apply or share it across projects.
            </p>

            <form onSubmit={handleSaveCustom} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Template Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. My Freelance Operating System"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="What is this template designed for?"
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Select Modules to Include:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeAreas}
                      onChange={(e) => setIncludeAreas(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>Areas</span>
                  </label>
                  <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeGoals}
                      onChange={(e) => setIncludeGoals(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>Goals</span>
                  </label>
                  <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeMilestones}
                      onChange={(e) => setIncludeMilestones(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>Milestones</span>
                  </label>
                  <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeWorkItemTypes}
                      onChange={(e) => setIncludeWorkItemTypes(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>Work Item Types</span>
                  </label>
                  <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeRoutines}
                      onChange={(e) => setIncludeRoutines(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>Routines</span>
                  </label>
                  <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeTimeBudgets}
                      onChange={(e) => setIncludeTimeBudgets(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>Time Budgets</span>
                  </label>
                  <label className="flex items-center space-x-2 space-x-reverse cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeReviewPolicies}
                      onChange={(e) => setIncludeReviewPolicies(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>Review Policies</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 space-x-reverse pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSaveModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400"
                >
                  {t('cancel')}
                </button>
                <button
                  disabled={loading || !customName.trim()}
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
