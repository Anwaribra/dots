import { Calendar, Clock, GitCommit, LogOut, Send, ShieldCheck, ArrowLeft } from 'lucide-react'
import { DotsLogo } from '../brand/DotsLogo'
import { useAuth } from '../../context/AuthContext'

export type ActiveView = 'today' | 'week' | 'changes'

interface AppNavbarProps {
  activeView: ActiveView
  onSelectView: (view: ActiveView) => void
  onOpenLinkModal: () => void
  isRealtimeConnected?: boolean
  onBackToLanding?: () => void
}

export const AppNavbar: React.FC<AppNavbarProps> = ({
  activeView,
  onSelectView,
  onOpenLinkModal,
  isRealtimeConnected = true,
  onBackToLanding
}) => {
  const { dotsUser, signOut } = useAuth()

  return (
    <header className="app-navbar-container">
      <div className="app-navbar-inner">
        {/* Left: Brand Logo & Back Option */}
        <div className="app-navbar-left">
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="app-nav-back-btn"
              title="Return to Landing Page"
              aria-label="Back to Landing Page"
            >
              <ArrowLeft size={16} />
            </button>
          )}

          <div className="app-brand-lockup" onClick={() => onSelectView('today')} role="button" tabIndex={0}>
            <DotsLogo size={28} />
            <span className="app-badge-pill">App</span>
          </div>

          {/* Realtime Live Pulse */}
          <div className="realtime-status-pill" title="Live connection to Supabase backend">
            <span className={`realtime-dot ${isRealtimeConnected ? 'connected' : 'disconnected'}`} />
            <span className="realtime-label">{isRealtimeConnected ? 'Live Sync' : 'Offline'}</span>
          </div>
        </div>

        {/* Center: Core Three Views Nav */}
        <nav className="app-view-selector" aria-label="Main View Selector">
          <button
            type="button"
            className={`view-tab-btn ${activeView === 'today' ? 'active' : ''}`}
            onClick={() => onSelectView('today')}
          >
            <Clock size={16} />
            <span>Today</span>
          </button>

          <button
            type="button"
            className={`view-tab-btn ${activeView === 'week' ? 'active' : ''}`}
            onClick={() => onSelectView('week')}
          >
            <Calendar size={16} />
            <span>Week</span>
          </button>

          <button
            type="button"
            className={`view-tab-btn ${activeView === 'changes' ? 'active' : ''}`}
            onClick={() => onSelectView('changes')}
          >
            <GitCommit size={16} />
            <span>Schedule Changes</span>
          </button>
        </nav>

        {/* Right: Telegram Sync Badge & User Actions */}
        <div className="app-navbar-right">
          {dotsUser?.telegram_chat_id ? (
            <div className="telegram-connected-pill" title={`Connected to Telegram Chat #${dotsUser.telegram_chat_id}`}>
              <Send size={13} className="tg-icon" />
              <span className="tg-username">@{dotsUser.telegram_username || 'Telegram'}</span>
              <ShieldCheck size={14} className="verified-icon" />
            </div>
          ) : (
            <button
              type="button"
              className="telegram-link-btn"
              onClick={onOpenLinkModal}
              title="Connect your Telegram bot to sync tasks"
            >
              <Send size={13} />
              <span>Connect Telegram</span>
            </button>
          )}

          <button
            type="button"
            className="app-signout-btn"
            onClick={signOut}
            title="Sign out of Dots"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}
