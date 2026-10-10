# Project state

## Completed stages

- Stage 1 — Foundation: remediation in progress. The stage now has `profiles`, settings, secure Electron, local database and migration runner, but reusable UI primitives, a single renderer IPC wrapper/error shape, and fully translated UI text remain incomplete.
- Stage 2 — Core entities: remediation in progress. The schema now covers the entity model and built-in work-item type seeds; UI/service coverage is still incomplete for milestones, types and custom fields, tags, notes, edits, restore, and entity detail views.

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

- Stages 1 and 2 are not yet definition-of-done complete; do not begin Stage 3.
- See the current source audit in the conversation before treating either stage as complete.

## Next stage

Complete the remaining Stage 1/2 definition-of-done items, then proceed to Stage 3 only on explicit instruction.
