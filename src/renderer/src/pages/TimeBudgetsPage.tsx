import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PieChart, Plus, Trash2, Shield, Lock, Unlock, Layers, Target, FolderKanban, Activity } from 'lucide-react'
import type { TimeBudget, Area, Goal, Project, WorkItemType } from '../../../shared/entities'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Dialog } from '../components/ui/dialog'
import { Badge } from '../components/ui/badge'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function TimeBudgetsPage(): JSX.Element {
  const { t } = useTranslation()
  const planner = window.planner

  const [budgets, setBudgets] = useState<TimeBudget[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [types, setTypes] = useState<WorkItemType[]>([])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [scopeType, setScopeType] = useState<'area' | 'goal' | 'project' | 'workItemType'>('area')
  const [form, setForm] = useState({
    name: '',
    allocationMode: 'target' as 'minimum' | 'target' | 'maximum' | 'range',
    protection: 'flexible' as 'flexible' | 'protected' | 'locked',
    minimumMinutes: 0,
    targetMinutes: 60,
    maximumMinutes: 120,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    priority: 'medium' as 'critical' | 'high' | 'medium' | 'low',
    selectedScopeId: ''
  })

  const loadData = async (): Promise<void> => {
    if (!planner) return
    try {
      const [bList, aList, gList, pList, tList] = await Promise.all([
        planner.timeBudgets.list(),
        planner.areas.list(),
        planner.goals.list(),
        planner.projects.list(),
        planner.workItemTypes.list()
      ])
      setBudgets(bList)
      setAreas(aList)
      setGoals(gList)
      setProjects(pList)
      setTypes(tList)
      if (aList.length > 0 && !form.selectedScopeId) {
        setForm((prev) => ({ ...prev, selectedScopeId: aList[0].id }))
      }
    } catch (err) {
      console.error('Failed to load time budgets', err)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const handleCreateBudget = async (): Promise<void> => {
    if (!planner || !form.name.trim() || !form.selectedScopeId) return

    const payload: any = {
      name: form.name,
      allocationMode: form.allocationMode,
      protection: form.protection,
      minimumMinutes: Number(form.minimumMinutes) || 0,
      targetMinutes: Number(form.targetMinutes) || 0,
      maximumMinutes: Number(form.maximumMinutes) || 0,
      daysOfWeek: form.daysOfWeek,
      priority: form.priority,
      areaId: scopeType === 'area' ? form.selectedScopeId : null,
      goalId: scopeType === 'goal' ? form.selectedScopeId : null,
      projectId: scopeType === 'project' ? form.selectedScopeId : null,
      workItemTypeId: scopeType === 'workItemType' ? form.selectedScopeId : null
    }

    await planner.timeBudgets.create(payload)
    setIsModalOpen(false)
    setForm({
      name: '',
      allocationMode: 'target',
      protection: 'flexible',
      minimumMinutes: 0,
      targetMinutes: 60,
      maximumMinutes: 120,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      priority: 'medium',
      selectedScopeId: areas[0]?.id || ''
    })
    void loadData()
  }

  const handleDeleteBudget = async (id: string): Promise<void> => {
    if (!planner) return
    await planner.entities.delete({ kind: 'timeBudget', id })
    void loadData()
  }

  const getScopeName = (budget: TimeBudget): string => {
    if (budget.areaId) {
      const a = areas.find((x) => x.id === budget.areaId)
      return `Area: ${a ? a.name : 'Unknown'}`
    }
    if (budget.goalId) {
      const g = goals.find((x) => x.id === budget.goalId)
      return `Goal: ${g ? g.title : 'Unknown'}`
    }
    if (budget.projectId) {
      const p = projects.find((x) => x.id === budget.projectId)
      return `Project: ${p ? p.title : 'Unknown'}`
    }
    if (budget.workItemTypeId) {
      const t = types.find((x) => x.id === budget.workItemTypeId)
      return `Type: ${t ? t.name : 'Unknown'}`
    }
    return 'Custom'
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Time Budgets
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Allocate and protect time for specific areas, goals, projects, or work item types.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={16} className="me-2" /> Add Time Budget
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((b) => (
          <Card key={b.id} className="space-y-4 relative flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{b.name}</h3>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    {getScopeName(b)}
                  </span>
                </div>
                <div className="flex items-center space-x-1 space-x-reverse">
                  {b.protection === 'locked' && (
                    <Badge variant="critical" className="text-[10px] flex items-center">
                      <Lock size={10} className="me-1" /> Locked
                    </Badge>
                  )}
                  {b.protection === 'protected' && (
                    <Badge variant="high" className="text-[10px] flex items-center">
                      <Shield size={10} className="me-1" /> Protected
                    </Badge>
                  )}
                  {b.protection === 'flexible' && (
                    <Badge variant="secondary" className="text-[10px] flex items-center">
                      <Unlock size={10} className="me-1" /> Flexible
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg text-xs">
                <div>
                  <span className="block text-slate-400">Min</span>
                  <strong>{b.minimumMinutes}m</strong>
                </div>
                <div>
                  <span className="block text-slate-400">Target</span>
                  <strong>{b.targetMinutes}m</strong>
                </div>
                <div>
                  <span className="block text-slate-400">Max</span>
                  <strong>{b.maximumMinutes}m</strong>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>Mode: <strong className="capitalize">{b.allocationMode}</strong></span>
                <span>Days: {b.daysOfWeek.map((d) => DAYS[d]).join(', ')}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 p-1 h-auto"
                onClick={() => void handleDeleteBudget(b.id)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </Card>
        ))}

        {budgets.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400">
            No time budgets created yet. Click "Add Time Budget" to protect time for your priorities.
          </div>
        )}
      </div>

      {/* Modal: Create Time Budget */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Time Budget"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void handleCreateBudget()}>Create Budget</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Budget Name"
            placeholder="e.g. Deep Work, Learning Spanish, Client Project"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Scope Target"
              value={scopeType}
              onChange={(e) => {
                const newScope = e.target.value as any
                setScopeType(newScope)
                if (newScope === 'area') setForm({ ...form, selectedScopeId: areas[0]?.id || '' })
                if (newScope === 'goal') setForm({ ...form, selectedScopeId: goals[0]?.id || '' })
                if (newScope === 'project') setForm({ ...form, selectedScopeId: projects[0]?.id || '' })
                if (newScope === 'workItemType') setForm({ ...form, selectedScopeId: types[0]?.id || '' })
              }}
              options={[
                { value: 'area', label: 'Area' },
                { value: 'goal', label: 'Goal' },
                { value: 'project', label: 'Project' },
                { value: 'workItemType', label: 'Work Item Type' }
              ]}
            />

            <Select
              label="Choose Entity"
              value={form.selectedScopeId}
              onChange={(e) => setForm({ ...form, selectedScopeId: e.target.value })}
              options={
                scopeType === 'area'
                  ? areas.map((a) => ({ value: a.id, label: a.name }))
                  : scopeType === 'goal'
                  ? goals.map((g) => ({ value: g.id, label: g.title }))
                  : scopeType === 'project'
                  ? projects.map((p) => ({ value: p.id, label: p.title }))
                  : types.map((t) => ({ value: t.id, label: t.name }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Allocation Mode"
              value={form.allocationMode}
              onChange={(e) => setForm({ ...form, allocationMode: e.target.value as any })}
              options={[
                { value: 'minimum', label: 'Minimum' },
                { value: 'target', label: 'Target' },
                { value: 'maximum', label: 'Maximum' },
                { value: 'range', label: 'Range' }
              ]}
            />

            <Select
              label="Protection Level"
              value={form.protection}
              onChange={(e) => setForm({ ...form, protection: e.target.value as any })}
              options={[
                { value: 'flexible', label: 'Flexible (Can be borrowed)' },
                { value: 'protected', label: 'Protected (Warning on violation)' },
                { value: 'locked', label: 'Locked (Cannot be displaced)' }
              ]}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Min (minutes)"
              type="number"
              value={form.minimumMinutes}
              onChange={(e) => setForm({ ...form, minimumMinutes: Number(e.target.value) })}
            />
            <Input
              label="Target (minutes)"
              type="number"
              value={form.targetMinutes}
              onChange={(e) => setForm({ ...form, targetMinutes: Number(e.target.value) })}
            />
            <Input
              label="Max (minutes)"
              type="number"
              value={form.maximumMinutes}
              onChange={(e) => setForm({ ...form, maximumMinutes: Number(e.target.value) })}
            />
          </div>
        </div>
      </Dialog>
    </div>
  )
}
