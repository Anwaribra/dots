# Project state

## Completed stages

- Stage 1 — Foundation (completed in source; execution verification is pending because Node.js/npm are not installed in the current environment).

## How to run

1. Install Node.js 20+.
2. Run `npm install`, then `npm run rebuild:electron`.
3. Run `npm run dev`.
4. Verify with `npm run typecheck` and `npm test`.

`npm run rebuild:node` rebuilds `better-sqlite3` for Node-based tooling. `npm run db:generate` generates a migration and `npm run db:migrate` is available for database tooling.

## Folder tree

```text
.
├── drizzle/
│   ├── meta/
│   └── 0000_foundation.sql
├── src/
│   ├── main/
│   │   ├── db/
│   │   ├── services/
│   │   └── index.ts
│   ├── preload/
│   │   └── index.ts
│   ├── renderer/
│   │   ├── src/
│   │   └── index.html
│   └── shared/
│       ├── ipc.ts
│       └── settings.ts
└── tests/
    └── settings-schema.test.ts
```

## Database

Migration `0000_foundation` creates `settings`: `id`, `locale`, `theme`, `weekStartsOn`, `timezone`, `use24HourTime`, `createdAt`, `updatedAt`. `id` is the primary key. The singleton row uses a stable UUID.

## IPC channels

- `settings:get`: payload `undefined`; returns validated `Settings`.
- `settings:update`: payload validated by `settingsUpdateSchema`; returns validated `Settings`.

All renderer-to-main payloads are Zod validated in main. The preload bridge exposes only the typed `window.planner.settings` API. Context isolation is enabled, Node integration disabled, and sandbox enabled.

## Services

- `getSettings(): Settings`
- `updateSettings(input: unknown): Settings`
- `getDatabase()` and `runMigrations()` initialize SQLite and Drizzle migrations.

## Engines

None yet. Stage 1 deliberately contains no planning/business engines.

## Conventions

- Strict TypeScript; shared contracts live in `src/shared`.
- Instants are UTC milliseconds; later calendar days use `YYYY-MM-DD` and times `HH:mm`.
- Week start defaults to Saturday (`6`).
- English and Arabic text belongs only in `src/renderer/src/locales/*/common.json`.
- Layout CSS uses logical properties for RTL compatibility.

## Known limitations

- Node.js/npm are absent on the current machine, so dependencies could not be installed and typecheck/tests could not be executed.
- Stage 1 only persists application settings; all domain tables arrive in the relevant later stages.

## Next stage

Stage 2: core entities — areas, optional-area goals, milestones, projects, work items, work-item types, custom field definitions/values, tags, and notes.
