# Dots — Phase 1 Implementation Note: Architecture, Findings & Extraction Boundaries

## 1. Actual Inspection Findings

### Codebase Organization & State
- **Scheduler Core (`src/main/scheduler/`)**:
  - The scheduling engine consists of 9 pure TypeScript files:
    - `types.ts`: Core data structures (`PlanningInput`, `ReplanningInput`, `ScheduleItem`, `DayCapacityInfo`, etc.).
    - `capacity/`: Day capacity calculation with 75% planning capacity and 20% reality buffer.
    - `constraints/`: Free interval calculation and next-available-slot search.
    - `dependencies/`: Dependency DAG checks (Decision A5 Hard Constraint).
    - `scoring/`: Deterministic item scoring based on priority, deadline proximity, and order index.
    - `allocation/`: Session splitting (`maxSessionMinutes`, `minSessionMinutes`) and time budget displacement.
    - `explanations.ts`: Human-readable explanation generation for scheduling decisions.
    - `scheduling.ts`: The primary week/day scheduler (`schedule(input)`).
    - `replanning.ts`: Real-time schedule repair (`replan(input)`), preserving past and locked events, shifting flexible items, and generating before/after diffs (`ReplanningChange[]`).
  - **Critical Finding**: `src/main/scheduler/` is **already 100% pure TypeScript** with ZERO imports from Electron, SQLite, React, or Drizzle ORM. It operates purely on in-memory domain inputs.

- **Storage & Desktop Coupling Layer (`src/main/services/`)**:
  - `planning-service.ts` and `replanning-service.ts` query local SQLite using `better-sqlite3` and `drizzle-orm`, convert relational rows into `PlanningInput` / `ReplanningInput`, call `schedule()` / `replan()`, and write resulting items to `scheduled_items`, `plan_versions`, and `replanning_history`.
  - Electron IPC (`src/preload/index.ts`, `src/shared/ipc.ts`) wires these services to the React renderer.

- **Test Suite Status**:
  - All 20 test files and 146 tests in `tests/` pass cleanly with Vitest.
  - Pure algorithmic tests (`tests/capacity.test.ts`, `tests/scheduler.test.ts`, `tests/replanning.test.ts`) test the scheduling logic directly without SQLite.

---

## 2. Proposed Module Boundaries & Extraction Strategy

We will establish an isolated, isomorphic core package: **`src/engine/`** (Dots Core Engine).

### Module Architecture:
```
src/engine/
├── index.ts                  # Public entry point exposing all engine functions and types
├── types.ts                  # Unified engine types (ScheduleItem, DayCapacity, Diff, etc.)
├── capacity.ts               # Reality capacity calculations & buffer limits (75% / 20%)
├── constraints.ts            # Slot search, interval math, fixed event avoidance
├── scoring.ts                # Deterministic prioritization & order index ranking
├── allocation.ts             # Session splitting & session duration math
├── dependencies.ts           # Topological dependency verification
├── explanations.ts           # Human-readable explanation generator
├── scheduler.ts              # Deterministic multi-day/weekly schedule generator
├── replanner.ts              # Real-time schedule repair & diff engine
└── contracts/                # Integration contracts for external callers (Telegram, UI, MCP)
    ├── index.ts
    ├── task-capture.ts       # Validated task ingestion schema (Zod)
    ├── schedule-proposal.ts  # Proposal lifecycle (create proposal, diff, approve/reject/stale)
    └── schedule-store.ts     # Abstract schedule repository interface (In-memory & DB adapters)
```

### Key Architectural Safeguards:
1. **Zero Native Bindings**: `src/engine/` must only depend on pure TypeScript (and Zod for runtime schema validation). No `better-sqlite3`, no Electron, no Node-only binaries.
2. **Backward Compatibility**: `src/main/scheduler/index.ts` will re-export directly from `src/engine/` so all existing tests and Electron services continue to function without any breaking changes.
3. **Determinism Guaranteed**: `schedule()` and `replan()` take explicit `nowDate` and `currentTime` inputs. Given identical state, they yield identical schedule slots.

---

## 3. Risks & Mitigations

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| **Breaking existing Electron app or 146 tests** | Regression in local app | Maintain full backward compatibility in `src/main/scheduler/index.ts`. Run Vitest on all 20 test suites on every change. |
| **Concurrency & Stale Proposals** | Race condition if user delays approving a proposal while schedule state changes | The proposal interface must track `baseScheduleVersion` or `timestamp`. If current schedule changes before approval, proposal transitions to `stale`. |
| **Overwriting working legacy rules** | Subtle scheduling bugs | Port exact algorithmic logic from `src/main/scheduler/` without modifying scoring constants or slot search heuristics. |
