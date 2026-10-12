import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { runMigrations } from '../src/main/db/migrate'
import * as schema from '../src/main/db/schema'

describe('migration runner', () => {
  const clients: Database.Database[] = []

  afterEach(() => { clients.splice(0).forEach((client) => client.close()) })

  it('is idempotent for an in-memory database', () => {
    const client = new Database(':memory:')
    clients.push(client)
    const database = drizzle(client, { schema })
    const migrationsFolder = path.resolve(process.cwd(), 'drizzle')

    runMigrations(database, migrationsFolder)
    runMigrations(database, migrationsFolder)

    expect(client.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'settings'").get()).toEqual({ name: 'settings' })
    expect(client.prepare('SELECT COUNT(*) AS count FROM __drizzle_migrations').get()).toEqual({ count: 11 })
  })
})
