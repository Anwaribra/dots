import { z } from 'zod'

export const localeSchema = z.enum(['en', 'ar'])
export type AppLocale = z.infer<typeof localeSchema>

export const settingsSchema = z.object({
  locale: localeSchema.default('en'),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  weekStartsOn: z.number().int().min(0).max(6).default(6),
  timezone: z.string().min(1).default('UTC'),
  use24HourTime: z.boolean().default(true),
  planningCapacityPercentage: z.number().int().min(1).max(100).default(75),
  bufferPercentage: z.number().int().min(0).max(100).default(20),
  notificationsEnabled: z.boolean().default(true),
  onboardingDone: z.boolean().default(false),
  demoMode: z.boolean().default(false)
})
export type Settings = z.infer<typeof settingsSchema>

export const settingsUpdateSchema = settingsSchema.partial()
