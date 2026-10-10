import { eq } from 'drizzle-orm'
import { getDatabase } from '../db/database'
import { settings } from '../db/schema'
import { settingsSchema, settingsUpdateSchema, type Settings } from '../../shared/settings'

const SETTINGS_ID = '00000000-0000-4000-8000-000000000001'

function defaultSettings(): Settings {
  return settingsSchema.parse({ timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' })
}

export function getSettings(): Settings {
  const db = getDatabase()
  const row = db.select().from(settings).where(eq(settings.id, SETTINGS_ID)).get()
  if (row) return settingsSchema.parse(row)
  const value = defaultSettings()
  const now = Date.now()
  db.insert(settings).values({ id: SETTINGS_ID, ...value, createdAt: now, updatedAt: now }).run()
  return value
}

export function updateSettings(input: unknown): Settings {
  const changes = settingsUpdateSchema.parse(input)
  const next = settingsSchema.parse({ ...getSettings(), ...changes })
  getDatabase().update(settings).set({ ...next, updatedAt: Date.now() }).where(eq(settings.id, SETTINGS_ID)).run()
  return next
}
