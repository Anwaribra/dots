import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Sparkles,
  Compass,
  Database,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  BookOpen,
  Dumbbell,
  Repeat,
  Briefcase,
  X
} from 'lucide-react'
import type { Settings } from '../../../shared/settings'
import type { TemplateRecord } from '../../../shared/templates'
import i18n from '../i18n'

interface OnboardingWizardProps {
  isOpen: boolean
  currentSettings: Settings | null
  onClose: () => void
  onComplete: () => void
}

type Step = 'welcome' | 'template_picker' | 'guided_lang' | 'guided_areas' | 'guided_capacity' | 'done'

export function OnboardingWizard({
  isOpen,
  currentSettings,
  onClose,
  onComplete
}: OnboardingWizardProps): JSX.Element | null {
  const { t } = useTranslation()
  const planner = window.planner
  const [step, setStep] = useState<Step>('welcome')
  const [templates, setTemplates] = useState<TemplateRecord[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)

  // Guided step form states
  const [locale, setLocale] = useState<Settings['locale']>(currentSettings?.locale ?? 'en')
  const [use24Hour, setUse24Hour] = useState<boolean>(currentSettings?.use24HourTime ?? true)
  const [weekStartsOn, setWeekStartsOn] = useState<number>(currentSettings?.weekStartsOn ?? 6)
  const [capacity, setCapacity] = useState<number>(currentSettings?.planningCapacityPercentage ?? 75)
  const [buffer, setBuffer] = useState<number>(currentSettings?.bufferPercentage ?? 20)

  // Pre-selected areas for guided setup
  const [selectedAreas, setSelectedAreas] = useState<string[]>(['Work', 'Health', 'Learning'])

  useEffect(() => {
    if (isOpen && planner) {
      planner.templates.list().then((list) => {
        setTemplates(list.filter((t) => t.builtin))
      }).catch(() => undefined)
    }
  }, [isOpen, planner])

  if (!isOpen) return null

  const handleFinish = async (): Promise<void> => {
    if (!planner) return
    setLoading(true)
    try {
      await planner.settings.update({
        locale,
        use24HourTime: use24Hour,
        weekStartsOn,
        planningCapacityPercentage: capacity,
        bufferPercentage: buffer,
        onboardingDone: true
      })
      i18n.changeLanguage(locale)
      document.documentElement.lang = locale
      document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
      onComplete()
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = async (): Promise<void> => {
    if (!planner) return
    setLoading(true)
    try {
      await planner.settings.update({ onboardingDone: true })
      onComplete()
    } finally {
      setLoading(false)
    }
  }

  const handleLoadDemo = async (): Promise<void> => {
    if (!planner) return
    setLoading(true)
    setStatusMsg(t('onboardingDemoHint'))
    try {
      await planner.demo.load()
      await planner.settings.update({ onboardingDone: true })
      onComplete()
    } finally {
      setLoading(false)
    }
  }

  const handleApplyTemplate = async (templateId: string): Promise<void> => {
    if (!planner) return
    setLoading(true)
    setStatusMsg(t('applying'))
    try {
      await planner.templates.apply(templateId, true)
      await planner.settings.update({ onboardingDone: true })
      onComplete()
    } finally {
      setLoading(false)
    }
  }

  const handleGuidedAreaSubmit = async (): Promise<void> => {
    if (!planner) return
    setLoading(true)
    try {
      for (const areaName of selectedAreas) {
        await planner.areas.create({ name: areaName })
      }
      setStep('guided_capacity')
    } finally {
      setLoading(false)
    }
  }

  const templateIcons: Record<string, JSX.Element> = {
    'builtin-study': <BookOpen className="text-indigo-500" size={24} />,
    'builtin-fitness': <Dumbbell className="text-emerald-500" size={24} />,
    'builtin-review': <Repeat className="text-amber-500" size={24} />,
    'builtin-freelance': <Briefcase className="text-blue-500" size={24} />
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs">
              C
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
              {t('appName')} · {t('onboardingLabel')}
            </span>
          </div>
          <button
            onClick={handleSkip}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title={t('skipOnboardingTitle')}
          >
            {t('skipOnboarding')}
          </button>
        </div>

        {/* Content body */}
        <div className="p-8 overflow-y-auto flex-1">
          {statusMsg && (
            <div className="mb-4 rounded-lg bg-indigo-50 p-3 text-sm text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
              {statusMsg}
            </div>
          )}

          {step === 'welcome' && (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                <Sparkles size={28} />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {t('onboardingWelcome')}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  {t('onboardingSubtitle')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-start">
                {/* Option 1: Template */}
                <button
                  onClick={() => setStep('template_picker')}
                  className="p-5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:shadow-md transition-all bg-white dark:bg-slate-800/60 dark:border-slate-700 dark:hover:border-indigo-400 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <BookOpen size={20} />
                    </div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                      {t('pickTemplate')}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {t('onboardingTemplateHint')}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                    <span>{t('choose')}</span>
                    <ArrowRight size={14} className="ms-1 rtl:rotate-180" />
                  </div>
                </button>

                {/* Option 2: Demo data */}
                <button
                  onClick={handleLoadDemo}
                  disabled={loading}
                  className="p-5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all bg-white dark:bg-slate-800/60 dark:border-slate-700 dark:hover:border-emerald-400 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Database size={20} />
                    </div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                      {t('exploreDemo')}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {t('onboardingDemoHint')}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                    <span>{t('loadDemo')}</span>
                    <ArrowRight size={14} className="ms-1 rtl:rotate-180" />
                  </div>
                </button>

                {/* Option 3: Guided setup */}
                <button
                  onClick={() => setStep('guided_lang')}
                  className="p-5 rounded-xl border border-slate-200 hover:border-violet-500 hover:shadow-md transition-all bg-white dark:bg-slate-800/60 dark:border-slate-700 dark:hover:border-violet-400 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-lg bg-violet-50 dark:bg-violet-950 flex items-center justify-center text-violet-600 dark:text-violet-400">
                      <Compass size={20} />
                    </div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                      {t('startFromScratch')}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {t('onboardingGuidedHint')}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-xs font-semibold text-violet-600 dark:text-violet-400 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                    <span>{t('guided')}</span>
                    <ArrowRight size={14} className="ms-1 rtl:rotate-180" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 'template_picker' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {t('readyMadeTemplates')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('readyMadeTemplatesDesc')}
                  </p>
                </div>
                <button
                  onClick={() => setStep('welcome')}
                  className="flex items-center text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <ArrowLeft size={14} className="me-1 rtl:rotate-180" />
                  {t('back')}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedTemplateId === tpl.id
                        ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:bg-indigo-950/30'
                        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start space-x-3 space-x-reverse">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700/60 shrink-0">
                        {templateIcons[tpl.id] || <Sparkles size={20} />}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                            {tpl.name}
                          </h4>
                          {selectedTemplateId === tpl.id && (
                            <CheckCircle2 size={16} className="text-indigo-600 dark:text-indigo-400" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                          {tpl.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
                          {tpl.payload.areas?.length ? <span>• {t('countAreas', { count: tpl.payload.areas.length })}</span> : null}
                          {tpl.payload.goals?.length ? <span>• {t('countGoals', { count: tpl.payload.goals.length })}</span> : null}
                          {tpl.payload.routines?.length ? <span>• {t('countRoutines', { count: tpl.payload.routines.length })}</span> : null}
                          {tpl.payload.timeBudgets?.length ? <span>• {t('countBudgets', { count: tpl.payload.timeBudgets.length })}</span> : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end space-x-3 space-x-reverse pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setStep('welcome')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  {t('back')}
                </button>
                <button
                  disabled={!selectedTemplateId || loading}
                  onClick={() => selectedTemplateId && handleApplyTemplate(selectedTemplateId)}
                  className="flex items-center space-x-1.5 space-x-reverse px-5 py-2 rounded-lg bg-indigo-600 font-semibold text-white text-xs hover:bg-indigo-500 disabled:opacity-50 shadow-sm"
                >
                  <span>{t('applyAndStart')}</span>
                  <ArrowRight size={14} className="rtl:rotate-180" />
                </button>
              </div>
            </div>
          )}

          {step === 'guided_lang' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {t('languageAndRegional')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('languageAndRegionalDesc')}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {t('interfaceLanguage')}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setLocale('en')}
                      className={`p-3 rounded-lg border text-sm font-medium text-center transition-all ${
                        locale === 'en'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {t('englishLtr')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocale('ar')}
                      className={`p-3 rounded-lg border text-sm font-medium text-center transition-all ${
                        locale === 'ar'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {t('arabicRtl')}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t('timeFormat')}
                    </label>
                    <select
                      value={use24Hour ? '24' : '12'}
                      onChange={(e) => setUse24Hour(e.target.value === '24')}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <option value="24">{t('hour24')}</option>
                      <option value="12">{t('hour12')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t('weekStartsOn')}
                    </label>
                    <select
                      value={String(weekStartsOn)}
                      onChange={(e) => setWeekStartsOn(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <option value="6">{t('saturdayDefault')}</option>
                      <option value="0">{t('sunday')}</option>
                      <option value="1">{t('monday')}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setStep('welcome')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  {t('back')}
                </button>
                <button
                  onClick={() => setStep('guided_areas')}
                  className="flex items-center space-x-1.5 space-x-reverse px-5 py-2 rounded-lg bg-indigo-600 font-semibold text-white text-xs hover:bg-indigo-500 shadow-sm"
                >
                  <span>{t('nextLifeAreas')}</span>
                  <ArrowRight size={14} className="rtl:rotate-180" />
                </button>
              </div>
            </div>
          )}

          {step === 'guided_areas' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {t('selectPrimaryAreas')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('selectPrimaryAreasDesc')}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(['Work', 'Learning', 'Health & Fitness', 'Personal', 'Finance', 'Creative'] as const).map((areaName) => {
                  const isChecked = selectedAreas.includes(areaName)
                  const areaLabelKey = {
                    Work: 'areaPresetWork',
                    Learning: 'areaPresetLearning',
                    'Health & Fitness': 'areaPresetHealth',
                    Personal: 'areaPresetPersonal',
                    Finance: 'areaPresetFinance',
                    Creative: 'areaPresetCreative'
                  }[areaName]
                  return (
                    <button
                      key={areaName}
                      type="button"
                      onClick={() => {
                        setSelectedAreas((prev) =>
                          isChecked ? prev.filter((a) => a !== areaName) : [...prev, areaName]
                        )
                      }}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                        isChecked
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      <span>{t(areaLabelKey)}</span>
                      {isChecked && <Check size={14} />}
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setStep('guided_lang')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  {t('back')}
                </button>
                <div className="space-x-2 space-x-reverse">
                  <button
                    onClick={() => setStep('guided_capacity')}
                    className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400"
                  >
                    {t('skip')}
                  </button>
                  <button
                    disabled={loading}
                    onClick={handleGuidedAreaSubmit}
                    className="inline-flex items-center space-x-1.5 space-x-reverse px-5 py-2 rounded-lg bg-indigo-600 font-semibold text-white text-xs hover:bg-indigo-500 shadow-sm"
                  >
                    <span>{t('createAndContinue')}</span>
                    <ArrowRight size={14} className="rtl:rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'guided_capacity' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {t('planningCapacityBuffer')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('planningCapacityBufferDesc')}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <span>{t('planningCapacityLabel', { value: capacity })}</span>
                    <span className="text-slate-400">{t('recommendedCapacity')}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {t('planningCapacityHint')}
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    <span>{t('realityBufferLabel', { value: buffer })}</span>
                    <span className="text-slate-400">{t('recommendedBuffer')}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={buffer}
                    onChange={(e) => setBuffer(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {t('realityBufferHint')}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setStep('guided_areas')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  {t('back')}
                </button>
                <button
                  disabled={loading}
                  onClick={handleFinish}
                  className="flex items-center space-x-1.5 space-x-reverse px-6 py-2 rounded-lg bg-indigo-600 font-semibold text-white text-xs hover:bg-indigo-500 shadow-sm"
                >
                  <span>{t('finishAndLaunch')}</span>
                  <Check size={14} />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
