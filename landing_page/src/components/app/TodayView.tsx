import React from 'react'
import {
  Clock,
  Lock,
  RefreshCw,
  AlertTriangle,
  Calendar,
  Send,
  Layers,
  Check,
  Plus
} from 'lucide-react'
import type { DotsScheduledSlot, DotsFixedEvent } from '../../types/dots'
import { NextActionIndicator } from './NextActionIndicator'

interface TodayViewProps {
  slots: DotsScheduledSlot[]
  fixedEvents?: DotsFixedEvent[]
  isLoading: boolean
  error: string | null
  targetDate: string // YYYY-MM-DD
  onRefresh: () => void
  onOpenLinkModal?: () => void
  isTelegramLinked?: boolean
  onOpenAddTask?: () => void
  onToggleComplete?: (slotId: string) => Promise<void>
}

export const TodayView: React.FC<TodayViewProps> = ({
  slots,
  fixedEvents = [],
  isLoading,
  error,
  targetDate,
  onRefresh,
  onOpenLinkModal,
  isTelegramLinked = true,
  onOpenAddTask,
  onToggleComplete
}) => {
  // Combine slots and fixed events into a unified chronological timeline
  type TimelineItem = {
    id: string
    title: string
    startTime: string
    endTime: string
    durationMinutes: number
    isFixed: boolean
    isLocked: boolean
    completed?: boolean
    priority?: string
    reason?: string | null
  }

  const items: TimelineItem[] = [
    ...slots.map((s) => ({
      id: s.id,
      title: s.title,
      startTime: s.start_time,
      endTime: s.end_time,
      durationMinutes: s.duration_minutes,
      isFixed: false,
      isLocked: s.locked,
      completed: s.completed || false,
      reason: s.reason
    })),
    ...fixedEvents.map((fe) => ({
      id: fe.id,
      title: fe.title,
      startTime: fe.start_time,
      endTime: fe.end_time,
      durationMinutes: fe.duration_minutes,
      isFixed: true,
      isLocked: fe.locked,
      completed: false,
      reason: 'Fixed Calendar Commitment'
    }))
  ].sort((a, b) => a.startTime.localeCompare(b.startTime))

  // Capacity calculations
  const totalPlannedMinutes = items.reduce((sum, item) => sum + item.durationMinutes, 0)
  const workdayMinutes = 480 // 8 hours (09:00 - 17:00)
  const planningCapacity = Math.round(workdayMinutes * 0.75) // 360m (75%)
  const bufferMinutes = Math.round(workdayMinutes * 0.2) // 96m (20%)
  const loadPercentage = Math.min(100, Math.round((totalPlannedMinutes / planningCapacity) * 100))

  const formattedDate = new Date(targetDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <div className="view-container today-view">
      {/* Top Banner / Day Capacity Card */}
      <div className="today-header-card">
        <div className="today-header-content">
          <div className="date-badge-row">
            <span className="today-tag">TODAY</span>
            <span className="date-full-text">{formattedDate}</span>
          </div>
          <h1 className="today-heading">Ambient Cockpit</h1>
          <p className="today-subheading">
            Your schedule is structured with reality buffers. Focus on one task at a time.
          </p>
        </div>

        {/* Capacity Meter */}
        <div className="today-capacity-card">
          <div className="capacity-stat-row">
            <span className="capacity-label">Daily Focus Load</span>
            <span className="capacity-numbers">
              <strong>{totalPlannedMinutes}m</strong> / {planningCapacity}m max
            </span>
          </div>

          <div className="capacity-progress-track">
            <div
              className={`capacity-progress-fill ${loadPercentage > 85 ? 'overbooked' : 'optimal'}`}
              style={{ width: `${loadPercentage}%` }}
            />
          </div>

          <div className="capacity-breakdown">
            <span className="cap-pill focus">75% Load Cap</span>
            <span className="cap-pill buffer">{bufferMinutes}m Protected Buffer</span>
            <button
              onClick={onRefresh}
              className="refresh-btn"
              title="Refresh schedule from Supabase"
              aria-label="Refresh schedule"
            >
              <RefreshCw size={13} className={isLoading ? 'spinning' : ''} />
              <span>Sync</span>
            </button>
          </div>
        </div>
      </div>

      {/* Telegram Link Alert if not linked */}
      {!isTelegramLinked && (
        <div className="link-telegram-banner">
          <div className="banner-icon">
            <Send size={18} />
          </div>
          <div className="banner-text">
            <strong>Connect with Telegram:</strong> Send <code>/link</code> to{' '}
            <a href="https://t.me/DotsPersonalPlannerBot" target="_blank" rel="noopener noreferrer">
              @DotsPersonalPlannerBot
            </a>{' '}
            to sync tasks and schedule changes directly from your chat.
          </div>
          <button onClick={onOpenLinkModal} className="banner-link-action-btn">
            Connect Code
          </button>
        </div>
      )}

      {/* Next Action Indicator Component */}
      <NextActionIndicator slots={slots} />

      {/* Error State */}
      {error && (
        <div className="view-error-state" role="alert">
          <AlertTriangle size={20} className="error-icon" />
          <div className="error-content">
            <h4>Could not load today's schedule</h4>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="view-loading-skeleton" aria-label="Loading schedule">
          <div className="skeleton-item" />
          <div className="skeleton-item" />
          <div className="skeleton-item" />
        </div>
      )}

      {/* Chronological Timeline */}
      <div className="timeline-section">
        <div className="timeline-section-header">
          <h3>
            <Clock size={16} />
            <span>Chronological Schedule</span>
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {onOpenAddTask && (
              <button
                type="button"
                onClick={onOpenAddTask}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#2B2FD9',
                  color: '#FFFFFF',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  border: 'none',
                  fontSize: '0.80rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(43, 47, 217, 0.25)',
                  transition: 'all 0.15s ease',
                }}
              >
                <Plus size={14} strokeWidth={2.5} />
                <span>Add Task</span>
              </button>
            )}
            <span className="item-count-badge">{items.length} Blocks</span>
          </div>
        </div>

        {items.length === 0 && !isLoading && !error ? (
          <div className="timeline-empty-card">
            <div className="empty-icon-circle">
              <Calendar size={28} />
            </div>
            <h4>No tasks scheduled for today</h4>
            <p>
              Your schedule is completely clear. You can add a task directly below or message{' '}
              <strong>@DotsPersonalPlannerBot</strong> on Telegram.
            </p>
            {onOpenAddTask && (
              <button
                type="button"
                onClick={onOpenAddTask}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#2B2FD9',
                  color: '#FFFFFF',
                  padding: '9px 18px',
                  borderRadius: '9999px',
                  border: 'none',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: '12px',
                  boxShadow: '0 4px 12px rgba(43, 47, 217, 0.25)',
                }}
              >
                <Plus size={15} strokeWidth={2.5} />
                <span>Schedule Your First Task</span>
              </button>
            )}
          </div>
        ) : (
          <div className="timeline-list">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className={`timeline-slot-card ${item.isFixed ? 'fixed-slot' : 'flexible-slot'}`}
                style={{
                  opacity: item.completed ? 0.72 : 1,
                  borderLeft: item.completed ? '4px solid #10B981' : undefined,
                  transition: 'all 0.2s ease',
                }}
              >
                <div className="slot-time-column">
                  <span className="slot-start">{item.startTime}</span>
                  <span className="slot-separator" />
                  <span className="slot-end">{item.endTime}</span>
                </div>

                <div className="slot-dot-indicator">
                  <div
                    className="dot"
                    style={{ background: item.completed ? '#10B981' : undefined }}
                  />
                  {idx < items.length - 1 && <div className="connecting-line" />}
                </div>

                <div className="slot-content-column">
                  <div className="slot-title-row" style={{ alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                      {!item.isFixed && onToggleComplete && (
                        <button
                          type="button"
                          onClick={() => onToggleComplete(item.id)}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: item.completed ? '2px solid #10B981' : '2px solid #D1D5DB',
                            background: item.completed ? '#10B981' : 'transparent',
                            color: '#FFFFFF',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                            padding: 0,
                            transition: 'all 0.15s ease',
                          }}
                          title={item.completed ? 'Mark as Incomplete' : 'Mark as Done'}
                        >
                          {item.completed && <Check size={14} strokeWidth={3} />}
                        </button>
                      )}

                      <h4
                        className="slot-title"
                        style={{
                          textDecoration: item.completed ? 'line-through' : 'none',
                          color: item.completed ? '#6B7280' : '#111827',
                          margin: 0,
                        }}
                      >
                        {item.title}
                      </h4>
                    </div>

                    <div className="slot-badges">
                      {item.completed ? (
                        <span
                          className="slot-type-badge"
                          style={{
                            background: 'rgba(16, 185, 129, 0.12)',
                            color: '#059669',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Check size={11} strokeWidth={3} />
                          <span>Done</span>
                        </span>
                      ) : item.isFixed ? (
                        <span className="slot-type-badge fixed">
                          <Lock size={11} />
                          <span>Fixed</span>
                        </span>
                      ) : (
                        <span className="slot-type-badge adaptive">
                          <Layers size={11} />
                          <span>Adaptive</span>
                        </span>
                      )}
                      <span className="slot-duration-badge">{item.durationMinutes}m</span>
                    </div>
                  </div>

                  {item.reason && <p className="slot-reason-text">{item.reason}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
