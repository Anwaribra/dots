import { contextBridge, ipcRenderer } from 'electron'

const api = {
  settings: {
    get: () => ipcRenderer.invoke('settings:get', undefined),
    update: (input: unknown) => ipcRenderer.invoke('settings:update', input)
  },
  areas: {
    list: () => ipcRenderer.invoke('areas:list', undefined),
    create: (input: unknown) => ipcRenderer.invoke('areas:create', input),
    update: (input: unknown) => ipcRenderer.invoke('areas:update', input)
  },
  goals: {
    list: () => ipcRenderer.invoke('goals:list', undefined),
    create: (input: unknown) => ipcRenderer.invoke('goals:create', input),
    update: (input: unknown) => ipcRenderer.invoke('goals:update', input)
  },
  milestones: {
    list: (goalId?: string) => ipcRenderer.invoke('milestones:list', { goalId }),
    create: (input: unknown) => ipcRenderer.invoke('milestones:create', input),
    update: (input: unknown) => ipcRenderer.invoke('milestones:update', input)
  },
  projects: {
    list: () => ipcRenderer.invoke('projects:list', undefined),
    create: (input: unknown) => ipcRenderer.invoke('projects:create', input),
    update: (input: unknown) => ipcRenderer.invoke('projects:update', input)
  },
  workItemTypes: {
    list: () => ipcRenderer.invoke('work-item-types:list', undefined),
    create: (input: unknown) => ipcRenderer.invoke('work-item-types:create', input),
    update: (input: unknown) => ipcRenderer.invoke('work-item-types:update', input)
  },
  customFieldDefs: {
    list: (workItemTypeId?: string) => ipcRenderer.invoke('custom-field-defs:list', { workItemTypeId }),
    create: (input: unknown) => ipcRenderer.invoke('custom-field-defs:create', input),
    update: (input: unknown) => ipcRenderer.invoke('custom-field-defs:update', input)
  },
  customFieldValues: {
    get: (workItemId: string) => ipcRenderer.invoke('custom-field-values:get', { workItemId }),
    set: (input: unknown) => ipcRenderer.invoke('custom-field-values:set', input)
  },
  workItems: {
    list: () => ipcRenderer.invoke('work-items:list', undefined),
    create: (input: unknown) => ipcRenderer.invoke('work-items:create', input),
    update: (input: unknown) => ipcRenderer.invoke('work-items:update', input)
  },
  tags: {
    list: () => ipcRenderer.invoke('tags:list', undefined),
    create: (input: unknown) => ipcRenderer.invoke('tags:create', input),
    attach: (input: unknown) => ipcRenderer.invoke('tags:attach', input),
    detach: (input: unknown) => ipcRenderer.invoke('tags:detach', input),
    getForEntity: (entityType: string, entityId: string) => ipcRenderer.invoke('tags:get-for-entity', { entityType, entityId })
  },
  notes: {
    list: (entityType: string, entityId: string) => ipcRenderer.invoke('notes:list', { entityType, entityId }),
    create: (input: unknown) => ipcRenderer.invoke('notes:create', input),
    delete: (id: string) => ipcRenderer.invoke('notes:delete', { id })
  },
  resources: {
    list: () => ipcRenderer.invoke('resources:list', undefined),
    get: (id: string) => ipcRenderer.invoke('resources:get', { id }),
    create: (input: unknown) => ipcRenderer.invoke('resources:create', input),
    update: (input: unknown) => ipcRenderer.invoke('resources:update', input),
    duplicate: (id: string) => ipcRenderer.invoke('resources:duplicate', { id })
  },
  resourceItems: {
    list: (resourceId: string) => ipcRenderer.invoke('resource-items:list', { resourceId }),
    create: (input: unknown) => ipcRenderer.invoke('resource-items:create', input),
    update: (input: unknown) => ipcRenderer.invoke('resource-items:update', input),
    bulkAdd: (input: unknown) => ipcRenderer.invoke('resource-items:bulk-add', input),
    reorder: (input: unknown) => ipcRenderer.invoke('resource-items:reorder', input),
    linkWorkItem: (input: unknown) => ipcRenderer.invoke('resource-items:link-work-item', input)
  },
  dependencies: {
    list: () => ipcRenderer.invoke('dependencies:list', undefined),
    create: (input: unknown) => ipcRenderer.invoke('dependencies:create', input),
    delete: (id: string) => ipcRenderer.invoke('dependencies:delete', { id })
  },
  availabilityRules: {
    list: () => ipcRenderer.invoke('availability-rules:list', undefined),
    update: (rules: unknown[]) => ipcRenderer.invoke('availability-rules:update', { rules })
  },
  availabilityOverrides: {
    list: () => ipcRenderer.invoke('availability-overrides:list', undefined),
    create: (input: unknown) => ipcRenderer.invoke('availability-overrides:create', input),
    delete: (id: string) => ipcRenderer.invoke('availability-overrides:delete', { id })
  },
  capacity: {
    calculate: (date: string) => ipcRenderer.invoke('capacity:calculate', { date })
  },
  fixedEvents: {
    list: () => ipcRenderer.invoke('fixed-events:list', undefined),
    create: (input: unknown) => ipcRenderer.invoke('fixed-events:create', input),
    update: (input: unknown) => ipcRenderer.invoke('fixed-events:update', input)
  },
  timeBudgets: {
    list: () => ipcRenderer.invoke('time-budgets:list', undefined),
    create: (input: unknown) => ipcRenderer.invoke('time-budgets:create', input),
    update: (input: unknown) => ipcRenderer.invoke('time-budgets:update', input)
  },
  routines: {
    list: () => ipcRenderer.invoke('routines:list', undefined),
    create: (input: unknown) => ipcRenderer.invoke('routines:create', input),
    update: (input: unknown) => ipcRenderer.invoke('routines:update', input)
  },
  habits: {
    list: () => ipcRenderer.invoke('habits:list', undefined),
    create: (input: unknown) => ipcRenderer.invoke('habits:create', input),
    update: (input: unknown) => ipcRenderer.invoke('habits:update', input),
    log: (input: unknown) => ipcRenderer.invoke('habits:log', input),
    listLogs: (filter?: { habitId?: string; date?: string } | string) => {
      const payload =
        typeof filter === 'string'
          ? filter.includes('-')
            ? { date: filter }
            : { habitId: filter }
          : filter
      return ipcRenderer.invoke('habits:list-logs', payload)
    }
  },
  planning: {
    generateWeek: (startDate?: string) => ipcRenderer.invoke('planning:generate-week', { startDate }),
    getSchedule: (startDate: string, endDate: string) => ipcRenderer.invoke('planning:get-schedule', { startDate, endDate }),
    clearSchedule: (startDate: string, endDate: string) => ipcRenderer.invoke('planning:clear-schedule', { startDate, endDate }),
    updateScheduleItem: (input: unknown) => ipcRenderer.invoke('planning:update-schedule-item', input),
    createScheduleItem: (input: unknown) => ipcRenderer.invoke('planning:create-schedule-item', input),
    deleteScheduleItem: (id: string) => ipcRenderer.invoke('planning:delete-schedule-item', { id })
  },
  entities: {
    archive: (input: unknown) => ipcRenderer.invoke('entities:archive', input),
    restore: (input: unknown) => ipcRenderer.invoke('entities:restore', input),
    delete: (input: unknown) => ipcRenderer.invoke('entities:delete', input)
  },
  sessions: {
    list: (workItemId?: string) => ipcRenderer.invoke('sessions:list', workItemId ? { workItemId } : undefined),
    create: (input: unknown) => ipcRenderer.invoke('sessions:create', input),
    update: (input: unknown) => ipcRenderer.invoke('sessions:update', input),
    delete: (id: string) => ipcRenderer.invoke('sessions:delete', { id })
  },
  timer: {
    getState: () => ipcRenderer.invoke('timer:get-state', undefined),
    start: (input: unknown) => ipcRenderer.invoke('timer:start', input),
    pause: () => ipcRenderer.invoke('timer:pause', undefined),
    resume: () => ipcRenderer.invoke('timer:resume', undefined),
    stop: () => ipcRenderer.invoke('timer:stop', undefined),
    complete: () => ipcRenderer.invoke('timer:complete', undefined),
    addTime: (minutes: number) => ipcRenderer.invoke('timer:add-time', { minutes })
  },
  accuracy: {
    getForWorkItem: (workItemId: string) => ipcRenderer.invoke('accuracy:get-for-work-item', { workItemId }),
    getOverall: () => ipcRenderer.invoke('accuracy:get-overall', undefined)
  },
  backup: {
    exportJson: () => ipcRenderer.invoke('backup:export-json', undefined),
    restore: (jsonData: string) => ipcRenderer.invoke('backup:restore', { jsonData }),
    createDb: (destPath?: string) => ipcRenderer.invoke('backup:create-db', destPath ? { destPath } : undefined)
  },
  reviews: {
    listPolicies: () => ipcRenderer.invoke('review-policies:list', undefined),
    createPolicy: (input: unknown) => ipcRenderer.invoke('review-policies:create', input),
    updatePolicy: (input: unknown) => ipcRenderer.invoke('review-policies:update', input),
    deletePolicy: (id: string) => ipcRenderer.invoke('review-policies:delete', { id }),
    attachPolicy: (itemKind: 'workItem' | 'resourceItem', itemId: string, policyId: string) =>
      ipcRenderer.invoke('review:attach', { itemKind, itemId, policyId }),
    detachPolicy: (itemKind: 'workItem' | 'resourceItem', itemId: string) =>
      ipcRenderer.invoke('review:detach', { itemKind, itemId }),
    recordEvent: (input: unknown) => ipcRenderer.invoke('review-events:record', input),
    listEvents: (filter?: { workItemId?: string; resourceItemId?: string }) =>
      ipcRenderer.invoke('review-events:list', filter),
    getDue: (nowMs?: number) => ipcRenderer.invoke('review:get-due', nowMs ? { nowMs } : undefined),
    syncToPlanner: (nowMs?: number) => ipcRenderer.invoke('review:sync-to-planner', nowMs ? { nowMs } : undefined)
  },
  replanning: {
    preview: (input: unknown) => ipcRenderer.invoke('replanning:preview', input),
    apply: (input: unknown) => ipcRenderer.invoke('replanning:apply', input),
    undo: (targetDate: string) => ipcRenderer.invoke('replanning:undo', { targetDate }),
    getHistory: (targetDate?: string) => ipcRenderer.invoke('replanning:get-history', targetDate ? { targetDate } : undefined),
    getVersions: (targetDate: string) => ipcRenderer.invoke('replanning:get-versions', { targetDate })
  },
  progress: {
    getGoal: (goalId: string) => ipcRenderer.invoke('progress:get-goal', { goalId }),
    recordSnapshot: (input: unknown) => ipcRenderer.invoke('progress:record-snapshot', input),
    getHistory: (entityType: string, entityId: string) => ipcRenderer.invoke('progress:get-history', { entityType, entityId })
  },
  goalMetrics: {
    list: (goalId: string) => ipcRenderer.invoke('goal-metrics:list', { goalId }),
    create: (input: unknown) => ipcRenderer.invoke('goal-metrics:create', input),
    update: (input: unknown) => ipcRenderer.invoke('goal-metrics:update', input),
    delete: (id: string) => ipcRenderer.invoke('goal-metrics:delete', { id })
  },
  analytics: {
    getOverview: (filter?: unknown) => ipcRenderer.invoke('analytics:get-overview', filter)
  },
  dashboard: {
    getData: (nowDate?: string) => ipcRenderer.invoke('dashboard:get-data', nowDate ? { nowDate } : undefined)
  },
  templates: {
    list: () => ipcRenderer.invoke('templates:list', undefined),
    apply: (id: string, skipDuplicates?: boolean) => ipcRenderer.invoke('templates:apply', { id, skipDuplicates }),
    saveCustom: (input: unknown) => ipcRenderer.invoke('templates:save-custom', input),
    delete: (id: string) => ipcRenderer.invoke('templates:delete', { id }),
    exportJson: (id: string) => ipcRenderer.invoke('templates:export-json', { id }),
    importJson: (jsonStr: string) => ipcRenderer.invoke('templates:import-json', { jsonStr })
  },
  demo: {
    load: () => ipcRenderer.invoke('demo:load', undefined),
    delete: () => ipcRenderer.invoke('demo:delete', undefined)
  },
  search: {
    global: (query: unknown) => ipcRenderer.invoke('search:global', query)
  },
  weeklyReview: {
    generate: (period: unknown) => ipcRenderer.invoke('weekly-review:generate', period)
  }
}

contextBridge.exposeInMainWorld('planner', api)
