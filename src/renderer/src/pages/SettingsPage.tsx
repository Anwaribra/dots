import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Settings } from '../../../shared/settings'
import { Card } from '../components/ui/card'
import { Select } from '../components/ui/select'
import i18n from '../i18n'

export function SettingsPage(): JSX.Element {
  const { t } = useTranslation()
  const [settings, setSettings] = useState<Settings | null>(null)
  const planner = window.planner

  useEffect(() => {
    if (planner) {
      planner.settings.get().then(setSettings).catch(() => undefined)
    }
  }, [])

  const applySettings = (next: Settings): void => {
    setSettings(next)
    i18n.changeLanguage(next.locale)
    document.documentElement.lang = next.locale
    document.documentElement.dir = next.locale === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.dataset.theme = next.theme
  }

  const updateSetting = async (patch: Partial<Settings>): Promise<void> => {
    if (!planner) return
    const updated = await planner.settings.update(patch)
    applySettings(updated)
  }

  if (!settings) return <div className="p-4">Loading settings...</div>

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('settings')}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Personal preferences persisted locally in your SQLite database.
        </p>
      </div>

      <Card className="space-y-6">
        <Select
          label={t('language')}
          value={settings.locale}
          onChange={(e) => void updateSetting({ locale: e.target.value as any })}
          options={[
            { value: 'en', label: 'English' },
            { value: 'ar', label: 'العربية (Arabic)' }
          ]}
        />

        <Select
          label={t('theme')}
          value={settings.theme}
          onChange={(e) => void updateSetting({ theme: e.target.value as any })}
          options={[
            { value: 'system', label: t('system') },
            { value: 'light', label: t('light') },
            { value: 'dark', label: t('dark') }
          ]}
        />

        <Select
          label={t('weekStartsOn')}
          value={String(settings.weekStartsOn)}
          onChange={(e) => void updateSetting({ weekStartsOn: Number(e.target.value) })}
          options={[
            { value: '6', label: `${t('saturday')} (Default)` },
            { value: '0', label: t('sunday') },
            { value: '1', label: t('monday') }
          ]}
        />
      </Card>
    </div>
  )
}
