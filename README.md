# Clarity Planner

Local-first desktop planning application. Stage 1 supplies the secure Electron foundation, local SQLite settings, bilingual RTL-ready shell, and design system base.

## Setup

Install Node.js 20+ and run:

```powershell
npm install
npm run rebuild:electron
npm run dev
```

Use `npm run rebuild:node` when running native-module tooling under Node rather than Electron. Run `npm run typecheck` and `npm test` before changes are merged.

The database is stored under Electron's per-user data directory; it is never accessed by the renderer process.
