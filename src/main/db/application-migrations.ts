import { app } from 'electron'
import path from 'node:path'
import { getDatabase } from './database'
import { runMigrations } from './migrate'

export function runApplicationMigrations(): void {
  runMigrations(getDatabase(), path.join(app.getAppPath(), 'drizzle'))
}
