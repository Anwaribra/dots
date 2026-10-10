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

  useEffect(() => { window.planner.settings.get().then(applySettings) }, [])
  function applySettings(next: Settings): void {
    setSettings(next)
    i18n.changeLanguage(next.locale)
    document.documentElement.lang = next.locale
    document.documentElement.dir = next.locale === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.dataset.theme = next.theme
  }
  async function changeSettings(patch: Partial<Settings>): Promise<void> { applySettings(await window.planner.settings.update(patch)) }

  return <main className="app-shell">
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
      <div className="welcome"><p className="eyebrow">{t('today')}</p><h1>{t('foundationReady')}</h1><p>{t('foundationCopy')}</p><button className="primary" onClick={() => setActive('inbox')}>{t('startPlanning')}</button></div>
      <div className="placeholder-grid"><div className="placeholder-card"><span>01</span><h2>{t('inbox')}</h2><p>Capture work as it arrives.</p></div><div className="placeholder-card"><span>02</span><h2>{t('planner')}</h2><p>Build a realistic plan around your availability.</p></div><div className="placeholder-card"><span>03</span><h2>{t('goals')}</h2><p>Connect daily work to meaningful outcomes.</p></div></div>
    </section>
  </main>
}
