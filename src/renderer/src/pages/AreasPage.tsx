import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Archive, Plus, RotateCcw, Trash2 } from 'lucide-react'
import type { Area } from '../../../shared/entities'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card } from '../components/ui/card'
import { Dialog } from '../components/ui/dialog'
import { NotesWidget } from '../components/NotesWidget'
import { DeleteDialog } from '../components/DeleteDialog'

export function AreasPage(): JSX.Element {
  const { t } = useTranslation()
  const [areas, setAreas] = useState<Area[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#3b82f6')
  const [selectedArea, setSelectedArea] = useState<Area | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Area | null>(null)

  const planner = window.planner

  const refreshAreas = async (): Promise<void> => {
    if (!planner) return
    const list = await planner.areas.list()
    setAreas(list)
  }

  useEffect(() => {
    void refreshAreas()
  }, [])

  const handleCreateOrUpdate = async (): Promise<void> => {
    if (!name.trim() || !planner) return
    if (selectedArea) {
      await planner.areas.update({
        id: selectedArea.id,
        name: name.trim(),
        description: description.trim() || null,
        color
      })
    } else {
      await planner.areas.create({
        name: name.trim(),
        description: description.trim() || undefined,
        color
      })
    }
    closeModal()
    await refreshAreas()
  }

  const openCreateModal = (): void => {
    setSelectedArea(null)
    setName('')
    setDescription('')
    setColor('#3b82f6')
    setIsModalOpen(true)
  }

  const openEditModal = (area: Area): void => {
    setSelectedArea(area)
    setName(area.name)
    setDescription(area.description || '')
    setColor(area.color || '#3b82f6')
    setIsModalOpen(true)
  }

  const closeModal = (): void => {
    setIsModalOpen(false)
    setSelectedArea(null)
    setName('')
    setDescription('')
  }

  const handleArchive = async (id: string): Promise<void> => {
    if (!planner) return
    await planner.entities.archive({ kind: 'area', id })
    await refreshAreas()
  }

  const handleDelete = async (id: string): Promise<void> => {
    if (!planner) return
    await planner.entities.delete({ kind: 'area', id })
    setDeleteTarget(null)
    await refreshAreas()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('areas')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('areasSubtitle')}
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus size={18} className="me-1" />
          {t('create')} {t('area')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {areas.map((area) => (
          <Card key={area.id} className="relative flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 space-x-reverse">
                <span
                  className="h-4 w-4 rounded-full border border-slate-300 dark:border-slate-700"
                  style={{ backgroundColor: area.color || '#3b82f6' }}
                />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">{area.name}</h3>
              </div>
              {area.description && (
                <p className="text-sm text-slate-600 dark:text-slate-400">{area.description}</p>
              )}
            </div>

            <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => openEditModal(area)}>
                  {t('edit')}
                </Button>
                <div className="flex space-x-1 space-x-reverse">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void handleArchive(area.id)}
                    title={t('archive')}
                  >
                    <Archive size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(area)}
                    title={t('delete')}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              <NotesWidget entityType="area" entityId={area.id} />
            </div>
          </Card>
        ))}
      </div>

      <Dialog
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedArea ? `${t('edit')} ${t('area')}` : `${t('create')} ${t('area')}`}
      >
        <div className="space-y-4">
          <Input
            label={t('name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('areaNamePlaceholder')}
          />
          <Input
            label={t('description')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('optionalDescription')}
          />
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('color')}
            </label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-9 w-full cursor-pointer rounded-md border border-slate-300 bg-white p-1 dark:border-slate-700 dark:bg-slate-900"
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
          title={deleteTarget.name}
          onConfirm={() => void handleDelete(deleteTarget.id)}
        />
      )}
    </div>
  )
}
