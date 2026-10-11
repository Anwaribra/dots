import { app, BrowserWindow, ipcMain, shell } from 'electron'
import path from 'node:path'
import { ipcChannels, ipcSchemas } from '../shared/ipc'
import { getSettings, updateSettings } from './services/settings-service'
import {
  clearScheduleRange,
  createScheduleItem,
  deleteScheduleItem,
  generateWeekSchedule,
  listPersistedSchedule,
  updateScheduleItem
} from './services/planning-service'
import {
  archiveEntity,
  attachTag,
  bulkAddResourceItems,
  createArea,
  createAvailabilityOverride,
  createCustomFieldDef,
  createDependency,
  createFixedEvent,
  createGoal,
  createHabit,
  createMilestone,
  createNote,
  createProject,
  createResource,
  createResourceItem,
  createRoutine,
  createTag,
  createTimeBudget,
  createWorkItem,
  createWorkItemType,
  deleteAvailabilityOverride,
  deleteDependency,
  deleteEntity,
  deleteNote,
  detachTag,
  duplicateResource,
  getCapacityForDate,
  getCustomFieldValues,
  getEntityTags,
  getResource,
  linkResourceItemToWorkItem,
  listAreas,
  listAvailabilityOverrides,
  listAvailabilityRules,
  listCustomFieldDefs,
  listDependencies,
  listFixedEvents,
  listGoals,
  listHabitLogs,
  listHabits,
  listMilestones,
  listNotes,
  listProjects,
  listResourceItems,
  listResources,
  listRoutines,
  listTags,
  listTimeBudgets,
  listWorkItemTypes,
  listWorkItems,
  logHabit,
  reorderResourceItems,
  restoreEntity,
  seedBuiltInWorkItemTypes,
  seedDefaultAvailabilityRules,
  setCustomFieldValue,
  updateArea,
  updateAvailabilityRules,
  updateCustomFieldDef,
  updateFixedEvent,
  updateGoal,
  updateHabit,
  updateMilestone,
  updateProject,
  updateResource,
  updateResourceItem,
  updateRoutine,
  updateTimeBudget,
  updateWorkItem,
  updateWorkItemType
} from './services/entity-service'
import { runApplicationMigrations } from './db/application-migrations'
import {
  listTimeSessions,
  createTimeSession,
  updateTimeSession,
  deleteTimeSession
} from './services/session-service'
import {
  getTimerState,
  startTimer,
  pauseTimer,
  resumeTimer,
  stopTimer,
  completeTimer,
  addTimerTime
} from './services/timer-service'
import {
  calculateEstimationAccuracy,
  aggregateEstimationAccuracy
} from '../shared/time-math'
import {
  exportJsonData,
  restoreJsonData,
  createDatabaseBackupFile
} from './services/backup-service'
import {
  attachReviewPolicy,
  createReviewPolicy,
  deleteReviewPolicy,
  detachReviewPolicy,
  ensureDueReviewsAsWorkItems,
  getDueReviewsList,
  listReviewEvents,
  listReviewPolicies,
  recordReviewEvent,
  updateReviewPolicy
} from './services/review-service'
import {
  previewReplanDay,
  applyReplanDay,
  undoLastReplan,
  listReplanningHistory,
  listPlanVersions
} from './services/replanning-service'
import {
  getGoalProgress,
  recordProgressSnapshot,
  getProgressHistory,
  listGoalMetrics,
  createGoalMetric,
  updateGoalMetric,
  deleteGoalMetric
} from './services/progress-service'
import {
  getAnalyticsOverview,
  getDashboardWidgetsData
} from './services/analytics-service'



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

  // Stage 03: Resources
  ipcMain.handle(ipcChannels.resourcesList, (_event, input: unknown) => {
    ipcSchemas[ipcChannels.resourcesList].parse(input)
    return listResources()
  })
  ipcMain.handle(ipcChannels.resourcesGet, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.resourcesGet].parse(input)
    return getResource(parsed.id)
  })
  ipcMain.handle(ipcChannels.resourcesCreate, (_event, input: unknown) => createResource(ipcSchemas[ipcChannels.resourcesCreate].parse(input)))
  ipcMain.handle(ipcChannels.resourcesUpdate, (_event, input: unknown) => updateResource(ipcSchemas[ipcChannels.resourcesUpdate].parse(input)))
  ipcMain.handle(ipcChannels.resourcesDuplicate, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.resourcesDuplicate].parse(input)
    return duplicateResource(parsed)
  })

  // Stage 03: Resource Items
  ipcMain.handle(ipcChannels.resourceItemsList, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.resourceItemsList].parse(input)
    return listResourceItems(parsed.resourceId)
  })
  ipcMain.handle(ipcChannels.resourceItemsCreate, (_event, input: unknown) => createResourceItem(ipcSchemas[ipcChannels.resourceItemsCreate].parse(input)))
  ipcMain.handle(ipcChannels.resourceItemsUpdate, (_event, input: unknown) => updateResourceItem(ipcSchemas[ipcChannels.resourceItemsUpdate].parse(input)))
  ipcMain.handle(ipcChannels.resourceItemsBulkAdd, (_event, input: unknown) => bulkAddResourceItems(ipcSchemas[ipcChannels.resourceItemsBulkAdd].parse(input)))
  ipcMain.handle(ipcChannels.resourceItemsReorder, (_event, input: unknown) => {
    reorderResourceItems(ipcSchemas[ipcChannels.resourceItemsReorder].parse(input))
  })
  ipcMain.handle(ipcChannels.resourceItemsLinkWorkItem, (_event, input: unknown) => linkResourceItemToWorkItem(ipcSchemas[ipcChannels.resourceItemsLinkWorkItem].parse(input)))

  // Stage 03: Dependencies
  ipcMain.handle(ipcChannels.dependenciesList, (_event, input: unknown) => {
    ipcSchemas[ipcChannels.dependenciesList].parse(input)
    return listDependencies()
  })
  ipcMain.handle(ipcChannels.dependenciesCreate, (_event, input: unknown) => createDependency(ipcSchemas[ipcChannels.dependenciesCreate].parse(input)))
  ipcMain.handle(ipcChannels.dependenciesDelete, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.dependenciesDelete].parse(input)
    deleteDependency(parsed)
  })

  // Stage 04: Time Model
  ipcMain.handle(ipcChannels.availabilityRulesList, (_event, input: unknown) => {
    ipcSchemas[ipcChannels.availabilityRulesList].parse(input)
    return listAvailabilityRules()
  })
  ipcMain.handle(ipcChannels.availabilityRulesUpdate, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.availabilityRulesUpdate].parse(input)
    return updateAvailabilityRules(parsed)
  })
  ipcMain.handle(ipcChannels.availabilityOverridesList, (_event, input: unknown) => {
    ipcSchemas[ipcChannels.availabilityOverridesList].parse(input)
    return listAvailabilityOverrides()
  })
  ipcMain.handle(ipcChannels.availabilityOverridesCreate, (_event, input: unknown) => createAvailabilityOverride(ipcSchemas[ipcChannels.availabilityOverridesCreate].parse(input)))
  ipcMain.handle(ipcChannels.availabilityOverridesDelete, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.availabilityOverridesDelete].parse(input)
    deleteAvailabilityOverride(parsed.id)
  })

  ipcMain.handle(ipcChannels.capacityCalculate, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.capacityCalculate].parse(input)
    return getCapacityForDate(parsed.date)
  })

  ipcMain.handle(ipcChannels.fixedEventsList, (_event, input: unknown) => {
    ipcSchemas[ipcChannels.fixedEventsList].parse(input)
    return listFixedEvents()
  })
  ipcMain.handle(ipcChannels.fixedEventsCreate, (_event, input: unknown) => createFixedEvent(ipcSchemas[ipcChannels.fixedEventsCreate].parse(input)))
  ipcMain.handle(ipcChannels.fixedEventsUpdate, (_event, input: unknown) => updateFixedEvent(ipcSchemas[ipcChannels.fixedEventsUpdate].parse(input)))

  ipcMain.handle(ipcChannels.timeBudgetsList, (_event, input: unknown) => {
    ipcSchemas[ipcChannels.timeBudgetsList].parse(input)
    return listTimeBudgets()
  })
  ipcMain.handle(ipcChannels.timeBudgetsCreate, (_event, input: unknown) => createTimeBudget(ipcSchemas[ipcChannels.timeBudgetsCreate].parse(input)))
  ipcMain.handle(ipcChannels.timeBudgetsUpdate, (_event, input: unknown) => updateTimeBudget(ipcSchemas[ipcChannels.timeBudgetsUpdate].parse(input)))

  ipcMain.handle(ipcChannels.routinesList, (_event, input: unknown) => {
    ipcSchemas[ipcChannels.routinesList].parse(input)
    return listRoutines()
  })
  ipcMain.handle(ipcChannels.routinesCreate, (_event, input: unknown) => createRoutine(ipcSchemas[ipcChannels.routinesCreate].parse(input)))
  ipcMain.handle(ipcChannels.routinesUpdate, (_event, input: unknown) => updateRoutine(ipcSchemas[ipcChannels.routinesUpdate].parse(input)))

  ipcMain.handle(ipcChannels.habitsList, (_event, input: unknown) => {
    ipcSchemas[ipcChannels.habitsList].parse(input)
    return listHabits()
  })
  ipcMain.handle(ipcChannels.habitsCreate, (_event, input: unknown) => createHabit(ipcSchemas[ipcChannels.habitsCreate].parse(input)))
  ipcMain.handle(ipcChannels.habitsUpdate, (_event, input: unknown) => updateHabit(ipcSchemas[ipcChannels.habitsUpdate].parse(input)))
  ipcMain.handle(ipcChannels.habitsLog, (_event, input: unknown) => logHabit(ipcSchemas[ipcChannels.habitsLog].parse(input)))
  ipcMain.handle(ipcChannels.habitsListLogs, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.habitsListLogs].parse(input)
    return listHabitLogs(parsed)
  })

  // Stage 05 & 06: Planning Engine & Schedule Items
  ipcMain.handle(ipcChannels.planningGenerateWeek, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.planningGenerateWeek].parse(input)
    return generateWeekSchedule(parsed?.startDate)
  })
  ipcMain.handle(ipcChannels.planningGetSchedule, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.planningGetSchedule].parse(input)
    return listPersistedSchedule(parsed.startDate, parsed.endDate)
  })
  ipcMain.handle(ipcChannels.planningClearSchedule, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.planningClearSchedule].parse(input)
    clearScheduleRange(parsed.startDate, parsed.endDate)
  })
  ipcMain.handle(ipcChannels.planningUpdateScheduleItem, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.planningUpdateScheduleItem].parse(input)
    return updateScheduleItem(parsed)
  })
  ipcMain.handle(ipcChannels.planningCreateScheduleItem, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.planningCreateScheduleItem].parse(input)
    return createScheduleItem(parsed)
  })
  ipcMain.handle(ipcChannels.planningDeleteScheduleItem, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.planningDeleteScheduleItem].parse(input)
    deleteScheduleItem(parsed.id)
  })

  // Entity Management
  ipcMain.handle(ipcChannels.entityArchive, (_event, input: unknown) => archiveEntity(ipcSchemas[ipcChannels.entityArchive].parse(input)))
  ipcMain.handle(ipcChannels.entityRestore, (_event, input: unknown) => restoreEntity(ipcSchemas[ipcChannels.entityRestore].parse(input)))
  ipcMain.handle(ipcChannels.entityDelete, (_event, input: unknown) => deleteEntity(ipcSchemas[ipcChannels.entityDelete].parse(input)))

  // Stage 07: Sessions
  ipcMain.handle(ipcChannels.sessionsList, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.sessionsList].parse(input)
    return listTimeSessions(parsed?.workItemId)
  })
  ipcMain.handle(ipcChannels.sessionsCreate, (_event, input: unknown) => {
    return createTimeSession(ipcSchemas[ipcChannels.sessionsCreate].parse(input) as any)
  })
  ipcMain.handle(ipcChannels.sessionsUpdate, (_event, input: unknown) => {
    return updateTimeSession(ipcSchemas[ipcChannels.sessionsUpdate].parse(input) as any)
  })
  ipcMain.handle(ipcChannels.sessionsDelete, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.sessionsDelete].parse(input)
    deleteTimeSession(parsed.id)
  })

  // Stage 07: Timer
  ipcMain.handle(ipcChannels.timerGetState, (_event, input: unknown) => {
    ipcSchemas[ipcChannels.timerGetState].parse(input)
    return getTimerState()
  })
  ipcMain.handle(ipcChannels.timerStart, (_event, input: unknown) => {
    return startTimer(ipcSchemas[ipcChannels.timerStart].parse(input) as any)
  })
  ipcMain.handle(ipcChannels.timerPause, (_event, input: unknown) => {
    ipcSchemas[ipcChannels.timerPause].parse(input)
    return pauseTimer()
  })
  ipcMain.handle(ipcChannels.timerResume, (_event, input: unknown) => {
    ipcSchemas[ipcChannels.timerResume].parse(input)
    return resumeTimer()
  })
  ipcMain.handle(ipcChannels.timerStop, (_event, input: unknown) => {
    ipcSchemas[ipcChannels.timerStop].parse(input)
    return stopTimer()
  })
  ipcMain.handle(ipcChannels.timerComplete, (_event, input: unknown) => {
    ipcSchemas[ipcChannels.timerComplete].parse(input)
    return completeTimer()
  })
  ipcMain.handle(ipcChannels.timerAddTime, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.timerAddTime].parse(input)
    return addTimerTime(parsed.minutes)
  })

  // Stage 07: Accuracy
  ipcMain.handle(ipcChannels.accuracyGetForWorkItem, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.accuracyGetForWorkItem].parse(input)
    const sessions = listTimeSessions(parsed.workItemId)
    const totalActual = sessions.reduce((acc, s) => acc + Math.max(0, s.durationMinutes - (s.pausedDurationMinutes || 0)), 0)
    const workItemsList = listWorkItems()
    const wi = workItemsList.find((w) => w.id === parsed.workItemId)
    return calculateEstimationAccuracy(wi?.estimatedMinutes ?? 0, totalActual)
  })
  ipcMain.handle(ipcChannels.accuracyGetOverall, (_event, input: unknown) => {
    ipcSchemas[ipcChannels.accuracyGetOverall].parse(input)
    const allItems = listWorkItems()
    return aggregateEstimationAccuracy(
      allItems.map((w) => ({ estimatedMinutes: w.estimatedMinutes ?? 0, actualMinutes: w.actualMinutes ?? 0 }))
    )
  })

  // Stage 07: Backup
  ipcMain.handle(ipcChannels.backupExportJson, (_event, input: unknown) => {
    ipcSchemas[ipcChannels.backupExportJson].parse(input)
    return exportJsonData()
  })
  ipcMain.handle(ipcChannels.backupRestore, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.backupRestore].parse(input)
    restoreJsonData(parsed.jsonData)
  })
  ipcMain.handle(ipcChannels.backupCreateDb, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.backupCreateDb].parse(input)
    return createDatabaseBackupFile(parsed?.destPath)
  })

  // Stage 08: Review System
  ipcMain.handle(ipcChannels.reviewPoliciesList, (_event, input: unknown) => {
    ipcSchemas[ipcChannels.reviewPoliciesList].parse(input)
    return listReviewPolicies()
  })
  ipcMain.handle(ipcChannels.reviewPoliciesCreate, (_event, input: unknown) => {
    return createReviewPolicy(ipcSchemas[ipcChannels.reviewPoliciesCreate].parse(input) as any)
  })
  ipcMain.handle(ipcChannels.reviewPoliciesUpdate, (_event, input: unknown) => {
    return updateReviewPolicy(ipcSchemas[ipcChannels.reviewPoliciesUpdate].parse(input) as any)
  })
  ipcMain.handle(ipcChannels.reviewPoliciesDelete, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.reviewPoliciesDelete].parse(input)
    deleteReviewPolicy(parsed.id)
  })
  ipcMain.handle(ipcChannels.reviewAttach, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.reviewAttach].parse(input)
    attachReviewPolicy(parsed.itemKind, parsed.itemId, parsed.policyId)
  })
  ipcMain.handle(ipcChannels.reviewDetach, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.reviewDetach].parse(input)
    detachReviewPolicy(parsed.itemKind, parsed.itemId)
  })
  ipcMain.handle(ipcChannels.reviewEventsRecord, (_event, input: unknown) => {
    return recordReviewEvent(ipcSchemas[ipcChannels.reviewEventsRecord].parse(input) as any)
  })
  ipcMain.handle(ipcChannels.reviewEventsList, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.reviewEventsList].parse(input)
    return listReviewEvents(parsed || {})
  })
  ipcMain.handle(ipcChannels.reviewGetDue, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.reviewGetDue].parse(input)
    return getDueReviewsList(parsed?.nowMs)
  })
  ipcMain.handle(ipcChannels.reviewSyncToPlanner, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.reviewSyncToPlanner].parse(input)
    return ensureDueReviewsAsWorkItems(parsed?.nowMs)
  })

  // Stage 09: Replanning Engine, History & Plan Versions
  ipcMain.handle(ipcChannels.replanningPreview, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.replanningPreview].parse(input)
    return previewReplanDay(parsed)
  })
  ipcMain.handle(ipcChannels.replanningApply, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.replanningApply].parse(input)
    return applyReplanDay(parsed)
  })
  ipcMain.handle(ipcChannels.replanningUndo, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.replanningUndo].parse(input)
    return undoLastReplan(parsed.targetDate)
  })
  ipcMain.handle(ipcChannels.replanningGetHistory, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.replanningGetHistory].parse(input)
    return listReplanningHistory(parsed?.targetDate)
  })
  ipcMain.handle(ipcChannels.replanningGetVersions, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.replanningGetVersions].parse(input)
    return listPlanVersions(parsed.targetDate)
  })

  // Stage 10: Progress Engine, Goal Metrics, Analytics & Dashboard
  ipcMain.handle(ipcChannels.progressGetGoal, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.progressGetGoal].parse(input)
    return getGoalProgress(parsed.goalId)
  })
  ipcMain.handle(ipcChannels.progressRecordSnapshot, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.progressRecordSnapshot].parse(input)
    return recordProgressSnapshot(parsed.entityType as any, parsed.entityId)
  })
  ipcMain.handle(ipcChannels.progressGetHistory, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.progressGetHistory].parse(input)
    return getProgressHistory(parsed.entityType, parsed.entityId)
  })
  ipcMain.handle(ipcChannels.goalMetricsList, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.goalMetricsList].parse(input)
    return listGoalMetrics(parsed.goalId)
  })
  ipcMain.handle(ipcChannels.goalMetricsCreate, (_event, input: unknown) => {
    return createGoalMetric(ipcSchemas[ipcChannels.goalMetricsCreate].parse(input) as any)
  })
  ipcMain.handle(ipcChannels.goalMetricsUpdate, (_event, input: unknown) => {
    return updateGoalMetric(ipcSchemas[ipcChannels.goalMetricsUpdate].parse(input) as any)
  })
  ipcMain.handle(ipcChannels.goalMetricsDelete, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.goalMetricsDelete].parse(input)
    deleteGoalMetric(parsed.id)
  })
  ipcMain.handle(ipcChannels.analyticsGetOverview, (_event, input: unknown) => {
    const parsed = ipcSchemas[ipcChannels.analyticsGetOverview].parse(input)
    return getAnalyticsOverview(parsed || {})
  })
  ipcMain.handle(ipcChannels.dashboardGetData, (_event, input: unknown) => {
    ipcSchemas[ipcChannels.dashboardGetData].parse(input)
    return getDashboardWidgetsData()
  })
}

app.whenReady().then(() => {
  runApplicationMigrations()
  seedBuiltInWorkItemTypes()
  seedDefaultAvailabilityRules()
  registerIpc()
  createWindow()
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
}).catch((error: unknown) => {
  console.error('Failed to start Clarity Planner:', error)
  app.quit()
})

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
