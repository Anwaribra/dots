import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, X } from 'lucide-react'
import type { Area, Project, WorkItemType } from '../../../shared/entities'

interface QuickAddModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

export function QuickAddModal({ isOpen, onClose, onCreated }: QuickAddModalProps): JSX.Element | null {
  const { t } = useTranslation()
  const planner = window.planner

  const [title, setTitle] = useState('')
  const [estimatedMinutes, setEstimatedMinutes] = useState(30)
  const [priority, setPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('medium')
  const [deadline, setDeadline] = useState('')
  const [workItemTypeId, setWorkItemTypeId] = useState<string>('')
  const [projectId, setProjectId] = useState<string>('')
  const [areaId, setAreaId] = useState<string>('')

  const [types, setTypes] = useState<WorkItemType[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen && planner) {
      Promise.all([
        planner.workItemTypes.list(),
        planner.projects.list(),
        planner.areas.list()
      ]).then(([tList, pList, aList]) => {
        setTypes(tList)
        setProjects(pList)
        setAreas(aList)
      })
    }
  }, [isOpen, planner])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!title.trim() || !planner) return

    setSubmitting(true)
    try {
      await planner.workItems.create({
        title: title.trim(),
        workItemTypeId: workItemTypeId || undefined,
        estimatedMinutes: Number(estimatedMinutes) || 30,
        priority,
        deadline: deadline || undefined,
        projectId: projectId || undefined,
        areaId: areaId || undefined,
        status: 'todo',
        flexibility: 'flexible'
      })
      setTitle('')
      setEstimatedMinutes(30)
      setPriority('medium')
      setDeadline('')
      setWorkItemTypeId('')
      setProjectId('')
      setAreaId('')
      onCreated()
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Plus className="text-indigo-600 dark:text-indigo-400" size={20} />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {t('quickCaptureTask')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('title')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('taskTitlePlaceholder')}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('type')}
              </label>
              <select
                value={workItemTypeId}
                onChange={(e) => setWorkItemTypeId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('estimatedMinutes')}
              </label>
              <input
                type="number"
                min={5}
                max={480}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('priority')}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="critical">{t('critical')}</option>
                <option value="high">{t('high')}</option>
                <option value="medium">{t('medium')}</option>
                <option value="low">{t('low')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('deadline')}
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('project')}
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('area')}
              </label>
              <select
                value={areaId}
                onChange={(e) => setAreaId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
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

          <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {submitting ? t('saving') : t('addToInbox')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
