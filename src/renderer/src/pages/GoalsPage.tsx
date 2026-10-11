import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Archive,
  CheckCircle2,
  Plus,
  Trash2,
  Camera,
  TrendingUp,
  Target,
  Clock,
  Compass,
  FolderKanban,
  Edit2
} from 'lucide-react'
import type { Area, Goal, Milestone, Project } from '../../../shared/entities'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Dialog } from '../components/ui/dialog'
import { NotesWidget } from '../components/NotesWidget'
import { DeleteDialog } from '../components/DeleteDialog'
import type { GoalProgressResult } from '../../../shared/progress-engine'

export function GoalsPage(): JSX.Element {
  const { t } = useTranslation()
  const [goals, setGoals] = useState<Goal[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [projects, setProjects] = useState<Project[]>([])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [areaId, setAreaId] = useState<string>('')
  const [priority, setPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('medium')
  const [targetDate, setTargetDate] = useState('')
  const [measurementType, setMeasurementType] = useState('duration')
  const [targetValue, setTargetValue] = useState<number | ''>('')
  const [unit, setUnit] = useState('')

  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [detailGoal, setDetailGoal] = useState<Goal | null>(null)

  // Goal Progress & History
  const [goalProgress, setGoalProgress] = useState<GoalProgressResult | null>(null)
  const [history, setHistory] = useState<any[]>([])

  // Milestones
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('')
  const [newMilestoneWeight, setNewMilestoneWeight] = useState<number>(20)

  // Custom Metrics
  const [metrics, setMetrics] = useState<any[]>([])
  const [isMetricModalOpen, setIsMetricModalOpen] = useState(false)
  const [metricName, setMetricName] = useState('')
  const [metricCurrent, setMetricCurrent] = useState<number>(0)
  const [metricTarget, setMetricTarget] = useState<number>(100)
  const [metricUnit, setMetricUnit] = useState('')

  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null)

  const planner = window.planner

  const refreshGoals = async (): Promise<void> => {
    if (!planner) return
    const [gList, aList, pList] = await Promise.all([
      planner.goals.list(),
      planner.areas.list(),
      planner.projects.list()
    ])
    setGoals(gList)
    setAreas(aList)
    setProjects(pList)
  }

  useEffect(() => {
    void refreshGoals()
  }, [])

  const refreshDetailGoalData = async (g: Goal): Promise<void> => {
    if (!planner) return
    try {
      const [mList, pRes, hList, metList] = await Promise.all([
        planner.milestones.list(g.id),
        planner.progress ? planner.progress.getGoal(g.id) : null,
        planner.progress ? planner.progress.getHistory('goal', g.id) : [],
        planner.goalMetrics ? planner.goalMetrics.list(g.id) : []
      ])
      setMilestones(mList)
      setGoalProgress(pRes)
      setHistory(hList)
      setMetrics(metList)
    } catch (err) {
      console.error('Failed to load goal detail data:', err)
    }
  }

  useEffect(() => {
    if (detailGoal) {
      void refreshDetailGoalData(detailGoal)
    } else {
      setGoalProgress(null)
      setMilestones([])
      setHistory([])
      setMetrics([])
    }
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
      if (detailGoal?.id === selectedGoal.id) {
        setDetailGoal({ ...selectedGoal, title: title.trim(), measurementType: measurementType as any })
      }
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
    setMeasurementType('duration')
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
    setMeasurementType(goal.measurementType || 'duration')
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
      title: newMilestoneTitle.trim(),
      weight: Number(newMilestoneWeight) || 1
    } as any)
    setNewMilestoneTitle('')
    setNewMilestoneWeight(20)
    await refreshDetailGoalData(detailGoal)
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
    await refreshDetailGoalData(detailGoal)
  }

  const handleRecordSnapshot = async (): Promise<void> => {
    if (!detailGoal || !planner?.progress) return
    await planner.progress.recordSnapshot({ entityType: 'goal', entityId: detailGoal.id })
    await refreshDetailGoalData(detailGoal)
  }

  const handleSaveMetric = async (): Promise<void> => {
    if (!metricName.trim() || !detailGoal || !planner?.goalMetrics) return
    await planner.goalMetrics.create({
      goalId: detailGoal.id,
      name: metricName.trim(),
      currentValue: Number(metricCurrent) || 0,
      targetValue: Number(metricTarget) || 0,
      unit: metricUnit.trim() || undefined
    })
    setIsMetricModalOpen(false)
    setMetricName('')
    setMetricCurrent(0)
    setMetricTarget(100)
    setMetricUnit('')
    await refreshDetailGoalData(detailGoal)
  }

  const handleUpdateMetricValue = async (metricId: string, current: number): Promise<void> => {
    if (!planner?.goalMetrics || !detailGoal) return
    await planner.goalMetrics.update({
      id: metricId,
      currentValue: current
    })
    await refreshDetailGoalData(detailGoal)
  }

  const handleDeleteMetric = async (metricId: string): Promise<void> => {
    if (!planner?.goalMetrics || !detailGoal) return
    await planner.goalMetrics.delete(metricId)
    await refreshDetailGoalData(detailGoal)
  }

  const handleDeleteGoal = async (childAction?: 'detach' | 'archive'): Promise<void> => {
    if (!deleteTarget || !planner) return
    await planner.entities.delete({ kind: 'goal', id: deleteTarget.id, childWorkItemAction: childAction })
    setDeleteTarget(null)
    if (detailGoal?.id === deleteTarget.id) setDetailGoal(null)
    await refreshGoals()
  }

  const linkedProjects = detailGoal ? projects.filter((p) => p.goalId === detailGoal.id) : []

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('goals')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('goalsSubtitle')}
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus size={18} className="me-1" />
          {t('create')} {t('goal')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Goals List (Left 5 Cols) */}
        <div className="space-y-3 lg:col-span-5">
          {goals.map((goal) => {
            const isSelected = detailGoal?.id === goal.id
            const matchedArea = areas.find((a) => a.id === goal.areaId)
            return (
              <Card
                key={goal.id}
                onClick={() => setDetailGoal(goal)}
                className={`cursor-pointer p-4 transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/20 ring-1 ring-indigo-500 dark:bg-indigo-950/20'
                    : 'hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{goal.title}</h3>
                    {goal.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">{goal.description}</p>
                    )}
                  </div>
                  <Badge variant={goal.priority}>{t(goal.priority)}</Badge>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="rounded bg-slate-100 px-2 py-0.5 capitalize dark:bg-slate-800">
                    Mode: {goal.measurementType || 'duration'}
                  </span>
                  {matchedArea && (
                    <span className="rounded bg-indigo-50 px-2 py-0.5 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {matchedArea.name}
                    </span>
                  )}
                  {goal.targetDate && <span>{t('due')}: {goal.targetDate}</span>}
                </div>

                <div className="mt-3 flex justify-end space-x-2 space-x-reverse border-t border-slate-100 pt-2 dark:border-slate-800">
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

        {/* Goal Detail View (Right 7 Cols) */}
        <div className="lg:col-span-7">
          {detailGoal ? (
            <div className="space-y-6">
              {/* Progress Summary Card */}
              <Card className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {detailGoal.title}
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {t('calculationPrefix')} {goalProgress?.details || t('evaluatingProgress')}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => void handleRecordSnapshot()}>
                    <Camera size={14} className="me-1 text-indigo-600" />
                    {t('recordSnapshot')}
                  </Button>
                </div>

                {/* Progress Bar & Metric Numbers */}
                <div className="mt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                      {goalProgress?.progressPercentage ?? 0}%
                    </span>
                    <span className="text-xs text-slate-500">
                      {t('investedVsTotal', {
                        invested: goalProgress?.completedWorkloadMinutes ?? 0,
                        total: goalProgress?.totalWorkloadMinutes ?? 0
                      })}
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                      style={{ width: `${goalProgress?.progressPercentage ?? 0}%` }}
                    />
                  </div>
                </div>

                {/* Snapshots & History Trend */}
                {history.length > 0 && (
                  <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <div className="flex items-center space-x-1.5 space-x-reverse text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <TrendingUp size={14} className="text-emerald-500" />
                      <span>{t('progressSnapshots', { count: history.length })}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {history.slice(-4).map((h) => (
                        <span
                          key={h.id}
                          className="rounded bg-slate-100 px-2 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        >
                          {h.snapshotDate}: <strong className="text-slate-900 dark:text-slate-100">{h.progressPercentage}%</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Milestones with Component Weights */}
              <Card className="p-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    {t('milestonesAndWeights')}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {t('completedCountOf', {
                      done: milestones.filter((m) => m.status === 'completed').length,
                      total: milestones.length
                    })}
                  </span>
                </div>

                <div className="mt-3 flex space-x-2 space-x-reverse">
                  <Input
                    placeholder={t('milestonePlaceholder')}
                    value={newMilestoneTitle}
                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder={t('weightPercent')}
                    value={newMilestoneWeight}
                    onChange={(e) => setNewMilestoneWeight(Number(e.target.value))}
                    className="w-24"
                    title={t('weightTitle')}
                  />
                  <Button onClick={() => void handleAddMilestone()}>{t('add')}</Button>
                </div>

                <div className="mt-3 space-y-1">
                  {milestones.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">
                      {t('noMilestonesYet')}
                    </div>
                  ) : (
                    milestones.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => void handleToggleMilestone(m)}
                        className="flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-slate-50 dark:hover:bg-slate-900/40"
                      >
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <CheckCircle2
                            size={18}
                            className={
                              m.status === 'completed' ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'
                            }
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
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800">
                          {t('weightLabel', { weight: (m as any).weight ?? 1 })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Custom Numeric Metrics (Section 78) */}
              <Card className="p-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Target size={16} className="text-indigo-600" />
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      {t('customNumericMetrics')}
                    </h3>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsMetricModalOpen(true)}>
                    <Plus size={14} className="me-1" />
                    {t('addMetric')}
                  </Button>
                </div>

                <div className="mt-3 space-y-2">
                  {metrics.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">
                      {t('noCustomMetrics')}
                    </div>
                  ) : (
                    metrics.map((met) => {
                      const pct = met.targetValue > 0 ? Math.min(100, Math.round((met.currentValue / met.targetValue) * 100)) : 0
                      return (
                        <div
                          key={met.id}
                          className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5 dark:border-slate-800"
                        >
                          <div>
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {met.name}
                            </span>
                            <div className="text-[11px] text-slate-500">
                              {met.currentValue} / {met.targetValue} {met.unit || ''} ({pct}%)
                            </div>
                          </div>
                          <div className="flex items-center space-x-1.5 space-x-reverse">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => void handleUpdateMetricValue(met.id, met.currentValue + 1)}
                            >
                              +1
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => void handleDeleteMetric(met.id)}
                              className="text-red-500"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </Card>

              {/* Linked Projects */}
              <Card className="p-5">
                <h3 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">
                  {t('linkedProjectsCount', { count: linkedProjects.length })}
                </h3>
                {linkedProjects.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400">
                    {t('noProjectsLinked')}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {linkedProjects.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between rounded-md bg-slate-50 p-2 text-xs dark:bg-slate-900/40"
                      >
                        <span className="font-medium text-slate-800 dark:text-slate-200">{p.title}</span>
                        <Badge variant={p.priority}>{p.priority}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Notes */}
              <NotesWidget entityType="goal" entityId={detailGoal.id} />
            </div>
          ) : (
            <Card className="p-12 text-center text-slate-400">
              <Compass size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-700" />
              {t('selectGoalToView')}
            </Card>
          )}
        </div>
      </div>

      {/* Goal Create/Edit Dialog */}
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
            placeholder={t('goalNamePlaceholder')}
          />
          <Input
            label={t('description')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('optionalDescription')}
          />
          <Select
            label={t('progressCalculationMode')}
            value={measurementType}
            onChange={(e) => setMeasurementType(e.target.value)}
            options={[
              { value: 'duration', label: t('modeDuration') },
              { value: 'weighted', label: t('modeWeighted') },
              { value: 'count', label: t('modeCount') },
              { value: 'milestone', label: t('modeMilestone') },
              { value: 'numeric', label: t('modeNumeric') },
              { value: 'percentage', label: t('modePercentage') }
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

      {/* Add Custom Metric Dialog */}
      <Dialog
        isOpen={isMetricModalOpen}
        onClose={() => setIsMetricModalOpen(false)}
        title={t('addCustomMetric')}
      >
        <div className="space-y-4">
          <Input
            label={t('metricName')}
            placeholder={t('metricNamePlaceholder')}
            value={metricName}
            onChange={(e) => setMetricName(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('currentValue')}
              type="number"
              value={metricCurrent}
              onChange={(e) => setMetricCurrent(Number(e.target.value))}
            />
            <Input
              label={t('targetValue')}
              type="number"
              value={metricTarget}
              onChange={(e) => setMetricTarget(Number(e.target.value))}
            />
          </div>
          <Input
            label={t('unit')}
            placeholder={t('metricUnitPlaceholder')}
            value={metricUnit}
            onChange={(e) => setMetricUnit(e.target.value)}
          />
          <div className="flex justify-end space-x-2 space-x-reverse pt-2">
            <Button variant="ghost" onClick={() => setIsMetricModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={() => void handleSaveMetric()}>{t('save')}</Button>
          </div>
        </div>
      </Dialog>

      {/* Delete Dialog */}
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
