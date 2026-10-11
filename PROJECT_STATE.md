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
  - Today Dashboard (`TodayPage.tsx`): Real execution view with progress stats (Planned, Actual, Remaining, Completion %, Usable Capacity), zero-guilt analytical progress messages, Current Item card, and timeline view with quick actions.
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
  - **Timer UI**: `TodayPage.tsx` timer modal with live polling every 1s, over-target indicator, Start/Pause/Resume/+5m/Complete/Stop controls.
- **Stage 8 — Basic review**: Fully completed.
  - **Pure Review Engine** (`src/shared/review-engine.ts`): Pure deterministic calculation of next review dates (`calculateNextReviewAt`), interval days parsing (`parseIntervalDays`), status evaluation (`evaluateReviewStatus`), and due/overdue review filtering (`getDueReviews`). Shortens interval on weak recall when policy dictates (`shortenOnWeak`).
  - **Review Service** (`src/main/services/review-service.ts`): CRUD for review policies (`review_policies`), policy attachment/detachment for work items & resource items, recording review events (`review_events` history logging with transactional item status/count sync), due/overdue item listing (`getDueReviewsList`), and conversion of due reviews into schedulable work items (`ensureDueReviewsAsWorkItems`).
  - **Database Migration `0007_review_system.sql`**: Creates `review_policies` and `review_events` tables and adds review columns to `work_items` and `resource_items`. Enforces Decision A14 SQL `CHECK` constraint `exactly_one_ref` on `review_events`.
  - **IPC Channels**: `review-policies:list/create/update/delete`, `review:attach/detach`, `review-events:record/list`, `review:get-due`, `review:sync-to-planner`.
  - **Review UI** (`src/renderer/src/pages/ReviewPage.tsx`): Interactive view with Due Reviews list, "Mark Reviewed" modal, Review Policies management, Review History log, and "Feed Due Reviews to Planner" action.
- **Stage 9 — Replanning**: Fully completed.
  - **Pure Replanning Engine** (`src/main/scheduler/replanning.ts`): Recalculates only the remaining schedule from `currentTime` onwards. Reuses core scheduler scoring and constraints. Preserves completed past items, respects in-progress work (`activeWorkItemId` or `startM < currentM && endM > currentM`), strictly preserves locked items (`locked === true`), and inserts urgent work while shifting flexible work. Handles triggers: `urgent_work_added`, `task_overrun`, `task_finished_early`, `skipped_item` (with 5 resolutions: `move_later_today`, `move_tomorrow`, `next_free_slot`, `skip`, `cancel`), `availability_changed`, `deadline_changed`, `fixed_event_added`, `manual_replan`.
  - **Overload Detection & Suggestions**: Computes remaining capacity vs requested demand; when overloaded produces human-readable warnings and concrete suggestions (move flexible work, move low-priority work, split large items, use another day, reduce non-protected budgets).
  - **Explanations & Diff**: Produces structured `ReplanningChange[]` diff with badges (`inserted`, `moved`, `split`, `extended`, `shortened`, `displaced`, `skipped`, `preserved`) and numerical explanations.
  - **Replanning Service** (`src/main/services/replanning-service.ts`): `previewReplanDay()`, `applyReplanDay()`, `undoLastReplan()`, `listReplanningHistory()`, `listPlanVersions()`. Transactional updates, snapshot archiving, and instant rollback.
  - **Database Migration `0008_replanning.sql`**: Creates `replanning_history` (timestamped change logs with structured JSON diff) and `plan_versions` (full schedule snapshots with version numbering and rollback capabilities).
  - **IPC Channels**: `replanning:preview`, `replanning:apply`, `replanning:undo`, `replanning:get-history`, `replanning:get-versions`.
  - **UI**:
    - `TodayPage.tsx`: "Replan My Day" primary action button, "Undo" button, "History" button.
    - `ReplanPreviewModal.tsx`: Visual before/after diff review, overload warning banner with suggestions, explanations, and approval flow.
    - `PlanHistoryModal.tsx`: Change logs tab and Plan Versions tab with one-click snapshot rollback.
    - Skip Resolution Dialog: Prompting user for resolution (`moveLaterToday`, `nextFreeSlot`, `moveTomorrow`, `skip`, `cancel`) when skipping tasks.
  - **Tests**: 62 tests passing across 9 test suites under plain Node, 0 TypeScript errors. `tests/replanning.test.ts` covers the 2h critical spec insertion at 11:00, skipped item rescheduling, locked item preservation, in-progress item preservation, overload suggestions, and exact undo round-trip.

## How to run

```powershell
cmd /c npm run typecheck
cmd /c npx vitest run tests/replanning.test.ts tests/scheduler.test.ts tests/capacity.test.ts tests/time-math.test.ts tests/bulk-parser.test.ts tests/dependency-cycle.test.ts tests/recurrence.test.ts tests/entity-schemas.test.ts tests/settings-schema.test.ts
cmd /c npm run dev
```

## Folder tree

```text
src/
├── main/
│   ├── db/          # database, schema, migrations runner, application migrations (0000 - 0008)
│   ├── scheduler/   # pure deterministic planning & replanning engines (constraints, scoring, allocation, capacity, dependencies, scheduling, replanning, explanations, types)
│   ├── services/    # domain services (settings-service, entity-service, planning-service, replanning-service, session-service, timer-service, notification-service, backup-service, review-service)
│   └── index.ts     # main process & IPC handler registration
├── preload/
│   └── index.ts     # contextBridge API exposing typed planner IPC bridge
├── renderer/
│   ├── src/
│   │   ├── components/  # UI primitives, ReplanPreviewModal, PlanHistoryModal, BulkResourceModal, QuickAddModal, NotesWidget, DeleteDialog
│   │   ├── locales/     # en/common.json, ar/common.json
│   │   ├── pages/       # TodayPage (replan, timer, timeline), InboxPage, WeeklyPlannerPage, ReviewPage, AreasPage, GoalsPage, ProjectsPage, WorkItemsPage, ResourcesPage, RoutinesAndHabitsPage, TimeBudgetsPage, AvailabilityAndCapacityPage, TypesAndFieldsPage, TagsPage, SettingsPage, PlannerDebugPage, PlaceholderPage
│   │   ├── App.tsx      # Main application shell with sidebar & topbar
│   │   ├── i18n.ts
│   │   └── main.tsx
│   └── index.html
└── shared/          # Zod schemas, bulk-parser.ts, dependency-utils.ts, capacity.ts, recurrence.ts, time-math.ts, review-engine.ts & IPC contract (ipc.ts)
```

## Database

Migrations `0000_foundation` through `0008_replanning` create `settings`, `profiles`, `areas`, `goals`, `milestones`, `projects`, `work_item_types`, `custom_field_definitions`, `work_items`, `custom_field_values`, `tags`, `entity_tags`, `notes`, `resources`, `resource_items`, `work_item_dependencies`, `availability_rules`, `availability_overrides`, `fixed_events`, `time_budgets`, `routines`, `habits`, `habit_logs`, `scheduled_items`, `time_sessions`, `review_policies`, `review_events`, `replanning_history`, and `plan_versions`.

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
- Replanning: `replanning:preview`, `replanning:apply`, `replanning:undo`, `replanning:get-history`, `replanning:get-versions`

- **Stage 10 — Progress engine, analytics & dashboard**: Fully completed.
  - **Pure Progress Engine** (`src/shared/progress-engine.ts`): Multi-mode goal progress calculation — `percentage` (current vs target), `count` (completed items / total), `duration` (completed minutes / total minutes — never raw count alone), `numeric` (custom value vs target), `milestone` (milestones checked / total), `weighted` (component sub-goals with weights summing to 100). Project progress weighted by item estimated duration. Composable and capped 0–100. Velocity and trend computed across progress history snapshots.
  - **Pure Analytics Engine** (`src/shared/analytics-engine.ts`): Aggregates time by area, goal, project; planned vs scheduled vs actual breakdown; completion rate; deadline performance; reschedule/skip rates; overdue work count; capacity utilization; estimation accuracy distribution. Filters by date range, area, goal, project, tag, and item type. Handles empty datasets cleanly (no NaN, no crash).
  - **Progress Service** (`src/main/services/progress-service.ts`): DB integration for progress snapshots (`progress_history` table in migration `0009_progress_analytics.sql`). `getGoalProgress()`, `recordProgressSnapshot()`, `getProgressHistory()`.
  - **Goal Metrics Service** (`src/main/services/progress-service.ts`): CRUD for `goal_metrics` table — custom numeric metrics linked to goals (`name`, `unit`, `currentValue`, `targetValue`).
  - **Analytics Service** (`src/main/services/analytics-service.ts`): Loads raw sessions, work items, scheduled items, areas, goals, projects from DB and feeds them to the analytics engine. `getAnalyticsOverview(filter?)` and `getDashboardWidgetsData()`.
  - **Database Migration `0009_progress_analytics.sql`**: `progress_history` table (entityType, entityId, progress, notes, recordedAt) and `goal_metrics` table (goalId, name, unit, currentValue, targetValue).
  - **IPC Channels**: `progress:get-goal`, `progress:record-snapshot`, `progress:get-history`, `goal-metrics:list/create/update/delete`, `analytics:get-overview`, `dashboard:get-data`.
  - **Dashboard UI** (`src/renderer/src/pages/DashboardPage.tsx`): Fixed-layout widgets — Today's plan summary (completed / remaining / capacity %), Goal Progress cards with multi-mode progress bars, Planned vs Scheduled vs Actual (bar chart via recharts), Time by Area and Time by Project (pie charts), Upcoming Deadlines list.
  - **Analytics UI** (`src/renderer/src/pages/AnalyticsPage.tsx`): Date-range, area, goal, project, tag, item-type filters. Overview cards (completion rate, deadline performance, estimation accuracy, utilisation). Planned/Scheduled/Actual area chart. Time breakdown charts. Completion rate trend. Full RTL support.
  - **GoalsPage upgrade** (`src/renderer/src/pages/GoalsPage.tsx`): Progress widget per goal (mode indicator, progress bar, history chart, manual snapshot recording), goal metrics editor, inline milestone progress.
  - **ProjectsPage upgrade** (`src/renderer/src/pages/ProjectsPage.tsx`): Workload and progress widgets per project (weighted progress, velocity indicator, capacity utilisation bar).
  - **Localisation**: Dashboard and analytics keys added to `en/common.json` and `ar/common.json`.
  - **Tests**: `tests/progress-analytics.test.ts` — 15/15 passing. Covers all 6 progress modes, weighted calculation, edge cases (empty data, over-100 caps), project progress, velocity/trend, analytics breakdowns, filters, and empty-dataset safety.
  - **0 TypeScript errors** (`npm run typecheck` exit code 0).

- **Stage 11 — Templates, onboarding & demo data**: Fully completed.
  - **Database Migration `0010_templates_and_onboarding.sql`**: Creates `templates` table (`id`, `name`, `description`, `category`, `builtin`, `payload_json`, `created_at`, `updated_at`) and adds `onboarding_done` and `demo_mode` columns to `settings`.
  - **Built-in Templates**: Shipped as pure JSON blueprints in `src/main/templates/` (`builtin-study.json`, `builtin-fitness.json`, `builtin-review.json`, `builtin-freelance.json`). Seeded automatically on startup into the `templates` table.
  - **Template Service** (`src/main/services/template-service.ts`):
    - `listTemplates()`: lists built-in and custom templates.
    - `applyTemplate()`: applies template payload purely through existing entity services (areas, goals, milestones, work item types, routines, time budgets, review policies, resources). Completely decoupled from scheduler and planning engines. Robust duplicate detection via `skipDuplicates` flag.
    - `saveCustomTemplate()`: captures current workspace entities into a reusable template payload, honoring user inclusion toggles.
    - `deleteTemplate()`: safely removes custom templates (prohibits deleting built-in templates).
  - **Demo Data Service** (`src/main/services/demo-service.ts`):
    - Seeds rich sample dataset (`demo-data.json`) labeled with `[Demo]` prefix into the active database.
    - `deleteDemoData()`: one-click removal of all demo data in dependency-safe order (`workItems` → `projects` → `goals` → `areas` → `routines`), leaving no orphan records.
    - `demoMode` state triggers persistent app banner.
  - **Onboarding Wizard** (`src/renderer/src/components/OnboardingWizard.tsx`):
    - Welcome screen with three clear pathways: "Pick a ready-made template", "Explore with demo data", or "Start from scratch".
    - Skippable guided steps: Language & regional format (en/ar, 12h/24h, week starts on), Focus areas selection, Planning capacity & reality buffer configuration.
    - Displays on first launch or can be re-run on demand from Settings.
  - **Templates UI** (`src/renderer/src/pages/TemplatesPage.tsx`):
    - Categorized gallery (Study, Fitness, Spaced Review, Freelance, Custom).
    - Detailed card breakdown showing constituent entity counts.
    - Apply modal with duplicate skipping toggle.
    - "Save Current Setup as Template" modal with selective entity module checkboxes.
  - **Settings Page Upgrade** (`src/renderer/src/pages/SettingsPage.tsx`):
    - Load / Delete Demo Data buttons.
    - Re-launch Onboarding Wizard action.
  - **IPC Channels**: `templates:list`, `templates:apply`, `templates:save-custom`, `templates:delete`, `demo:load`, `demo:delete`.
  - **Localisation**: Full English and Arabic translations for templates, demo, and onboarding.
  - **Tests**: `tests/templates.test.ts` (8/8 passing). Total 85 tests passing across 11 test suites under Node.
  - **0 TypeScript errors** (`npm run typecheck` exit code 0).

## How to run

```powershell
cmd /c npm run typecheck
cmd /c npx vitest run tests/replanning.test.ts tests/scheduler.test.ts tests/capacity.test.ts tests/time-math.test.ts tests/bulk-parser.test.ts tests/dependency-cycle.test.ts tests/recurrence.test.ts tests/entity-schemas.test.ts tests/settings-schema.test.ts tests/progress-analytics.test.ts tests/templates.test.ts
cmd /c npm run dev
```

## Folder tree

```text
src/
├── main/
│   ├── db/          # database, schema, migrations runner, application migrations (0000 - 0010)
│   ├── scheduler/   # pure deterministic planning & replanning engines (constraints, scoring, allocation, capacity, dependencies, scheduling, replanning, explanations, types)
│   ├── services/    # domain services (settings-service, entity-service, planning-service, replanning-service, session-service, timer-service, notification-service, backup-service, review-service, progress-service, analytics-service, template-service, demo-service)
│   ├── templates/   # built-in JSON templates (study, fitness, review, freelance) and demo-data.json
│   └── index.ts     # main process & IPC handler registration
├── preload/
│   └── index.ts     # contextBridge API exposing typed planner IPC bridge
├── renderer/
│   ├── src/
│   │   ├── components/  # UI primitives, OnboardingWizard, ReplanPreviewModal, PlanHistoryModal, BulkResourceModal, QuickAddModal, NotesWidget, DeleteDialog
│   │   ├── locales/     # en/common.json, ar/common.json
│   │   ├── pages/       # TodayPage, InboxPage, WeeklyPlannerPage, ReviewPage, AreasPage, GoalsPage, ProjectsPage, WorkItemsPage, ResourcesPage, RoutinesAndHabitsPage, TimeBudgetsPage, AvailabilityAndCapacityPage, TypesAndFieldsPage, TagsPage, SettingsPage, PlannerDebugPage, DashboardPage, AnalyticsPage, TemplatesPage
│   │   ├── App.tsx      # Main application shell with sidebar & topbar
│   │   ├── i18n.ts
│   │   └── main.tsx
│   └── index.html
└── shared/          # Zod schemas, templates.ts, bulk-parser.ts, dependency-utils.ts, capacity.ts, recurrence.ts, time-math.ts, review-engine.ts, progress-engine.ts, analytics-engine.ts & IPC contract (ipc.ts)
```

## Database

Migrations `0000_foundation` through `0010_templates_and_onboarding` create `settings`, `profiles`, `areas`, `goals`, `milestones`, `projects`, `work_item_types`, `custom_field_definitions`, `work_items`, `custom_field_values`, `tags`, `entity_tags`, `notes`, `resources`, `resource_items`, `work_item_dependencies`, `availability_rules`, `availability_overrides`, `fixed_events`, `time_budgets`, `routines`, `habits`, `habit_logs`, `scheduled_items`, `time_sessions`, `review_policies`, `review_events`, `replanning_history`, `plan_versions`, `progress_history`, `goal_metrics`, and `templates`.

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
- Replanning: `replanning:preview`, `replanning:apply`, `replanning:undo`, `replanning:get-history`, `replanning:get-versions`
- Progress: `progress:get-goal`, `progress:record-snapshot`, `progress:get-history`
- Goal Metrics: `goal-metrics:list`, `goal-metrics:create`, `goal-metrics:update`, `goal-metrics:delete`
- Analytics: `analytics:get-overview`
- Dashboard: `dashboard:get-data`
- Templates: `templates:list`, `templates:apply`, `templates:save-custom`, `templates:delete`
- Demo Data: `demo:load`, `demo:delete`

## Next stage

- Stage 12 of 12 — Final polish, comprehensive export/import, backup/restore, production packaging validation.
