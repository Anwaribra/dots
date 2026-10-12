# Clarity Planner — Complete Technical Specification & Architecture Document

> **Document Purpose**: Comprehensive technical overview, architectural breakdown, and feature specification of **Clarity Planner** for external architectural review and strategic planning.

---

## 1. Executive Summary & Core Philosophy

**Clarity Planner** is a high-performance, local-first desktop application designed for structured personal planning, execution tracking, and time management. It bridges high-level life vision (areas and long-term goals) with granular execution (calendar scheduling, focus timers, and spaced repetition).

### Key Differentiators & Philosophy:
1. **Local-First & Complete Data Ownership**: 
   - Powered by an embedded SQLite database (`better-sqlite3` + `drizzle-orm`).
   - Zero telemetry, zero external cloud dependencies, 100% offline functionality.
2. **"Zero-Guilt" Realistic Planning**:
   - Unlike naive calendar apps that schedule 100% of waking hours, Clarity incorporates **Planning Capacity** (e.g., 75%) and a dedicated **Reality Buffer** (e.g., 20%) to absorb daily disruptions, fatigue, and context switching.
3. **Deterministic, Explainable Scheduling**:
   - The planning engine is 100% mathematical and deterministic (no pseudo-random scheduling or stochastic heuristics).
   - Decisions are accompanied by human-readable, numerical explanations (e.g., why a task was displaced, split, or postponed).
4. **Resilient Replanning**:
   - Provides a one-click **"Replan My Day"** engine that calculates forward-looking schedule diffs from the current minute, preserving completed and in-progress work, with full versioning and instant rollbacks.
5. **Native Bilingual (English & Arabic RTL)**:
   - Designed from day one with bidirectional CSS logical properties, bidirectional UI typography, and full localization in English (LTR) and Arabic (RTL).

---

## 2. Technology Stack

| Layer | Technologies | Rationale & Configuration |
|---|---|---|
| **Desktop Shell** | **Electron 33** | Strict security configuration: `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`. Typed IPC bridge via `preload/index.ts`. |
| **Build & Bundler** | **electron-vite 2.3** + Vite 5 | Fast HMR in development, independent production builds for Main, Preload, and Renderer. |
| **Frontend Framework** | **React 18.3** + **TypeScript 5.7** | Strongly typed components, hooks, and clean separation of concerns. |
| **Styling & Design System** | **Tailwind CSS 3.4** + Vanilla CSS Variables | CSS design tokens, dark/light/system theme toggles, RTL-aware CSS logical properties (`margin-inline-start`, `border-inline-end`, etc.). |
| **Icons & Visualization** | **Lucide React** + **Recharts 3.10** | Minimal, modern icons; reactive data visualization for time distribution and analytics. |
| **Database & ORM** | **better-sqlite3 12** + **Drizzle ORM 0.44** | Native SQLite speed, synchronous transactions, type-safe SQL queries, and 11 idempotent schema migrations. |
| **Validation & Contracts** | **Zod 3.24** | Schema validation for all inter-process communication (IPC) channels and import/export payloads. |
| **Localization** | **i18next** + **react-i18next** | Namespace-free, instant LTR/RTL toggling with 700+ translated strings per language. |
| **Testing Suite** | **Vitest 2.1** | 20 test suites with 146 unit & integration tests covering scheduling algorithms, time math, migrations, and analytics. |

---

## 3. Domain Model & Hierarchy

The application establishes a clear, non-restrictive hierarchy:

```
[ Areas of Responsibility ] (e.g., Career, Health, Learning, Personal)
      └── [ Goals ] (Multi-mode progress: duration, count, milestone, weighted, numeric)
            ├── [ Milestones ] (Checkpoints with optional component weights)
            └── [ Projects ] (Actionable containers with duration-weighted progress)
                  └── [ Work Items / Tasks ] (Schedulable atomic units)
                        ├── Types & Dynamic Custom Fields (text, number, date, select, boolean)
                        ├── Tags & Attached Notes
                        ├── Time Budgets (Flexible, Protected, Locked)
                        ├── Spaced Review Policies (Repetition tracking)
                        └── Dependencies (DAG graph with cycle detection)

[ Structured Resources ] (Courses, Books, Playlists, PDFs)
      └── [ Resource Items ] ──(Optionally linked to)──> [ Work Items ]
```

---

## 4. Architectural Breakdown: All 12 Stages

### Stage 1 — Secure Foundation & Core Shell
- **Electron Architecture**: Fully isolated renderer process communicating exclusively through a strictly typed `window.planner` context bridge.
- **SQLite Engine**: Embedded SQLite database initialized under Electron's per-user data directory (`app.getPath('userData')`), inaccessible to renderer directly.
- **Migration Runner**: Idempotent Drizzle migration engine automatically applying incremental schema migrations on boot.
- **Bilingual Design System**: Seamless Arabic (RTL) / English (LTR) toggle, dark/light theme switching, and custom Frameless Window title bar controls (`minimize`, `maximize`, `close`).

### Stage 2 — Core Entities & Polymorphism
- Full CRUD, archiving, restoration, and deletion cascaded across **Areas**, **Goals**, **Milestones**, **Projects**, and **Work Items**.
- **Dynamic Extensibility**:
  - **Work Item Types**: Built-in defaults (`task`, `habit`, `routine`) plus user-defined types.
  - **Custom Field Definitions & Values**: Attached per type (supports text, number, date, select dropdowns, and boolean flags).
  - **Polymorphic Tags & Notes**: Universal tagging and markdown notes attachable to any entity.
- **Safe Deletion Strategy**: Interactive modal prompting user to either *detach* child work items (orphaning safely) or *archive* them together.

### Stage 3 — Structured Resources & Dependency Graph
- **Resources Management**: Hierarchical container for structured learning materials (Courses, Books, Training Programs, Playlists).
- **Intelligent Bulk Parser (`parseBulkResourceText`)**:
  - Automatically parses copy-pasted syllabi (e.g., `Video 1 | 35m`, `Chapter 2 - 45 min`).
  - Supports English and Arabic digits (`١, ٢, ٣...`), irregular delimiters, and missing durations.
- **Ordering Modes**:
  - `sequential`: Each item is locked until the previous item completes.
  - `flexible`: Free independent ordering.
  - `dependency_based`: Explicit DAG directed dependency mapping.
- **Cycle Detection Algorithm**: Detects circular prerequisites before creation and returns explicit node path error messages.
- **Resource Item Linkage (Decision A14 Completion Truth)**: Unlinked items own their status; linked items derive progress, actual time, and completion state reactively from their parent Work Items.

### Stage 4 — Time Model, Capacity & Budgets
- **Availability Rules & Overrides**: Configurable weekly schedule (working windows per day of week) plus date-specific overrides (holidays, sick leaves, custom hours).
- **Fixed Events**: Non-negotiable calendar commitments (meetings, lectures, doctor appointments) that block time slots and cannot be shifted.
- **Time Budgets**:
  - Dedicated time allocation per Area, Goal, Project, or Type.
  - Allocation Modes: `minimum`, `target`, `maximum`, `range`.
  - Protection Levels: `flexible` (can be borrowed from), `protected` (triggers warnings if encroached), `locked` (cannot be displaced).
- **Routines & Habits Tracker**:
  - **Recurring Routines**: Time-blocking habits supporting RFC 5545 RRule recurrence expansion without generating infinite database rows.
  - **Daily Habits**: Daily toggle checklist with streak calculation and history logs.
- **Pure Capacity Engine (`capacity.ts`)**: Single source of truth calculating daily available minutes, reality buffer deduction, fixed commitments, and remaining flexible bandwidth.

### Stage 5 — Deterministic Planning Engine
- **Pure Deterministic Scheduling (`scheduling.ts`)**:
  - Zero stochastic or random behavior (`Math.random` strictly disallowed).
  - Given the same database state and date range, always yields the exact same schedule.
- **Hard Constraints**:
  - Prerequisite dependencies checked before scoring.
  - Fixed events and existing locked sessions strictly reserved.
  - Overlapping item prevention.
- **Heuristic Scoring System**:
  - Balances urgency (proximity to hard deadline), priority level, preferred date alignment, and user energy level match.
- **Session Splitting & Budget Displacement**:
  - Automatically splits tasks exceeding `maxSessionMinutes` into logical sessions (e.g., Session 1/2, Session 2/2).
  - Permits hard-deadline tasks to displace `flexible` or `protected` budgets while logging exact mathematical justifications.

### Stage 6 — Planner UI & Daily Execution
- **Today Dashboard (`TodayPage.tsx`)**:
  - Real-time execution cockpit showing Planned vs Scheduled vs Actual vs Remaining minutes.
  - Zero-guilt status messages.
  - Active task focus card with instant timer controls.
- **Weekly Planner (`WeeklyPlannerPage.tsx`)**:
  - 7-day adaptive timeline grid respecting `weekStartsOn` setting (Saturday, Sunday, or Monday).
  - Visual daily capacity meters (Healthy, Heavy, Overloaded).
  - Interactive item controls: move across days, lock/unlock, resize duration, split session, or delete.
- **Inbox Queue (`InboxPage.tsx`)**:
  - GTD-style fast capture queue to record unscheduled thoughts and convert them into planned items.
- **Global Quick Add Modal (`Ctrl+K` / `Alt+N`)**:
  - Lightweight modal accessible anywhere in the app for instant task capture.

### Stage 7 — Execution Engine, Focus Timer & Backups
- **Main-Process Singleton Timer (`timer-service.ts`)**:
  - Timer runs in Node.js background; persists through window minimizes, renderer refreshes, and app reloads.
  - Modes: Countdown, Stopwatch, Pomodoro, and Custom intervals.
- **Transactional Session Logging (`session-service.ts`)**:
  - Completing a focus session creates an immutable record in `time_sessions`.
  - Automatically recalculates and caches `work_items.actual_minutes` and `projects.completed_minutes` in the same atomic database transaction.
- **Estimation Accuracy Algorithm (`time-math.ts`)**:
  - Computes ratio of estimated vs actual minutes across tasks and aggregates user bias (tendency to overestimate vs underestimate) as informational insight.
- **Desktop Notifications**: Native Electron desktop notifications with a 5-minute deduplication window.
- **Backup & Restore (`backup-service.ts`)**:
  - Atomic JSON database export and validation.
  - Live `.sqlite` snapshot backup.

### Stage 8 — Spaced Repetition Review Engine
- **Pure Review Engine (`review-engine.ts`)**:
  - Deterministic calculation of next review dates based on customizable interval progressions (e.g., 1, 3, 7, 14, 30, 90 days).
  - `shortenOnWeak`: Dynamic interval reduction when the user reports weak recall.
- **Review Service & UI (`ReviewPage.tsx`)**:
  - Review policy attachment for both Work Items and Resource Items.
  - Detailed review history logging with recall ratings (`strong`, `good`, `weak`).
  - One-click **"Feed Due Reviews to Planner"** to automatically schedule due reviews as actionable tasks.

### Stage 9 — Intelligent Replanning Engine
- **Partial-Day Replanner (`replanning.ts`)**:
  - Re-evaluates schedule from `currentTime` onwards without modifying completed past history.
  - Strict preservation of in-progress tasks and user-locked tasks.
  - Handles 8 real-world triggers: `urgent_work_added`, `task_overrun`, `task_finished_early`, `skipped_item`, `availability_changed`, `deadline_changed`, `fixed_event_added`, `manual_replan`.
- **Overload Detection & Advisory**:
  - When remaining tasks exceed remaining usable minutes, the engine generates actionable suggestions (e.g., defer flexible work, split large items, adjust reality buffer).
- **Visual Diff & Audit Trail (`ReplanPreviewModal.tsx`)**:
  - Displays side-by-side diff badges: `inserted`, `moved`, `split`, `extended`, `shortened`, `displaced`, `skipped`, `preserved`.
  - Instant One-Click **Undo** restoring previous snapshot from `plan_versions`.

### Stage 10 — Multi-Mode Progress Engine & Analytics
- **Multi-Mode Goal Progress Engine (`progress-engine.ts`)**:
  1. `percentage`: Manual subjective percentage (0–100%).
  2. `count`: Completed tasks / total tasks.
  3. `duration`: Completed minutes / total estimated minutes (time-weighted).
  4. `numeric`: Quantitative metric vs target value (e.g., pages read, km run, money saved).
  5. `milestone`: Ratio of checked milestones.
  6. `weighted`: Component sub-goals or milestones with custom percentage weights summing to 100%.
- **Analytics Engine (`analytics-engine.ts`) & Dashboard (`DashboardPage.tsx`)**:
  - Time distribution by Area, Goal, and Project.
  - Planned vs Scheduled vs Actual time comparative bar charts.
  - Deadline reliability rates, overdue tasks, capacity utilization trends.
  - Clean edge-case handling (zero division protection, no `NaN` or crashes on empty datasets).

### Stage 11 — Templates, Onboarding Wizard & Demo Data
- **Built-in Blueprints**:
  - Shipped with production-ready JSON templates: **Study Blueprint**, **Fitness Blueprint**, **Spaced Review Blueprint**, **Freelance Project Blueprint**.
- **Template Engine (`template-service.ts`)**:
  - Safe entity application with deduplication toggle (`skipDuplicates`).
  - Custom Template Creator: Package active workspace entities into reusable custom templates.
- **One-Click Demo Sandbox (`demo-service.ts`)**:
  - Injects comprehensive sample data labeled with `[Demo]`.
  - Clean one-click purge without leaving orphan records.
- **Onboarding Wizard (`OnboardingWizard.tsx`)**:
  - First-run guided flow: Language & regional formatting, Life Area selection, Planning capacity & reality buffer setup.

### Stage 12 — Advanced Flow View, Global Search & System Polish
- **Weekly Review Cockpit (`WeeklyReviewPage.tsx`)**:
  - Periodic analytical wrap-up: Completion rates, time breakdown, habit streaks, and neutral "friction signals" (overruns, missed deadlines, reschedules) with zero guilt-inducing language.
- **Customizable Widget Dashboard**:
  - Reorder and toggle visibility of dashboard cards with persistent layout state in local storage.
- **Visual Hierarchy Flow Graph (`FlowViewPage.tsx`)**:
  - Interactive multi-column cascade mapping `Areas → Goals → Milestones → Projects → Work Items` with active bidirectional click filtering.
- **Global Cross-Entity Search (`Ctrl+F`)**:
  - Instant fuzzy search across all entities (Areas, Goals, Milestones, Projects, Tasks, Tags, Notes, Resources, Routines, Habits).
- **Keyboard-First Navigation**:
  - Dedicated shortcuts modal (`?` or `Ctrl+/`), numerical jumps (`1` Dashboard, `2` Today, `3` Inbox, `4` Planner, `5` Analytics, `6` Goals, `7` Projects, `8` Weekly Review, `9` Settings).
- **Automated Daily Rolling Backups**:
  - Silent daily backup scheduler retaining rolling 7-day database snapshots in local storage.

---

## 5. Database Schema Summary (Drizzle ORM)

The SQLite database comprises **28 tables** managed through 11 migrations (`0000_foundation` through `0010_templates_and_onboarding`):

```sql
-- Settings & Configuration
settings (id, locale, theme, week_starts_on, timezone, use_24h, planning_capacity_pct, buffer_pct, onboarding_done, demo_mode)
profiles (id, display_name, created_at)

-- Core Hierarchy
areas (id, name, description, color, archived, created_at, updated_at)
goals (id, area_id, name, description, status, target_date, progress_mode, manual_progress, created_at, updated_at)
goal_metrics (id, goal_id, name, unit, current_value, target_value)
milestones (id, goal_id, title, target_date, completed, weight_pct)
projects (id, goal_id, area_id, name, description, status, target_date, completed_minutes, created_at, updated_at)
work_item_types (id, name, color, is_builtin, created_at)
custom_field_definitions (id, work_item_type_id, name, field_type, options_json)
work_items (id, project_id, milestone_id, work_item_type_id, title, description, status, estimated_minutes, actual_minutes, deadline, preferred_date, priority, flexibility, energy_level, review_policy_id, next_review_at, review_count, archived)
custom_field_values (id, work_item_id, field_def_id, value_json)
work_item_dependencies (id, prerequisite_id, dependent_id)

-- Metadata & Notes
tags (id, name, color)
entity_tags (id, entity_type, entity_id, tag_id)
notes (id, entity_type, entity_id, content, created_at)

-- Resources & Learning
resources (id, title, description, resource_type, ordering_mode)
resource_items (id, resource_id, work_item_id, title, estimated_minutes, actual_minutes, status, sort_order, review_policy_id, next_review_at)

-- Time Model & Scheduling
availability_rules (id, day_of_week, start_time, end_time, is_active)
availability_overrides (id, date, start_time, end_time, is_off_day, notes)
fixed_events (id, title, date, start_time, end_time, rrule)
time_budgets (id, name, area_id, goal_id, project_id, type_id, allocation_mode, protection, min_minutes, target_minutes, max_minutes, days_of_week)
routines (id, name, preferred_time, duration_minutes, rrule)
habits (id, name, target_times_per_day, unit)
habit_logs (id, habit_id, date, count)
scheduled_items (id, work_item_id, title, date, start_time, end_time, duration_minutes, session_index, total_sessions, is_split, locked, reason)

-- Execution, Review & History
time_sessions (id, work_item_id, start_time, end_time, duration_minutes, paused_duration_minutes, notes)
review_policies (id, name, interval_days, shorten_on_weak)
review_events (id, work_item_id, resource_item_id, policy_id, recall_quality, reviewed_at, duration_minutes, notes)
replanning_history (id, target_date, trigger, diff_json, created_at)
plan_versions (id, target_date, version_number, snapshot_json, created_at)
progress_history (id, entity_type, entity_id, progress, notes, recorded_at)
templates (id, name, description, category, builtin, payload_json, created_at, updated_at)
```

---

## 6. IPC Channel Architecture (API Contract)

All communication between Renderer and Electron Main process passes through strongly typed, Zod-validated IPC channels:

| Module | IPC Channels |
|---|---|
| **Settings** | `settings:get`, `settings:update` |
| **Entities** | `areas:*`, `goals:*`, `milestones:*`, `projects:*`, `work-items:*`, `work-item-types:*`, `custom-field-defs:*`, `custom-field-values:*`, `tags:*`, `notes:*`, `entities:archive`, `entities:restore`, `entities:delete` |
| **Resources** | `resources:list`, `resources:get`, `resources:create`, `resources:update`, `resources:duplicate`, `resource-items:list`, `resource-items:create`, `resource-items:update`, `resource-items:bulk-add`, `resource-items:reorder`, `resource-items:link-work-item`, `dependencies:*` |
| **Time Model** | `availability-rules:*`, `availability-overrides:*`, `fixed-events:*`, `time-budgets:*`, `capacity:calculate`, `routines:*`, `habits:*`, `habits:log`, `habits:list-logs` |
| **Scheduler** | `planning:generate-week`, `planning:get-schedule`, `planning:clear-schedule`, `planning:update-schedule-item`, `planning:create-schedule-item`, `planning:delete-schedule-item` |
| **Replanning** | `replanning:preview`, `replanning:apply`, `replanning:undo`, `replanning:get-history`, `replanning:get-versions` |
| **Execution** | `timer:get-state`, `timer:start`, `timer:pause`, `timer:resume`, `timer:stop`, `timer:complete`, `timer:add-time`, `sessions:list`, `sessions:create`, `sessions:update`, `sessions:delete`, `accuracy:get-for-work-item`, `accuracy:get-overall` |
| **Review** | `review-policies:*`, `review:attach`, `review:detach`, `review-events:record`, `review-events:list`, `review:get-due`, `review:sync-to-planner` |
| **Analytics** | `progress:get-goal`, `progress:record-snapshot`, `progress:get-history`, `goal-metrics:*`, `analytics:get-overview`, `dashboard:get-data`, `weekly-review:generate` |
| **Templates** | `templates:list`, `templates:apply`, `templates:save-custom`, `templates:delete`, `templates:export-json`, `templates:import-json`, `demo:load`, `demo:delete` |
| **Search & Window** | `search:global`, `backup:export-json`, `backup:restore`, `backup:create-db`, `window:minimize`, `window:maximize`, `window:close`, `window:is-maximized` |

---

## 7. Current Project Quality & Verification Status

- **Type Safety**: Full strict TypeScript configuration. **0 TypeScript errors** (`npm run typecheck` passes with exit code 0).
- **Unit & Integration Tests**: **146 / 146 tests passing across 20 test files** (`vitest run` passes with exit code 0).
- **Build Verification**: Production build compiles in ~4.8 seconds (`electron-vite build` outputs clean bundles for main, preload, and renderer).
- **Runtime Performance**: Lightweight native startup, instant SQLite read/write operations via synchronous better-sqlite3 calls on the main thread, and zero network latency.

---

## 8. Strategic Questions & Consultation Topics for ChatGPT

When sharing this document with ChatGPT, recommended discussion topics include:

1. **Architectural Evaluation**:
   - *How does this architecture compare to leading local-first productivity apps (e.g., Obsidian, Logseq, Superhuman)?*
   - *Are there any hidden bottlenecks in running synchronous SQLite queries inside Electron's main process for larger datasets (e.g., 50,000+ items)?*
2. **Deterministic Scheduler Optimization**:
   - *Can the deterministic constraint satisfaction algorithm be enhanced with constraint satisfaction problem (CSP) solvers or interval tree indexing without sacrificing deterministic predictability?*
3. **Data Sync & Multi-Device Strategy**:
   - *What is the cleanest architectural pattern to introduce optional multi-device synchronization (e.g., CRDTs like Yjs, ElectricSQL, or CouchDB/PouchDB) without compromising the local SQLite performance?*
4. **AI & LLM Integration Points**:
   - *Where can local or API-based LLMs (e.g., Ollama or Gemini) provide high-value, non-intrusive assistance (e.g., natural language task decomposition, automated weekly review synthesis, adaptive schedule advisory)?*
5. **UX & Product-Market Fit**:
   - *What feature or onboarding adjustments would make this app compelling for power users (developers, students, freelancers) transitioning from tools like Notion, TickTick, or Motion?*
