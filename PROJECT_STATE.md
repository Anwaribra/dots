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
- **Stage 5 — Planning engine**: Fully completed.
  - Pure deterministic engine under `src/main/scheduler/` (`constraints/`, `scoring/`, `allocation/`, `capacity/`, `dependencies/`, `scheduling.ts`, `explanations.ts`, `types.ts`).
  - Precedence & Constraint handling: Hard constraint prerequisite dependencies (checked before scoring), 100% deterministic (no `Math.random` or non-deterministic time references), Session splitting for items exceeding max session length, Hard deadline displacement of flexible/protected time budgets with exact numerical explanations. `locked` budgets and items never move.
  - Database schema & Migration `0005_planner_engine`: `scheduled_items` table storing persisted weekly/daily schedule blocks with link to `work_items`.
  - Main Service & IPC: `PlanningService` loading real entity DB state, invoking scheduler, and persisting results; exposed via `planning:generate-week`, `planning:get-schedule`, `planning:clear-schedule`.
  - Developer Debug View: `PlannerDebugPage.tsx` under the `Planner` tab for visualizing schedule generation, explanations, overload reports, and warnings.
  - Tests: 54 Vitest unit/integration tests across 12 test suites passing, 0 TypeScript errors.

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
│   ├── db/          # database, schema, migrations runner, application migrations (0000 - 0005)
│   ├── scheduler/   # pure deterministic planning engine (constraints, scoring, allocation, capacity, dependencies, scheduling, explanations, types)
│   ├── services/    # domain services (settings-service, entity-service)
│   └── index.ts     # main process & IPC handler registration
├── preload/
│   └── index.ts     # contextBridge API exposing typed planner IPC bridge
├── renderer/
│   ├── src/
│   │   ├── components/  # UI primitives (button, input, select, card, badge, dialog, tabs), BulkResourceModal, NotesWidget, DeleteDialog
│   │   ├── locales/     # en/common.json, ar/common.json
│   │   ├── pages/       # AreasPage, GoalsPage, ProjectsPage, WorkItemsPage, ResourcesPage, RoutinesAndHabitsPage, TimeBudgetsPage, AvailabilityAndCapacityPage, TypesAndFieldsPage, TagsPage, SettingsPage, PlannerDebugPage, PlaceholderPage
│   │   ├── App.tsx      # Main application shell with sidebar & topbar
│   │   ├── i18n.ts
│   │   └── main.tsx
│   └── index.html
└── shared/          # Zod schemas (entities.ts, settings.ts), bulk-parser.ts, dependency-utils.ts, capacity.ts, recurrence.ts & IPC contract (ipc.ts)
```

## Database

Migrations `0000_foundation` through `0005_planner_engine` create `settings`, `profiles`, `areas`, `goals`, `milestones`, `projects`, `work_item_types`, `custom_field_definitions`, `work_items`, `custom_field_values`, `tags`, `entity_tags`, `notes`, `resources`, `resource_items`, `work_item_dependencies`, `availability_rules`, `availability_overrides`, `fixed_events`, `time_budgets`, `routines`, `habits`, `habit_logs`, and `scheduled_items`.

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
- Planning Engine: `planning:generate-week`, `planning:get-schedule`, `planning:clear-schedule`

## Next stage

- Stage 6 — Planning UI & Interactive Schedule: Day/Week timeline views, drag-and-drop manual schedule overrides, interactive slot placement, overload indicator badges, and visual feedback for explanations and warnings.
