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
- **Stage 6 — Planner UI**: Fully completed.
  - Today Dashboard (`TodayPage.tsx`): Real execution view with progress stats (Planned, Actual, Remaining, Completion %, Usable Capacity), zero-guilt analytical progress messages, Current Item card (timer placeholder replaced in Stage 7), and timeline view with quick actions.
  - Weekly Planner (`WeeklyPlannerPage.tsx`): 7-day adaptive timeline grid respecting `weekStartsOn` setting, daily capacity indicators, overload warnings, manual control (move, lock/unlock, split, resize, delete, add). Regeneration preserves locked items.
  - Inbox Queue (`InboxPage.tsx`): Quick capture form, pending queue, "Plan Item" action.
  - Quick Add Modal (`QuickAddModal.tsx`): Accessible via `Ctrl+K` or `Alt+N` for structured fast task capture.
- **Stage 7 — Execution Engine**: Fully completed.
  - **Timer Service** (`src/main/services/timer-service.ts`): Main-process singleton timer that survives window reloads and restarts. Modes: countdown, stopwatch, pomodoro, custom. Controls: start, pause, resume, stop, complete, add-time. Completion persists a session automatically.
  - **Session Service** (`src/main/services/session-service.ts`): CRUD for `time_sessions` table. Every create/update/delete runs `syncWorkItemActualInTx` inside the same drizzle transaction to keep `work_items.actual_minutes` as a transactionally-consistent cache that always equals `SUM(time_sessions.net_minutes)`. Also updates `projects.completed_minutes`.
  - **Notification Service** (`src/main/services/notification-service.ts`): Wraps `Electron.Notification` with deduplication by key (5-minute window). Used exclusively for timer completion in this stage.
  - **Backup Service** (`src/main/services/backup-service.ts`): `exportJsonData()` (full DB dump), `validateJsonBackup()` (structural validation), `restoreJsonData()` (atomic delete-then-reinsert in one transaction, validated before touching DB), `createDatabaseBackupFile()` (DB file copy with timestamp).
  - **Pure Time-Math Module** (`src/shared/time-math.ts`): `computeNetSessionMinutes`, `computeRemainingWorkMinutes`, `calculateEstimationAccuracy`, `aggregateEstimationAccuracy`. `EstimationAccuracyResult` surface bias as suggestion only — never edits estimates.
  - **Database**: Migration `0006_execution_engine.sql` — `time_sessions` table + `notifications_enabled` column in `settings`.
  - **IPC**: `sessions:list/create/update/delete`, `timer:get-state/start/pause/resume/stop/complete/add-time`, `accuracy:get-for-work-item/get-overall`, `backup:export-json/restore/create-db`. All channels have Zod input schemas, preload bridge entries, and main-process handlers.
  - **Timer UI**: `TodayPage.tsx` timer placeholder replaced with real modal — shows elapsed/remaining clock, Start/Pause/Resume/+5m/Complete/Stop controls, live polling every 1s, over-target indicator.
  - **Tests**: 97 tests passing across 15 test suites, 0 TypeScript errors.
    - `tests/time-math.test.ts` — 22 pure unit tests covering all math functions, midnight-crossing, pause/resume accuracy, and aggregation.
    - `tests/session-service.test.ts` — 8 integration tests proving the `actualMinutes` cache invariant holds after create, update, delete, and multi-session scenarios.
    - `tests/backup-service.test.ts` — 12 integration tests: export round-trip, validation rejections, JSON string input, atomicity on corrupt data.
- **Stage 8 — Basic review**: Fully completed.
  - **Pure Review Engine** (`src/shared/review-engine.ts`): Pure deterministic calculation of next review dates (`calculateNextReviewAt`), interval days parsing (`parseIntervalDays`), status evaluation (`evaluateReviewStatus`), and due/overdue review filtering (`getDueReviews`). Shortens interval on weak recall when policy dictates (`shortenOnWeak`).
  - **Review Service** (`src/main/services/review-service.ts`): CRUD for review policies (`review_policies`), policy attachment/detachment for work items & resource items, recording review events (`review_events` history logging with transactional item status/count sync), due/overdue item listing (`getDueReviewsList`), and conversion of due reviews into schedulable work items (`ensureDueReviewsAsWorkItems`).
  - **Database Migration `0007_review_system.sql`**: Creates `review_policies` and `review_events` tables and adds review columns (`review_policy_id`, `last_reviewed_at`, `next_review_at`, `review_count`, `review_status`) to `work_items` and `resource_items`. Enforces Decision A14 SQL `CHECK` constraint `exactly_one_ref` on `review_events` (`workItemId` XOR `resourceItemId`).
  - **IPC Channels**: `review-policies:list/create/update/delete`, `review:attach/detach`, `review-events:record/list`, `review:get-due`, `review:sync-to-planner`.
  - **Review UI** (`src/renderer/src/pages/ReviewPage.tsx`): Full interactive view replacing placeholder under the `Review` sidebar item. Displays Due Reviews list with quick "Mark Reviewed" modal (result quality, duration, notes), Review Policies management (custom interval lists, shorten-on-weak toggle), Review History event log, and "Feed Due Reviews to Planner" action.
  - **Tests**: 105 tests passing across 16 test suites, 0 TypeScript errors. `tests/review-system.test.ts` covers pure engine calculations, custom interval lists, review history preservation, weak recall interval shortening, and Decision A14 SQL `CHECK` constraint enforcement.

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
│   ├── db/          # database, schema, migrations runner, application migrations (0000 - 0006)
│   ├── scheduler/   # pure deterministic planning engine (constraints, scoring, allocation, capacity, dependencies, scheduling, explanations, types)
│   ├── services/    # domain services (settings-service, entity-service, planning-service, session-service, timer-service, notification-service, backup-service)
│   └── index.ts     # main process & IPC handler registration
├── preload/
│   └── index.ts     # contextBridge API exposing typed planner IPC bridge
├── renderer/
│   ├── src/
│   │   ├── components/  # UI primitives, BulkResourceModal, QuickAddModal, NotesWidget, DeleteDialog
│   │   ├── locales/     # en/common.json, ar/common.json
│   │   ├── pages/       # TodayPage (real timer), InboxPage, WeeklyPlannerPage, AreasPage, GoalsPage, ProjectsPage, WorkItemsPage, ResourcesPage, RoutinesAndHabitsPage, TimeBudgetsPage, AvailabilityAndCapacityPage, TypesAndFieldsPage, TagsPage, SettingsPage, PlannerDebugPage, PlaceholderPage
│   │   ├── App.tsx      # Main application shell with sidebar & topbar
│   │   ├── i18n.ts
│   │   └── main.tsx
│   └── index.html
└── shared/          # Zod schemas (entities.ts, settings.ts), bulk-parser.ts, dependency-utils.ts, capacity.ts, recurrence.ts, time-math.ts & IPC contract (ipc.ts)
```

## Database

Migrations `0000_foundation` through `0006_execution_engine` create `settings` (with `notifications_enabled`), `profiles`, `areas`, `goals`, `milestones`, `projects`, `work_item_types`, `custom_field_definitions`, `work_items`, `custom_field_values`, `tags`, `entity_tags`, `notes`, `resources`, `resource_items`, `work_item_dependencies`, `availability_rules`, `availability_overrides`, `fixed_events`, `time_budgets`, `routines`, `habits`, `habit_logs`, `scheduled_items`, and `time_sessions`.

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
- Routines & Habits: `routines:list`, `routines:create`, `routines:update`, `habits:list`, `habits:create`, `habits:update`, `habits:log`, `habits:list-logs`
- Entity Management: `entities:archive`, `entities:restore`, `entities:delete`
- Planning Engine: `planning:generate-week`, `planning:get-schedule`, `planning:clear-schedule`, `planning:update-schedule-item`, `planning:create-schedule-item`, `planning:delete-schedule-item`
- Sessions: `sessions:list`, `sessions:create`, `sessions:update`, `sessions:delete`
- Timer: `timer:get-state`, `timer:start`, `timer:pause`, `timer:resume`, `timer:stop`, `timer:complete`, `timer:add-time`
- Backup: `backup:export-json`, `backup:restore`, `backup:create-db`
- Reviews: `review-policies:list/create/update/delete`, `review:attach/detach`, `review-events:record/list`, `review:get-due`, `review:sync-to-planner`

## Next stage

- Stage 9 — Goal tracking: Progress calculation strategies, milestone progress rollup, metrics, and visual progress charts.
