import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Activity,
  BarChart3,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  FolderKanban,
  Goal as GoalIcon,
  Inbox,
  Keyboard,
  Layers,
  Library,
  Network,
  Plus,
  Repeat2,
  Search,
  Settings2,
  Tag as TagIcon,
  ClipboardCheck
} from 'lucide-react'
import i18n from './i18n'
import type { Settings } from '../../shared/settings'
import { AreasPage } from './pages/AreasPage'
import { GoalsPage } from './pages/GoalsPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { WorkItemsPage } from './pages/WorkItemsPage'
import { ResourcesPage } from './pages/ResourcesPage'
import { TypesAndFieldsPage } from './pages/TypesAndFieldsPage'
import { TagsPage } from './pages/TagsPage'
import { SettingsPage } from './pages/SettingsPage'
import { AvailabilityAndCapacityPage } from './pages/AvailabilityAndCapacityPage'
import { TimeBudgetsPage } from './pages/TimeBudgetsPage'
import { RoutinesAndHabitsPage } from './pages/RoutinesAndHabitsPage'
import { TodayPage } from './pages/TodayPage'
import { InboxPage } from './pages/InboxPage'
import { WeeklyPlannerPage } from './pages/WeeklyPlannerPage'
import { ReviewPage } from './pages/ReviewPage'
import { DashboardPage } from './pages/DashboardPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { QuickAddModal } from './components/QuickAddModal'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { LayoutDashboard, BarChart2, Sparkles } from 'lucide-react'
import { TemplatesPage } from './pages/TemplatesPage'
import { OnboardingWizard } from './components/OnboardingWizard'
import { GlobalSearchModal } from './components/GlobalSearchModal'
import { ShortcutsHelpModal } from './components/ShortcutsHelpModal'
import { WeeklyReviewPage } from './pages/WeeklyReviewPage'
import { FlowViewPage } from './pages/FlowViewPage'

const navigation = [
  ['dashboard', LayoutDashboard],
  ['today', CalendarDays],
  ['inbox', Inbox],
  ['planner', ClipboardList],
  ['analytics', BarChart2],
  ['goals', GoalIcon],
  ['projects', FolderKanban],
  ['areas', Layers],
  ['resources', Library],
  ['routines', Repeat2],
  ['budgets', BarChart3],
  ['availability', CalendarDays],
  ['types', Activity],
  ['tags', TagIcon],
  ['review', CheckSquare],
  ['weeklyReview', ClipboardCheck],
  ['flow', Network],
  ['templates', Sparkles]
] as const

export function App(): JSX.Element {
  const { t } = useTranslation()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [active, setActive] = useState<string>('today')
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const planner = window.planner

  useEffect(() => {
    if (planner) {
      planner.settings
        .get()
        .then(applySettings)
        .catch(() => undefined)
    }

    const handleKeyDown = (e: KeyboardEvent): void => {
      const target = e.target as HTMLElement | null
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)

      // Quick Add: Ctrl+K or Alt+N
      if ((e.ctrlKey && e.key.toLowerCase() === 'k') || (e.altKey && e.key.toLowerCase() === 'n')) {
        e.preventDefault()
        setQuickAddOpen((prev) => !prev)
        return
      }
      // Global search: Ctrl+F
      if (e.ctrlKey && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
        return
      }
      // Keyboard shortcuts: Ctrl+/ or ? (when not typing in an input)
      if ((e.ctrlKey && (e.key === '/' || e.key === '?')) || (!isInput && e.key === '?')) {
        e.preventDefault()
        setShortcutsOpen((prev) => !prev)
        return
      }

      // Quick page navigation with keys 1..9 (when not in an input)
      if (!isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const navMap: Record<string, string> = {
          '1': 'dashboard',
          '2': 'today',
          '3': 'inbox',
          '4': 'planner',
          '5': 'analytics',
          '6': 'goals',
          '7': 'projects',
          '8': 'weeklyReview',
          '9': 'settings'
        }
        if (navMap[e.key]) {
          e.preventDefault()
          setActive(navMap[e.key])
          return
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [planner])

  function applySettings(next: Settings): void {
    setSettings(next)
    i18n.changeLanguage(next.locale)
    document.documentElement.lang = next.locale
    document.documentElement.dir = next.locale === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.dataset.theme = next.theme
  }

  async function changeSettings(patch: Partial<Settings>): Promise<void> {
    if (planner) applySettings(await planner.settings.update(patch))
  }

  if (!planner) {
    return (
      <main className="fatal min-h-screen p-8 text-center" role="alert">
        <h1 className="text-2xl font-bold text-red-600">Application bridge unavailable</h1>
        <p className="mt-2 text-sm text-slate-600">
          The secure desktop bridge did not load. Restart the application.
        </p>
      </main>
    )
  }

  return (
    <main className="app-shell min-h-screen flex bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <aside className="sidebar w-64 border-e border-slate-200 bg-white p-4 flex flex-col justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-6">
          <div className="brand flex items-center space-x-3 space-x-reverse px-2">
            <div className="brand-mark flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">
              C
            </div>
            <div>
              <strong className="block text-sm font-bold leading-tight">{t('appName')}</strong>
              <small className="text-xs text-slate-500">{t('appTagline')}</small>
            </div>
          </div>

          {/* Search button */}
          <button
            id="sidebar-search-btn"
            onClick={() => setSearchOpen(true)}
            className="flex w-full items-center space-x-2 space-x-reverse rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-400 hover:border-indigo-300 hover:text-slate-600 dark:hover:border-indigo-700 dark:hover:text-slate-300 transition-colors"
          >
            <Search size={14} />
            <span className="flex-1 text-start text-xs">Search…</span>
            <kbd className="hidden md:inline-block rounded bg-slate-200 dark:bg-slate-700 px-1 text-[9px] text-slate-500">Ctrl+F</kbd>
          </button>

          <nav aria-label="Main navigation" className="space-y-1">
            {navigation.map(([key, Icon]) => (
              <button
                key={key}
                id={`nav-${key}`}
                className={`flex w-full items-center space-x-3 space-x-reverse rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active === key
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
                onClick={() => setActive(key)}
              >
                <Icon size={18} />
                <span>{t(key)}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-bottom space-y-1 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            id="shortcuts-help-btn"
            onClick={() => setShortcutsOpen(true)}
            className="flex w-full items-center space-x-3 space-x-reverse rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-800 transition-colors"
            title="Keyboard Shortcuts (Ctrl+/)"
          >
            <Keyboard size={18} />
            <span>Shortcuts</span>
            <kbd className="hidden md:inline-block ml-auto rounded bg-slate-100 dark:bg-slate-800 px-1 text-[9px] text-slate-400">Ctrl+/</kbd>
          </button>
          <button
            id="nav-settings"
            className={`flex w-full items-center space-x-3 space-x-reverse rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active === 'settings'
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
            onClick={() => setActive('settings')}
          >
            <Settings2 size={18} />
            <span>{t('settings')}</span>
          </button>
        </div>
      </aside>

      <section className="content flex-1 p-8 overflow-y-auto">
        {settings?.demoMode && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs text-amber-900 shadow-sm dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-200">
            <div className="flex items-center space-x-2 space-x-reverse font-semibold">
              <Sparkles size={16} className="text-amber-600 dark:text-amber-400" />
              <span>{t('demoModeActive')} — You are exploring sample data. Real tasks are unaffected.</span>
            </div>
            <button
              onClick={async () => {
                if (planner) {
                  await planner.demo.delete()
                  const updated = await planner.settings.get()
                  applySettings(updated)
                }
              }}
              className="rounded-lg bg-amber-600 px-3 py-1 font-semibold text-white hover:bg-amber-500 shadow-sm transition-colors"
            >
              {t('clearDemoData')}
            </button>
          </div>
        )}

        <header className="topbar mb-6 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <h2 className="text-xl font-bold uppercase tracking-wider text-slate-400 text-xs">
            {t(active)}
          </h2>
          <div className="settings-row flex items-center space-x-4 space-x-reverse text-xs">
            <button
              onClick={() => setQuickAddOpen(true)}
              id="topbar-quick-add-btn"
              className="flex items-center space-x-1.5 space-x-reverse rounded-lg bg-indigo-600 px-3 py-1.5 font-semibold text-white hover:bg-indigo-500 shadow-sm"
              title="Quick Capture (Ctrl+K or Alt+N)"
            >
              <Plus size={14} />
              <span>Quick Add</span>
              <kbd className="hidden md:inline-block rounded bg-indigo-700 px-1 text-[10px]">Ctrl+K</kbd>
            </button>

            <label className="flex items-center space-x-2 space-x-reverse">
              <span>{t('language')}:</span>
              <select
                value={settings?.locale ?? 'en'}
                onChange={(e) => changeSettings({ locale: e.target.value as Settings['locale'] })}
                className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </label>
            <label className="flex items-center space-x-2 space-x-reverse">
              <span>{t('theme')}:</span>
              <select
                value={settings?.theme ?? 'system'}
                onChange={(e) => changeSettings({ theme: e.target.value as Settings['theme'] })}
                className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
              >
                <option value="system">{t('system')}</option>
                <option value="light">{t('light')}</option>
                <option value="dark">{t('dark')}</option>
              </select>
            </label>
          </div>
        </header>

        {active === 'dashboard' ? (
          <DashboardPage onNavigate={setActive} />
        ) : active === 'analytics' ? (
          <AnalyticsPage />
        ) : active === 'areas' ? (
          <AreasPage />
        ) : active === 'goals' ? (
          <GoalsPage />
        ) : active === 'projects' ? (
          <ProjectsPage />
        ) : active === 'inbox' ? (
          <InboxPage />
        ) : active === 'resources' ? (
          <ResourcesPage />
        ) : active === 'routines' ? (
          <RoutinesAndHabitsPage />
        ) : active === 'budgets' ? (
          <TimeBudgetsPage />
        ) : active === 'availability' ? (
          <AvailabilityAndCapacityPage />
        ) : active === 'types' ? (
          <TypesAndFieldsPage />
        ) : active === 'tags' ? (
          <TagsPage />
        ) : active === 'settings' ? (
          <SettingsPage />
        ) : active === 'today' ? (
          <TodayPage />
        ) : active === 'planner' ? (
          <WeeklyPlannerPage />
        ) : active === 'review' ? (
          <ReviewPage />
        ) : active === 'weeklyReview' ? (
          <WeeklyReviewPage />
        ) : active === 'flow' ? (
          <FlowViewPage />
        ) : active === 'templates' ? (
          <TemplatesPage />
        ) : (
          <PlaceholderPage titleKey={active} stageNumber={0} />
        )}
      </section>

      <OnboardingWizard
        isOpen={Boolean(settings && !settings.onboardingDone)}
        currentSettings={settings}
        onClose={() => changeSettings({ onboardingDone: true })}
        onComplete={() => {
          if (planner) {
            planner.settings.get().then(applySettings).catch(() => undefined)
          }
        }}
      />

      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onCreated={() => {
          // Refresh views if needed
        }}
      />

      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={(page) => { setActive(page); setSearchOpen(false) }}
      />

      <ShortcutsHelpModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </main>
  )
}
