# Project state

## Completed stages

- Stage 1 — Foundation. Verified source includes secure Electron, Drizzle/SQLite migration infrastructure, typed and Zod-validated settings IPC, English/Arabic RTL-ready renderer shell, Tailwind configuration, and migration idempotence coverage. The sandboxed preload contains no third-party runtime imports; it exposes the `planner` bridge using Electron APIs only.

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

Migration `0000_foundation` creates `settings` with UUID `id`, locale, theme, week-start, timezone, 24-hour preference, and UTC-millisecond audit fields. The pure `runMigrations(database, folder)` runner is idempotent; the application wrapper supplies Electron's data location.

## IPC channels

- `settings:get`: payload `undefined`, returns `Settings`.
- `settings:update`: partial settings payload, Zod-validated in main, returns `Settings`.

## Known limitations

- No domain entities have been started; those remain Stage 2.

## Next stage

Stage 2 — core entities, only when explicitly requested.
