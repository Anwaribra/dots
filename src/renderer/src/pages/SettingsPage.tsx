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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Planning Capacity % (e.g. 75%)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={settings.planningCapacityPercentage ?? 75}
              onChange={(e) => void updateSetting({ planningCapacityPercentage: Number(e.target.value) })}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Buffer % of Usable (e.g. 20%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={settings.bufferPercentage ?? 20}
              onChange={(e) => void updateSetting({ bufferPercentage: Number(e.target.value) })}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
      </Card>

      {/* Stage 11: Demo Data & Onboarding Wizard */}
      <Card className="space-y-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Demo Data & Onboarding
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Populate your system with sample data to experiment safely, or re-run the initial onboarding flow.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {settings.demoMode ? (
            <button
              onClick={async () => {
                if (planner) {
                  await planner.demo.delete()
                  const updated = await planner.settings.get()
                  applySettings(updated)
                }
              }}
              className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-500 shadow-sm"
            >
              {t('clearDemoData')}
            </button>
          ) : (
            <button
              onClick={async () => {
                if (planner) {
                  await planner.demo.load()
                  const updated = await planner.settings.get()
                  applySettings(updated)
                }
              }}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 shadow-sm"
            >
              {t('loadDemoData')}
            </button>
          )}

          <button
            onClick={() => updateSetting({ onboardingDone: false })}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            Re-run Onboarding Wizard
          </button>
        </div>
      </Card>
    </div>
  )
}
