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
}

const api: PreloadApi = {
  settings: {
    get: () => ipcRenderer.invoke(ipcChannels.settingsGet, undefined),
    update: (input) => ipcRenderer.invoke(ipcChannels.settingsUpdate, input)
  }
}

contextBridge.exposeInMainWorld('planner', api)
