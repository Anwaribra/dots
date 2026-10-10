# Project state

## Completed stages

- **Stage 1 — Foundation**: Fully completed. Secure Electron setup (`contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`), Zod-validated typed IPC bridge, SQLite database with `better-sqlite3` and `drizzle-orm`, idempotent migration runner, settings service persisted in SQLite, i18next (English & Arabic) with working LTR/RTL toggle, CSS variable-based design system primitives (`Button`, `Input`, `Select`, `Card`, `Badge`, `Dialog`, `Tabs`), app shell sidebar navigation for 10 generic pages.
- **Stage 2 — Core entities**: Fully completed. Database schema, services, IPC, and UI for Areas, Goals (nullable areaId), Milestones, Projects, Work Items, Work Item Types (built-in + custom), Custom Field Definitions & Values per type, user-defined Tags, Notes attached to entities, Archive & Restore, and deletion modals with choice between detaching or archiving child work items.
- **Stage 3 — Resources**: Fully completed. Database tables `resources`, `resource_items`, `work_item_dependencies` and migration `0003_resources_and_dependencies`. Bulk entry parser (`parseBulkResourceText`) supporting Arabic digits, extra spaces, missing duration, and custom separators. Ordering modes (`sequential`, `flexible`, `dependency_based`), dependency cycle detection algorithm with clear error messages, resource item reordering, resource duplication. Linking resource items to schedulable work items while preserving resource hierarchy, and Decision A14 Completion Truth (linked resource items derive status/progress/actual time from their work items; unlinked items own their status). Full UI view `ResourcesPage` and `BulkResourceModal`.
- **Stage 4 — Time model**: Fully completed.
  - Tables & Migration `0004_time_model`: `availability_rules`, `availability_overrides`, `fixed_events`, `time_budgets`, `routines`, `habits`, `habit_logs`, with columns `planning_capacity_percentage` and `buffer_percentage` in `settings`.
  - Independent Budget columns: `allocationMode` (`minimum | target | maximum | range`) and `protection` (`flexible | protected | locked`).
  - Budget Scopes: Real foreign keys (`areaId`, `goalId`, `projectId`, `workItemTypeId`) enforced with SQL `CHECK` constraint (exactly one set) and cascading deletions.
  - Pure Engines: `src/shared/capacity.ts` (single source of truth for daily capacity, buffer %, fixed event overlaps, locked/protected budgets) and `src/shared/recurrence.ts` (RRule expansion for daily, weekly, monthly, interval without generating infinite instances).
  - Main Services & IPC handlers: Seeded availability rules, overrides, conflict detection on fixed events, routines, habits, habit completion logging, and polymorphic reference cleanup on entity deletion.
  - UI: `AvailabilityAndCapacityPage` (schedule, overrides, fixed events, and live capacity breakdown), `TimeBudgetsPage` (budget creation, scope selection, protection indicators), `RoutinesAndHabitsPage` (habits tracker with daily toggles, recurring routine blocks), and Settings capacity/buffer preferences.
  - Fully tested: 43 Vitest tests passing across 10 test suites, 0 TypeScript errors.

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
│   ├── db/          # database, schema, migrations runner, application migrations (0000 - 0004)
│   ├── services/    # domain services (settings-service, entity-service)
│   └── index.ts     # main process & IPC handler registration
├── preload/
│   └── index.ts     # contextBridge API exposing typed planner IPC bridge
├── renderer/
│   ├── src/
│   │   ├── components/  # UI primitives (button, input, select, card, badge, dialog, tabs), BulkResourceModal, NotesWidget, DeleteDialog
│   │   ├── locales/     # en/common.json, ar/common.json
│   │   ├── pages/       # AreasPage, GoalsPage, ProjectsPage, WorkItemsPage, ResourcesPage, RoutinesAndHabitsPage, TimeBudgetsPage, AvailabilityAndCapacityPage, TypesAndFieldsPage, TagsPage, SettingsPage, PlaceholderPage
│   │   ├── App.tsx      # Main application shell with sidebar & topbar
│   │   ├── i18n.ts
│   │   └── main.tsx
│   └── index.html
└── shared/          # Zod schemas (entities.ts, settings.ts), bulk-parser.ts, dependency-utils.ts, capacity.ts, recurrence.ts & IPC contract (ipc.ts)
```

## Database

Migrations `0000_foundation`, `0001_core_entities`, `0002_stage_foundation_and_entity_repairs`, `0003_resources_and_dependencies`, and `0004_time_model` create `settings`, `profiles`, `areas`, `goals`, `milestones`, `projects`, `work_item_types`, `custom_field_definitions`, `work_items`, `custom_field_values`, `tags`, `entity_tags`, `notes`, `resources`, `resource_items`, `work_item_dependencies`, `availability_rules`, `availability_overrides`, `fixed_events`, `time_budgets`, `routines`, `habits`, and `habit_logs`.

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
- Resources: `resources:list`, `resources:get`, `resources:create`, `resources:update`, `resources:duplicate`
- Resource Items: `resource-items:list`, `resource-items:create`, `resource-items:update`, `resource-items:bulk-add`, `resource-items:reorder`, `resource-items:link-work-item`
- Dependencies: `dependencies:list`, `dependencies:create`, `dependencies:delete`
- Availability & Capacity: `availability-rules:list`, `availability-rules:update`, `availability-overrides:list`, `availability-overrides:create`, `availability-overrides:delete`, `capacity:calculate`
- Fixed Events: `fixed-events:list`, `fixed-events:create`, `fixed-events:update`
- Time Budgets: `time-budgets:list`, `time-budgets:create`, `time-budgets:update`
- Routines & Habits: `routines:list`, `routines:create`, `routines:update`, `habits:list`, `habits:create`, `habits:update`, `habits:log`, `habits:logs:list`
- Entity Management: `entities:archive`, `entities:restore`, `entities:delete`

## Next stage

- Stage 5 — The Planner Engine: Adaptive scheduling engine, packing algorithms, scoring functions, manual reorder, drag & drop calendar/timeline, and auto-scheduling with respect to capacity and buffers.
