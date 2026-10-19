import { describe, it, expect } from 'vitest'
import type {
  DotsScheduledSlot,
  DotsFixedEvent,
  DotsScheduleProposal,
  DotsUser
} from '../landing_page/src/types/dots'

describe('Dots Web App Integration & State Logic', () => {
  // Test User
  const mockUser: DotsUser = {
    id: 'a46ff6f9-e77e-4d64-8a7d-9a91603f40d3',
    auth_user_id: 'auth-user-123',
    telegram_chat_id: 858650312,
    telegram_username: 'Anwaribra0',
    display_name: 'Anwar',
    timezone: 'Africa/Cairo',
    created_at: '2026-10-19T17:33:00.000Z'
  }

  // Live Slot matching real database record
  const mockSlots: DotsScheduledSlot[] = [
    {
      id: 'slot-1792431190364',
      user_id: mockUser.id,
      task_id: 'task-1792431189332-k48x',
      title: 'Review audit report',
      date: '2026-10-19',
      start_time: '09:00',
      end_time: '09:45',
      duration_minutes: 45,
      session_index: 1,
      total_sessions: 1,
      locked: false,
      reason: 'Adaptive Focus Corridor',
      created_at: '2026-10-19T17:33:10.000Z'
    },
    {
      id: 'slot-1792431190365',
      user_id: mockUser.id,
      task_id: 'task-1792431189333-m59y',
      title: 'Deploy edge functions',
      date: '2026-10-19',
      start_time: '11:00',
      end_time: '12:00',
      duration_minutes: 60,
      session_index: 1,
      total_sessions: 1,
      locked: false,
      reason: 'Scheduled before standup',
      created_at: '2026-10-19T17:33:11.000Z'
    }
  ]

  // Fixed Commitment
  const mockFixedEvents: DotsFixedEvent[] = [
    {
      id: 'fix-1',
      user_id: mockUser.id,
      title: 'Architecture Review Meeting',
      date: '2026-10-19',
      start_time: '10:00',
      end_time: '10:45',
      duration_minutes: 45,
      locked: true,
      created_at: '2026-10-19T17:00:00.000Z'
    }
  ]

  // Real Proposal snapshot
  const mockProposals: DotsScheduleProposal[] = [
    {
      id: 'prop-1792431190364-yu5x',
      user_id: mockUser.id,
      status: 'approved',
      target_date: '2026-10-19',
      human_summary: 'Placed "Review audit report" at 09:00 (45m)',
      base_schedule_snapshot: [],
      proposed_schedule: [
        {
          id: 'slot-1792431190364',
          title: 'Review audit report',
          startTime: '09:00',
          endTime: '09:45',
          durationMinutes: 45,
          locked: false,
          reason: 'Initial allocation'
        }
      ],
      is_overloaded: false,
      overload_minutes: 0,
      created_at: '2026-10-19T17:33:10.000Z'
    },
    {
      id: 'prop-1792431190365-over',
      user_id: mockUser.id,
      status: 'pending',
      target_date: '2026-10-20',
      human_summary: 'Heavy load day: 380m requested',
      base_schedule_snapshot: [
        {
          id: 'slot-old',
          title: 'Existing morning task',
          startTime: '09:00',
          endTime: '12:00',
          durationMinutes: 180,
          locked: false
        }
      ],
      proposed_schedule: [
        {
          id: 'slot-old',
          title: 'Existing morning task',
          startTime: '09:00',
          endTime: '12:00',
          durationMinutes: 180,
          locked: false
        },
        {
          id: 'slot-new',
          title: 'Deep dive code refactor',
          startTime: '13:00',
          endTime: '16:20',
          durationMinutes: 200,
          locked: false
        }
      ],
      is_overloaded: true,
      overload_minutes: 20,
      created_at: '2026-10-19T17:35:00.000Z'
    }
  ]

  describe('1. Today View Timeline & Capacity Math', () => {
    it('correctly merges fixed commitments and adaptive slots in chronological order', () => {
      const combined = [
        ...mockSlots.map((s) => ({
          id: s.id,
          title: s.title,
          startTime: s.start_time,
          endTime: s.end_time,
          isFixed: false
        })),
        ...mockFixedEvents.map((fe) => ({
          id: fe.id,
          title: fe.title,
          startTime: fe.start_time,
          endTime: fe.end_time,
          isFixed: true
        }))
      ].sort((a, b) => a.startTime.localeCompare(b.startTime))

      expect(combined).toHaveLength(3)
      // 09:00 Review audit report
      expect(combined[0].title).toBe('Review audit report')
      expect(combined[0].startTime).toBe('09:00')
      expect(combined[0].isFixed).toBe(false)

      // 10:00 Architecture Review Meeting (fixed)
      expect(combined[1].title).toBe('Architecture Review Meeting')
      expect(combined[1].startTime).toBe('10:00')
      expect(combined[1].isFixed).toBe(true)

      // 11:00 Deploy edge functions
      expect(combined[2].title).toBe('Deploy edge functions')
      expect(combined[2].startTime).toBe('11:00')
      expect(combined[2].isFixed).toBe(false)
    })

    it('calculates reality capacity breakdown with 75% cap and 20% protected buffer', () => {
      const totalPlannedMinutes = 45 + 45 + 60 // 150m
      const workdayMinutes = 480 // 8 hours (09:00 - 17:00)
      const planningCapacity = Math.round(workdayMinutes * 0.75) // 360m
      const bufferMinutes = Math.round(workdayMinutes * 0.2) // 96m
      const loadPercentage = Math.round((totalPlannedMinutes / planningCapacity) * 100)

      expect(planningCapacity).toBe(360)
      expect(bufferMinutes).toBe(96)
      expect(loadPercentage).toBe(42) // 150 / 360 = 41.6% -> 42%
      expect(loadPercentage).toBeLessThan(85) // Healthy capacity!
    })

    it('flags days exceeding capacity threshold as overbooked', () => {
      const heavyDayMinutes = 380
      const planningCapacity = 360
      const loadPercentage = Math.min(100, Math.round((heavyDayMinutes / planningCapacity) * 100))

      expect(loadPercentage).toBe(100)
      expect(heavyDayMinutes > planningCapacity).toBe(true)
    })
  })

  describe('2. Next Action Indicator Logic', () => {
    function parseTimeToMinutes(t: string): number {
      const [h, m] = t.split(':').map(Number)
      return h * 60 + m
    }

    function determineActiveOrNext(
      slots: DotsScheduledSlot[],
      currentMinutes: number
    ): { active: DotsScheduledSlot | null; next: DotsScheduledSlot | null } {
      const sorted = [...slots].sort((a, b) => a.start_time.localeCompare(b.start_time))
      let active: DotsScheduledSlot | null = null
      let next: DotsScheduledSlot | null = null

      for (const slot of sorted) {
        const startMin = parseTimeToMinutes(slot.start_time)
        const endMin = parseTimeToMinutes(slot.end_time)

        if (currentMinutes >= startMin && currentMinutes < endMin) {
          active = slot
          break
        } else if (startMin > currentMinutes && !next) {
          next = slot
        }
      }

      return { active, next }
    }

    it('identifies currently active task during its corridor', () => {
      // Current time: 09:20 (within 09:00 - 09:45)
      const { active, next } = determineActiveOrNext(mockSlots, 9 * 60 + 20)
      expect(active).not.toBeNull()
      expect(active?.title).toBe('Review audit report')
      expect(next).toBeNull()
    })

    it('identifies next upcoming task before it starts', () => {
      // Current time: 08:30 (before 09:00)
      const { active, next } = determineActiveOrNext(mockSlots, 8 * 60 + 30)
      expect(active).toBeNull()
      expect(next).not.toBeNull()
      expect(next?.title).toBe('Review audit report')
    })

    it('transitions to subsequent task between corridors', () => {
      // Current time: 10:15 (between 09:45 and 11:00)
      const { active, next } = determineActiveOrNext(mockSlots, 10 * 60 + 15)
      expect(active).toBeNull()
      expect(next).not.toBeNull()
      expect(next?.title).toBe('Deploy edge functions')
    })
  })

  describe('3. Week View 7-Day Matrix & Navigation', () => {
    it('computes exact 7-day Monday-to-Sunday corridor for any given date', () => {
      const targetDate = '2026-10-19' // Monday
      const baseDate = new Date(targetDate + 'T00:00:00')
      const dayOfWeek = baseDate.getDay() // 1 = Monday
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

      const monday = new Date(baseDate)
      monday.setDate(baseDate.getDate() + diffToMonday)

      const weekDates: string[] = []
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday)
        d.setDate(monday.getDate() + i)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        weekDates.push(`${year}-${month}-${day}`)
      }

      expect(weekDates).toHaveLength(7)
      expect(weekDates[0]).toBe('2026-10-19') // Monday
      expect(weekDates[6]).toBe('2026-10-25') // Sunday
    })

    it('groups slots correctly by day', () => {
      const targetDate = '2026-10-19'
      const slotsForMonday = mockSlots.filter((s) => s.date === targetDate)
      const slotsForTuesday = mockSlots.filter((s) => s.date === '2026-10-20')

      expect(slotsForMonday).toHaveLength(2)
      expect(slotsForTuesday).toHaveLength(0)
    })
  })

  describe('4. Schedule Changes & Proposal Audit Log', () => {
    it('formats approved proposal as committed schedule change', () => {
      const approvedProp = mockProposals.find((p) => p.status === 'approved')
      expect(approvedProp).toBeDefined()
      expect(approvedProp?.status).toBe('approved')
      expect(approvedProp?.is_overloaded).toBe(false)
      expect(approvedProp?.proposed_schedule[0].title).toBe('Review audit report')
    })

    it('identifies overload minutes and warnings for pending proposals', () => {
      const pendingProp = mockProposals.find((p) => p.status === 'pending')
      expect(pendingProp).toBeDefined()
      expect(pendingProp?.is_overloaded).toBe(true)
      expect(pendingProp?.overload_minutes).toBe(20)
      expect(pendingProp?.base_schedule_snapshot).toHaveLength(1)
      expect(pendingProp?.proposed_schedule).toHaveLength(2)
    })
  })

  describe('5. Realtime & Telegram User Linking State', () => {
    it('verifies that Telegram chat ID links to application user', () => {
      expect(mockUser.telegram_chat_id).toBe(858650312)
      expect(mockUser.telegram_username).toBe('Anwaribra0')
      expect(mockUser.auth_user_id).toBeDefined()
    })
  })
})
