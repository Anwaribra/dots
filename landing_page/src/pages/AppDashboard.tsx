import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { AppNavbar, type ActiveView } from '../components/app/AppNavbar'
import { TodayView } from '../components/app/TodayView'
import { WeekView } from '../components/app/WeekView'
import { ScheduleChangesView } from '../components/app/ScheduleChangesView'
import { TelegramLinkModal } from '../components/app/TelegramLinkModal'
import { AddTaskModal } from '../components/app/AddTaskModal'
import type {
  DotsScheduledSlot,
  DotsFixedEvent,
  DotsScheduleProposal
} from '../types/dots'
import { ArrowRight } from 'lucide-react'
import { DotsLogo } from '../components/brand/DotsLogo'

interface AppDashboardProps {
  onBackToLanding?: () => void
}

export const AppDashboard: React.FC<AppDashboardProps> = ({ onBackToLanding }) => {
  const { user, dotsUser, isLoading: authLoading, refreshDotsUser } = useAuth()

  const [activeView, setActiveView] = useState<ActiveView>('today')
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false)

  // Data state
  const [slots, setSlots] = useState<DotsScheduledSlot[]>([])
  const [fixedEvents, setFixedEvents] = useState<DotsFixedEvent[]>([])
  const [proposals, setProposals] = useState<DotsScheduleProposal[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)

  // Target date for Today (YYYY-MM-DD in local time)
  const [targetDate, setTargetDate] = useState<string>(() => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })

  // Load data from Supabase
  const loadScheduleData = useCallback(async () => {
    if (!user) {
      setSlots([])
      setFixedEvents([])
      setProposals([])
      setDataLoading(false)
      return
    }

    setDataLoading(true)
    setDataError(null)

    try {
      // Refresh profile state in case Telegram was linked
      if (refreshDotsUser) {
        refreshDotsUser().catch(() => {})
      }

      // 1. Fetch scheduled slots
      const { data: slotData, error: slotErr } = await supabase
        .from('dots_scheduled_slots')
        .select('*')
        .order('start_time', { ascending: true })

      if (slotErr) {
        throw new Error(slotErr.message)
      }

      // 2. Fetch fixed events
      const { data: feData, error: feErr } = await supabase
        .from('dots_fixed_events')
        .select('*')

      if (feErr) {
        console.warn('[Dots] Fixed events fetch notice:', feErr.message)
      }

      // 3. Fetch schedule proposals
      const { data: propData, error: propErr } = await supabase
        .from('dots_schedule_proposals')
        .select('*')
        .order('created_at', { ascending: false })

      if (propErr) {
        throw new Error(propErr.message)
      }

      setSlots(slotData || [])
      setFixedEvents(feData || [])
      setProposals(propData || [])
    } catch (err: any) {
      console.error('[Dots Dashboard] Data load failed:', err)
      setDataError(err.message || 'Failed to fetch schedule data')
    } finally {
      setDataLoading(false)
    }
  }, [user])

  // Initial fetch and Realtime subscription
  useEffect(() => {
    loadScheduleData()

    if (!user) return

    // Supabase Realtime channel
    const channel = supabase
      .channel('dots_dashboard_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dots_scheduled_slots' },
        () => {
          loadScheduleData()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dots_schedule_proposals' },
        () => {
          loadScheduleData()
        }
      )
      .subscribe((status) => {
        setIsRealtimeConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, loadScheduleData])

  // If not signed in, show a dedicated authentication barrier with demo quick-start
  if (!authLoading && !user) {
    return (
      <div className="app-auth-barrier">
        <div className="auth-barrier-glow" />
        <div className="auth-barrier-card">
          <div className="auth-barrier-header">
            <DotsLogo size={36} />
            <h2>Dots Visual Control Center</h2>
            <p>Sign in to view and inspect your schedule managed by Dots.</p>
          </div>

          <div className="auth-barrier-actions">
            <a href="#signin" className="demo-signin-btn" style={{ textDecoration: 'none' }}>
              <span>Sign in to Your Account</span>
              <ArrowRight size={16} />
            </a>

            <div className="telegram-info-note" style={{ fontSize: '0.80rem', color: '#5F5F7C', margin: '8px 0' }}>
              <span>Telegram users: send <code>/link</code> to <strong>@DotsPersonalPlannerBot</strong> to connect your bot after signing in.</span>
            </div>

            {onBackToLanding && (
              <button onClick={onBackToLanding} className="barrier-back-btn">
                Back to Home
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Handle Mark as Done toggle
  const handleToggleComplete = async (slotId: string) => {
    const slot = slots.find((s) => s.id === slotId)
    if (!slot) return
    const nextCompleted = !slot.completed

    // Optimistic UI update
    setSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, completed: nextCompleted } : s))
    )

    try {
      const { error } = await supabase
        .from('dots_scheduled_slots')
        .update({ completed: nextCompleted, updated_at: new Date().toISOString() })
        .eq('id', slotId)

      if (error) {
        console.error('[AppDashboard] Failed to toggle complete in Supabase:', error.message)
      }
    } catch (err) {
      console.error('[AppDashboard] Failed to toggle complete:', err)
      // Revert state on failure
      setSlots((prev) =>
        prev.map((s) => (s.id === slotId ? { ...s, completed: !nextCompleted } : s))
      )
    }
  }

  // Today's slots filtered by target date
  const todaySlots = slots.filter((s) => s.date === targetDate)
  const todayFixed = fixedEvents.filter((fe) => fe.date === targetDate)

  return (
    <div className="dots-app-layout">
      {/* Top Navigation */}
      <AppNavbar
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenLinkModal={() => setIsLinkModalOpen(true)}
        isRealtimeConnected={isRealtimeConnected}
        onBackToLanding={onBackToLanding}
      />

      {/* Main Surface Content */}
      <main className="app-main-content">
        {activeView === 'today' && (
          <TodayView
            slots={todaySlots}
            fixedEvents={todayFixed}
            isLoading={dataLoading}
            error={dataError}
            targetDate={targetDate}
            onRefresh={loadScheduleData}
            onOpenLinkModal={() => setIsLinkModalOpen(true)}
            isTelegramLinked={Boolean(dotsUser?.telegram_chat_id)}
            onOpenAddTask={() => setIsAddTaskOpen(true)}
            onToggleComplete={handleToggleComplete}
          />
        )}

        {activeView === 'week' && (
          <WeekView
            slots={slots}
            fixedEvents={fixedEvents}
            isLoading={dataLoading}
            targetDate={targetDate}
            onSelectDate={(newDate) => {
              setTargetDate(newDate)
              setActiveView('today')
            }}
          />
        )}

        {activeView === 'changes' && (
          <ScheduleChangesView
            proposals={proposals}
            isLoading={dataLoading}
            error={dataError}
            onRefresh={loadScheduleData}
          />
        )}
      </main>

      {/* Telegram Link Modal */}
      <TelegramLinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
      />

      {/* Direct Web Add Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        dotsUser={dotsUser}
        existingSlots={slots}
        targetDate={targetDate}
        onTaskCreated={loadScheduleData}
      />
    </div>
  )
}
