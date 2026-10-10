import { app } from 'electron'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import path from 'node:path'
import fs from 'node:fs'

let database: ReturnType<typeof drizzle<typeof schema>> | undefined

export function setDatabase(db: ReturnType<typeof drizzle<typeof schema>>): void {
  database = db
}

export function getDatabase(): ReturnType<typeof drizzle<typeof schema>> {
  if (database) return database
  const folder = path.join(app.getPath('userData'), 'data')
  fs.mkdirSync(folder, { recursive: true })
  const client = new Database(path.join(folder, 'clarity-planner.db'))
  client.pragma('foreign_keys = ON')
  database = drizzle(client, { schema })
  return database
}
