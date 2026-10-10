import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import type { Area, CustomFieldDefinition, Goal, Project, WorkItem, WorkItemType } from '../../../shared/entities'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Dialog } from '../components/ui/dialog'
import { NotesWidget } from '../components/NotesWidget'
import { DeleteDialog } from '../components/DeleteDialog'

export function WorkItemsPage(): JSX.Element {
  const { t } = useTranslation()
  const [workItems, setWorkItems] = useState<WorkItem[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [workItemTypes, setWorkItemTypes] = useState<WorkItemType[]>([])
  const [customDefs, setCustomDefs] = useState<CustomFieldDefinition[]>([])
  const [customValues, setCustomValues] = useState<Record<string, any>>({})

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState('')
  const [goalId, setGoalId] = useState('')
  const [areaId, setAreaId] = useState('')
  const [typeId, setTypeId] = useState('')
  const [priority, setPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('medium')
  const [status, setStatus] = useState<any>('todo')
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(0)
  const [deadline, setDeadline] = useState('')
  const [energyLevel, setEnergyLevel] = useState<any>('')
  const [flexibility, setFlexibility] = useState<any>('flexible')
  const [selectedWorkItem, setSelectedWorkItem] = useState<WorkItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<WorkItem | null>(null)

  const planner = window.planner

  const refreshAll = async (): Promise<void> => {
    if (!planner) return
    const [wList, aList, gList, pList, tList] = await Promise.all([
      planner.workItems.list(),
      planner.areas.list(),
      planner.goals.list(),
      planner.projects.list(),
      planner.workItemTypes.list()
    ])
    setWorkItems(wList)
    setAreas(aList)
    setGoals(gList)
    setProjects(pList)
    setWorkItemTypes(tList)
  }

  useEffect(() => {
    void refreshAll()
  }, [])

  useEffect(() => {
    if (!planner || !typeId) {
      setCustomDefs([])
      return
    }
    planner.customFieldDefs.list(typeId).then(setCustomDefs).catch(() => setCustomDefs([]))
  }, [typeId])

  const handleCreateOrUpdate = async (): Promise<void> => {
    if (!title.trim() || !planner) return

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      projectId: projectId || null,
      goalId: goalId || null,
      areaId: areaId || null,
      workItemTypeId: typeId || null,
      priority,
      status,
      estimatedMinutes,
      deadline: deadline || null,
      energyLevel: energyLevel || null,
      flexibility,
      customFieldValues: customValues
    }

    if (selectedWorkItem) {
      await planner.workItems.update({ id: selectedWorkItem.id, ...payload })
    } else {
      await planner.workItems.create(payload)
    }
    closeModal()
    await refreshAll()
  }

  const openCreateModal = (): void => {
    setSelectedWorkItem(null)
    setTitle('')
    setDescription('')
    setProjectId('')
    setGoalId('')
    setAreaId('')
    setTypeId('')
    setPriority('medium')
    setStatus('todo')
    setEstimatedMinutes(0)
    setDeadline('')
    setEnergyLevel('')
    setFlexibility('flexible')
    setCustomValues({})
    setIsModalOpen(true)
  }

  const openEditModal = async (item: WorkItem): Promise<void> => {
    setSelectedWorkItem(item)
    setTitle(item.title)
    setDescription(item.description || '')
    setProjectId(item.projectId || '')
    setGoalId(item.goalId || '')
    setAreaId(item.areaId || '')
    setTypeId(item.workItemTypeId || '')
    setPriority(item.priority)
    setStatus(item.status)
    setEstimatedMinutes(item.estimatedMinutes || 0)
    setDeadline(item.deadline || '')
    setEnergyLevel(item.energyLevel || '')
    setFlexibility(item.flexibility || 'flexible')

    if (planner && item.id) {
      const vals = await planner.customFieldValues.get(item.id)
      const valMap: Record<string, any> = {}
      vals.forEach((v) => {
        valMap[v.definitionId] = v.textValue ?? v.numberValue ?? v.booleanValue ?? v.dateValue ?? v.selectValue ?? ''
      })
      setCustomValues(valMap)
    }

    setIsModalOpen(true)
  }

  const closeModal = (): void => {
    setIsModalOpen(false)
    setSelectedWorkItem(null)
  }

  const handleDelete = async (): Promise<void> => {
    if (!deleteTarget || !planner) return
    await planner.entities.delete({ kind: 'workItem', id: deleteTarget.id })
    setDeleteTarget(null)
    await refreshAll()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('inbox')} / {t('workItems')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Executable activities. No mandatory hierarchy required.
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus size={18} className="me-1" />
          {t('create')} {t('workItems')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workItems.map((item) => {
          const matchedProject = projects.find((p) => p.id === item.projectId)
          const matchedType = workItemTypes.find((t) => t.id === item.workItemTypeId)
          return (
            <Card key={item.id} className="flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
                  <Badge variant={item.priority}>{t(item.priority)}</Badge>
                </div>
                {item.description && (
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{item.description}</p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  {matchedType && (
                    <span className="rounded bg-indigo-50 px-2 py-0.5 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {matchedType.name}
                    </span>
                  )}
                  {matchedProject && (
                    <span className="rounded bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
                      {matchedProject.title}
                    </span>
                  )}
                  <span>Est: {item.estimatedMinutes}m</span>
                  {item.deadline && <span>Due: {item.deadline}</span>}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" onClick={() => void openEditModal(item)}>
                    {t('edit')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(item)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
                <NotesWidget entityType="workItem" entityId={item.id} />
              </div>
            </Card>
          )
        })}
      </div>

      <Dialog
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedWorkItem ? `${t('edit')} ${t('workItems')}` : `${t('create')} ${t('workItems')}`}
      >
        <div className="space-y-4">
          <Input
            label={t('title')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Review pull request, Study Chapter 3, Workout"
          />
          <Input
            label={t('description')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional details..."
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label={t('type')}
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              options={[
                { value: '', label: t('noType') },
                ...workItemTypes.map((type) => ({ value: type.id, label: type.name }))
              ]}
            />
            <Select
              label={t('project')}
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              options={[
                { value: '', label: t('noProject') },
                ...projects.map((p) => ({ value: p.id, label: p.title }))
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label={t('goal')}
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              options={[
                { value: '', label: t('noGoal') },
                ...goals.map((g) => ({ value: g.id, label: g.title }))
              ]}
            />
            <Select
              label={t('area')}
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
              options={[
                { value: '', label: t('noArea') },
                ...areas.map((a) => ({ value: a.id, label: a.name }))
              ]}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Select
              label={t('priority')}
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              options={[
                { value: 'critical', label: t('critical') },
                { value: 'high', label: t('high') },
                { value: 'medium', label: t('medium') },
                { value: 'low', label: t('low') }
              ]}
            />
            <Input
              label={t('estimatedMinutes')}
              type="number"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
            />
            <Input
              label={t('deadline')}
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          {/* Custom Fields defined for selected type */}
          {customDefs.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-900/50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Custom Fields ({workItemTypes.find((t) => t.id === typeId)?.name})
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {customDefs.map((def) => (
                  <div key={def.id}>
                    {def.fieldType === 'select' ? (
                      <Select
                        label={def.name}
                        value={customValues[def.id] || ''}
                        onChange={(e) => setCustomValues({ ...customValues, [def.id]: e.target.value })}
                        options={[
                          { value: '', label: '-- Select --' },
                          ...(def.options || []).map((o) => ({ value: o, label: o }))
                        ]}
                      />
                    ) : def.fieldType === 'boolean' ? (
                      <label className="flex items-center space-x-2 space-x-reverse pt-4 text-xs font-medium">
                        <input
                          type="checkbox"
                          checked={!!customValues[def.id]}
                          onChange={(e) => setCustomValues({ ...customValues, [def.id]: e.target.checked })}
                          className="rounded text-indigo-600"
                        />
                        <span>{def.name}</span>
                      </label>
                    ) : (
                      <Input
                        label={def.name}
                        type={def.fieldType === 'number' ? 'number' : def.fieldType === 'date' ? 'date' : 'text'}
                        value={customValues[def.id] || ''}
                        onChange={(e) =>
                          setCustomValues({
                            ...customValues,
                            [def.id]: def.fieldType === 'number' ? Number(e.target.value) : e.target.value
                          })
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 space-x-reverse pt-2">
            <Button variant="ghost" onClick={closeModal}>
              {t('cancel')}
            </Button>
            <Button onClick={() => void handleCreateOrUpdate()}>{t('save')}</Button>
          </div>
        </div>
      </Dialog>

      {deleteTarget && (
        <DeleteDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title={deleteTarget.title}
          onConfirm={() => void handleDelete()}
        />
      )}
    </div>
  )
}
