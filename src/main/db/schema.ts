import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const settings = sqliteTable('settings', {
  id: text('id').primaryKey(),
  locale: text('locale').notNull().default('en'),
  theme: text('theme').notNull().default('system'),
  weekStartsOn: integer('week_starts_on').notNull().default(6),
  timezone: text('timezone').notNull().default('UTC'),
  use24HourTime: integer('use_24_hour_time', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull()
})
