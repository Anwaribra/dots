import React from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog } from './ui/dialog'
import { Button } from './ui/button'

export interface DeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  hasChildWorkItems?: boolean
  onConfirm: (childAction?: 'detach' | 'archive') => void
}

export function DeleteDialog({
  isOpen,
  onClose,
  title,
  hasChildWorkItems = false,
  onConfirm
}: DeleteDialogProps): JSX.Element | null {
  const { t } = useTranslation()

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={t('deleteModalTitle')}>
      <div className="space-y-4">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Are you sure you want to delete <strong className="font-semibold">{title}</strong>?
        </p>

        {hasChildWorkItems ? (
          <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
              {t('deleteModalQuestion')}
            </p>
            <div className="flex flex-col space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onConfirm('detach')
                  onClose()
                }}
              >
                {t('detachWorkItems')}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  onConfirm('archive')
                  onClose()
                }}
              >
                {t('archiveWorkItems')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-end space-x-2 space-x-reverse pt-2">
            <Button variant="ghost" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                onConfirm()
                onClose()
              }}
            >
              {t('delete')}
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  )
}
