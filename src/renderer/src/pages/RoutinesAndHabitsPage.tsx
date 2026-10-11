import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Repeat, CheckSquare, Plus, Trash2, CheckCircle2, Circle, Flame, Calendar } from 'lucide-react'
import type { Routine, Habit, HabitLog } from '../../../shared/entities'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Dialog } from '../components/ui/dialog'
import { Badge } from '../components/ui/badge'

export function RoutinesAndHabitsPage(): JSX.Element {
  const { t } = useTranslation()
  const planner = window.planner

  const [routines, setRoutines] = useState<Routine[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [todayLogs, setTodayLogs] = useState<HabitLog[]>([])
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  )

  const [routineModalOpen, setRoutineModalOpen] = useState(false)
  const [habitModalOpen, setHabitModalOpen] = useState(false)

  // Forms
  const [routineForm, setRoutineForm] = useState({
    name: '',
    description: '',
    targetDuration: 30,
    recurrenceRule: 'FREQ=DAILY',
    preferredTime: '08:00',
    flexibility: 'semi_flexible' as 'fixed' | 'semi_flexible' | 'flexible',
    protected: false
  })

  const [habitForm, setHabitForm] = useState({
    name: '',
    description: '',
    targetType: 'binary' as 'binary' | 'count' | 'duration' | 'frequency',
    targetValue: 1,
    targetFrequencyDays: 7,
    unit: ''
  })

  const loadData = async (): Promise<void> => {
    if (!planner) return
    try {
      const [rList, hList, logs] = await Promise.all([
        planner.routines.list(),
        planner.habits.list(),
        planner.habits.listLogs({ date: selectedDate })
      ])
      setRoutines(rList)
      setHabits(hList)
      setTodayLogs(logs)
    } catch (err) {
      console.error('Failed to load routines/habits', err)
    }
  }

  useEffect(() => {
    void loadData()
  }, [selectedDate])

  const handleCreateRoutine = async (): Promise<void> => {
    if (!planner || !routineForm.name.trim()) return
    await planner.routines.create(routineForm)
    setRoutineModalOpen(false)
    setRoutineForm({
      name: '',
      description: '',
      targetDuration: 30,
      recurrenceRule: 'FREQ=DAILY',
      preferredTime: '08:00',
      flexibility: 'semi_flexible',
      protected: false
    })
    void loadData()
  }

  const handleDeleteRoutine = async (id: string): Promise<void> => {
    if (!planner) return
    await planner.entities.delete({ kind: 'routine', id })
    void loadData()
  }

  const handleCreateHabit = async (): Promise<void> => {
    if (!planner || !habitForm.name.trim()) return
    await planner.habits.create({
      name: habitForm.name,
      description: habitForm.description || null,
      targetType: habitForm.targetType,
      targetValue: Number(habitForm.targetValue) || 1,
      targetFrequencyDays: Number(habitForm.targetFrequencyDays) || 7,
      unit: habitForm.unit || null
    })
    setHabitModalOpen(false)
    setHabitForm({
      name: '',
      description: '',
      targetType: 'binary',
      targetValue: 1,
      targetFrequencyDays: 7,
      unit: ''
    })
    void loadData()
  }

  const handleDeleteHabit = async (id: string): Promise<void> => {
    if (!planner) return
    await planner.entities.delete({ kind: 'habit', id })
    void loadData()
  }

  const handleToggleHabit = async (habit: Habit): Promise<void> => {
    if (!planner) return
    const existingLog = todayLogs.find((l) => l.habitId === habit.id)
    const nextValue = existingLog && existingLog.value >= habit.targetValue ? 0 : habit.targetValue
    await planner.habits.log({
      habitId: habit.id,
      date: selectedDate,
      value: nextValue
    })
    void loadData()
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t('routinesAndHabits')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('routinesAndHabitsSubtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-3 space-x-reverse">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-44 text-xs"
          />
        </div>
      </div>

      {/* Habits Section */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center">
              <Flame size={18} className="me-2 text-amber-500" /> {t('dailyHabits')}
            </h2>
            <p className="text-xs text-slate-500">
              {t('checkOffHabitsFor')} {selectedDate}.
            </p>
          </div>
          <Button size="sm" onClick={() => setHabitModalOpen(true)}>
            <Plus size={14} className="me-1" /> {t('addHabit')}
          </Button>
        </div>

        {habits.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">{t('noHabitsConfigured')}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {habits.map((h) => {
              const log = todayLogs.find((l) => l.habitId === h.id)
              const isDone = log ? log.value >= h.targetValue : false

              return (
                <div
                  key={h.id}
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                    isDone
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div
                    className="flex items-center space-x-3 space-x-reverse cursor-pointer flex-1"
                    onClick={() => void handleToggleHabit(h)}
                  >
                    <button
                      className={`text-xl transition-colors ${
                        isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 hover:text-slate-400'
                      }`}
                    >
                      {isDone ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </button>
                    <div>
                      <strong className={`block text-sm ${isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                        {h.name}
                      </strong>
                      <span className="text-xs text-slate-400">
                        {t('target')}: {h.targetValue} {h.unit || t('times')} / {h.targetFrequencyDays}d
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 p-1 h-auto"
                    onClick={() => void handleDeleteHabit(h.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Routines Section */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center">
              <Repeat size={18} className="me-2 text-indigo-500" /> {t('recurringRoutines')}
            </h2>
            <p className="text-xs text-slate-500">
              {t('recurringRoutinesSubtitle')}
            </p>
          </div>
          <Button size="sm" onClick={() => setRoutineModalOpen(true)}>
            <Plus size={14} className="me-1" /> {t('addRoutine')}
          </Button>
        </div>

        {routines.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">{t('noRoutinesConfigured')}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {routines.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <strong className="text-sm text-slate-900 dark:text-slate-100">{r.name}</strong>
                    <Badge variant={r.protected ? 'high' : 'secondary'} className="text-[10px]">
                      {r.targetDuration}m
                    </Badge>
                  </div>
                  {r.description && <p className="text-xs text-slate-500 mt-1">{r.description}</p>}
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{t('preferredTime')}: {r.preferredTime || t('preferredTimeAnytime')}</span>
                    <span className="capitalize">{r.flexibility.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 p-1 h-auto"
                    onClick={() => void handleDeleteRoutine(r.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal: Create Routine */}
      <Dialog
        isOpen={routineModalOpen}
        onClose={() => setRoutineModalOpen(false)}
        title={t('addRecurringRoutine')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRoutineModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={() => void handleCreateRoutine()}>{t('createRoutine')}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label={t('routineName')}
            placeholder={t('routineNamePlaceholder')}
            value={routineForm.name}
            onChange={(e) => setRoutineForm({ ...routineForm, name: e.target.value })}
          />
          <Input
            label={t('description')}
            value={routineForm.description}
            onChange={(e) => setRoutineForm({ ...routineForm, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t('estimatedMinutes')}
              type="number"
              value={routineForm.targetDuration}
              onChange={(e) => setRoutineForm({ ...routineForm, targetDuration: Number(e.target.value) })}
            />
            <Input
              label={t('preferredTimeLabel')}
              type="time"
              value={routineForm.preferredTime}
              onChange={(e) => setRoutineForm({ ...routineForm, preferredTime: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label={t('flexibility')}
              value={routineForm.flexibility}
              onChange={(e) => setRoutineForm({ ...routineForm, flexibility: e.target.value as any })}
              options={[
                { value: 'semi_flexible', label: t('semiFlexible') },
                { value: 'fixed', label: t('fixed') },
                { value: 'flexible', label: t('flexible') }
              ]}
            />
            <Input
              label={t('recurrenceRRule')}
              value={routineForm.recurrenceRule}
              onChange={(e) => setRoutineForm({ ...routineForm, recurrenceRule: e.target.value })}
            />
          </div>
        </div>
      </Dialog>

      {/* Modal: Create Habit */}
      <Dialog
        isOpen={habitModalOpen}
        onClose={() => setHabitModalOpen(false)}
        title={t('addHabitTracker')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setHabitModalOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={() => void handleCreateHabit()}>{t('createHabit')}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label={t('habitName')}
            placeholder={t('habitNamePlaceholder')}
            value={habitForm.name}
            onChange={(e) => setHabitForm({ ...habitForm, name: e.target.value })}
          />
          <Input
            label={t('description')}
            value={habitForm.description}
            onChange={(e) => setHabitForm({ ...habitForm, description: e.target.value })}
          />
          <div className="grid grid-cols-3 gap-3">
            <Select
              label={t('type')}
              value={habitForm.targetType}
              onChange={(e) => setHabitForm({ ...habitForm, targetType: e.target.value as any })}
              options={[
                { value: 'binary', label: 'Yes / No' },
                { value: 'count', label: 'Count (Numeric)' },
                { value: 'duration', label: 'Duration (Minutes)' },
                { value: 'frequency', label: 'Frequency' }
              ]}
            />
            <Input
              label={t('targetValue')}
              type="number"
              value={habitForm.targetValue}
              onChange={(e) => setHabitForm({ ...habitForm, targetValue: Number(e.target.value) })}
            />
            <Input
              label={t('unitOptional')}
              placeholder={t('unitPlaceholder')}
              value={habitForm.unit}
              onChange={(e) => setHabitForm({ ...habitForm, unit: e.target.value })}
            />
          </div>
        </div>
      </Dialog>
    </div>
  )
}
