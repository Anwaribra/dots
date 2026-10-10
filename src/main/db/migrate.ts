import { app } from 'electron'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import path from 'node:path'
import { getDatabase } from './database'

export function runMigrations(): void {
  migrate(getDatabase(), { migrationsFolder: path.join(app.getAppPath(), 'drizzle') })
}
