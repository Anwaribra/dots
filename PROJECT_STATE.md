# Project state

## Completed stages

- Stage 1 — Foundation.
- Stage 2 — Core entities: database schema and migration for areas, goals, milestones, projects, work items, work-item types, custom-field definitions/values, tags, entity tags, and notes. Areas/goals/projects/work items have validated IPC, local services, and a minimal connected UI.

## How to run

```powershell
npm install
npm run typecheck
npm test
npm run dev
```

`pretest` runs `rebuild:node` so Vitest uses a Node-compatible `better-sqlite3`. `predev` runs `rebuild:electron` so Electron uses an Electron-compatible native module. Run either rebuild script directly after switching Node/Electron ABI versions.

## Folder tree

```text
src/
├── main/
│   ├── db/          # database, migration runner, schema
│   ├── services/    # main-process domain services
│   └── index.ts
├── preload/
│   └── index.ts
├── renderer/
│   ├── src/         # React, styles, i18n, renderer window types
│   └── index.html
└── shared/          # Zod schemas and typed IPC contract
```

## Database

Migrations `0000_foundation` and `0001_core_entities` create settings and the Stage 2 entity tables. FK behavior: child goals/projects detach from archived/deleted areas; milestones cascade with their goal; projects detach from goal/milestone; work items detach from projects/types; custom values cascade with their work item/definition. The pure `runMigrations(database, folder)` runner is idempotent.

## IPC channels

- `settings:get`: payload `undefined`, returns `Settings`.
- `settings:update`: partial settings payload, Zod-validated in main, returns `Settings`.
- List/create channels for areas, goals, projects and work items, plus `entities:archive`; every payload is Zod-validated in main.

## Known limitations

- Milestones, work item types, custom fields, tags, and notes have schema support but their editing UI arrives in a later refinement of Stage 2.

## Next stage

Stage 3 — resources, resource items, bulk entry, ordering modes, dependencies, and cycle detection.
