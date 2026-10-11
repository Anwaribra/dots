import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Tag as TagIcon, Trash2 } from 'lucide-react'
import type { Tag } from '../../../shared/entities'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card } from '../components/ui/card'
import { Dialog } from '../components/ui/dialog'

export function TagsPage(): JSX.Element {
  const { t } = useTranslation()
  const [tags, setTags] = useState<Tag[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState('#6366f1')

  const planner = window.planner

  const refreshTags = async (): Promise<void> => {
    if (!planner) return
    const list = await planner.tags.list()
    setTags(list)
  }

  useEffect(() => {
    void refreshTags()
  }, [])

  const handleCreate = async (): Promise<void> => {
    if (!name.trim() || !planner) return
    await planner.tags.create({ name: name.trim(), color })
    setIsModalOpen(false)
    setName('')
    await refreshTags()
  }

  const handleDelete = async (id: string): Promise<void> => {
    if (!planner) return
    await planner.entities.delete({ kind: 'tag', id })
    await refreshTags()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('tags')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('tagsSubtitle')}
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={18} className="me-1" />
          {t('create')} {t('tags')}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {tags.map((tag) => (
          <Card key={tag.id} className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: tag.color || '#6366f1' }} />
              <span className="font-semibold text-slate-900 dark:text-slate-100">{tag.name}</span>
            </div>
            <button
              onClick={() => void handleDelete(tag.id)}
              className="text-slate-400 hover:text-red-500"
            >
              <Trash2 size={16} />
            </button>
          </Card>
        ))}
      </div>

      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${t('create')} ${t('tags')}`}>
        <div className="space-y-4">
          <Input
            label={t('name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('tagPlaceholder')}
          />
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{t('color')}</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-9 w-full cursor-pointer rounded-md border border-slate-300 bg-white p-1 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <div className="flex justify-end space-x-2 space-x-reverse pt-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>{t('cancel')}</Button>
            <Button onClick={() => void handleCreate()}>{t('save')}</Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
