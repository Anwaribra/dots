import { app, BrowserWindow, ipcMain, shell } from 'electron'
import path from 'node:path'
import { ipcChannels, ipcSchemas } from '../shared/ipc'
import { getSettings, updateSettings } from './services/settings-service'
import {
  archiveEntity,
  attachTag,
  createArea,
  createCustomFieldDef,
  createGoal,
  createMilestone,
  createNote,
  createProject,
  createTag,
  createWorkItem,
  createWorkItemType,
  deleteEntity,
  deleteNote,
  detachTag,
  getCustomFieldValues,
  getEntityTags,
  listAreas,
  listCustomFieldDefs,
  listGoals,
  listMilestones,
  listNotes,
  listProjects,
  listTags,
  listWorkItemTypes,
  listWorkItems,
  restoreEntity,
  seedBuiltInWorkItemTypes,
  setCustomFieldValue,
  updateArea,
  updateCustomFieldDef,
  updateGoal,
  updateMilestone,
  updateProject,
  updateWorkItem,
  updateWorkItemType
} from './services/entity-service'
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
  // Settings
  ipcMain.handle(ipcChannels.settingsGet, (_event, input: unknown) => {
    ipcSchemas[ipcChannels.settingsGet].parse(input)
    return getSettings()
  })
  ipcMain.handle(ipcChannels.settingsUpdate, (_event, input: unknown) => {
    return updateSettings(ipcSchemas[ipcChannels.settingsUpdate].parse(input))
  })

  // Areas
  ipcMain.handle(ipcChannels.areasList, (_event, input: unknown) => {
    ipcSchemas[ipcChannels.areasList].parse(input)
    return listAreas()
  })
  ipcMain.handle(ipcChannels.areasCreate, (_event, input: unknown) => createArea(ipcSchemas[ipcChannels.areasCreate].parse(input)))
  ipcMain.handle(ipcChannels.areasUpdate, (_event, input: unknown) => updateArea(ipcSchemas[ipcChannels.areasUpdate].parse(input)))

  // Goals
  ipcMain.handle(ipcChannels.goalsList, (_event, input: unknown) => {
    ipcSchemas[ipcChannels.goalsList].parse(input)
    return listGoals()
  })
  ipcMain.handle(ipcChannels.goalsCreate, (_event, input: unknown) => createGoal(ipcSchemas[ipcChannels.goalsCreate].parse(input)))
  ipcMain.handle(ipcChannels.goalsUpdate, (_event, input: unknown) => updateGoal(ipcSchemas[ipcChannels.goalsUpdate].parse(input)))

  // Milestones
  ipcMain.handle(ipcChannels.milestonesList, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.milestonesList].parse(input)
    return listMilestones(parsed?.goalId)
  })
  ipcMain.handle(ipcChannels.milestonesCreate, (_event, input: unknown) => createMilestone(ipcSchemas[ipcChannels.milestonesCreate].parse(input)))
  ipcMain.handle(ipcChannels.milestonesUpdate, (_event, input: unknown) => updateMilestone(ipcSchemas[ipcChannels.milestonesUpdate].parse(input)))

  // Projects
  ipcMain.handle(ipcChannels.projectsList, (_event, input: unknown) => {
    ipcSchemas[ipcChannels.projectsList].parse(input)
    return listProjects()
  })
  ipcMain.handle(ipcChannels.projectsCreate, (_event, input: unknown) => createProject(ipcSchemas[ipcChannels.projectsCreate].parse(input)))
  ipcMain.handle(ipcChannels.projectsUpdate, (_event, input: unknown) => updateProject(ipcSchemas[ipcChannels.projectsUpdate].parse(input)))

  // Work Item Types
  ipcMain.handle(ipcChannels.workItemTypesList, (_event, input: unknown) => {
    ipcSchemas[ipcChannels.workItemTypesList].parse(input)
    return listWorkItemTypes()
  })
  ipcMain.handle(ipcChannels.workItemTypesCreate, (_event, input: unknown) => createWorkItemType(ipcSchemas[ipcChannels.workItemTypesCreate].parse(input)))
  ipcMain.handle(ipcChannels.workItemTypesUpdate, (_event, input: unknown) => updateWorkItemType(ipcSchemas[ipcChannels.workItemTypesUpdate].parse(input)))

  // Custom Field Defs
  ipcMain.handle(ipcChannels.customFieldDefsList, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.customFieldDefsList].parse(input)
    return listCustomFieldDefs(parsed?.workItemTypeId)
  })
  ipcMain.handle(ipcChannels.customFieldDefsCreate, (_event, input: unknown) => createCustomFieldDef(ipcSchemas[ipcChannels.customFieldDefsCreate].parse(input)))
  ipcMain.handle(ipcChannels.customFieldDefsUpdate, (_event, input: unknown) => updateCustomFieldDef(ipcSchemas[ipcChannels.customFieldDefsUpdate].parse(input)))

  // Custom Field Values
  ipcMain.handle(ipcChannels.customFieldValuesGet, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.customFieldValuesGet].parse(input)
    return getCustomFieldValues(parsed.workItemId)
  })
  ipcMain.handle(ipcChannels.customFieldValuesSet, (_event, input: unknown) => setCustomFieldValue(ipcSchemas[ipcChannels.customFieldValuesSet].parse(input)))

  // Work Items
  ipcMain.handle(ipcChannels.workItemsList, (_event, input: unknown) => {
    ipcSchemas[ipcChannels.workItemsList].parse(input)
    return listWorkItems()
  })
  ipcMain.handle(ipcChannels.workItemsCreate, (_event, input: unknown) => createWorkItem(ipcSchemas[ipcChannels.workItemsCreate].parse(input)))
  ipcMain.handle(ipcChannels.workItemsUpdate, (_event, input: unknown) => updateWorkItem(ipcSchemas[ipcChannels.workItemsUpdate].parse(input)))

  // Tags
  ipcMain.handle(ipcChannels.tagsList, (_event, input: unknown) => {
    ipcSchemas[ipcChannels.tagsList].parse(input)
    return listTags()
  })
  ipcMain.handle(ipcChannels.tagsCreate, (_event, input: unknown) => createTag(ipcSchemas[ipcChannels.tagsCreate].parse(input)))
  ipcMain.handle(ipcChannels.tagsAttach, (_event, input: unknown) => {
    attachTag(ipcSchemas[ipcChannels.tagsAttach].parse(input))
  })
  ipcMain.handle(ipcChannels.tagsDetach, (_event, input: unknown) => {
    detachTag(ipcSchemas[ipcChannels.tagsDetach].parse(input))
  })
  ipcMain.handle(ipcChannels.tagsGetForEntity, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.tagsGetForEntity].parse(input)
    return getEntityTags(parsed.entityType, parsed.entityId)
  })

  // Notes
  ipcMain.handle(ipcChannels.notesList, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.notesList].parse(input)
    return listNotes(parsed.entityType, parsed.entityId)
  })
  ipcMain.handle(ipcChannels.notesCreate, (_event, input: unknown) => createNote(ipcSchemas[ipcChannels.notesCreate].parse(input)))
  ipcMain.handle(ipcChannels.notesDelete, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.notesDelete].parse(input)
    deleteNote(parsed.id)
  })

  // Entity Management
  ipcMain.handle(ipcChannels.entityArchive, (_event, input: unknown) => archiveEntity(ipcSchemas[ipcChannels.entityArchive].parse(input)))
  ipcMain.handle(ipcChannels.entityRestore, (_event, input: unknown) => restoreEntity(ipcSchemas[ipcChannels.entityRestore].parse(input)))
  ipcMain.handle(ipcChannels.entityDelete, (_event, input: unknown) => deleteEntity(ipcSchemas[ipcChannels.entityDelete].parse(input)))
}

app.whenReady().then(() => {
  runApplicationMigrations()
  seedBuiltInWorkItemTypes()
  registerIpc()
  createWindow()
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
}).catch((error: unknown) => {
  console.error('Failed to start Clarity Planner:', error)
  app.quit()
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
