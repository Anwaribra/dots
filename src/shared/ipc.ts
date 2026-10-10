import { z } from 'zod'
import { settingsSchema, settingsUpdateSchema } from './settings'
import {
  archiveEntitySchema,
  attachTagSchema,
  bulkAddResourceItemsSchema,
  createAreaSchema,
  createCustomFieldDefSchema,
  createGoalSchema,
  createMilestoneSchema,
  createNoteSchema,
  createProjectSchema,
  createResourceItemSchema,
  createResourceSchema,
  createTagSchema,
  createWorkItemDependencySchema,
  createWorkItemSchema,
  createWorkItemTypeSchema,
  deleteEntitySchema,
  deleteWorkItemDependencySchema,
  linkResourceItemToWorkItemSchema,
  reorderResourceItemsSchema,
  restoreEntitySchema,
  setCustomFieldValueSchema,
  updateAreaSchema,
  updateCustomFieldDefSchema,
  updateGoalSchema,
  updateMilestoneSchema,
  updateProjectSchema,
  updateResourceItemSchema,
  updateResourceSchema,
  updateWorkItemSchema,
  updateWorkItemTypeSchema,
  type Area,
  type CustomFieldDefinition,
  type CustomFieldValue,
  type Goal,
  type Milestone,
  type Note,
  type Project,
  type Resource,
  type ResourceItem,
  type Tag,
  type WorkItem,
  type WorkItemDependency,
  type WorkItemType
} from './entities'

export const ipcChannels = {
  settingsGet: 'settings:get',
  settingsUpdate: 'settings:update',

  areasList: 'areas:list',
  areasCreate: 'areas:create',
  areasUpdate: 'areas:update',

  goalsList: 'goals:list',
  goalsCreate: 'goals:create',
  goalsUpdate: 'goals:update',

  milestonesList: 'milestones:list',
  milestonesCreate: 'milestones:create',
  milestonesUpdate: 'milestones:update',

  projectsList: 'projects:list',
  projectsCreate: 'projects:create',
  projectsUpdate: 'projects:update',

  workItemTypesList: 'work-item-types:list',
  workItemTypesCreate: 'work-item-types:create',
  workItemTypesUpdate: 'work-item-types:update',

  customFieldDefsList: 'custom-field-defs:list',
  customFieldDefsCreate: 'custom-field-defs:create',
  customFieldDefsUpdate: 'custom-field-defs:update',

  customFieldValuesGet: 'custom-field-values:get',
  customFieldValuesSet: 'custom-field-values:set',

  workItemsList: 'work-items:list',
  workItemsCreate: 'work-items:create',
  workItemsUpdate: 'work-items:update',

  tagsList: 'tags:list',
  tagsCreate: 'tags:create',
  tagsAttach: 'tags:attach',
  tagsDetach: 'tags:detach',
  tagsGetForEntity: 'tags:get-for-entity',

  notesList: 'notes:list',
  notesCreate: 'notes:create',
  notesDelete: 'notes:delete',

  resourcesList: 'resources:list',
  resourcesGet: 'resources:get',
  resourcesCreate: 'resources:create',
  resourcesUpdate: 'resources:update',
  resourcesDuplicate: 'resources:duplicate',

  resourceItemsList: 'resource-items:list',
  resourceItemsCreate: 'resource-items:create',
  resourceItemsUpdate: 'resource-items:update',
  resourceItemsBulkAdd: 'resource-items:bulk-add',
  resourceItemsReorder: 'resource-items:reorder',
  resourceItemsLinkWorkItem: 'resource-items:link-work-item',

  dependenciesList: 'dependencies:list',
  dependenciesCreate: 'dependencies:create',
  dependenciesDelete: 'dependencies:delete',

  entityArchive: 'entities:archive',
  entityRestore: 'entities:restore',
  entityDelete: 'entities:delete'
} as const

export const ipcSchemas = {
  [ipcChannels.settingsGet]: z.undefined(),
  [ipcChannels.settingsUpdate]: settingsUpdateSchema,

  [ipcChannels.areasList]: z.undefined(),
  [ipcChannels.areasCreate]: createAreaSchema,
  [ipcChannels.areasUpdate]: updateAreaSchema,

  [ipcChannels.goalsList]: z.undefined(),
  [ipcChannels.goalsCreate]: createGoalSchema,
  [ipcChannels.goalsUpdate]: updateGoalSchema,

  [ipcChannels.milestonesList]: z.object({ goalId: z.string().uuid().optional() }).optional(),
  [ipcChannels.milestonesCreate]: createMilestoneSchema,
  [ipcChannels.milestonesUpdate]: updateMilestoneSchema,

  [ipcChannels.projectsList]: z.undefined(),
  [ipcChannels.projectsCreate]: createProjectSchema,
  [ipcChannels.projectsUpdate]: updateProjectSchema,

  [ipcChannels.workItemTypesList]: z.undefined(),
  [ipcChannels.workItemTypesCreate]: createWorkItemTypeSchema,
  [ipcChannels.workItemTypesUpdate]: updateWorkItemTypeSchema,

  [ipcChannels.customFieldDefsList]: z.object({ workItemTypeId: z.string().uuid().optional() }).optional(),
  [ipcChannels.customFieldDefsCreate]: createCustomFieldDefSchema,
  [ipcChannels.customFieldDefsUpdate]: updateCustomFieldDefSchema,

  [ipcChannels.customFieldValuesGet]: z.object({ workItemId: z.string().uuid() }),
  [ipcChannels.customFieldValuesSet]: setCustomFieldValueSchema,

  [ipcChannels.workItemsList]: z.undefined(),
  [ipcChannels.workItemsCreate]: createWorkItemSchema,
  [ipcChannels.workItemsUpdate]: updateWorkItemSchema,

  [ipcChannels.tagsList]: z.undefined(),
  [ipcChannels.tagsCreate]: createTagSchema,
  [ipcChannels.tagsAttach]: attachTagSchema,
  [ipcChannels.tagsDetach]: attachTagSchema,
  [ipcChannels.tagsGetForEntity]: z.object({ entityType: z.string(), entityId: z.string().uuid() }),

  [ipcChannels.notesList]: z.object({ entityType: z.string(), entityId: z.string().uuid() }),
  [ipcChannels.notesCreate]: createNoteSchema,
  [ipcChannels.notesDelete]: z.object({ id: z.string().uuid() }),

  [ipcChannels.resourcesList]: z.undefined(),
  [ipcChannels.resourcesGet]: z.object({ id: z.string().uuid() }),
  [ipcChannels.resourcesCreate]: createResourceSchema,
  [ipcChannels.resourcesUpdate]: updateResourceSchema,
  [ipcChannels.resourcesDuplicate]: z.object({ id: z.string().uuid() }),

  [ipcChannels.resourceItemsList]: z.object({ resourceId: z.string().uuid() }),
  [ipcChannels.resourceItemsCreate]: createResourceItemSchema,
  [ipcChannels.resourceItemsUpdate]: updateResourceItemSchema,
  [ipcChannels.resourceItemsBulkAdd]: bulkAddResourceItemsSchema,
  [ipcChannels.resourceItemsReorder]: reorderResourceItemsSchema,
  [ipcChannels.resourceItemsLinkWorkItem]: linkResourceItemToWorkItemSchema,

  [ipcChannels.dependenciesList]: z.undefined(),
  [ipcChannels.dependenciesCreate]: createWorkItemDependencySchema,
  [ipcChannels.dependenciesDelete]: deleteWorkItemDependencySchema,

  [ipcChannels.entityArchive]: archiveEntitySchema,
  [ipcChannels.entityRestore]: restoreEntitySchema,
  [ipcChannels.entityDelete]: deleteEntitySchema
} as const

export type PlannerApi = {
  settings: {
    get: () => Promise<z.infer<typeof settingsSchema>>
    update: (input: z.input<typeof settingsUpdateSchema>) => Promise<z.infer<typeof settingsSchema>>
  }
  areas: {
    list: () => Promise<Area[]>
    create: (input: z.input<typeof createAreaSchema>) => Promise<Area>
    update: (input: z.input<typeof updateAreaSchema>) => Promise<Area>
  }
  goals: {
    list: () => Promise<Goal[]>
    create: (input: z.input<typeof createGoalSchema>) => Promise<Goal>
    update: (input: z.input<typeof updateGoalSchema>) => Promise<Goal>
  }
  milestones: {
    list: (goalId?: string) => Promise<Milestone[]>
    create: (input: z.input<typeof createMilestoneSchema>) => Promise<Milestone>
    update: (input: z.input<typeof updateMilestoneSchema>) => Promise<Milestone>
  }
  projects: {
    list: () => Promise<Project[]>
    create: (input: z.input<typeof createProjectSchema>) => Promise<Project>
    update: (input: z.input<typeof updateProjectSchema>) => Promise<Project>
  }
  workItemTypes: {
    list: () => Promise<WorkItemType[]>
    create: (input: z.input<typeof createWorkItemTypeSchema>) => Promise<WorkItemType>
    update: (input: z.input<typeof updateWorkItemTypeSchema>) => Promise<WorkItemType>
  }
  customFieldDefs: {
    list: (workItemTypeId?: string) => Promise<CustomFieldDefinition[]>
    create: (input: z.input<typeof createCustomFieldDefSchema>) => Promise<CustomFieldDefinition>
    update: (input: z.input<typeof updateCustomFieldDefSchema>) => Promise<CustomFieldDefinition>
  }
  customFieldValues: {
    get: (workItemId: string) => Promise<CustomFieldValue[]>
    set: (input: z.input<typeof setCustomFieldValueSchema>) => Promise<CustomFieldValue>
  }
  workItems: {
    list: () => Promise<WorkItem[]>
    create: (input: z.input<typeof createWorkItemSchema>) => Promise<WorkItem>
    update: (input: z.input<typeof updateWorkItemSchema>) => Promise<WorkItem>
  }
  tags: {
    list: () => Promise<Tag[]>
    create: (input: z.input<typeof createTagSchema>) => Promise<Tag>
    attach: (input: z.input<typeof attachTagSchema>) => Promise<void>
    detach: (input: z.input<typeof attachTagSchema>) => Promise<void>
    getForEntity: (entityType: string, entityId: string) => Promise<Tag[]>
  }
  notes: {
    list: (entityType: string, entityId: string) => Promise<Note[]>
    create: (input: z.input<typeof createNoteSchema>) => Promise<Note>
    delete: (id: string) => Promise<void>
  }
  resources: {
    list: () => Promise<Resource[]>
    get: (id: string) => Promise<Resource>
    create: (input: z.input<typeof createResourceSchema>) => Promise<Resource>
    update: (input: z.input<typeof updateResourceSchema>) => Promise<Resource>
    duplicate: (id: string) => Promise<Resource>
  }
  resourceItems: {
    list: (resourceId: string) => Promise<ResourceItem[]>
    create: (input: z.input<typeof createResourceItemSchema>) => Promise<ResourceItem>
    update: (input: z.input<typeof updateResourceItemSchema>) => Promise<ResourceItem>
    bulkAdd: (input: z.input<typeof bulkAddResourceItemsSchema>) => Promise<ResourceItem[]>
    reorder: (input: z.input<typeof reorderResourceItemsSchema>) => Promise<void>
    linkWorkItem: (input: z.input<typeof linkResourceItemToWorkItemSchema>) => Promise<WorkItem>
  }
  dependencies: {
    list: () => Promise<WorkItemDependency[]>
    create: (input: z.input<typeof createWorkItemDependencySchema>) => Promise<WorkItemDependency>
    delete: (id: string) => Promise<void>
  }
  entities: {
    archive: (input: z.input<typeof archiveEntitySchema>) => Promise<void>
    restore: (input: z.input<typeof restoreEntitySchema>) => Promise<void>
    delete: (input: z.input<typeof deleteEntitySchema>) => Promise<void>
  }
}
