import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import type { Note } from '../../../shared/entities'
import { Button } from './ui/button'

export interface NotesWidgetProps {
  entityType: string
  entityId: string
}

export function NotesWidget({ entityType, entityId }: NotesWidgetProps): JSX.Element {
  const { t } = useTranslation()
  const [notesList, setNotesList] = useState<Note[]>([])
  const [content, setContent] = useState('')
  const planner = window.planner

  const refreshNotes = async (): Promise<void> => {
    if (!planner || !entityId) return
    const res = await planner.notes.list(entityType, entityId)
    setNotesList(res)
  }

  useEffect(() => {
    void refreshNotes()
  }, [entityType, entityId])

  const handleAddNote = async (): Promise<void> => {
    if (!content.trim() || !planner) return
    await planner.notes.create({ entityType, entityId, content: content.trim() })
    setContent('')
    await refreshNotes()
  }

  const handleDeleteNote = async (id: string): Promise<void> => {
    if (!planner) return
    await planner.notes.delete(id)
    await refreshNotes()
  }

  return (
    <div className="space-y-3 pt-2">
      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{t('notes')}</h4>
      <div className="flex space-x-2 space-x-reverse">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a note..."
          rows={2}
          className="w-full rounded-md border border-slate-300 bg-white p-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        <Button onClick={() => void handleAddNote()} size="sm">
          <Plus size={16} />
        </Button>
      </div>
      <div className="space-y-2">
        {notesList.map((note) => (
          <div
            key={note.id}
            className="flex items-start justify-between rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-800 dark:bg-slate-900/50"
          >
            <p className="whitespace-pre-wrap text-slate-800 dark:text-slate-200">{note.content}</p>
            <button
              onClick={() => void handleDeleteNote(note.id)}
              className="ms-2 text-slate-400 hover:text-red-500"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
