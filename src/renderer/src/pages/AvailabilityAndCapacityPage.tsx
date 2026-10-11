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

const DAY_KEYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday'
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
            {t('availabilityAndCapacityModel')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('availabilitySubtitle')}
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
            <RefreshCw size={14} className="me-1" /> {t('refresh')}
          </Button>
        </div>
      </div>

      {/* Capacity Overview Box for selected date */}
      {capacity && (
        <Card className="bg-gradient-to-r from-indigo-50/50 to-slate-50 dark:from-indigo-950/20 dark:to-slate-900 border-indigo-100 dark:border-indigo-900/40">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs uppercase font-bold text-indigo-600 dark:text-indigo-400">
                {t('singleSourceOfTruthCapacity')}
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {t('date')}: {selectedDate} ({t(DAY_KEYS[capacity.dayOfWeek])})
              </h2>
            </div>
            {capacity.isOverloaded && (
              <Badge variant="critical" className="text-xs px-2 py-1 flex items-center">
                <AlertTriangle size={14} className="me-1" /> {t('dayOverloaded')}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 pt-4 text-center">
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
              <span className="block text-xs text-slate-500">{t('available')}</span>
              <strong className="text-lg text-slate-900 dark:text-slate-100">{capacity.availableMinutes}m</strong>
              <span className="block text-[11px] text-slate-400">{(capacity.availableMinutes / 60).toFixed(1)}h</span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
              <span className="block text-xs text-slate-500">{t('usableCapPct')}</span>
              <strong className="text-lg text-slate-900 dark:text-slate-100">{capacity.usableMinutes}m</strong>
              <span className="block text-[11px] text-slate-400">{(capacity.usableMinutes / 60).toFixed(1)}h</span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
              <span className="block text-xs text-slate-500">{t('buffer')}</span>
              <strong className="text-lg text-amber-600 dark:text-amber-400">{capacity.bufferMinutes}m</strong>
              <span className="block text-[11px] text-slate-400">{t('protectedGap')}</span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
              <span className="block text-xs text-slate-500">{t('fixedEvents')}</span>
              <strong className="text-lg text-purple-600 dark:text-purple-400">{capacity.fixedEventMinutes}m</strong>
              <span className="block text-[11px] text-slate-400">{t('nonNegotiable')}</span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
              <span className="block text-xs text-slate-500">{t('lockedBudgets')}</span>
              <strong className="text-lg text-indigo-600 dark:text-indigo-400">{capacity.budgetSummary.lockedMinutes}m</strong>
              <span className="block text-[11px] text-slate-400">{t('preAllocated')}</span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
              <span className="block text-xs text-slate-500">{t('flexibleWorkLeft')}</span>
              <strong className="text-lg text-emerald-600 dark:text-emerald-400">{capacity.remainingMinutesForFlexibleWork}m</strong>
              <span className="block text-[11px] text-slate-400">{(capacity.remainingMinutesForFlexibleWork / 60).toFixed(1)}h {t('freeHours')}</span>
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
              {t('weeklyAvailabilitySchedule')}
            </h2>
            <p className="text-xs text-slate-500">
              {t('weeklyAvailabilitySubtitle')}
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
                  {t(DAY_KEYS[rule.dayOfWeek])}
                </span>
              </div>

              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className="text-xs text-slate-400">{t('start')}:</span>
                  <Input
                    type="time"
                    disabled={!rule.isActive}
                    value={rule.startTime}
                    onChange={(e) => handleRuleChange(rule.id, 'startTime', e.target.value)}
                    className="w-28 text-xs py-1"
                  />
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className="text-xs text-slate-400">{t('end')}:</span>
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
                {t('dateOverrides')}
              </h2>
              <p className="text-xs text-slate-500">
                {t('dateOverridesSubtitle')}
              </p>
            </div>
            <Button size="sm" onClick={() => setOverrideModalOpen(true)}>
              <Plus size={14} className="me-1" /> {t('addOverride')}
            </Button>
          </div>

          {overrides.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">{t('noOverridesConfigured')}</p>
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
                      {ov.isUnavailable ? t('offDay') : `${ov.startTime} - ${ov.endTime}`}
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
                {t('fixedEvents')}
              </h2>
              <p className="text-xs text-slate-500">
                {t('fixedEventsSubtitle')}
              </p>
            </div>
            <Button size="sm" onClick={() => setFixedEventModalOpen(true)}>
              <Plus size={14} className="me-1" /> {t('addFixedEvent')}
            </Button>
          </div>

          {fixedEvents.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">{t('noFixedEventsScheduled')}</p>
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
                      {fe.recurrenceRule && ` • ${t('recurrenceRRule')}: ${fe.recurrenceRule}`}
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
        title={t('addDateAvailabilityOverride')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOverrideModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={() => void handleCreateOverride()}>{t('saveOverride')}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label={t('date')}
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
              {t('markAsUnavailable')}
            </label>
          </div>
          {!overrideForm.isUnavailable && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={t('start')}
                type="time"
                value={overrideForm.startTime}
                onChange={(e) => setOverrideForm({ ...overrideForm, startTime: e.target.value })}
              />
              <Input
                label={t('end')}
                type="time"
                value={overrideForm.endTime}
                onChange={(e) => setOverrideForm({ ...overrideForm, endTime: e.target.value })}
              />
            </div>
          )}
          <Input
            label={t('reasonNotes')}
            placeholder={t('reasonPlaceholder')}
            value={overrideForm.notes}
            onChange={(e) => setOverrideForm({ ...overrideForm, notes: e.target.value })}
          />
        </div>
      </Dialog>

      {/* Modal: Create Fixed Event */}
      <Dialog
        isOpen={fixedEventModalOpen}
        onClose={() => setFixedEventModalOpen(false)}
        title={t('addFixedEvent')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setFixedEventModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={() => void handleCreateFixedEvent()}>{t('createEvent')}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label={t('eventTitle')}
            placeholder={t('eventTitlePlaceholder')}
            value={fixedEventForm.title}
            onChange={(e) => setFixedEventForm({ ...fixedEventForm, title: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('startFormat')}
              value={fixedEventForm.startTime}
              onChange={(e) => setFixedEventForm({ ...fixedEventForm, startTime: e.target.value })}
            />
            <Input
              label={t('endFormat')}
              value={fixedEventForm.endTime}
              onChange={(e) => setFixedEventForm({ ...fixedEventForm, endTime: e.target.value })}
            />
          </div>
          <Select
            label={t('flexibility')}
            value={fixedEventForm.flexibility}
            onChange={(e) => setFixedEventForm({ ...fixedEventForm, flexibility: e.target.value })}
            options={[
              { value: 'fixed', label: t('fixedCannotBeShifted') },
              { value: 'semi_flexible', label: t('semiFlexible') },
              { value: 'flexible', label: t('flexible') }
            ]}
          />
          <Input
            label={t('recurrenceRuleOptional')}
            placeholder={t('recurrenceRulePlaceholder')}
            value={fixedEventForm.recurrenceRule}
            onChange={(e) => setFixedEventForm({ ...fixedEventForm, recurrenceRule: e.target.value })}
          />
        </div>
      </Dialog>
    </div>
  )
}
