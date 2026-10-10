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
  }
}

contextBridge.exposeInMainWorld('planner', api)
