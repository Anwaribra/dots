import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Inbox, Play, Plus, Trash2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import type { Area, Project, WorkItem, WorkItemType } from '../../../shared/entities'
import type { PlanningResult } from '../../../main/scheduler/types'

function getTodayString(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function InboxPage(): JSX.Element {
  const { t } = useTranslation()
  const planner = window.planner

  const [items, setItems] = useState<WorkItem[]>([])
  const [types, setTypes] = useState<WorkItemType[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [areas, setAreas] = useState<Area[]>([])

  // Quick form state
  const [title, setTitle] = useState('')
  const [estimatedMinutes, setEstimatedMinutes] = useState(30)
  const [priority, setPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('medium')
  const [deadline, setDeadline] = useState('')
  const [workItemTypeId, setWorkItemTypeId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [areaId, setAreaId] = useState('')

  // Engine feedback report state
  const [planFeedback, setPlanFeedback] = useState<{
    itemId: string
    title: string
    message: string
    success: boolean
  } | null>(null)

  useEffect(() => {
    loadInboxData()
  }, [])

  const loadInboxData = async (): Promise<void> => {
    if (!planner) return
    const [wList, tList, pList, aList] = await Promise.all([
      planner.workItems.list(),
      planner.workItemTypes.list(),
      planner.projects.list(),
      planner.areas.list()
    ])
    // Filter unscheduled or todo work items
    setItems(wList.filter((w) => w.status === 'todo'))
    setTypes(tList)
    setProjects(pList)
    setAreas(aList)
  }

  const handleCapture = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!title.trim() || !planner) return

    await planner.workItems.create({
      title: title.trim(),
      workItemTypeId: workItemTypeId || undefined,
      estimatedMinutes: Number(estimatedMinutes) || 30,
      priority,
      deadline: deadline || undefined,
      projectId: projectId || undefined,
      areaId: areaId || undefined,
      status: 'todo'
    })

    setTitle('')
    setEstimatedMinutes(30)
    setPriority('medium')
    setDeadline('')
    setWorkItemTypeId('')
    setProjectId('')
    setAreaId('')
    loadInboxData()
  }

  const handlePlanItem = async (item: WorkItem): Promise<void> => {
    if (!planner) return
    setPlanFeedback(null)

    // Run planning engine for current week
    const today = getTodayString()
    const result: PlanningResult = await planner.planning.generateWeek(today)

    // Find where item landed in scheduledItems or unscheduledItems
    const scheduled = result.scheduledItems.find((s) => s.workItemId === item.id)
    const unscheduled = result.unscheduledItems.find((u) => u.workItemId === item.id)
    const explanation = result.explanations.find((e) => e.entityId === item.id)

    if (scheduled) {
      setPlanFeedback({
        itemId: item.id,
        title: item.title,
        message: `Successfully scheduled on ${scheduled.date} at ${scheduled.startTime} - ${scheduled.endTime} (${scheduled.durationMinutes}m).`,
        success: true
      })
    } else if (unscheduled) {
      setPlanFeedback({
        itemId: item.id,
        title: item.title,
        message: unscheduled.reason,
        success: false
      })
    } else if (explanation) {
      setPlanFeedback({
        itemId: item.id,
        title: item.title,
        message: explanation.reason,
        success: explanation.action === 'scheduled' || explanation.action === 'split'
      })
    } else {
      setPlanFeedback({
        itemId: item.id,
        title: item.title,
        message: 'Planning engine processed item. Check the Weekly Planner to view placement.',
        success: true
      })
    }

    loadInboxData()
  }

  const handleDeleteItem = async (id: string): Promise<void> => {
    if (!planner) return
    await planner.entities.delete({ kind: 'workItem', id })
    loadInboxData()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center space-x-3 space-x-reverse">
          <Inbox className="text-indigo-600 dark:text-indigo-400" size={24} />
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {t('inboxQueue')}
            </h1>
            <p className="text-xs text-slate-500">
              {t('inboxDesc')}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
          {items.length} {t('pending')}
        </span>
      </div>

      {/* Plan Feedback Alert Callout */}
      {planFeedback && (
        <div
          className={`rounded-xl border p-4 text-sm ${
            planFeedback.success
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
              : 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
          }`}
        >
          <div className="flex items-start space-x-2 space-x-reverse">
            {planFeedback.success ? (
              <CheckCircle2 className="mt-0.5 text-emerald-600 dark:text-emerald-400" size={18} />
            ) : (
              <AlertTriangle className="mt-0.5 text-amber-600 dark:text-amber-400" size={18} />
            )}
            <div>
              <strong className="block font-bold">{t('planningResult', { title: planFeedback.title })}</strong>
              <p className="mt-0.5 text-xs">{planFeedback.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Capture Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
          {t('quickCaptureForm')}
        </h3>

        <form onSubmit={handleCapture} className="space-y-4">
          <div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('whatNeedsToBeDone')}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                {t('type')}
              </label>
              <select
                value={workItemTypeId}
                onChange={(e) => setWorkItemTypeId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="">{t('noType')}</option>
                {types.map((tItem) => (
                  <option key={tItem.id} value={tItem.id}>
                    {tItem.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                {t('estimatedMinutes')}
              </label>
              <input
                type="number"
                min={5}
                max={480}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                {t('priority')}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="critical">{t('critical')}</option>
                <option value="high">{t('high')}</option>
                <option value="medium">{t('medium')}</option>
                <option value="low">{t('low')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                {t('deadline')}
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                {t('project')}
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="">{t('noProject')}</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                {t('area')}
              </label>
              <select
                value={areaId}
                onChange={(e) => setAreaId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="">{t('noArea')}</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center space-x-2 space-x-reverse rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              <Plus size={16} />
              <span>{t('addToInbox')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Inbox List */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
          {t('capturedTasksQueue')}
        </h3>

        {items.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            {t('inboxEmpty')}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const pr = projects.find((p) => p.id === item.projectId)
              const ar = areas.find((a) => a.id === item.areaId)
              const tp = types.find((tItem) => tItem.id === item.workItemTypeId)

              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4 transition-colors md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-slate-950"
                >
                  <div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <strong className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </strong>
                      <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {tp ? tp.name : t('type')}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          item.priority === 'critical'
                            ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                            : item.priority === 'high'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {t(item.priority)}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span className="flex items-center space-x-1 space-x-reverse">
                        <Clock size={12} />
                        <span>{item.estimatedMinutes}m</span>
                      </span>
                      {item.deadline && <span>{t('deadline')}: {item.deadline}</span>}
                      {pr && <span>{t('project')}: {pr.title}</span>}
                      {ar && <span>{t('area')}: {ar.name}</span>}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 space-x-reverse pt-2 md:pt-0">
                    <button
                      onClick={() => handlePlanItem(item)}
                      className="flex items-center space-x-1 space-x-reverse rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                    >
                      <Play size={14} />
                      <span>{t('planItem')}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
