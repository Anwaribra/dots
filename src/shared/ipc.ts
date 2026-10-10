import { z } from 'zod'
import { settingsSchema, settingsUpdateSchema } from './settings'
import { archiveEntitySchema, createAreaSchema, createGoalSchema, createProjectSchema, createWorkItemSchema, type Area, type Goal, type Project, type WorkItem } from './entities'

export const ipcChannels = {
  settingsGet: 'settings:get',
  settingsUpdate: 'settings:update',
  areasList: 'areas:list', areasCreate: 'areas:create', goalsList: 'goals:list', goalsCreate: 'goals:create', projectsList: 'projects:list', projectsCreate: 'projects:create', workItemsList: 'work-items:list', workItemsCreate: 'work-items:create', entityArchive: 'entities:archive'
} as const

export const ipcSchemas = {
  [ipcChannels.settingsGet]: z.undefined(),
  [ipcChannels.settingsUpdate]: settingsUpdateSchema,
  [ipcChannels.areasList]: z.undefined(), [ipcChannels.areasCreate]: createAreaSchema,
  [ipcChannels.goalsList]: z.undefined(), [ipcChannels.goalsCreate]: createGoalSchema,
  [ipcChannels.projectsList]: z.undefined(), [ipcChannels.projectsCreate]: createProjectSchema,
  [ipcChannels.workItemsList]: z.undefined(), [ipcChannels.workItemsCreate]: createWorkItemSchema,
  [ipcChannels.entityArchive]: archiveEntitySchema
} as const

export type PlannerApi = {
  settings: {
    get: () => Promise<z.infer<typeof settingsSchema>>
    update: (input: z.infer<typeof settingsUpdateSchema>) => Promise<z.infer<typeof settingsSchema>>
  }
  areas: { list: () => Promise<Area[]>; create: (input: z.infer<typeof createAreaSchema>) => Promise<Area> }
  goals: { list: () => Promise<Goal[]>; create: (input: z.infer<typeof createGoalSchema>) => Promise<Goal> }
  projects: { list: () => Promise<Project[]>; create: (input: z.infer<typeof createProjectSchema>) => Promise<Project> }
  workItems: { list: () => Promise<WorkItem[]>; create: (input: z.infer<typeof createWorkItemSchema>) => Promise<WorkItem> }
  entities: { archive: (input: z.infer<typeof archiveEntitySchema>) => Promise<void> }
}
