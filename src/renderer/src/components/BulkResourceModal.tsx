import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { parseBulkResourceText, type ParsedResourceItem } from '../../../shared/bulk-parser'
import { Dialog } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'

export interface BulkResourceModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (items: ParsedResourceItem[]) => void
}

export function BulkResourceModal({ isOpen, onClose, onSave }: BulkResourceModalProps): JSX.Element | null {
  const { t } = useTranslation()
  const [rawText, setRawText] = useState('')
  const [parsedItems, setParsedItems] = useState<ParsedResourceItem[]>([])

  useEffect(() => {
    const items = parseBulkResourceText(rawText)
    setParsedItems(items)
  }, [rawText])

  const handleItemChange = (index: number, field: 'title' | 'estimatedMinutes', value: any): void => {
    const next = [...parsedItems]
    next[index] = { ...next[index], [field]: value }
    setParsedItems(next)
  }

  const handleSave = (): void => {
    if (parsedItems.length === 0) return
    onSave(parsedItems)
    setRawText('')
    onClose()
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Bulk Resource Entry">
      <div className="space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Paste lines of content (e.g. <code>Video 1 | 35</code> or <code>Chapter 2 - 45 min</code>). The parser will extract titles and durations automatically.
        </p>

        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder={`Video 1 | 35\nVideo 2 | 42m\nVideo 3 | 28`}
          rows={6}
          className="w-full rounded-md border border-slate-300 bg-white p-3 text-sm font-mono text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />

        {parsedItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Preview & Edit ({parsedItems.length} items)
            </h4>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900/50">
              <table className="w-full text-start text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
                    <th className="pb-2 text-start">#</th>
                    <th className="pb-2 text-start">{t('title')}</th>
                    <th className="pb-2 text-start">{t('estimatedMinutes')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {parsedItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1 text-slate-400">{idx + 1}</td>
                      <td className="py-1 pe-2">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleItemChange(idx, 'title', e.target.value)}
                          className="w-full rounded border border-slate-300 bg-white px-2 py-0.5 dark:border-slate-700 dark:bg-slate-900"
                        />
                      </td>
                      <td className="py-1">
                        <input
                          type="number"
                          value={item.estimatedMinutes}
                          onChange={(e) => handleItemChange(idx, 'estimatedMinutes', Number(e.target.value))}
                          className="w-20 rounded border border-slate-300 bg-white px-2 py-0.5 dark:border-slate-700 dark:bg-slate-900"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2 space-x-reverse pt-2">
          <Button variant="ghost" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSave} disabled={parsedItems.length === 0}>
            Save {parsedItems.length} Items
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
