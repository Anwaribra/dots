import React from 'react'
import { Sparkles, Clock, ShieldCheck } from 'lucide-react'
import type { DotsScheduledSlot } from '../../types/dots'

interface NextActionIndicatorProps {
  slots: DotsScheduledSlot[]
  currentTimeStr?: string // e.g. "09:15"
}

export const NextActionIndicator: React.FC<NextActionIndicatorProps> = ({ slots, currentTimeStr }) => {
  // Current time in HH:mm
  const now = new Date()
  const currentMinutes = currentTimeStr
    ? parseTimeToMinutes(currentTimeStr)
    : now.getHours() * 60 + now.getMinutes()

  function parseTimeToMinutes(t: string): number {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }

  // Find currently active task or next upcoming task
  let activeSlot: DotsScheduledSlot | null = null
  let nextSlot: DotsScheduledSlot | null = null

  const sortedSlots = [...slots].sort((a, b) => a.start_time.localeCompare(b.start_time))

  for (const slot of sortedSlots) {
    const startMin = parseTimeToMinutes(slot.start_time)
    const endMin = parseTimeToMinutes(slot.end_time)

    if (currentMinutes >= startMin && currentMinutes < endMin) {
      activeSlot = slot
      break
    } else if (startMin > currentMinutes && !nextSlot) {
      nextSlot = slot
    }
  }

  const targetSlot = activeSlot || nextSlot || sortedSlots[0]
  const isCurrentlyRunning = activeSlot !== null

  if (!targetSlot) {
    return (
      <div className="next-action-card empty-state">
        <div className="next-action-ambient-glow" />
        <div className="next-action-header">
          <span className="next-badge clean">
            <Sparkles size={14} />
            <span>Zero Scheduled Burden</span>
          </span>
          <span className="buffer-badge">20% Buffer Active</span>
        </div>
        <h3 className="next-action-title">Your Day is Open</h3>
        <p className="next-action-subtitle">
          Send a quick message to <strong>@DotsPersonalPlannerBot</strong> on Telegram to schedule tasks effortlessly.
        </p>
      </div>
    )
  }

  return (
    <div className={`next-action-card ${isCurrentlyRunning ? 'active-running' : 'upcoming'}`}>
      <div className="next-action-ambient-glow" />

      <div className="next-action-top-row">
        <div className="next-action-status-indicator">
          {isCurrentlyRunning ? (
            <span className="live-pill active">
              <span className="pulse-indicator" />
              <span>In Focus Right Now</span>
            </span>
          ) : (
            <span className="live-pill upcoming">
              <Clock size={13} />
              <span>Next Action</span>
            </span>
          )}

          <span className="time-window-badge">
            {targetSlot.start_time} – {targetSlot.end_time} ({targetSlot.duration_minutes}m)
          </span>
        </div>

        <span className="reality-guarantee-pill" title="Protected 20% reality buffer guarantees peace of mind">
          <ShieldCheck size={13} />
          <span>Reality Buffer Protected</span>
        </span>
      </div>

      <div className="next-action-body">
        <h2 className="next-task-heading">{targetSlot.title}</h2>
        {targetSlot.reason && <p className="next-task-reason">{targetSlot.reason}</p>}
      </div>

      <div className="next-action-footer">
        <div className="next-action-meta">
          <span className="meta-tag">Session {targetSlot.session_index} of {targetSlot.total_sessions}</span>
          {targetSlot.locked ? (
            <span className="meta-tag locked">Fixed Commitment</span>
          ) : (
            <span className="meta-tag adaptive">Adaptive Schedule</span>
          )}
        </div>
        <span className="anti-guilt-note">Zero-guilt replanning: delays are automatically absorbed.</span>
      </div>
    </div>
  )
}
