import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Copy,
  FileText,
  Link,
  Lock,
  Plus,
  Trash2,
  Video
} from 'lucide-react'
import type { Area, Goal, Project, Resource, ResourceItem } from '../../../shared/entities'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Dialog } from '../components/ui/dialog'
import { NotesWidget } from '../components/NotesWidget'
import { DeleteDialog } from '../components/DeleteDialog'
import { BulkResourceModal } from '../components/BulkResourceModal'
import type { ParsedResourceItem } from '../../../shared/bulk-parser'

export function ResourcesPage(): JSX.Element {
  const { t } = useTranslation()
  const [resources, setResources] = useState<Resource[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [items, setItems] = useState<ResourceItem[]>([])

  // Modal states
  const [isResModalOpen, setIsResModalOpen] = useState(false)
  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)

  // Resource Form
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [resourceType, setResourceType] = useState<any>('course')
  const [orderingMode, setOrderingMode] = useState<any>('sequential')
  const [areaId, setAreaId] = useState('')
  const [goalId, setGoalId] = useState('')
  const [projectId, setProjectId] = useState('')

  // Item Form
  const [itemTitle, setItemTitle] = useState('')
  const [itemType, setItemType] = useState('item')
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(0)
  const [deleteTarget, setDeleteTarget] = useState<Resource | null>(null)

  const planner = window.planner

  const refreshResources = async (): Promise<void> => {
    if (!planner) return
    const [rList, aList, gList, pList] = await Promise.all([
      planner.resources.list(),
      planner.areas.list(),
      planner.goals.list(),
      planner.projects.list()
    ])
    setResources(rList)
    setAreas(aList)
    setGoals(gList)
    setProjects(pList)
    if (rList.length > 0 && !selectedResource) {
      setSelectedResource(rList[0])
    }
  }

  const refreshItems = async (rId: string): Promise<void> => {
    if (!planner) return
    const list = await planner.resourceItems.list(rId)
    setItems(list)
  }

  useEffect(() => {
    void refreshResources()
  }, [])

  useEffect(() => {
    if (selectedResource) void refreshItems(selectedResource.id)
  }, [selectedResource])

  const handleCreateOrUpdateResource = async (): Promise<void> => {
    if (!title.trim() || !planner) return
    if (selectedResource && isResModalOpen) {
      const updated = await planner.resources.update({
        id: selectedResource.id,
        title: title.trim(),
        description: description.trim() || null,
        resourceType,
        orderingMode,
        areaId: areaId || null,
        goalId: goalId || null,
        projectId: projectId || null
      })
      setSelectedResource(updated)
    } else {
      const created = await planner.resources.create({
        title: title.trim(),
        description: description.trim() || undefined,
        resourceType,
        orderingMode,
        areaId: areaId || null,
        goalId: goalId || null,
        projectId: projectId || null
      })
      setSelectedResource(created)
    }
    setIsResModalOpen(false)
    await refreshResources()
  }

  const handleDuplicateResource = async (): Promise<void> => {
    if (!selectedResource || !planner) return
    const copy = await planner.resources.duplicate(selectedResource.id)
    await refreshResources()
    setSelectedResource(copy)
  }

  const handleCreateItem = async (): Promise<void> => {
    if (!itemTitle.trim() || !selectedResource || !planner) return
    await planner.resourceItems.create({
      resourceId: selectedResource.id,
      title: itemTitle.trim(),
      itemType,
      estimatedMinutes
    })
    setIsItemModalOpen(false)
    setItemTitle('')
    setEstimatedMinutes(0)
    await refreshItems(selectedResource.id)
  }

  const handleBulkAdd = async (parsedItems: ParsedResourceItem[]): Promise<void> => {
    if (!selectedResource || !planner) return
    await planner.resourceItems.bulkAdd({
      resourceId: selectedResource.id,
      items: parsedItems.map((i) => ({
        title: i.title,
        estimatedMinutes: i.estimatedMinutes,
        itemType: 'item'
      }))
    })
    await refreshItems(selectedResource.id)
  }

  const handleMoveItem = async (index: number, direction: 'up' | 'down'): Promise<void> => {
    if (!selectedResource || !planner) return
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= items.length) return

    const reordered = [...items]
    const temp = reordered[index]
    reordered[index] = reordered[targetIdx]
    reordered[targetIdx] = temp

    await planner.resourceItems.reorder({
      resourceId: selectedResource.id,
      itemIdsInOrder: reordered.map((i) => i.id)
    })
    await refreshItems(selectedResource.id)
  }

  const handleLinkWorkItem = async (item: ResourceItem): Promise<void> => {
    if (!planner || !selectedResource) return
    await planner.resourceItems.linkWorkItem({
      resourceItemId: item.id,
      title: item.title,
      projectId: selectedResource.projectId,
      goalId: selectedResource.goalId,
      areaId: selectedResource.areaId
    })
    await refreshItems(selectedResource.id)
  }

  const handleDeleteResource = async (): Promise<void> => {
    if (!deleteTarget || !planner) return
    await planner.entities.delete({ kind: 'resource', id: deleteTarget.id })
    setDeleteTarget(null)
    if (selectedResource?.id === deleteTarget.id) setSelectedResource(null)
    await refreshResources()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('resources')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('resourcesSubtitle')}
          </p>
        </div>
        <Button
          onClick={() => {
            setTitle('')
            setDescription('')
            setResourceType('course')
            setOrderingMode('sequential')
            setAreaId('')
            setGoalId('')
            setProjectId('')
            setIsResModalOpen(true)
          }}
        >
          <Plus size={18} className="me-1" />
          {t('create')} {t('resources')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Resources List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('allResources')}</h3>
          <div className="space-y-2">
            {resources.map((res) => (
              <Card
                key={res.id}
                className={`cursor-pointer p-4 transition-all hover:shadow-md ${
                  selectedResource?.id === res.id ? 'ring-2 ring-indigo-500' : ''
                }`}
                onClick={() => setSelectedResource(res)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">{res.title}</h4>
                    <p className="text-xs text-slate-500 capitalize">{res.resourceType.replace('_', ' ')}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {res.orderingMode}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column: Selected Resource Details & Items */}
        <div className="lg:col-span-2 space-y-4">
          {selectedResource ? (
            <Card className="space-y-4">
              <div className="flex items-start justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                <div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      {selectedResource.title}
                    </h2>
                    <Badge variant="secondary">
                      {selectedResource.orderingMode === 'dependency_based'
                        ? t('dependencyBasedOrdering')
                        : selectedResource.orderingMode === 'sequential'
                          ? t('sequentialOrdering')
                          : t('flexibleOrdering')}
                    </Badge>
                  </div>
                  {selectedResource.description && (
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {selectedResource.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Button variant="outline" size="sm" onClick={() => setIsBulkModalOpen(true)}>
                    {t('bulkAdd')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsItemModalOpen(true)}>
                    <Plus size={16} className="me-1" /> {t('add')}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => void handleDuplicateResource()} title={t('duplicate')}>
                    <Copy size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(selectedResource)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              {/* Items Tree / List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t('contentItems')} ({items.length})
                </h4>

                {items.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400 dark:border-slate-800">
                    {t('noContentItemsYet')}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {items.map((item, idx) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between rounded-lg border p-3 text-sm transition-colors ${
                          item.isBlocked
                            ? 'border-amber-200 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20'
                            : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="flex flex-col">
                            <button
                              disabled={idx === 0}
                              onClick={() => void handleMoveItem(idx, 'up')}
                              className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              disabled={idx === items.length - 1}
                              onClick={() => void handleMoveItem(idx, 'down')}
                              className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                            >
                              <ArrowDown size={12} />
                            </button>
                          </div>

                          <div>
                            <div className="flex items-center space-x-2 space-x-reverse">
                              {item.isBlocked && <Lock size={14} className="text-amber-600" />}
                              <span className="font-semibold text-slate-900 dark:text-slate-100">
                                {item.title}
                              </span>
                            </div>
                            <div className="mt-0.5 flex items-center space-x-2 space-x-reverse text-xs text-slate-500">
                              <span>{item.estimatedMinutes}m</span>
                              {item.blockedByTitle && (
                                <span className="text-amber-600 dark:text-amber-400">
                                  ({t('blockedByTitle', { title: item.blockedByTitle })})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 space-x-reverse">
                          {/* Completion Truth Badge (Decision A14) */}
                          <Badge
                            variant={
                              item.effectiveStatus === 'completed'
                                ? 'completed'
                                : item.effectiveStatus === 'blocked'
                                ? 'critical'
                                : item.effectiveStatus === 'in_progress'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {item.effectiveStatus}
                          </Badge>

                          {item.workItemId ? (
                            <span className="inline-flex items-center text-xs text-indigo-600 dark:text-indigo-400">
                              <Link size={12} className="me-1" /> {t('schedulable')}
                            </span>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => void handleLinkWorkItem(item)}
                              title={t('turnIntoSchedulable')}
                            >
                              <Link size={14} className="me-1" /> {t('planAction')}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <NotesWidget entityType="resource" entityId={selectedResource.id} />
            </Card>
          ) : (
            <Card className="p-8 text-center text-slate-400">
              {t('selectResourceToView')}
            </Card>
          )}
        </div>
      </div>

      {/* Resource Modal */}
      <Dialog
        isOpen={isResModalOpen}
        onClose={() => setIsResModalOpen(false)}
        title={selectedResource ? `${t('edit')} ${t('resources')}` : `${t('create')} ${t('resources')}`}
      >
        <div className="space-y-4">
          <Input
            label={t('title')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('resourcePlaceholder')}
          />
          <Input
            label={t('description')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('optionalDescription')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label={t('resourceType')}
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value as any)}
              options={[
                { value: 'course', label: t('course') },
                { value: 'book', label: t('book') },
                { value: 'playlist', label: t('playlist') },
                { value: 'pdf', label: t('pdf') },
                { value: 'article_collection', label: t('articleCollection') },
                { value: 'training_program', label: t('trainingProgram') },
                { value: 'study_plan', label: t('studyPlan') },
                { value: 'custom', label: t('customType') }
              ]}
            />
            <Select
              label={t('orderingMode')}
              value={orderingMode}
              onChange={(e) => setOrderingMode(e.target.value as any)}
              options={[
                { value: 'sequential', label: t('sequentialOrdering') },
                { value: 'flexible', label: t('flexibleOrdering') },
                { value: 'dependency_based', label: t('dependencyBasedOrdering') }
              ]}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Select
              label={t('area')}
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
              options={[{ value: '', label: t('noArea') }, ...areas.map((a) => ({ value: a.id, label: a.name }))]}
            />
            <Select
              label={t('goal')}
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              options={[{ value: '', label: t('noGoal') }, ...goals.map((g) => ({ value: g.id, label: g.title }))]}
            />
            <Select
              label={t('project')}
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              options={[{ value: '', label: t('noProject') }, ...projects.map((p) => ({ value: p.id, label: p.title }))]}
            />
          </div>

          <div className="flex justify-end space-x-2 space-x-reverse pt-2">
            <Button variant="ghost" onClick={() => setIsResModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={() => void handleCreateOrUpdateResource()}>{t('save')}</Button>
          </div>
        </div>
      </Dialog>

      {/* Item Modal */}
      <Dialog
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title={t('addContentItem')}
      >
        <div className="space-y-4">
          <Input
            label={t('title')}
            value={itemTitle}
            onChange={(e) => setItemTitle(e.target.value)}
            placeholder={t('contentItemPlaceholder')}
          />
          <Input
            label={t('estimatedMinutes')}
            type="number"
            value={estimatedMinutes}
            onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
          />
          <div className="flex justify-end space-x-2 space-x-reverse pt-2">
            <Button variant="ghost" onClick={() => setIsItemModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={() => void handleCreateItem()}>{t('save')}</Button>
          </div>
        </div>
      </Dialog>

      {/* Bulk Modal */}
      <BulkResourceModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSave={(items) => void handleBulkAdd(items)}
      />

      {deleteTarget && (
        <DeleteDialog
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title={deleteTarget.title}
          onConfirm={() => void handleDeleteResource()}
        />
      )}
    </div>
  )
}
