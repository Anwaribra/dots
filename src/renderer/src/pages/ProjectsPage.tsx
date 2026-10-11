import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  Trash2,
  FolderKanban,
  CheckCircle2,
  Clock,
  Layers,
  Compass,
  AlertCircle,
  Play
} from 'lucide-react'
import type { Area, Goal, Project, WorkItem } from '../../../shared/entities'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Dialog } from '../components/ui/dialog'
import { NotesWidget } from '../components/NotesWidget'
import { DeleteDialog } from '../components/DeleteDialog'
import { calculateProjectProgress } from '../../../shared/progress-engine'

export function ProjectsPage(): JSX.Element {
  const { t } = useTranslation()
  const [projects, setProjects] = useState<Project[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [workItems, setWorkItems] = useState<WorkItem[]>([])
  const [sessions, setSessions] = useState<any[]>([])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [areaId, setAreaId] = useState('')
  const [goalId, setGoalId] = useState('')
  const [priority, setPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('medium')
  const [deadline, setDeadline] = useState('')
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(0)

  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [detailProject, setDetailProject] = useState<Project | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)

  const planner = window.planner

  const refreshData = async (): Promise<void> => {
    if (!planner) return
    const [pList, aList, gList, wList, sList] = await Promise.all([
      planner.projects.list(),
      planner.areas.list(),
      planner.goals.list(),
      planner.workItems.list(),
      planner.sessions ? planner.sessions.list() : []
    ])
    setProjects(pList)
    setAreas(aList)
    setGoals(gList)
    setWorkItems(wList)
    setSessions(sList)
  }

  useEffect(() => {
    void refreshData()
  }, [])

  const handleCreateOrUpdate = async (): Promise<void> => {
    if (!title.trim() || !planner) return
    if (selectedProject) {
      await planner.projects.update({
        id: selectedProject.id,
        title: title.trim(),
        description: description.trim() || null,
        areaId: areaId || null,
        goalId: goalId || null,
        priority,
        deadline: deadline || null,
        estimatedMinutes
      })
      if (detailProject?.id === selectedProject.id) {
        setDetailProject({
          ...selectedProject,
          title: title.trim(),
          areaId: areaId || null,
          goalId: goalId || null,
          priority,
          deadline: deadline || null,
          estimatedMinutes
        })
      }
    } else {
      await planner.projects.create({
        title: title.trim(),
        description: description.trim() || undefined,
        areaId: areaId || null,
        goalId: goalId || null,
        priority,
        deadline: deadline || null,
        estimatedMinutes
      })
    }
    closeModal()
    await refreshData()
  }

  const openCreateModal = (): void => {
    setSelectedProject(null)
    setTitle('')
    setDescription('')
    setAreaId('')
    setGoalId('')
    setPriority('medium')
    setDeadline('')
    setEstimatedMinutes(0)
    setIsModalOpen(true)
  }

  const openEditModal = (project: Project): void => {
    setSelectedProject(project)
    setTitle(project.title)
    setDescription(project.description || '')
    setAreaId(project.areaId || '')
    setGoalId(project.goalId || '')
    setPriority(project.priority)
    setDeadline(project.deadline || '')
    setEstimatedMinutes(project.estimatedMinutes || 0)
    setIsModalOpen(true)
  }

  const closeModal = (): void => {
    setIsModalOpen(false)
    setSelectedProject(null)
  }

  const handleDeleteProject = async (childAction?: 'detach' | 'archive'): Promise<void> => {
    if (!deleteTarget || !planner) return
    await planner.entities.delete({ kind: 'project', id: deleteTarget.id, childWorkItemAction: childAction })
    setDeleteTarget(null)
    if (detailProject?.id === deleteTarget.id) setDetailProject(null)
    await refreshData()
  }

  // Work items belonging to detailProject
  const projectTasks = detailProject ? workItems.filter((w) => w.projectId === detailProject.id) : []
  const projectSessions = detailProject
    ? sessions.filter((s) => {
        if (s.projectId === detailProject.id) return true
        if (s.workItemId) {
          const wi = workItems.find((w) => w.id === s.workItemId)
          return wi?.projectId === detailProject.id
        }
        return false
      })
    : []

  // Progress engine evaluation (Duration-weighted progress)
  const progressStats = calculateProjectProgress(
    projectTasks.map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      completed: t.status === 'completed' || t.status === 'done',
      estimatedMinutes: t.estimatedMinutes || 0,
      actualMinutes: t.actualMinutes || 0
    }))
  )

  const actualTimeTracked = projectSessions.reduce(
    (acc, s) => acc + Math.max(0, (s.durationMinutes || 0) - (s.pausedDurationMinutes || 0)),
    0
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('projects')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Containers of executable work. Progress is duration-weighted (10m vs 3h contribute accurately).
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus size={18} className="me-1" />
          {t('create')} {t('project')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Project List (Left 5 Cols) */}
        <div className="space-y-3 lg:col-span-5">
          {projects.map((project) => {
            const isSelected = detailProject?.id === project.id
            const matchedArea = areas.find((a) => a.id === project.areaId)
            const matchedGoal = goals.find((g) => g.id === project.goalId)
            const tasksCount = workItems.filter((w) => w.projectId === project.id).length

            return (
              <Card
                key={project.id}
                onClick={() => setDetailProject(project)}
                className={`cursor-pointer p-4 transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/20 ring-1 ring-indigo-500 dark:bg-indigo-950/20'
                    : 'hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">{project.title}</h3>
                  <Badge variant={project.priority}>{t(project.priority)}</Badge>
                </div>

                {project.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">{project.description}</p>
                )}

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                  {matchedArea && (
                    <span className="rounded bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
                      {matchedArea.name}
                    </span>
                  )}
                  {matchedGoal && (
                    <span className="rounded bg-indigo-50 px-2 py-0.5 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {matchedGoal.title}
                    </span>
                  )}
                  <span className="rounded bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
                    {tasksCount} tasks
                  </span>
                  {project.deadline && <span>Due: {project.deadline}</span>}
                </div>

                <div className="mt-3 flex justify-end space-x-2 space-x-reverse border-t border-slate-100 pt-2 dark:border-slate-800">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      openEditModal(project)
                    }}
                  >
                    {t('edit')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteTarget(project)
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

        {/* Project Detail View (Right 7 Cols) */}
        <div className="lg:col-span-7">
          {detailProject ? (
            <div className="space-y-6">
              {/* Progress & Workload Summary Card */}
              <Card className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {detailProject.title}
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {detailProject.description || 'No description provided.'}
                    </p>
                  </div>
                  <Badge variant={detailProject.priority}>{detailProject.priority}</Badge>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                      {progressStats.progressPercentage}%
                    </span>
                    <span className="text-xs text-slate-500">
                      Duration-weighted progress ({progressStats.completedMinutes}m / {progressStats.totalMinutes}m)
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                      style={{ width: `${progressStats.progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* KPI summary */}
                <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-3 text-center dark:border-slate-800">
                  <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-900/50">
                    <div className="text-[11px] text-slate-400">Completed Tasks</div>
                    <div className="mt-0.5 text-base font-bold text-slate-800 dark:text-slate-200">
                      {progressStats.completedTasks} / {progressStats.totalTasks}
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-900/50">
                    <div className="text-[11px] text-slate-400">Time Tracked</div>
                    <div className="mt-0.5 text-base font-bold text-emerald-600 dark:text-emerald-400">
                      {actualTimeTracked}m
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-900/50">
                    <div className="text-[11px] text-slate-400">Target Deadline</div>
                    <div className="mt-0.5 text-base font-bold text-slate-800 dark:text-slate-200">
                      {detailProject.deadline || 'None'}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Tasks List */}
              <Card className="p-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    Work Items ({projectTasks.length})
                  </h3>
                </div>

                <div className="mt-3 space-y-2">
                  {projectTasks.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No tasks assigned to this project yet. Use Quick Add or Work Items page to link tasks.
                    </div>
                  ) : (
                    projectTasks.map((task) => {
                      const isDone = task.status === 'completed' || task.status === 'done'
                      return (
                        <div
                          key={task.id}
                          className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5 dark:border-slate-800"
                        >
                          <div className="flex items-center space-x-2.5 space-x-reverse">
                            <CheckCircle2
                              size={18}
                              className={isDone ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'}
                            />
                            <div>
                              <span
                                className={`text-sm font-medium ${
                                  isDone ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                {task.title}
                              </span>
                              <div className="text-[11px] text-slate-400">
                                {task.estimatedMinutes || 0}m planned • {task.actualMinutes || 0}m actual
                              </div>
                            </div>
                          </div>
                          <Badge variant={task.priority}>{task.priority}</Badge>
                        </div>
                      )
                    })
                  )}
                </div>
              </Card>

              {/* Time Sessions */}
              <Card className="p-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Clock size={16} className="text-emerald-500" />
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      Recent Time Sessions ({projectSessions.length})
                    </h3>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {projectSessions.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">
                      No time logged for this project yet.
                    </div>
                  ) : (
                    projectSessions.slice(0, 5).map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between rounded-md bg-slate-50 p-2 text-xs dark:bg-slate-900/40"
                      >
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {s.durationMinutes} min session
                        </span>
                        <span className="text-slate-400">
                          {new Date(s.startTime).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Notes */}
              <NotesWidget entityType="project" entityId={detailProject.id} />
            </div>
          ) : (
            <Card className="p-12 text-center text-slate-400">
              <FolderKanban size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-700" />
              Select a project to view duration-weighted progress, workload, tasks and sessions.
            </Card>
          )}
        </div>
      </div>

      {/* Project Create/Edit Dialog */}
      <Dialog
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedProject ? `${t('edit')} ${t('project')}` : `${t('create')} ${t('project')}`}
      >
        <div className="space-y-4">
          <Input
            label={t('title')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Website Redesign, Q3 Report"
          />
          <Input
            label={t('description')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label={t('area')}
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
              options={[
                { value: '', label: t('noArea') },
                ...areas.map((a) => ({ value: a.id, label: a.name }))
              ]}
            />
            <Select
              label={t('goal')}
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              options={[
                { value: '', label: t('noGoal') },
                ...goals.map((g) => ({ value: g.id, label: g.title }))
              ]}
            />
          </div>
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
              label={t('deadline')}
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          <Input
            label={t('estimatedMinutes')}
            type="number"
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
          />
          <div className="flex justify-end space-x-2 space-x-reverse pt-2">
            <Button variant="ghost" onClick={closeModal}>
              {t('cancel')}
            </Button>
            <Button onClick={() => void handleCreateOrUpdate()}>{t('save')}</Button>
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
          onConfirm={(action) => void handleDeleteProject(action)}
        />
      )}
    </div>
  )
}
