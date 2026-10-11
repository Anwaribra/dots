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
  ClipboardCheck,
  LayoutDashboard,
  BarChart2,
  Sparkles,
  Minus,
  Square,
  Copy,
  X,
  Sun,
  Moon,
  Laptop
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
  const [isMaximized, setIsMaximized] = useState(true)

  const planner = window.planner

  function applySettings(next: Settings): void {
    setSettings(next)
    i18n.changeLanguage(next.locale)
    document.documentElement.lang = next.locale
    document.documentElement.dir = next.locale === 'ar' ? 'rtl' : 'ltr'

    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = next.theme === 'dark' || (next.theme === 'system' && systemDark)

    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
  }

  useEffect(() => {
    if (planner) {
      planner.settings
        .get()
        .then(applySettings)
        .catch(() => undefined)

      if (planner.windowControls) {
        planner.windowControls.isMaximized().then(setIsMaximized).catch(() => undefined)
      }
    }

    // Media listener for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleMediaChange = (): void => {
      if (settings?.theme === 'system') {
        applySettings(settings)
      }
    }
    mediaQuery.addEventListener('change', handleMediaChange)

    const handleKeyDown = (e: KeyboardEvent): void => {
      const target = e.target as HTMLElement | null
      const isInput =
        target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)

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
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      mediaQuery.removeEventListener('change', handleMediaChange)
    }
  }, [planner, settings?.theme])

  async function changeSettings(patch: Partial<Settings>): Promise<void> {
    if (planner) applySettings(await planner.settings.update(patch))
  }

  const handleMinimize = (): void => {
    planner?.windowControls?.minimize().catch(() => undefined)
  }

  const handleMaximize = async (): Promise<void> => {
    if (!planner?.windowControls) return
    await planner.windowControls.maximize()
    const max = await planner.windowControls.isMaximized()
    setIsMaximized(max)
  }

  const handleClose = (): void => {
    planner?.windowControls?.close().catch(() => undefined)
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

  const isDarkCurrent =
    document.documentElement.classList.contains('dark') ||
    settings?.theme === 'dark' ||
    (settings?.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100 select-none">
      {/* Sleek Custom Topbar & Titlebar */}
      <header className="app-drag-region flex h-11 w-full shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/95 px-3 backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/95 z-50">
        {/* App identity on titlebar */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-tr from-indigo-600 to-violet-500 text-xs font-black text-white shadow-sm">
            C
          </div>
          <span className="text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-200">
            Clarity Planner
          </span>
          <span className="hidden sm:inline-block text-[11px] text-slate-400 dark:text-slate-500">
            / {t(active)}
          </span>
        </div>

        {/* Global Controls & Window Control Buttons */}
        <div className="app-no-drag flex items-center gap-1.5">
          {/* Quick Capture Button */}
          <button
            onClick={() => setQuickAddOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white shadow-sm hover:bg-indigo-500 active:bg-indigo-700 transition-colors"
            title="Quick Capture (Ctrl+K or Alt+N)"
          >
            <Plus size={13} />
            <span className="hidden md:inline">{t('quickAdd')}</span>
            <kbd className="hidden lg:inline-block rounded bg-indigo-700/80 px-1 py-0.2 text-[9px] font-mono">
              Ctrl+K
            </kbd>
          </button>

          {/* Search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200 transition-colors"
            title="Search Everywhere (Ctrl+F)"
          >
            <Search size={13} />
            <span className="hidden md:inline text-[11px]">{t('search')}</span>
            <kbd className="hidden lg:inline-block rounded bg-slate-200/80 dark:bg-slate-700 px-1 text-[9px] font-mono">
              Ctrl+F
            </kbd>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center rounded-md border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 p-0.5 text-[11px]">
            <button
              onClick={() => changeSettings({ locale: 'en' })}
              className={`rounded px-1.5 py-0.5 font-medium transition-colors ${
                (settings?.locale ?? 'en') === 'en'
                  ? 'bg-white shadow-xs text-indigo-600 dark:bg-slate-700 dark:text-indigo-300'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => changeSettings({ locale: 'ar' })}
              className={`rounded px-1.5 py-0.5 font-medium transition-colors ${
                settings?.locale === 'ar'
                  ? 'bg-white shadow-xs text-indigo-600 dark:bg-slate-700 dark:text-indigo-300'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              عربي
            </button>
          </div>

          {/* Theme Quick Toggle */}
          <div className="flex items-center rounded-md border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 p-0.5 text-xs text-slate-500 dark:text-slate-400">
            <button
              onClick={() => changeSettings({ theme: 'light' })}
              className={`p-1 rounded transition-colors ${
                settings?.theme === 'light'
                  ? 'bg-white shadow-xs text-amber-500 dark:bg-slate-700'
                  : 'hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Light theme"
            >
              <Sun size={13} />
            </button>
            <button
              onClick={() => changeSettings({ theme: 'dark' })}
              className={`p-1 rounded transition-colors ${
                settings?.theme === 'dark'
                  ? 'bg-white shadow-xs text-indigo-400 dark:bg-slate-700'
                  : 'hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Dark theme"
            >
              <Moon size={13} />
            </button>
            <button
              onClick={() => changeSettings({ theme: 'system' })}
              className={`p-1 rounded transition-colors ${
                settings?.theme === 'system'
                  ? 'bg-white shadow-xs text-indigo-500 dark:bg-slate-700 dark:text-indigo-300'
                  : 'hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="System theme"
            >
              <Laptop size={13} />
            </button>
          </div>

          {/* Window Control Buttons */}
          <div className="flex items-center ms-2 border-s border-slate-200 dark:border-slate-800 ps-1.5">
            <button
              onClick={handleMinimize}
              className="flex h-7 w-8 items-center justify-center rounded text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
              title="Minimize"
            >
              <Minus size={14} />
            </button>
            <button
              onClick={handleMaximize}
              className="flex h-7 w-8 items-center justify-center rounded text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
              title={isMaximized ? 'Restore' : 'Maximize'}
            >
              {isMaximized ? <Copy size={12} className="rotate-180" /> : <Square size={12} />}
            </button>
            <button
              onClick={handleClose}
              className="flex h-7 w-8 items-center justify-center rounded text-slate-500 hover:bg-rose-600 hover:text-white dark:text-slate-400 dark:hover:bg-rose-600 dark:hover:text-white transition-colors"
              title="Close Application"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Main App Layout: Sidebar + Scrollable View */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="flex w-60 shrink-0 flex-col justify-between border-e border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900/90 p-3">
          <div className="space-y-4 overflow-y-auto">
            {/* Quick search button in sidebar */}
            <button
              id="sidebar-search-btn"
              onClick={() => setSearchOpen(true)}
              className="flex w-full items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50 px-3 py-2 text-xs text-slate-500 hover:border-indigo-300 hover:text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:border-indigo-600 dark:hover:text-slate-200 transition-colors"
            >
              <Search size={14} />
              <span className="flex-1 text-start">Search workspace…</span>
              <kbd className="rounded bg-slate-200/80 px-1 text-[9px] font-mono dark:bg-slate-700">
                Ctrl+F
              </kbd>
            </button>

            {/* Navigation items */}
            <nav aria-label="Main navigation" className="space-y-0.5">
              {navigation.map(([key, Icon]) => {
                const isActive = active === key
                return (
                  <button
                    key={key}
                    id={`nav-${key}`}
                    onClick={() => setActive(key)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'} />
                    <span className="truncate">{t(key)}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Bottom Sidebar Tools */}
          <div className="border-t border-slate-200/80 pt-3 dark:border-slate-800/80 space-y-0.5">
            <button
              id="shortcuts-help-btn"
              onClick={() => setShortcutsOpen(true)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-200 transition-colors"
              title="Keyboard Shortcuts (Ctrl+/)"
            >
              <Keyboard size={15} />
              <span>{t('shortcuts')}</span>
              <kbd className="ms-auto rounded bg-slate-100 dark:bg-slate-800 px-1 text-[9px] font-mono text-slate-400">
                ?
              </kbd>
            </button>
            <button
              id="nav-settings"
              onClick={() => setActive('settings')}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                active === 'settings'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-200'
              }`}
            >
              <Settings2 size={15} />
              <span>{t('settings')}</span>
            </button>
          </div>
        </aside>

        {/* Dynamic Content View Container */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8 dark:bg-slate-950">
          {/* Demo Mode Banner */}
          {settings?.demoMode && (
            <div className="mb-6 flex items-center justify-between rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs text-amber-900 shadow-sm dark:border-amber-800/80 dark:bg-amber-950/50 dark:text-amber-200">
              <div className="flex items-center gap-2 font-semibold">
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

          {/* Active View Router */}
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
        </main>
      </div>

      {/* Global Modals */}
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
        onNavigate={(page) => {
          setActive(page)
          setSearchOpen(false)
        }}
      />

      <ShortcutsHelpModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  )
}
