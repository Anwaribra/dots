import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

export function runMigrations(database: BetterSQLite3Database<typeof schema>, migrationsFolder: string): void {
  migrate(database, { migrationsFolder })
}
