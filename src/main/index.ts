import { app, BrowserWindow, ipcMain, shell } from 'electron'
import path from 'node:path'
import { ipcChannels, ipcSchemas } from '../shared/ipc'
import { getSettings, updateSettings } from './services/settings-service'
import { runApplicationMigrations } from './db/application-migrations'

let mainWindow: BrowserWindow | undefined

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 980,
    minHeight: 640,
    show: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0d1220',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })
  mainWindow.once('ready-to-show', () => mainWindow?.show())
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  if (process.env.ELECTRON_RENDERER_URL) mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  else mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
}

function registerIpc(): void {
  ipcMain.handle(ipcChannels.settingsGet, (_event, input: unknown) => {
    ipcSchemas[ipcChannels.settingsGet].parse(input)
    return getSettings()
  })
  ipcMain.handle(ipcChannels.settingsUpdate, (_event, input: unknown) => {
    return updateSettings(ipcSchemas[ipcChannels.settingsUpdate].parse(input))
  })
}

app.whenReady().then(() => {
  runApplicationMigrations()
  registerIpc()
  createWindow()
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
