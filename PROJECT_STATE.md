# Project state

## Completed stages

- **Stage 1 — Foundation**: Fully completed. Secure Electron setup (`contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`), Zod-validated typed IPC bridge, SQLite database with `better-sqlite3` and `drizzle-orm`, idempotent migration runner, settings service persisted in SQLite, i18next (English & Arabic) with working LTR/RTL toggle, CSS variable-based design system primitives (`Button`, `Input`, `Select`, `Card`, `Badge`, `Dialog`, `Tabs`), app shell sidebar navigation for 10 generic pages.
- **Stage 2 — Core entities**: Fully completed. Full database schema, services, IPC, and UI for Areas, Goals (nullable areaId), Milestones (under goals), Projects (optional area/goal/milestone links), Work Items (optional parent/project/goal/area links), Work Item Types (built-in seeds + user-defined types), Custom Field Definitions & Values per type, user-defined Tags, Notes attached to entities, Archive & Restore, and deletion modals with choice between detaching or archiving child work items.

## How to run

```powershell
cmd /c npm run typecheck
cmd /c npm test
cmd /c npm run dev
```

`pretest` runs `rebuild:node` so Vitest uses a Node-compatible `better-sqlite3`. `predev` runs `rebuild:electron` so Electron uses an Electron-compatible native module.

## Folder tree

```text
src/
├── main/
│   ├── db/          # database, schema, migrations runner, application migrations
│   ├── services/    # domain services (settings-service, entity-service)
│   └── index.ts     # main process & IPC handler registration
├── preload/
│   └── index.ts     # contextBridge API exposing typed planner IPC bridge
├── renderer/
│   ├── src/
│   │   ├── components/  # UI primitives (button, input, select, card, badge, dialog, tabs) & widgets (NotesWidget, DeleteDialog)
│   │   ├── locales/     # en/common.json, ar/common.json
│   │   ├── pages/       # AreasPage, GoalsPage, ProjectsPage, WorkItemsPage, TypesAndFieldsPage, TagsPage, SettingsPage, PlaceholderPage
│   │   ├── App.tsx      # Main application shell with sidebar & topbar
│   │   ├── i18n.ts
│   │   └── main.tsx
│   └── index.html
└── shared/          # Zod schemas (entities.ts, settings.ts) & IPC contract (ipc.ts)
```

## Database

Migrations `0000_foundation`, `0001_core_entities`, and `0002_stage_foundation_and_entity_repairs` create `settings`, `profiles`, `areas`, `goals`, `milestones`, `projects`, `work_item_types`, `custom_field_definitions`, `work_items`, `custom_field_values`, `tags`, `entity_tags`, and `notes`.

## IPC channels

- Settings: `settings:get`, `settings:update`
- Areas: `areas:list`, `areas:create`, `areas:update`
- Goals: `goals:list`, `goals:create`, `goals:update`
- Milestones: `milestones:list`, `milestones:create`, `milestones:update`
- Projects: `projects:list`, `projects:create`, `projects:update`
- Work Item Types: `work-item-types:list`, `work-item-types:create`, `work-item-types:update`
- Custom Field Defs: `custom-field-defs:list`, `custom-field-defs:create`, `custom-field-defs:update`
- Custom Field Values: `custom-field-values:get`, `custom-field-values:set`
- Work Items: `work-items:list`, `work-items:create`, `work-items:update`
- Tags: `tags:list`, `tags:create`, `tags:attach`, `tags:detach`, `tags:get-for-entity`
- Notes: `notes:list`, `notes:create`, `notes:delete`
- Entity Management: `entities:archive`, `entities:restore`, `entities:delete`

## Known limitations

- Stage 3 (Resources & learning content) is next.

## Next stage

- Stage 3 — Resources: resources & items, bulk entry, ordering modes, dependencies and cycle detection.
