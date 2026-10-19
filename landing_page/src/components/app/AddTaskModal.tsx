import React, { useState } from 'react'
import { Plus, X, AlertCircle, Sparkles } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { DotsUser, DotsScheduledSlot } from '../../types/dots'

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
  dotsUser: DotsUser | null
  existingSlots: DotsScheduledSlot[]
  targetDate: string
  onTaskCreated: () => void
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  dotsUser,
  existingSlots,
  targetDate,
  onTaskCreated,
}) => {
  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState<number>(45)
  const [priority, setPriority] = useState<'high' | 'medium' | 'normal'>('medium')
  const [date, setDate] = useState(targetDate || new Date().toISOString().split('T')[0])
  const [customStartTime, setCustomStartTime] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  // Calculate auto start time based on existing slots for the selected date
  const computeNextAvailableStartTime = (selectedDate: string): string => {
    const daySlots = existingSlots
      .filter((s) => s.date === selectedDate)
      .sort((a, b) => a.end_time.localeCompare(b.end_time))

    if (daySlots.length === 0) {
      return '09:00'
    }

    const lastSlot = daySlots[daySlots.length - 1]
    return lastSlot.end_time || '10:00'
  }

  const addMinutesToTime = (timeStr: string, minutes: number): string => {
    const [h, m] = timeStr.split(':').map(Number)
    const totalMinutes = h * 60 + m + minutes
    const endH = Math.floor(totalMinutes / 60) % 24
    const endM = totalMinutes % 60
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Please enter a task title')
      return
    }

    if (!dotsUser?.id) {
      setError('User profile not loaded. Please wait a moment or reload.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const startTime = customStartTime.trim() || computeNextAvailableStartTime(date)
      const endTime = addMinutesToTime(startTime, duration)
      const slotId = `slot-${Date.now()}`
      const workItemId = `item-${Date.now()}`

      // 1. Insert Work Item
      await supabase.from('dots_work_items').insert({
        id: workItemId,
        user_id: dotsUser.id,
        title: title.trim(),
        estimated_minutes: duration,
        priority: priority,
        status: 'scheduled',
        energy_level: priority === 'high' ? 'high' : 'medium',
        preferred_date: date,
        preferred_start_time: startTime,
      })

      // 2. Insert Scheduled Slot
      const { error: slotErr } = await supabase.from('dots_scheduled_slots').insert({
        id: slotId,
        user_id: dotsUser.id,
        work_item_id: workItemId,
        title: title.trim(),
        date: date,
        start_time: startTime,
        end_time: endTime,
        duration_minutes: duration,
        session_index: 1,
        total_sessions: 1,
        is_split: false,
        locked: false,
        completed: false,
        reason: 'Scheduled directly from Web Control Center',
      })

      if (slotErr) {
        throw new Error(slotErr.message)
      }

      onTaskCreated()
      setTitle('')
      setCustomStartTime('')
      onClose()
    } catch (err: any) {
      console.error('[AddTaskModal] Failed to create task:', err)
      setError(err.message || 'Could not schedule task. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="link-modal-overlay" onClick={onClose}>
      <div
        className="link-modal-card"
        style={{ maxWidth: '500px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="link-modal-header">
          <div className="modal-title-lockup">
            <div
              className="tg-avatar-circle"
              style={{ background: 'rgba(43, 47, 217, 0.1)', color: '#2B2FD9' }}
            >
              <Plus size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h3>Add New Task</h3>
              <p>Place an intentional work block directly on your schedule.</p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: '12px',
              color: '#DC2626',
              fontSize: '0.82rem',
              fontWeight: 600,
              marginBottom: '14px',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="form-label" htmlFor="task-title" style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              Task Title
            </label>
            <input
              id="task-title"
              type="text"
              placeholder="e.g. Write architecture blueprint"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="code-input"
              style={{ textAlign: 'left', padding: '10px 14px', fontSize: '0.90rem' }}
              autoFocus
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label" htmlFor="task-date" style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                Date
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="task-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="code-input"
                  style={{ textAlign: 'left', padding: '10px 12px', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="task-start-time" style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                Start Time (Optional)
              </label>
              <input
                id="task-start-time"
                type="time"
                placeholder="Auto-placed"
                value={customStartTime}
                onChange={(e) => setCustomStartTime(e.target.value)}
                className="code-input"
                style={{ textAlign: 'left', padding: '10px 12px', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              Duration
            </label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[15, 30, 45, 60, 90, 120].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDuration(mins)}
                  style={{
                    flex: '1 1 auto',
                    padding: '7px 12px',
                    borderRadius: '9999px',
                    border: duration === mins ? '1.5px solid #2B2FD9' : '1px solid #E5E7EB',
                    background: duration === mins ? 'rgba(43, 47, 217, 0.08)' : '#FFFFFF',
                    color: duration === mins ? '#2B2FD9' : '#4B5563',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              Priority Level
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['high', 'medium', 'normal'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: priority === p ? '1.5px solid #2B2FD9' : '1px solid #E5E7EB',
                    background: priority === p ? 'rgba(43, 47, 217, 0.08)' : '#F9FAFB',
                    color: priority === p ? '#2B2FD9' : '#6B7280',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {p === 'high' ? '🔥 High' : p === 'medium' ? '⚡ Medium' : '🌱 Normal'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: '11px 18px',
                borderRadius: '9999px',
                border: '1px solid #D1D5DB',
                background: '#FFFFFF',
                color: '#4B5563',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              style={{
                flex: 2,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px 22px',
                borderRadius: '9999px',
                border: 'none',
                background: '#2B2FD9',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(43, 47, 217, 0.28)',
              }}
            >
              {isSubmitting ? (
                <span>Placing Task...</span>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Schedule Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
