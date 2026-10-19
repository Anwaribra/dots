import React from 'react'
import {
  GitCommit,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  Send,
  Calendar
} from 'lucide-react'
import type { DotsScheduleProposal } from '../../types/dots'

interface ScheduleChangesViewProps {
  proposals: DotsScheduleProposal[]
  isLoading: boolean
  error: string | null
  onRefresh: () => void
}

export const ScheduleChangesView: React.FC<ScheduleChangesViewProps> = ({
  proposals,
  isLoading,
  error,
  onRefresh
}) => {
  const getStatusBadge = (status: DotsScheduleProposal['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="proposal-status-badge approved">
            <CheckCircle2 size={12} />
            <span>Committed</span>
          </span>
        )
      case 'pending':
        return (
          <span className="proposal-status-badge pending">
            <Clock size={12} />
            <span>Pending Review</span>
          </span>
        )
      case 'rejected':
        return (
          <span className="proposal-status-badge rejected">
            <XCircle size={12} />
            <span>Declined</span>
          </span>
        )
      case 'stale':
        return (
          <span className="proposal-status-badge stale">
            <AlertTriangle size={12} />
            <span>Expired (Stale)</span>
          </span>
        )
      default:
        return null
    }
  }

  // Sort newest first
  const sortedProposals = [...proposals].sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  )

  return (
    <div className="view-container changes-view">
      {/* Header */}
      <div className="changes-header-card">
        <div className="changes-header-info">
          <span className="changes-tag">AUDIT LOG & REPLANNING FEED</span>
          <h2 className="changes-heading">Schedule Changes</h2>
          <p className="changes-subheading">
            Review adaptive repairs and task allocations proposed by the Telegram workflow.
          </p>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="view-error-state" role="alert">
          <AlertTriangle size={20} className="error-icon" />
          <div className="error-content">
            <h4>Could not load schedule changes</h4>
            <p>{error}</p>
          </div>
          <button onClick={onRefresh} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {sortedProposals.length === 0 && !isLoading && !error && (
        <div className="changes-empty-card">
          <div className="empty-icon-circle">
            <GitCommit size={28} />
          </div>
          <h4>No schedule changes recorded yet</h4>
          <p>
            When you send tasks or delay alerts to <strong>@DotsPersonalPlannerBot</strong> on
            Telegram, every proposed adjustment and approval is captured here in full detail.
          </p>
        </div>
      )}

      {/* Proposal Cards List */}
      <div className="proposals-feed-list">
        {sortedProposals.map((prop) => {
          const formattedDate = new Date(prop.created_at).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })

          const isCommitted = prop.status === 'approved'
          const isPending = prop.status === 'pending'

          return (
            <div
              key={prop.id}
              className={`proposal-audit-card ${isCommitted ? 'is-committed' : isPending ? 'is-pending' : 'is-inactive'}`}
            >
              <div className="proposal-card-topbar">
                <div className="proposal-meta-left">
                  {getStatusBadge(prop.status)}
                  <span className="proposal-date-tag">
                    <Calendar size={12} />
                    <span>Target: {prop.target_date}</span>
                  </span>
                  <span className="proposal-timestamp">{formattedDate}</span>
                </div>

                <div className="proposal-source-tag">
                  <Send size={12} />
                  <span>Telegram Workflow</span>
                </div>
              </div>

              <div className="proposal-summary-row">
                <h3 className="proposal-summary-title">{prop.human_summary}</h3>
                {prop.is_overloaded && (
                  <span className="overload-warning-pill">
                    <AlertTriangle size={12} />
                    <span>Overbooked by {prop.overload_minutes}m</span>
                  </span>
                )}
              </div>

              {/* Before vs After Comparison */}
              <div className="schedule-comparison-grid">
                {/* Before: Base Snapshot */}
                <div className="comparison-column before-col">
                  <div className="comp-col-header">
                    <span className="comp-label">Before (Base Snapshot)</span>
                    <span className="comp-count">
                      {prop.base_schedule_snapshot?.length || 0} slots
                    </span>
                  </div>

                  <div className="comp-slots-list">
                    {prop.base_schedule_snapshot && prop.base_schedule_snapshot.length > 0 ? (
                      prop.base_schedule_snapshot.map((slot, i) => (
                        <div key={slot.id || i} className="comp-slot-item base">
                          <span className="slot-time">
                            {slot.startTime || slot.start_time || '—'} –{' '}
                            {slot.endTime || slot.end_time || '—'}
                          </span>
                          <span className="slot-title-text">{slot.title || 'Existing Slot'}</span>
                        </div>
                      ))
                    ) : (
                      <div className="comp-empty-hint">Clean, open day</div>
                    )}
                  </div>
                </div>

                <div className="comparison-arrow">
                  <ArrowRight size={18} />
                </div>

                {/* After: Proposed / Committed */}
                <div className="comparison-column after-col">
                  <div className="comp-col-header">
                    <span className="comp-label">
                      {isCommitted ? 'Committed Schedule' : 'Proposed Schedule'}
                    </span>
                    <span className="comp-count">
                      {prop.proposed_schedule?.length || 0} slots
                    </span>
                  </div>

                  <div className="comp-slots-list">
                    {prop.proposed_schedule && prop.proposed_schedule.length > 0 ? (
                      prop.proposed_schedule.map((slot, i) => (
                        <div
                          key={slot.id || i}
                          className={`comp-slot-item ${slot.locked ? 'locked' : 'proposed'}`}
                        >
                          <span className="slot-time">
                            {slot.startTime || slot.start_time} – {slot.endTime || slot.end_time}
                          </span>
                          <span className="slot-title-text">{slot.title}</span>
                          {slot.reason && <span className="slot-reason-pill">{slot.reason}</span>}
                        </div>
                      ))
                    ) : (
                      <div className="comp-empty-hint">No slots</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
