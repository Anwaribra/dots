import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import type { Area, Goal, Project } from '../../../shared/entities'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Dialog } from '../components/ui/dialog'
import { NotesWidget } from '../components/NotesWidget'
import { DeleteDialog } from '../components/DeleteDialog'

export function ProjectsPage(): JSX.Element {
  const { t } = useTranslation()
  const [projects, setProjects] = useState<Project[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [areaId, setAreaId] = useState('')
  const [goalId, setGoalId] = useState('')
  const [priority, setPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('medium')
  const [deadline, setDeadline] = useState('')
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(0)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)

  const planner = window.planner

  const refreshData = async (): Promise<void> => {
    if (!planner) return
    const [pList, aList, gList] = await Promise.all([
      planner.projects.list(),
      planner.areas.list(),
      planner.goals.list()
    ])
    setProjects(pList)
    setAreas(aList)
    setGoals(gList)
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
    await refreshData()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('projects')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Containers of executable work. Links to Goal or Area are optional.
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus size={18} className="me-1" />
          {t('create')} {t('project')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const matchedArea = areas.find((a) => a.id === project.areaId)
          const matchedGoal = goals.find((g) => g.id === project.goalId)
          return (
            <Card key={project.id} className="flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">{project.title}</h3>
                  <Badge variant={project.priority}>{t(project.priority)}</Badge>
                </div>
                {project.description && (
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{project.description}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                  {matchedArea && <span className="rounded bg-slate-100 px-2 py-0.5 dark:bg-slate-800">{matchedArea.name}</span>}
                  {matchedGoal && <span className="rounded bg-indigo-50 px-2 py-0.5 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{matchedGoal.title}</span>}
                  {project.deadline && <span>Due: {project.deadline}</span>}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(project)}>
                    {t('edit')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(project)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
                <NotesWidget entityType="project" entityId={project.id} />
              </div>
            </Card>
          )
        })}
      </div>

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
