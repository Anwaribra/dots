import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Archive, CheckCircle2, Plus, Trash2 } from 'lucide-react'
import type { Area, Goal, Milestone } from '../../../shared/entities'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Dialog } from '../components/ui/dialog'
import { NotesWidget } from '../components/NotesWidget'
import { DeleteDialog } from '../components/DeleteDialog'

export function GoalsPage(): JSX.Element {
  const { t } = useTranslation()
  const [goals, setGoals] = useState<Goal[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [areaId, setAreaId] = useState<string>('')
  const [priority, setPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('medium')
  const [targetDate, setTargetDate] = useState('')
  const [measurementType, setMeasurementType] = useState('percentage')
  const [targetValue, setTargetValue] = useState<number | ''>('')
  const [unit, setUnit] = useState('')
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [detailGoal, setDetailGoal] = useState<Goal | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null)

  const planner = window.planner

  const refreshGoals = async (): Promise<void> => {
    if (!planner) return
    const [gList, aList] = await Promise.all([planner.goals.list(), planner.areas.list()])
    setGoals(gList)
    setAreas(aList)
  }

  useEffect(() => {
    void refreshGoals()
  }, [])

  const refreshMilestones = async (gId: string): Promise<void> => {
    if (!planner) return
    const list = await planner.milestones.list(gId)
    setMilestones(list)
  }

  useEffect(() => {
    if (detailGoal) void refreshMilestones(detailGoal.id)
  }, [detailGoal])

  const handleCreateOrUpdate = async (): Promise<void> => {
    if (!title.trim() || !planner) return
    if (selectedGoal) {
      await planner.goals.update({
        id: selectedGoal.id,
        title: title.trim(),
        description: description.trim() || null,
        areaId: areaId || null,
        priority,
        targetDate: targetDate || null,
        measurementType: measurementType as any,
        targetValue: targetValue === '' ? null : Number(targetValue),
        unit: unit.trim() || null
      })
    } else {
      await planner.goals.create({
        title: title.trim(),
        description: description.trim() || undefined,
        areaId: areaId || null,
        priority,
        targetDate: targetDate || null,
        measurementType: measurementType as any,
        targetValue: targetValue === '' ? undefined : Number(targetValue),
        unit: unit.trim() || undefined
      })
    }
    closeModal()
    await refreshGoals()
  }

  const openCreateModal = (): void => {
    setSelectedGoal(null)
    setTitle('')
    setDescription('')
    setAreaId('')
    setPriority('medium')
    setTargetDate('')
    setMeasurementType('percentage')
    setTargetValue('')
    setUnit('')
    setIsModalOpen(true)
  }

  const openEditModal = (goal: Goal): void => {
    setSelectedGoal(goal)
    setTitle(goal.title)
    setDescription(goal.description || '')
    setAreaId(goal.areaId || '')
    setPriority(goal.priority)
    setTargetDate(goal.targetDate || '')
    setMeasurementType(goal.measurementType)
    setTargetValue(goal.targetValue ?? '')
    setUnit(goal.unit || '')
    setIsModalOpen(true)
  }

  const closeModal = (): void => {
    setIsModalOpen(false)
    setSelectedGoal(null)
  }

  const handleAddMilestone = async (): Promise<void> => {
    if (!newMilestoneTitle.trim() || !detailGoal || !planner) return
    await planner.milestones.create({
      goalId: detailGoal.id,
      title: newMilestoneTitle.trim()
    })
    setNewMilestoneTitle('')
    await refreshMilestones(detailGoal.id)
  }

  const handleToggleMilestone = async (m: Milestone): Promise<void> => {
    if (!planner || !detailGoal) return
    const nextStatus = m.status === 'completed' ? 'active' : 'completed'
    const nextProgress = nextStatus === 'completed' ? 100 : 0
    await planner.milestones.update({
      id: m.id,
      status: nextStatus as any,
      progress: nextProgress
    })
    await refreshMilestones(detailGoal.id)
  }

  const handleDeleteGoal = async (childAction?: 'detach' | 'archive'): Promise<void> => {
    if (!deleteTarget || !planner) return
    await planner.entities.delete({ kind: 'goal', id: deleteTarget.id, childWorkItemAction: childAction })
    setDeleteTarget(null)
    if (detailGoal?.id === deleteTarget.id) setDetailGoal(null)
    await refreshGoals()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('goals')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Desired outcomes. Area association is optional.
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus size={18} className="me-1" />
          {t('create')} {t('goal')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {goals.map((goal) => {
              const matchedArea = areas.find((a) => a.id === goal.areaId)
              return (
                <Card
                  key={goal.id}
                  className={`cursor-pointer transition-shadow hover:shadow-md ${
                    detailGoal?.id === goal.id ? 'ring-2 ring-indigo-500' : ''
                  }`}
                  onClick={() => setDetailGoal(goal)}
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{goal.title}</h3>
                    <Badge variant={goal.priority}>{t(goal.priority)}</Badge>
                  </div>
                  {goal.description && (
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {goal.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>{matchedArea ? matchedArea.name : t('noArea')}</span>
                    {goal.targetDate && <span>Due: {goal.targetDate}</span>}
                  </div>
                  <div className="mt-3 flex justify-end space-x-1 space-x-reverse">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditModal(goal)
                      }}
                    >
                      {t('edit')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteTarget(goal)
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        <div>
          {detailGoal ? (
            <Card className="space-y-4 sticky top-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {detailGoal.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {areas.find((a) => a.id === detailGoal.areaId)?.name ?? t('noArea')}
                  </p>
                </div>
                <Badge variant={detailGoal.priority}>{t(detailGoal.priority)}</Badge>
              </div>

              {detailGoal.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400">{detailGoal.description}</p>
              )}

              <div className="border-t border-slate-200 pt-3 dark:border-slate-800 space-y-2">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {t('milestones')}
                </h4>
                <div className="flex space-x-2 space-x-reverse">
                  <Input
                    placeholder="New milestone..."
                    value={newMilestoneTitle}
                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  />
                  <Button size="sm" onClick={() => void handleAddMilestone()}>
                    <Plus size={16} />
                  </Button>
                </div>
                <div className="space-y-1 pt-1">
                  {milestones.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => void handleToggleMilestone(m)}
                      className="flex cursor-pointer items-center space-x-2 space-x-reverse rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <CheckCircle2
                        size={18}
                        className={m.status === 'completed' ? 'text-emerald-500' : 'text-slate-300'}
                      />
                      <span
                        className={`text-sm ${
                          m.status === 'completed'
                            ? 'line-through text-slate-400'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {m.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <NotesWidget entityType="goal" entityId={detailGoal.id} />
            </Card>
          ) : (
            <Card className="p-8 text-center text-slate-400">
              Select a goal to view milestones and notes.
            </Card>
          )}
        </div>
      </div>

      <Dialog
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedGoal ? `${t('edit')} ${t('goal')}` : `${t('create')} ${t('goal')}`}
      >
        <div className="space-y-4">
          <Input
            label={t('title')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Learn TypeScript, Pass Certification, Read 20 books"
          />
          <Input
            label={t('description')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
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
          <div className="grid grid-cols-2 gap-4">
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
              label={t('targetDate')}
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>

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
          hasChildWorkItems={true}
          onConfirm={(action) => void handleDeleteGoal(action)}
        />
      )}
    </div>
  )
}
