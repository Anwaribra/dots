import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, Clock, AlertTriangle, Plus, Trash2, CheckCircle, RefreshCw } from 'lucide-react'
import type { AvailabilityRule, AvailabilityOverride, FixedEvent } from '../../../shared/entities'
import type { DayCapacityResult } from '../../../shared/capacity'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Dialog } from '../components/ui/dialog'
import { Badge } from '../components/ui/badge'

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]

export function AvailabilityAndCapacityPage(): JSX.Element {
  const { t } = useTranslation()
  const planner = window.planner

  const [rules, setRules] = useState<AvailabilityRule[]>([])
  const [overrides, setOverrides] = useState<AvailabilityOverride[]>([])
  const [fixedEvents, setFixedEvents] = useState<FixedEvent[]>([])
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  )
  const [capacity, setCapacity] = useState<DayCapacityResult | null>(null)
  const [conflicts, setConflicts] = useState<any[]>([])

  // Modal states
  const [overrideModalOpen, setOverrideModalOpen] = useState(false)
  const [fixedEventModalOpen, setFixedEventModalOpen] = useState(false)

  // Forms
  const [overrideForm, setOverrideForm] = useState({
    date: selectedDate,
    startTime: '09:00',
    endTime: '17:00',
    isUnavailable: false,
    notes: ''
  })

  const [fixedEventForm, setFixedEventForm] = useState({
    title: '',
    startTime: `${selectedDate} 10:00`,
    endTime: `${selectedDate} 11:00`,
    flexibility: 'fixed',
    locked: true,
    recurrenceRule: ''
  })

  const loadData = async (): Promise<void> => {
    if (!planner) return
    try {
      const [rList, oList, feList, cap] = await Promise.all([
        planner.availabilityRules.list(),
        planner.availabilityOverrides.list(),
        planner.fixedEvents.list(),
        planner.capacity.calculate(selectedDate)
      ])
      setRules(rList)
      setOverrides(oList)
      setFixedEvents(feList)
      setCapacity(cap)
    } catch (err) {
      console.error('Failed to load availability data', err)
    }
  }

  useEffect(() => {
    void loadData()
  }, [selectedDate])

  const handleRuleChange = async (
    ruleId: string,
    field: 'startTime' | 'endTime' | 'isActive',
    val: any
  ): Promise<void> => {
    if (!planner) return
    const updated = rules.map((r) => (r.id === ruleId ? { ...r, [field]: val } : r))
    setRules(updated)
    await planner.availabilityRules.update(
      updated.map((r) => ({
        dayOfWeek: r.dayOfWeek,
        startTime: r.startTime,
        endTime: r.endTime,
        isActive: r.isActive
      }))
    )
    void loadData()
  }

  const handleCreateOverride = async (): Promise<void> => {
    if (!planner) return
    await planner.availabilityOverrides.create(overrideForm)
    setOverrideModalOpen(false)
    void loadData()
  }

  const handleDeleteOverride = async (id: string): Promise<void> => {
    if (!planner) return
    await planner.availabilityOverrides.delete(id)
    void loadData()
  }

  const handleCreateFixedEvent = async (): Promise<void> => {
    if (!planner || !fixedEventForm.title.trim()) return
    await planner.fixedEvents.create({
      title: fixedEventForm.title,
      startTime: fixedEventForm.startTime,
      endTime: fixedEventForm.endTime,
      flexibility: fixedEventForm.flexibility as any,
      locked: fixedEventForm.locked,
      recurrenceRule: fixedEventForm.recurrenceRule || null
    })
    setFixedEventModalOpen(false)
    setFixedEventForm({
      title: '',
      startTime: `${selectedDate} 10:00`,
      endTime: `${selectedDate} 11:00`,
      flexibility: 'fixed',
      locked: true,
      recurrenceRule: ''
    })
    void loadData()
  }

  const handleDeleteFixedEvent = async (id: string): Promise<void> => {
    if (!planner) return
    await planner.entities.delete({ kind: 'fixedEvent', id })
    void loadData()
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Availability & Capacity Model
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure your weekly schedule, date overrides, and fixed time commitments. Single source of truth for planning capacity.
          </p>
        </div>
        <div className="flex items-center space-x-3 space-x-reverse">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-44"
          />
          <Button variant="secondary" onClick={() => void loadData()}>
            <RefreshCw size={14} className="me-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* Capacity Overview Box for selected date */}
      {capacity && (
        <Card className="bg-gradient-to-r from-indigo-50/50 to-slate-50 dark:from-indigo-950/20 dark:to-slate-900 border-indigo-100 dark:border-indigo-900/40">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs uppercase font-bold text-indigo-600 dark:text-indigo-400">
                Single Source of Truth Capacity
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Date: {selectedDate} ({DAYS_OF_WEEK[capacity.dayOfWeek]})
              </h2>
            </div>
            {capacity.isOverloaded && (
              <Badge variant="critical" className="text-xs px-2 py-1 flex items-center">
                <AlertTriangle size={14} className="me-1" /> Day Overloaded
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 pt-4 text-center">
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
              <span className="block text-xs text-slate-500">Available</span>
              <strong className="text-lg text-slate-900 dark:text-slate-100">{capacity.availableMinutes}m</strong>
              <span className="block text-[11px] text-slate-400">{(capacity.availableMinutes / 60).toFixed(1)}h</span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
              <span className="block text-xs text-slate-500">Usable (Cap %)</span>
              <strong className="text-lg text-slate-900 dark:text-slate-100">{capacity.usableMinutes}m</strong>
              <span className="block text-[11px] text-slate-400">{(capacity.usableMinutes / 60).toFixed(1)}h</span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
              <span className="block text-xs text-slate-500">Buffer</span>
              <strong className="text-lg text-amber-600 dark:text-amber-400">{capacity.bufferMinutes}m</strong>
              <span className="block text-[11px] text-slate-400">Protected gap</span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
              <span className="block text-xs text-slate-500">Fixed Events</span>
              <strong className="text-lg text-purple-600 dark:text-purple-400">{capacity.fixedEventMinutes}m</strong>
              <span className="block text-[11px] text-slate-400">Non-negotiable</span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
              <span className="block text-xs text-slate-500">Locked Budgets</span>
              <strong className="text-lg text-indigo-600 dark:text-indigo-400">{capacity.budgetSummary.lockedMinutes}m</strong>
              <span className="block text-[11px] text-slate-400">Pre-allocated</span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
              <span className="block text-xs text-slate-500">Flexible Work Left</span>
              <strong className="text-lg text-emerald-600 dark:text-emerald-400">{capacity.remainingMinutesForFlexibleWork}m</strong>
              <span className="block text-[11px] text-slate-400">{(capacity.remainingMinutesForFlexibleWork / 60).toFixed(1)}h free</span>
            </div>
          </div>

          {capacity.conflictWarnings.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg space-y-1">
              {capacity.conflictWarnings.map((warn, i) => (
                <p key={i} className="text-xs text-amber-800 dark:text-amber-300 flex items-center">
                  <AlertTriangle size={14} className="me-1 shrink-0" /> {warn}
                </p>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Weekly Availability Rules */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Weekly Availability Schedule
            </h2>
            <p className="text-xs text-slate-500">
              Set your baseline working/availability window for each day of the week.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {rules.map((rule) => (
            <div key={rule.id} className="py-3 flex items-center justify-between text-sm">
              <div className="w-36 flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  checked={rule.isActive}
                  onChange={(e) => handleRuleChange(rule.id, 'isActive', e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className={rule.isActive ? 'font-semibold text-slate-900 dark:text-slate-100' : 'text-slate-400'}>
                  {DAYS_OF_WEEK[rule.dayOfWeek]}
                </span>
              </div>

              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className="text-xs text-slate-400">Start:</span>
                  <Input
                    type="time"
                    disabled={!rule.isActive}
                    value={rule.startTime}
                    onChange={(e) => handleRuleChange(rule.id, 'startTime', e.target.value)}
                    className="w-28 text-xs py-1"
                  />
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className="text-xs text-slate-400">End:</span>
                  <Input
                    type="time"
                    disabled={!rule.isActive}
                    value={rule.endTime}
                    onChange={(e) => handleRuleChange(rule.id, 'endTime', e.target.value)}
                    className="w-28 text-xs py-1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Date Overrides & Fixed Events Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Availability Overrides */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Date Overrides
              </h2>
              <p className="text-xs text-slate-500">
                Exceptions, holidays, and custom hours for specific days.
              </p>
            </div>
            <Button size="sm" onClick={() => setOverrideModalOpen(true)}>
              <Plus size={14} className="me-1" /> Add Override
            </Button>
          </div>

          {overrides.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No overrides configured</p>
          ) : (
            <div className="space-y-2">
              {overrides.map((ov) => (
                <div
                  key={ov.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                      {ov.date}
                    </span>
                    <span className="text-slate-500">
                      {ov.isUnavailable ? 'Off day (0h available)' : `${ov.startTime} - ${ov.endTime}`}
                      {ov.notes && ` • ${ov.notes}`}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 p-1 h-auto"
                    onClick={() => void handleDeleteOverride(ov.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Fixed Events */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Fixed Events
              </h2>
              <p className="text-xs text-slate-500">
                Appointments, meetings, classes, and immovable obligations.
              </p>
            </div>
            <Button size="sm" onClick={() => setFixedEventModalOpen(true)}>
              <Plus size={14} className="me-1" /> Add Fixed Event
            </Button>
          </div>

          {fixedEvents.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No fixed events scheduled</p>
          ) : (
            <div className="space-y-2">
              {fixedEvents.map((fe) => (
                <div
                  key={fe.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <strong className="text-slate-900 dark:text-slate-100 block">
                      {fe.title}
                    </strong>
                    <span className="text-slate-500">
                      {fe.startTime} - {fe.endTime}
                      {fe.recurrenceRule && ` • Recurrence: ${fe.recurrenceRule}`}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 p-1 h-auto"
                    onClick={() => void handleDeleteFixedEvent(fe.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Modal: Create Override */}
      <Dialog
        isOpen={overrideModalOpen}
        onClose={() => setOverrideModalOpen(false)}
        title="Add Date Availability Override"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOverrideModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleCreateOverride()}>Save Override</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Date"
            type="date"
            value={overrideForm.date}
            onChange={(e) => setOverrideForm({ ...overrideForm, date: e.target.value })}
          />
          <div className="flex items-center space-x-2 space-x-reverse">
            <input
              type="checkbox"
              id="isUnavailable"
              checked={overrideForm.isUnavailable}
              onChange={(e) => setOverrideForm({ ...overrideForm, isUnavailable: e.target.checked })}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isUnavailable" className="text-xs text-slate-700 dark:text-slate-300">
              Mark as completely unavailable (Day Off)
            </label>
          </div>
          {!overrideForm.isUnavailable && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Start Time"
                type="time"
                value={overrideForm.startTime}
                onChange={(e) => setOverrideForm({ ...overrideForm, startTime: e.target.value })}
              />
              <Input
                label="End Time"
                type="time"
                value={overrideForm.endTime}
                onChange={(e) => setOverrideForm({ ...overrideForm, endTime: e.target.value })}
              />
            </div>
          )}
          <Input
            label="Reason / Notes"
            placeholder="e.g. Doctor appointment, public holiday..."
            value={overrideForm.notes}
            onChange={(e) => setOverrideForm({ ...overrideForm, notes: e.target.value })}
          />
        </div>
      </Dialog>

      {/* Modal: Create Fixed Event */}
      <Dialog
        isOpen={fixedEventModalOpen}
        onClose={() => setFixedEventModalOpen(false)}
        title="Add Fixed Event"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFixedEventModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleCreateFixedEvent()}>Create Event</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Title"
            placeholder="e.g. Client Demo, Lecture, Dentist"
            value={fixedEventForm.title}
            onChange={(e) => setFixedEventForm({ ...fixedEventForm, title: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start (YYYY-MM-DD HH:mm)"
              value={fixedEventForm.startTime}
              onChange={(e) => setFixedEventForm({ ...fixedEventForm, startTime: e.target.value })}
            />
            <Input
              label="End (YYYY-MM-DD HH:mm)"
              value={fixedEventForm.endTime}
              onChange={(e) => setFixedEventForm({ ...fixedEventForm, endTime: e.target.value })}
            />
          </div>
          <Select
            label="Flexibility"
            value={fixedEventForm.flexibility}
            onChange={(e) => setFixedEventForm({ ...fixedEventForm, flexibility: e.target.value })}
            options={[
              { value: 'fixed', label: 'Fixed (Cannot be shifted)' },
              { value: 'semi_flexible', label: 'Semi-flexible' },
              { value: 'flexible', label: 'Flexible' }
            ]}
          />
          <Input
            label="Recurrence Rule (Optional)"
            placeholder="e.g. FREQ=WEEKLY;BYDAY=MO,WE or FREQ=DAILY"
            value={fixedEventForm.recurrenceRule}
            onChange={(e) => setFixedEventForm({ ...fixedEventForm, recurrenceRule: e.target.value })}
          />
        </div>
      </Dialog>
    </div>
  )
}
