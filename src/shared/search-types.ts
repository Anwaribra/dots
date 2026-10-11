export type SearchResultType =
  | 'area'
  | 'goal'
  | 'milestone'
  | 'project'
  | 'workItem'
  | 'resource'
  | 'resourceItem'
  | 'tag'
  | 'note'
  | 'routine'

export interface SearchResult {
  id: string
  type: SearchResultType
  title: string
  subtitle?: string
  /** e.g. area name, project name */
  context?: string
  status?: string
  priority?: string
  archivedAt?: number | null
}

export interface SearchQuery {
  q: string
  /** Max results total; default 40 */
  limit?: number
  /** Narrow to specific types */
  types?: SearchResultType[]
  includeArchived?: boolean
}

export interface SearchResponse {
  query: string
  results: SearchResult[]
  totalCount: number
  tookMs: number
}
