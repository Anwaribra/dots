# Clarity Planner

Local-first desktop planning application. Stage 1 supplies the secure Electron foundation, local SQLite settings, bilingual RTL-ready shell, and design system base.

## Setup

Install Node.js 20+ and run:

```powershell
npm install
npm run dev
```

`npm run dev` runs `predev`, which rebuilds `better-sqlite3` for Electron before opening the desktop window. `npm test` runs `pretest`, which rebuilds it for plain Node before Vitest starts. You can also run `npm run rebuild:electron` or `npm run rebuild:node` directly after changing Electron or Node versions. Run `npm run typecheck` and `npm test` before changes are merged.

The database is stored under Electron's per-user data directory; it is never accessed by the renderer process.
