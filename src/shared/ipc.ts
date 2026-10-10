import { z } from 'zod'
import { settingsSchema, settingsUpdateSchema } from './settings'

export const ipcChannels = {
  settingsGet: 'settings:get',
  settingsUpdate: 'settings:update'
} as const

export const ipcSchemas = {
  [ipcChannels.settingsGet]: z.undefined(),
  [ipcChannels.settingsUpdate]: settingsUpdateSchema
} as const

export type PlannerApi = {
  settings: {
    get: () => Promise<z.infer<typeof settingsSchema>>
    update: (input: z.infer<typeof settingsUpdateSchema>) => Promise<z.infer<typeof settingsSchema>>
  }
}
