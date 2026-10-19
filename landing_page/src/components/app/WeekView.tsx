import React, { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  X
} from 'lucide-react'
import type { DotsScheduledSlot, DotsFixedEvent } from '../../types/dots'

interface WeekViewProps {
  slots: DotsScheduledSlot[]
  fixedEvents?: DotsFixedEvent[]
  isLoading: boolean
  targetDate: string // YYYY-MM-DD
  onSelectDate: (date: string) => void
}

export const WeekView: React.FC<WeekViewProps> = ({
  slots,
  fixedEvents = [],
  isLoading,
  targetDate,
  onSelectDate
}) => {
  const [selectedTask, setSelectedTask] = useState<any | null>(null)
  const [weekOffset, setWeekOffset] = useState<number>(0)

  // Compute 7 days of the active week (Monday to Sunday)
  const baseDate = new Date(targetDate + 'T00:00:00')
  baseDate.setDate(baseDate.getDate() + weekOffset * 7)

  // Get Monday of that week
  const dayOfWeek = baseDate.getDay() // 0 is Sunday, 1 is Monday
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(baseDate)
  monday.setDate(baseDate.getDate() + diffToMonday)

  function formatDateToYYYYMMDD(d: Date): string {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const weekDays: Array<{ dateStr: string; dayName: string; dayNumber: number; isToday: boolean }> =
    []
  const todayStr = formatDateToYYYYMMDD(new Date())

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dateStr = formatDateToYYYYMMDD(d)
    weekDays.push({
      dateStr,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      isToday: dateStr === todayStr
    })
  }

  // Group slots by date
  const slotsByDate: Record<string, DotsScheduledSlot[]> = {}
  for (const day of weekDays) {
    slotsByDate[day.dateStr] = slots.filter((s) => s.date === day.dateStr)
  }

  const fixedByDate: Record<string, DotsFixedEvent[]> = {}
  for (const day of weekDays) {
    fixedByDate[day.dateStr] = fixedEvents.filter((fe) => fe.date === day.dateStr)
  }

  const weekRangeLabel = `${weekDays[0].dayName}, ${weekDays[0].dateStr} — ${weekDays[6].dayName}, ${weekDays[6].dateStr}`

  return (
    <div className="view-container week-view">
      {/* Week Header & Navigation */}
      <div className="week-header-card">
        <div className="week-header-info">
          <span className="week-tag">7-DAY HORIZON</span>
          <h2 className="week-range-heading">{weekRangeLabel}</h2>
          <p className="week-subheading">
            Each day balances focus time against a strict 20% reality buffer.
          </p>
        </div>

        <div className="week-navigation-controls">
          <button
            type="button"
            className="week-nav-btn"
            onClick={() => setWeekOffset((prev) => prev - 1)}
            aria-label="Previous week"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            className={`week-nav-btn current ${weekOffset === 0 ? 'active' : ''}`}
            onClick={() => setWeekOffset(0)}
          >
            Current Week
          </button>

          <button
            type="button"
            className="week-nav-btn"
            onClick={() => setWeekOffset((prev) => prev + 1)}
            aria-label="Next week"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && slots.length === 0 && (
        <div className="view-loading-skeleton" aria-label="Loading week schedule">
          <div className="skeleton-item" />
        </div>
      )}

      {/* 7-Day Grid */}
      <div className="week-grid-container">
        {weekDays.map((day) => {
          const daySlots = slotsByDate[day.dateStr] || []
          const dayFixed = fixedByDate[day.dateStr] || []
          const totalDayMinutes =
            daySlots.reduce((acc, s) => acc + s.duration_minutes, 0) +
            dayFixed.reduce((acc, fe) => acc + fe.duration_minutes, 0)

          const maxCapacity = 360 // 75% of 480m
          const capPercent = Math.min(100, Math.round((totalDayMinutes / maxCapacity) * 100))

          return (
            <div
              key={day.dateStr}
              className={`week-day-column ${day.isToday ? 'is-today' : ''}`}
              onClick={() => onSelectDate(day.dateStr)}
            >
              <div className="day-column-header">
                <span className="day-name">{day.dayName}</span>
                <span className={`day-number ${day.isToday ? 'today-pill' : ''}`}>
                  {day.dayNumber}
                </span>
                <div className="day-load-mini-track" title={`${totalDayMinutes}m planned of 360m cap`}>
                  <div
                    className={`day-load-fill ${capPercent > 85 ? 'full' : 'normal'}`}
                    style={{ width: `${capPercent}%` }}
                  />
                </div>
              </div>

              <div className="day-slots-list">
                {dayFixed.map((fe) => (
                  <div
                    key={fe.id}
                    className="week-slot-pill fixed"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedTask(fe)
                    }}
                  >
                    <div className="pill-time">{fe.start_time}</div>
                    <div className="pill-title">{fe.title}</div>
                    <Lock size={11} className="pill-icon" />
                  </div>
                ))}

                {daySlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="week-slot-pill adaptive"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedTask(slot)
                    }}
                  >
                    <div className="pill-time">{slot.start_time}</div>
                    <div className="pill-title">{slot.title}</div>
                    <span className="pill-dur">{slot.duration_minutes}m</span>
                  </div>
                ))}

                {daySlots.length === 0 && dayFixed.length === 0 && (
                  <div className="day-empty-slack">
                    <span className="slack-text">Available</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Task Inspection Drawer / Modal */}
      {selectedTask && (
        <div className="task-detail-overlay" onClick={() => setSelectedTask(null)}>
          <div className="task-detail-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <span className="drawer-badge">
                {selectedTask.locked ? 'Fixed Commitment' : 'Adaptive Slot'}
              </span>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setSelectedTask(null)}
                aria-label="Close details"
              >
                <X size={16} />
              </button>
            </div>

            <h3 className="drawer-title">{selectedTask.title}</h3>

            <div className="drawer-meta-grid">
              <div className="meta-cell">
                <span className="meta-label">Date</span>
                <span className="meta-val">{selectedTask.date}</span>
              </div>
              <div className="meta-cell">
                <span className="meta-label">Time Corridor</span>
                <span className="meta-val">
                  {selectedTask.start_time} – {selectedTask.end_time}
                </span>
              </div>
              <div className="meta-cell">
                <span className="meta-label">Duration</span>
                <span className="meta-val">{selectedTask.duration_minutes} minutes</span>
              </div>
              <div className="meta-cell">
                <span className="meta-label">Schedule Mode</span>
                <span className="meta-val">
                  {selectedTask.locked ? 'Immovable' : 'Fluid (Zero-Guilt Replan)'}
                </span>
              </div>
            </div>

            {selectedTask.reason && (
              <div className="drawer-reason-box">
                <span className="reason-label">Origin & Reasoning</span>
                <p className="reason-body">{selectedTask.reason}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
