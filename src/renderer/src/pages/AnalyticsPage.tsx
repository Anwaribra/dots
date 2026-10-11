import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts'
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  PieChart as PieIcon,
  TrendingUp,
  AlertTriangle,
  RotateCcw
} from 'lucide-react'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Select } from '../components/ui/select'
import type { AnalyticsOverview } from '../../../shared/analytics-engine'

const DEFAULT_COLORS = [
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#14b8a6'
]

export function AnalyticsPage(): JSX.Element {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.dir() === 'rtl'
  const planner = window.planner

  const [data, setData] = useState<AnalyticsOverview | null>(null)
  const [loading, setLoading] = useState(true)

  // Filter state
  const [dateRangePreset, setDateRangePreset] = useState<'all' | '7d' | '30d' | 'month'>('all')
  const [areaId, setAreaId] = useState('')
  const [goalId, setGoalId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [itemType, setItemType] = useState('')

  // Filter options
  const [areas, setAreas] = useState<Array<{ id: string; name: string }>>([])
  const [goals, setGoals] = useState<Array<{ id: string; title: string }>>([])
  const [projects, setProjects] = useState<Array<{ id: string; title: string }>>([])

  useEffect(() => {
    const loadOptions = async (): Promise<void> => {
      if (!planner) return
      try {
        const [a, g, p] = await Promise.all([
          planner.areas.list(),
          planner.goals.list(),
          planner.projects.list()
        ])
        setAreas(a)
        setGoals(g)
        setProjects(p)
      } catch (err) {
        console.error('Failed to load filter options:', err)
      }
    }
    void loadOptions()
  }, [])

  const loadAnalytics = async (): Promise<void> => {
    if (!planner?.analytics) return
    setLoading(true)

    let startDate: string | undefined
    let endDate: string | undefined
    const now = new Date()

    if (dateRangePreset === '7d') {
      const past = new Date(now)
      past.setDate(past.getDate() - 7)
      startDate = past.toISOString().substring(0, 10)
    } else if (dateRangePreset === '30d') {
      const past = new Date(now)
      past.setDate(past.getDate() - 30)
      startDate = past.toISOString().substring(0, 10)
    } else if (dateRangePreset === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().substring(0, 10)
    }

    try {
      const res = await planner.analytics.getOverview({
        startDate,
        endDate,
        areaId: areaId || undefined,
        goalId: goalId || undefined,
        projectId: projectId || undefined,
        itemType: itemType || undefined
      })
      setData(res)
    } catch (err) {
      console.error('Failed to load analytics overview:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAnalytics()
  }, [dateRangePreset, areaId, goalId, projectId, itemType])

  const handleResetFilters = (): void => {
    setDateRangePreset('all')
    setAreaId('')
    setGoalId('')
    setProjectId('')
    setItemType('')
  }

  // Prepared chart data
  const plannedVsActualData = data
    ? [
        {
          name: 'Time Allocation',
          Planned: data.plannedMinutes,
          Scheduled: data.scheduledMinutes,
          Actual: data.actualMinutes
        }
      ]
    : []

  const hasData =
    data &&
    (data.totalTasks > 0 ||
      data.actualMinutes > 0 ||
      data.scheduledMinutes > 0 ||
      data.plannedMinutes > 0)

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t('analytics', 'Analytics & Performance')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track planned vs actual execution, capacity utilization, deadline performance, and time allocation.
          </p>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <Button variant="outline" size="sm" onClick={handleResetFilters}>
            <RotateCcw size={14} className="me-1" />
            Reset Filters
          </Button>
          <Button variant="outline" size="sm" onClick={() => void loadAnalytics()}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="flex items-center space-x-2 space-x-reverse pb-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Filter size={14} className="text-indigo-600" />
          <span>Filters</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          <Select
            label="Date Range"
            value={dateRangePreset}
            onChange={(e) => setDateRangePreset(e.target.value as any)}
            options={[
              { value: 'all', label: 'All Time' },
              { value: '7d', label: 'Last 7 Days' },
              { value: '30d', label: 'Last 30 Days' },
              { value: 'month', label: 'This Month' }
            ]}
          />
          <Select
            label="Area"
            value={areaId}
            onChange={(e) => setAreaId(e.target.value)}
            options={[{ value: '', label: 'All Areas' }, ...areas.map((a) => ({ value: a.id, label: a.name }))]}
          />
          <Select
            label="Goal"
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
            options={[{ value: '', label: 'All Goals' }, ...goals.map((g) => ({ value: g.id, label: g.title }))]}
          />
          <Select
            label="Project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            options={[{ value: '', label: 'All Projects' }, ...projects.map((p) => ({ value: p.id, label: p.title }))]}
          />
          <Select
            label="Item Type"
            value={itemType}
            onChange={(e) => setItemType(e.target.value)}
            options={[
              { value: '', label: 'All Types' },
              { value: 'task', label: 'Task' },
              { value: 'habit', label: 'Habit' },
              { value: 'routine', label: 'Routine' }
            ]}
          />
        </div>
      </Card>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-slate-400">
          <Clock className="me-2 animate-spin" size={20} />
          <span>Aggregating analytics data...</span>
        </div>
      ) : !hasData ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
          <BarChart3 size={40} className="mb-3 text-slate-300 dark:text-slate-700" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No analytics data available
          </h3>
          <p className="mt-1 max-w-sm text-xs text-slate-500">
            There are no work items or logged time sessions matching your selected filters. Try broadening the filters or start logging work items.
          </p>
        </Card>
      ) : (
        <>
          {/* Key Metric KPI Cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <Card className="p-3.5">
              <span className="text-[11px] text-slate-500">Completion Rate</span>
              <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {data.completionRate}%
              </div>
              <span className="text-[10px] text-slate-400">
                {data.completedTasks} / {data.totalTasks} tasks
              </span>
            </Card>

            <Card className="p-3.5">
              <span className="text-[11px] text-slate-500">Deadline Accuracy</span>
              <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {data.deadlinePerformanceRate}%
              </div>
              <span className="text-[10px] text-slate-400">On-time completions</span>
            </Card>

            <Card className="p-3.5">
              <span className="text-[11px] text-slate-500">Overdue Tasks</span>
              <div className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">
                {data.overdueTasks}
              </div>
              <span className="text-[10px] text-slate-400">Past due date</span>
            </Card>

            <Card className="p-3.5">
              <span className="text-[11px] text-slate-500">Capacity Used</span>
              <div className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {data.capacityUtilization}%
              </div>
              <span className="text-[10px] text-slate-400">Usable capacity</span>
            </Card>

            <Card className="p-3.5">
              <span className="text-[11px] text-slate-500">Actual Logged</span>
              <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {data.actualMinutes}m
              </div>
              <span className="text-[10px] text-slate-400">Timer & sessions</span>
            </Card>

            <Card className="p-3.5">
              <span className="text-[11px] text-slate-500">Total Planned</span>
              <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {data.plannedMinutes}m
              </div>
              <span className="text-[10px] text-slate-400">Estimated duration</span>
            </Card>
          </div>

          {/* Charts Row 1: Planned vs Scheduled vs Actual & Time by Area */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Planned vs Scheduled vs Actual */}
            <Card className="p-5">
              <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                Planned vs Scheduled vs Actual (Minutes)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={plannedVsActualData}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" orientation={isRtl ? 'right' : 'left'} hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        borderColor: '#334155',
                        borderRadius: '0.5rem',
                        color: '#f8fafc',
                        direction: isRtl ? 'rtl' : 'ltr'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="Planned" fill="#94a3b8" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="Scheduled" fill="#6366f1" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="Actual" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Time by Area */}
            <Card className="p-5">
              <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                Time Distribution by Area
              </h3>
              {data.timeByArea.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-xs text-slate-400">
                  No area time recorded
                </div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.timeByArea}
                        dataKey="minutes"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }: any) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                      >
                        {data.timeByArea.map((entry, index) => (
                          <Cell
                            key={`cell-${entry.id}`}
                            fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any) => `${val} mins`}
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          borderColor: '#334155',
                          borderRadius: '0.5rem',
                          color: '#f8fafc',
                          direction: isRtl ? 'rtl' : 'ltr'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>

          {/* Charts Row 2: Daily Trends (Scheduled vs Actual) */}
          <Card className="p-5">
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Daily Trends (Scheduled vs Actual Execution)
            </h3>
            {data.dailyTrends.length === 0 ? (
              <div className="flex h-56 items-center justify-center text-xs text-slate-400">
                No daily historical data available
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.dailyTrends}
                    margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="date" />
                    <YAxis orientation={isRtl ? 'right' : 'left'} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        borderColor: '#334155',
                        borderRadius: '0.5rem',
                        color: '#f8fafc',
                        direction: isRtl ? 'rtl' : 'ltr'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="scheduledMinutes"
                      stroke="#6366f1"
                      name="Scheduled (min)"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="actualMinutes"
                      stroke="#10b981"
                      name="Actual (min)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* Tables Row: Time by Goal & Time by Project */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Time by Project */}
            <Card className="p-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                Time by Project
              </h3>
              {data.timeByProject.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No project time recorded</div>
              ) : (
                <div className="space-y-2">
                  {data.timeByProject.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5 text-xs dark:border-slate-800"
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-200">{p.name}</span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {p.minutes}m ({p.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Time by Goal */}
            <Card className="p-5">
              <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                Time by Goal
              </h3>
              {data.timeByGoal.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No goal time recorded</div>
              ) : (
                <div className="space-y-2">
                  {data.timeByGoal.map((g) => (
                    <div
                      key={g.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5 text-xs dark:border-slate-800"
                    >
                      <span className="font-medium text-slate-800 dark:text-slate-200">{g.name}</span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {g.minutes}m ({g.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
