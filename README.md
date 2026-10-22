# Dots

A calm, adaptive personal planning and scheduling platform designed to handle real-life changes without schedule collapse.

## Architecture Overview

The system consists of four primary components:

- **Desktop Application (`src/main`, `src/renderer`)**: Local-first Electron application with SQLite, offline storage, bilingual support (English/Arabic RTL), and deterministic local scheduling.
- **Scheduling Engine (`src/main/scheduler`, `src/engine`)**: Allocation algorithms, capacity constraints, dependency management, buffer calculations, and automated replanning.
- **Web Platform (`landing_page`)**: React, Vite, and Tailwind CSS web application featuring user onboarding, living schedule visualization, and Supabase Authentication.
- **Telegram Integration (`src/integration/telegram`, `supabase/functions`)**: Bi-directional Telegram bot for capturing quick tasks, approving schedule proposals, and receiving daily updates.

## Project Structure

```text
├── drizzle/                  # Database migration schemas
├── landing_page/             # Web application & marketing platform (React/Vite)
│   ├── src/                  # Web app source code
│   └── public/               # Static web assets
├── src/
│   ├── engine/               # Core scheduling and allocation logic
│   ├── integration/          # Supabase and Telegram integrations
│   ├── main/                 # Electron main process, SQLite db, background services
│   ├── renderer/             # Desktop UI components and pages
│   └── shared/               # Shared types, math utilities, and interfaces
├── supabase/                 # Supabase configuration, migrations, and edge functions
└── tests/                    # Vitest unit and integration test suite
```

## Setup & Development

### Prerequisites

- Node.js 20+
- npm 10+

### Environment Configuration

1. Copy `.env.example` to `.env` in the root directory:
   ```bash
   cp .env.example .env
   ```
2. Configure required keys:
   - `SUPABASE_URL` and `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-side only)
   - `TELEGRAM_BOT_TOKEN` and `TELEGRAM_WEBHOOK_SECRET`

3. For the web application, copy `landing_page/.env.example` to `landing_page/.env`:
   ```bash
   cp landing_page/.env.example landing_page/.env
   ```

### Running the Applications

#### Desktop App
```bash
npm install
npm run dev
```

#### Web Platform
```bash
cd landing_page
npm install
npm run dev
```

### Testing & Verification

Run the test suite across the scheduling engine, Telegram bot, and services:
```bash
npm test
```

Typecheck the projects:
```bash
npm run typecheck
npm run typecheck --prefix landing_page
```

Build the web platform:
```bash
npm run build --prefix landing_page
```

## Security & Privacy

- Secret keys, tokens, and credentials must never be committed to version control.
- Client-facing applications use only publishable keys (`VITE_SUPABASE_ANON_KEY`).
- Server-side administrative operations and webhooks use `SUPABASE_SERVICE_ROLE_KEY`.
