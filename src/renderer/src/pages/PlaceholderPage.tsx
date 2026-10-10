import React from 'react'
import { useTranslation } from 'react-i18next'
import { Construction } from 'lucide-react'
import { Card } from '../components/ui/card'

export interface PlaceholderPageProps {
  titleKey: string
  stageNumber: number
}

export function PlaceholderPage({ titleKey, stageNumber }: PlaceholderPageProps): JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <Card className="max-w-md p-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
          <Construction size={28} />
        </div>
        <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-slate-100">{t(titleKey)}</h2>
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Stage {stageNumber}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t('stageArrivesLater')}
        </p>
      </Card>
    </div>
  )
}
