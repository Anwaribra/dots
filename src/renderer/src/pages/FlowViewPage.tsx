import React, { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ChevronRight,
  FolderKanban,
  Goal as GoalIcon,
  Layers,
  Loader2,
  Network,
  Target
} from 'lucide-react'
import type { Area, Goal, Milestone, Project, WorkItem } from '../../../shared/entities'

type NodeKind = 'area' | 'goal' | 'milestone' | 'project' | 'workItem'

interface FlowNode {
  id: string
  kind: NodeKind
  title: string
  status?: string
  priority?: string
  progress?: number
  childCount?: number
  parentId?: string | null
}

const KIND_META: Record<NodeKind, { label: string; Icon: React.ElementType; color: string }> = {
  area: { label: 'Area', Icon: Layers, color: '#6366f1' },
  goal: { label: 'Goal', Icon: GoalIcon, color: '#8b5cf6' },
  milestone: { label: 'Milestone', Icon: Target, color: '#06b6d4' },
  project: { label: 'Project', Icon: FolderKanban, color: '#10b981' },
  workItem: { label: 'Task', Icon: Activity, color: '#f59e0b' }
}

function NodeCard({
  node,
  isSelected,
  onSelect
}: {
  node: FlowNode
  isSelected: boolean
  onSelect: () => void
}): JSX.Element {
  const meta = KIND_META[node.kind]
  const Icon = meta.Icon

  return (
    <button
      id={`flow-node-${node.id}`}
      onClick={onSelect}
      className={`w-48 text-left rounded-xl border-2 p-3 transition-all shadow-sm hover:shadow-md cursor-pointer ${
        isSelected
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 shadow-indigo-100 dark:shadow-indigo-900/30'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
      }`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className="p-1 rounded-lg flex-shrink-0"
          style={{ backgroundColor: meta.color + '20' }}
        >
          <Icon size={12} style={{ color: meta.color }} />
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: meta.color }}>
          {meta.label}
        </span>
      </div>
      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2 mb-1.5">
        {node.title}
      </p>
      <div className="flex items-center justify-between">
        {node.status && (
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wide ${
            node.status === 'done' || node.status === 'completed'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
              : node.status === 'active' || node.status === 'in_progress'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
          }`}>
            {node.status}
          </span>
        )}
        {node.childCount !== undefined && node.childCount > 0 && (
          <span className="text-[9px] text-slate-400">{node.childCount} items</span>
        )}
      </div>
      {node.progress !== undefined && (
        <div className="mt-2 h-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${node.progress}%`, backgroundColor: meta.color }}
          />
        </div>
      )}
    </button>
  )
}

function Column({
  title,
  icon: Icon,
  color,
  nodes,
  selectedId,
  onSelect
}: {
  title: string
  icon: React.ElementType
  color: string
  nodes: FlowNode[]
  selectedId: string | null
  onSelect: (id: string) => void
}): JSX.Element {
  return (
    <div className="flex flex-col min-w-[200px]">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Icon size={14} style={{ color }} />
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color }}>
          {title}
        </span>
        <span className="text-[10px] text-slate-400 ml-auto">{nodes.length}</span>
      </div>
      <div className="space-y-2 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        {nodes.map((n) => (
          <NodeCard
            key={n.id}
            node={n}
            isSelected={selectedId === n.id}
            onSelect={() => onSelect(n.id)}
          />
        ))}
        {nodes.length === 0 && (
          <div className="w-48 h-16 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] text-slate-400">
            No items
          </div>
        )}
      </div>
    </div>
  )
}

export function FlowViewPage(): JSX.Element {
  const [areas, setAreas] = useState<Area[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [workItems, setWorkItems] = useState<WorkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedKind, setSelectedKind] = useState<NodeKind | null>(null)
  const planner = window.planner

  useEffect(() => {
    if (!planner) { setLoading(false); return }
    Promise.all([
      planner.areas.list(),
      planner.goals.list(),
      planner.milestones.list(),
      planner.projects.list(),
      planner.workItems.list()
    ])
      .then(([a, g, m, p, w]) => {
        setAreas(a)
        setGoals(g)
        setMilestones(m as Milestone[])
        setProjects(p)
        setWorkItems(w)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [planner])

  // Build filtered nodes based on selection
  const areaNodes = useMemo<FlowNode[]>(() =>
    areas.filter((a) => !a.archivedAt).map((a) => ({
      id: a.id,
      kind: 'area',
      title: a.name,
      childCount: goals.filter((g) => g.areaId === a.id).length
    })), [areas, goals])

  const visibleGoals = useMemo(() => {
    if (selectedKind === 'area' && selectedId) return goals.filter((g) => g.areaId === selectedId && !g.archivedAt)
    return goals.filter((g) => !g.archivedAt)
  }, [goals, selectedId, selectedKind])

  const goalNodes = useMemo<FlowNode[]>(() =>
    visibleGoals.map((g) => ({
      id: g.id, kind: 'goal', title: g.title, status: g.status, priority: g.priority,
      progress: g.currentValue, childCount: milestones.filter((m) => m.goalId === g.id).length
    })), [visibleGoals, milestones])

  const visibleMilestones = useMemo(() => {
    if (selectedKind === 'goal' && selectedId) return milestones.filter((m) => m.goalId === selectedId && !m.archivedAt)
    if (selectedKind === 'area' && selectedId) {
      const areaGoalIds = new Set(goals.filter((g) => g.areaId === selectedId).map((g) => g.id))
      return milestones.filter((m) => areaGoalIds.has(m.goalId) && !m.archivedAt)
    }
    return milestones.filter((m) => !m.archivedAt)
  }, [milestones, goals, selectedId, selectedKind])

  const milestoneNodes = useMemo<FlowNode[]>(() =>
    visibleMilestones.map((m) => ({
      id: m.id, kind: 'milestone', title: m.title, status: m.status, progress: m.progress
    })), [visibleMilestones])

  const visibleProjects = useMemo(() => {
    if (selectedKind === 'goal' && selectedId) return projects.filter((p) => p.goalId === selectedId && !p.archivedAt)
    if (selectedKind === 'area' && selectedId) return projects.filter((p) => p.areaId === selectedId && !p.archivedAt)
    return projects.filter((p) => !p.archivedAt)
  }, [projects, selectedId, selectedKind])

  const projectNodes = useMemo<FlowNode[]>(() =>
    visibleProjects.map((p) => ({
      id: p.id, kind: 'project', title: p.title, status: p.status, priority: p.priority,
      progress: p.progress, childCount: workItems.filter((w) => w.projectId === p.id).length
    })), [visibleProjects, workItems])

  const visibleWorkItems = useMemo(() => {
    if (selectedKind === 'project' && selectedId) return workItems.filter((w) => w.projectId === selectedId && !w.archivedAt)
    if (selectedKind === 'goal' && selectedId) return workItems.filter((w) => w.goalId === selectedId && !w.archivedAt)
    if (selectedKind === 'area' && selectedId) return workItems.filter((w) => w.areaId === selectedId && !w.archivedAt)
    return []
  }, [workItems, selectedId, selectedKind])

  const workItemNodes = useMemo<FlowNode[]>(() =>
    visibleWorkItems.slice(0, 30).map((w) => ({
      id: w.id, kind: 'workItem', title: w.title, status: w.status, priority: w.priority, progress: w.progress
    })), [visibleWorkItems])

  function handleSelect(id: string, kind: NodeKind): void {
    if (selectedId === id && selectedKind === kind) {
      setSelectedId(null); setSelectedKind(null)
    } else {
      setSelectedId(id); setSelectedKind(kind)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-slate-400">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">Loading hierarchy…</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Network size={14} />
        <span>Click a node to filter connected items. Columns show Area → Goal → Milestone → Project → Task.</span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {(Object.entries(KIND_META) as [NodeKind, typeof KIND_META[NodeKind]][]).map(([kind, meta]) => {
          const Icon = meta.Icon
          return (
            <div key={kind} className="flex items-center gap-1.5 text-xs text-slate-500">
              <Icon size={12} style={{ color: meta.color }} />
              <span>{meta.label}</span>
            </div>
          )
        })}
        {selectedId && (
          <button
            onClick={() => { setSelectedId(null); setSelectedKind(null) }}
            className="ml-auto text-xs text-indigo-500 hover:text-indigo-400"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Flow columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        <Column
          title="Areas"
          icon={KIND_META.area.Icon}
          color={KIND_META.area.color}
          nodes={areaNodes}
          selectedId={selectedId}
          onSelect={(id) => handleSelect(id, 'area')}
        />

        <div className="flex items-start pt-8 text-slate-300 dark:text-slate-600">
          <ChevronRight size={20} />
        </div>

        <Column
          title="Goals"
          icon={KIND_META.goal.Icon}
          color={KIND_META.goal.color}
          nodes={goalNodes}
          selectedId={selectedId}
          onSelect={(id) => handleSelect(id, 'goal')}
        />

        <div className="flex items-start pt-8 text-slate-300 dark:text-slate-600">
          <ChevronRight size={20} />
        </div>

        <Column
          title="Milestones"
          icon={KIND_META.milestone.Icon}
          color={KIND_META.milestone.color}
          nodes={milestoneNodes}
          selectedId={selectedId}
          onSelect={(id) => handleSelect(id, 'milestone')}
        />

        <div className="flex items-start pt-8 text-slate-300 dark:text-slate-600">
          <ChevronRight size={20} />
        </div>

        <Column
          title="Projects"
          icon={KIND_META.project.Icon}
          color={KIND_META.project.color}
          nodes={projectNodes}
          selectedId={selectedId}
          onSelect={(id) => handleSelect(id, 'project')}
        />

        {visibleWorkItems.length > 0 && (
          <>
            <div className="flex items-start pt-8 text-slate-300 dark:text-slate-600">
              <ChevronRight size={20} />
            </div>
            <Column
              title="Tasks"
              icon={KIND_META.workItem.Icon}
              color={KIND_META.workItem.color}
              nodes={workItemNodes}
              selectedId={selectedId}
              onSelect={(id) => handleSelect(id, 'workItem')}
            />
          </>
        )}
      </div>

      {areaNodes.length === 0 && goalNodes.length === 0 && projectNodes.length === 0 && (
        <div className="py-16 text-center text-sm text-slate-400">
          No data yet. Add areas, goals, and projects to see the hierarchy here.
        </div>
      )}
    </div>
  )
}
