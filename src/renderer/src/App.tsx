import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart3, CalendarDays, CheckSquare, ChevronDown, ClipboardList, FolderKanban, Goal, Inbox, Library, Menu, Repeat2, Settings2 } from 'lucide-react'
import i18n from './i18n'
import type { Settings } from '../../shared/settings'

const navigation = [
  ['today', CalendarDays], ['inbox', Inbox], ['planner', ClipboardList], ['goals', Goal],
  ['projects', FolderKanban], ['resources', Library], ['routines', Repeat2], ['analytics', BarChart3], ['review', CheckSquare]
] as const

export function App(): JSX.Element {
  const { t } = useTranslation()
  const [settings, setSettings] = useState<Settings | null>(null)
  const [active, setActive] = useState('today')
  const [areas, setAreas] = useState<Array<{ id: string; name: string }>>([])
  const [goals, setGoals] = useState<Array<{ id: string; title: string }>>([])
  const [projects, setProjects] = useState<Array<{ id: string; title: string }>>([])
  const [workItems, setWorkItems] = useState<Array<{ id: string; title: string; estimatedMinutes: number }>>([])
  const [title, setTitle] = useState('')
  const planner = window.planner

  useEffect(() => {
    if (planner) planner.settings.get().then(applySettings).catch(() => undefined)
  }, [planner])
  useEffect(() => { if (planner) void refreshEntities() }, [planner])
  async function refreshEntities(): Promise<void> {
    const [nextAreas, nextGoals, nextProjects, nextWorkItems] = await Promise.all([planner.areas.list(), planner.goals.list(), planner.projects.list(), planner.workItems.list()])
    setAreas(nextAreas); setGoals(nextGoals); setProjects(nextProjects); setWorkItems(nextWorkItems)
  }
  async function addEntity(): Promise<void> {
    const value = title.trim(); if (!value) return
    if (active === 'goals') await planner.goals.create({ title: value })
    else if (active === 'projects') await planner.projects.create({ title: value })
    else if (active === 'inbox') await planner.workItems.create({ title: value })
    else await planner.areas.create({ name: value })
    setTitle(''); await refreshEntities()
  }
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
    return <main className="fatal min-h-screen" role="alert"><h1>Application bridge unavailable</h1><p>The secure desktop bridge did not load. Close the app and restart it with <code>npm run dev</code>. If this persists, check the Electron main-process console.</p></main>
  }

  return <main className="app-shell min-h-screen">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">C</div><div><strong>{t('appName')}</strong><small>{t('appTagline')}</small></div></div>
      <nav aria-label="Main navigation">{navigation.map(([key, Icon]) => <button key={key} className={active === key ? 'nav-item active' : 'nav-item'} onClick={() => setActive(key)}><Icon size={18}/><span>{t(key)}</span></button>)}</nav>
      <div className="sidebar-bottom"><button className="nav-item"><Settings2 size={18}/><span>{t('settings')}</span></button></div>
    </aside>
    <section className="content">
      <header className="topbar"><button className="menu" aria-label="Menu"><Menu size={20}/></button><div className="settings-row">
        <label>{t('language')}<select value={settings?.locale ?? 'en'} onChange={(e) => changeSettings({ locale: e.target.value as Settings['locale'] })}><option value="en">English</option><option value="ar">العربية</option></select></label>
        <label>{t('theme')}<select value={settings?.theme ?? 'system'} onChange={(e) => changeSettings({ theme: e.target.value as Settings['theme'] })}><option value="system">{t('system')}</option><option value="light">{t('light')}</option><option value="dark">{t('dark')}</option></select></label><ChevronDown size={16}/>
      </div></header>
      <div className="welcome"><p className="eyebrow">{t(active)}</p><h1>{active === 'goals' ? 'Goals' : active === 'projects' ? 'Projects' : active === 'inbox' ? 'Inbox' : t('foundationReady')}</h1><p>{active === 'goals' ? 'Define outcomes without forcing them into a fixed hierarchy.' : active === 'projects' ? 'Organize executable work around your own structure.' : active === 'inbox' ? 'Capture work first; scheduling arrives in a later stage.' : t('foundationCopy')}</p><div className="quick-add"><input value={title} onChange={(event) => setTitle(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void addEntity() }} placeholder={active === 'goals' ? 'New goal' : active === 'projects' ? 'New project' : active === 'inbox' ? 'New work item' : 'New area'} /><button className="primary" onClick={() => void addEntity()}>Add</button></div></div>
      <div className="placeholder-grid"><div className="placeholder-card"><span>{areas.length}</span><h2>Areas</h2><p>{areas.map((area) => area.name).join(', ') || 'No areas yet.'}</p></div><div className="placeholder-card"><span>{goals.length}</span><h2>{t('goals')}</h2><p>{goals.map((goal) => goal.title).join(', ') || 'No goals yet.'}</p></div><div className="placeholder-card"><span>{projects.length + workItems.length}</span><h2>Work</h2><p>{[...projects.map((project) => project.title), ...workItems.map((item) => item.title)].join(', ') || 'No projects or work items yet.'}</p></div></div>
    </section>
  </main>
}
