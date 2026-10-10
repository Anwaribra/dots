import { contextBridge, ipcRenderer } from 'electron'
import { ipcChannels, type PlannerApi } from '../shared/ipc'
import type { Settings } from '../shared/settings'

const api: PlannerApi = {
  settings: {
    get: () => ipcRenderer.invoke(ipcChannels.settingsGet, undefined),
    update: (input: Partial<Settings>) => ipcRenderer.invoke(ipcChannels.settingsUpdate, input)
  }
}

contextBridge.exposeInMainWorld('planner', api)
