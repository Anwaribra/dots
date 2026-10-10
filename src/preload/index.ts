import { contextBridge, ipcRenderer } from 'electron'

// Sandboxed preload scripts may only load Electron's restricted runtime APIs.
// Keep runtime channel names local; shared schemas remain in main/renderer builds.
const ipcChannels = {
  settingsGet: 'settings:get',
  settingsUpdate: 'settings:update'
} as const

type PreloadSettings = {
  locale: 'en' | 'ar'
  theme: 'light' | 'dark' | 'system'
  weekStartsOn: number
  timezone: string
  use24HourTime: boolean
}

type PreloadApi = {
  settings: {
    get: () => Promise<PreloadSettings>
    update: (input: Partial<PreloadSettings>) => Promise<PreloadSettings>
  }
  areas: { list: () => Promise<unknown[]>; create: (input: { name: string; description?: string; color?: string }) => Promise<unknown> }
  goals: { list: () => Promise<unknown[]>; create: (input: { title: string; areaId?: string | null; priority?: string; targetDate?: string | null }) => Promise<unknown> }
  projects: { list: () => Promise<unknown[]>; create: (input: { title: string; goalId?: string | null; areaId?: string | null; priority?: string; deadline?: string | null }) => Promise<unknown> }
  workItems: { list: () => Promise<unknown[]>; create: (input: { title: string; projectId?: string | null; estimatedMinutes?: number; priority?: string }) => Promise<unknown> }
  entities: { archive: (input: { kind: string; id: string }) => Promise<void> }
}

const api: PreloadApi = {
  settings: {
    get: () => ipcRenderer.invoke(ipcChannels.settingsGet, undefined),
    update: (input) => ipcRenderer.invoke(ipcChannels.settingsUpdate, input)
  },
  areas: { list: () => ipcRenderer.invoke('areas:list', undefined), create: (input) => ipcRenderer.invoke('areas:create', input) },
  goals: { list: () => ipcRenderer.invoke('goals:list', undefined), create: (input) => ipcRenderer.invoke('goals:create', input) },
  projects: { list: () => ipcRenderer.invoke('projects:list', undefined), create: (input) => ipcRenderer.invoke('projects:create', input) },
  workItems: { list: () => ipcRenderer.invoke('work-items:list', undefined), create: (input) => ipcRenderer.invoke('work-items:create', input) },
  entities: { archive: (input) => ipcRenderer.invoke('entities:archive', input) }
}

contextBridge.exposeInMainWorld('planner', api)
