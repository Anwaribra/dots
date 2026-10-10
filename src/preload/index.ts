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
  entities: {
    archive: (input: unknown) => ipcRenderer.invoke('entities:archive', input),
    restore: (input: unknown) => ipcRenderer.invoke('entities:restore', input),
    delete: (input: unknown) => ipcRenderer.invoke('entities:delete', input)
  }
}

contextBridge.exposeInMainWorld('planner', api)
