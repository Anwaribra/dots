import { like, or } from 'drizzle-orm'
import { getDatabase } from '../db/database'
import {
  areas,
  goals,
  milestones,
  notes,
  projects,
  resourceItems,
  resources,
  routines,
  tags,
  workItems
} from '../db/schema'
import type { SearchQuery, SearchResponse, SearchResult } from '../../shared/search-types'

function score(text: string, q: string): number {
  const t = text.toLowerCase()
  const lq = q.toLowerCase()
  if (t === lq) return 100
  if (t.startsWith(lq)) return 80
  if (t.includes(lq)) return 60
  return 0
}

export function globalSearch(query: SearchQuery): SearchResponse {
  const start = Date.now()
  const { q, limit = 40, types, includeArchived = false } = query
  if (!q || q.trim().length === 0) {
    return { query: q, results: [], totalCount: 0, tookMs: 0 }
  }

  const db = getDatabase()
  const pat = `%${q}%`
  const results: SearchResult[] = []

  const want = (t: string): boolean => !types || types.length === 0 || types.includes(t as any)

  if (want('area')) {
    const rows = db.select().from(areas).where(like(areas.name, pat)).all()
    for (const r of rows) {
      if (!includeArchived && r.archivedAt) continue
      results.push({ id: r.id, type: 'area', title: r.name, subtitle: r.description ?? undefined, archivedAt: r.archivedAt })
    }
  }

  if (want('goal')) {
    const rows = db.select().from(goals).where(or(like(goals.title, pat), like(goals.description, pat))).all()
    for (const r of rows) {
      if (!includeArchived && r.archivedAt) continue
      results.push({ id: r.id, type: 'goal', title: r.title, subtitle: r.description ?? undefined, status: r.status, priority: r.priority, archivedAt: r.archivedAt })
    }
  }

  if (want('milestone')) {
    const rows = db.select().from(milestones).where(like(milestones.title, pat)).all()
    for (const r of rows) {
      if (!includeArchived && r.archivedAt) continue
      results.push({ id: r.id, type: 'milestone', title: r.title, subtitle: r.description ?? undefined, status: r.status, archivedAt: r.archivedAt })
    }
  }

  if (want('project')) {
    const rows = db.select().from(projects).where(or(like(projects.title, pat), like(projects.description, pat))).all()
    for (const r of rows) {
      if (!includeArchived && r.archivedAt) continue
      results.push({ id: r.id, type: 'project', title: r.title, subtitle: r.description ?? undefined, status: r.status, priority: r.priority, archivedAt: r.archivedAt })
    }
  }

  if (want('workItem')) {
    const rows = db.select().from(workItems).where(or(like(workItems.title, pat), like(workItems.description, pat))).all()
    for (const r of rows) {
      if (!includeArchived && r.archivedAt) continue
      results.push({ id: r.id, type: 'workItem', title: r.title, subtitle: r.description ?? undefined, status: r.status, priority: r.priority, archivedAt: r.archivedAt })
    }
  }

  if (want('resource')) {
    const rows = db.select().from(resources).where(or(like(resources.title, pat), like(resources.description, pat))).all()
    for (const r of rows) {
      if (!includeArchived && r.archivedAt) continue
      results.push({ id: r.id, type: 'resource', title: r.title, subtitle: r.description ?? undefined, archivedAt: r.archivedAt })
    }
  }

  if (want('resourceItem')) {
    const rows = db.select().from(resourceItems).where(like(resourceItems.title, pat)).all()
    for (const r of rows) {
      if (!includeArchived && r.archivedAt) continue
      results.push({ id: r.id, type: 'resourceItem', title: r.title, subtitle: r.notes ?? undefined, status: r.status, archivedAt: r.archivedAt })
    }
  }

  if (want('tag')) {
    const rows = db.select().from(tags).where(like(tags.name, pat)).all()
    for (const r of rows) {
      if (!includeArchived && r.archivedAt) continue
      results.push({ id: r.id, type: 'tag', title: r.name, archivedAt: r.archivedAt })
    }
  }

  if (want('note')) {
    const rows = db.select().from(notes).where(like(notes.content, pat)).all()
    for (const r of rows) {
      if (!includeArchived && r.archivedAt) continue
      const preview = r.content.length > 80 ? r.content.slice(0, 80) + '…' : r.content
      results.push({ id: r.id, type: 'note', title: preview, context: `${r.entityType} note`, archivedAt: r.archivedAt })
    }
  }

  if (want('routine')) {
    const rows = db.select().from(routines).where(like(routines.name, pat)).all()
    for (const r of rows) {
      if (!includeArchived && r.archivedAt) continue
      results.push({ id: r.id, type: 'routine', title: r.name, subtitle: r.description ?? undefined, archivedAt: r.archivedAt })
    }
  }

  // Sort by relevance score descending
  results.sort((a, b) => score(b.title, q) - score(a.title, q))

  const totalCount = results.length
  const limited = results.slice(0, limit)

  return { query: q, results: limited, totalCount, tookMs: Date.now() - start }
}
