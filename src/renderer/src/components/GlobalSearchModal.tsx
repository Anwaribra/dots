import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Activity,
  Bookmark,
  FolderKanban,
  Goal as GoalIcon,
  Layers,
  Library,
  StickyNote,
  Tag as TagIcon,
  Target,
  X,
  Search,
  Repeat2
} from 'lucide-react'
import type { SearchResult, SearchResultType } from '../../../shared/search-types'

const TYPE_META: Record<SearchResultType, { label: string; Icon: React.ElementType; page?: string }> = {
  area: { label: 'Area', Icon: Layers, page: 'areas' },
  goal: { label: 'Goal', Icon: GoalIcon, page: 'goals' },
  milestone: { label: 'Milestone', Icon: Target, page: 'goals' },
  project: { label: 'Project', Icon: FolderKanban, page: 'projects' },
  workItem: { label: 'Task', Icon: Activity, page: 'inbox' },
  resource: { label: 'Resource', Icon: Library, page: 'resources' },
  resourceItem: { label: 'Resource Item', Icon: Bookmark, page: 'resources' },
  tag: { label: 'Tag', Icon: TagIcon, page: 'tags' },
  note: { label: 'Note', Icon: StickyNote },
  routine: { label: 'Routine', Icon: Repeat2, page: 'routines' }
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onNavigate?: (page: string) => void
}

export function GlobalSearchModal({ isOpen, onClose, onNavigate }: Props): JSX.Element | null {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const planner = window.planner

  const search = useCallback(
    async (q: string) => {
      if (!q.trim() || !planner) { setResults([]); return }
      setLoading(true)
      try {
        const res = await (planner as any).search.global({ q, limit: 30 })
        setResults(res.results)
        setSelected(0)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    },
    [planner]
  )

  useEffect(() => {
    const t = setTimeout(() => search(query), 180)
    return () => clearTimeout(t)
  }, [query, search])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setResults([])
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, results.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)) }
      if (e.key === 'Enter' && results[selected]) { handleSelect(results[selected]) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, results, selected])

  function handleSelect(r: SearchResult): void {
    const meta = TYPE_META[r.type]
    if (meta.page && onNavigate) onNavigate(meta.page)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label="Global Search"
    >
      <div className="w-full max-w-2xl mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <Search size={18} className="text-slate-400 flex-shrink-0" />
          <input
            ref={inputRef}
            id="global-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything…"
            className="flex-1 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm outline-none"
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {results.length === 0 && query.trim() && !loading && (
            <div className="py-10 text-center text-sm text-slate-400">No results for &ldquo;{query}&rdquo;</div>
          )}
          {results.length === 0 && !query.trim() && (
            <div className="py-8 text-center text-xs text-slate-400">
              Type to search areas, goals, projects, tasks, resources…
            </div>
          )}
          {results.map((r, i) => {
            const meta = TYPE_META[r.type]
            const Icon = meta.Icon
            return (
              <button
                key={r.id}
                id={`search-result-${i}`}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                  i === selected
                    ? 'bg-indigo-50 dark:bg-indigo-950/50'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
                onClick={() => handleSelect(r)}
                onMouseEnter={() => setSelected(i)}
              >
                <Icon size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{r.title}</span>
                    {r.status && r.status !== 'active' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-wide">{r.status}</span>
                    )}
                  </div>
                  {r.subtitle && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{r.subtitle}</p>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 flex-shrink-0 pt-0.5">{meta.label}</span>
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4 text-[10px] text-slate-400">
          <span><kbd className="bg-slate-100 dark:bg-slate-800 px-1 rounded">↑↓</kbd> navigate</span>
          <span><kbd className="bg-slate-100 dark:bg-slate-800 px-1 rounded">↵</kbd> open</span>
          <span><kbd className="bg-slate-100 dark:bg-slate-800 px-1 rounded">Esc</kbd> close</span>
        </div>
      </div>
    </div>
  )
}
