# LMS Frontend (React) — Ocean Professional

Modern LMS front-end with Supabase auth, feature flags, env-driven API client, and responsive dashboards.

## What’s included

- App shell with top navigation and a modular sidebar layout
- Routes: Dashboard, Courses, Assignments, Profile, Admin Dashboard, Healthcheck
- API client: env-based base URL, retries, and basic error handling (`src/lib/apiClient.js`)
- Feature flags: reads `REACT_APP_FEATURE_FLAGS` and `REACT_APP_EXPERIMENTS_ENABLED` (`src/lib/featureFlags.js`)
- Logging utility honoring `REACT_APP_LOG_LEVEL` (`src/lib/logger.js`)
- Ocean Professional theme in `src/styles/theme.css`
- Accessible components: `CourseCard`, `AssignmentCard`
- Healthcheck page mounted at `REACT_APP_HEALTHCHECK_PATH` or `/health`

## Getting Started

1) Install dependencies
- npm install

2) Configure environment
- Copy `.env.example` to `.env` and set values for your environment.

3) Start the app
- npm start
- Visit http://localhost:3000

## Environment variables

These are read at build time. Do not commit secrets.

- REACT_APP_API_BASE: Base URL for backend API (preferred)
- REACT_APP_BACKEND_URL: Fallback base URL for backend API
- REACT_APP_FRONTEND_URL: Frontend origin (used for Supabase email redirects)
- REACT_APP_WS_URL: Optional WebSocket URL (future use)
- REACT_APP_NODE_ENV: Optional app env indicator; falls back to NODE_ENV
- REACT_APP_NEXT_TELEMETRY_DISABLED: Optional flag, defaults respected if set
- REACT_APP_ENABLE_SOURCE_MAPS: Optional boolean flag
- REACT_APP_PORT: Optional dev server port override
- REACT_APP_TRUST_PROXY: Optional bool for proxy-aware deployments
- REACT_APP_LOG_LEVEL: debug|info|warn|error (default: info)
- REACT_APP_HEALTHCHECK_PATH: Health route path (default: /health)
- REACT_APP_FEATURE_FLAGS: JSON or comma-separated flags (e.g., `{"reports":true}` or `reports:true`)
- REACT_APP_EXPERIMENTS_ENABLED: true|false
- REACT_APP_SUPABASE_URL: Supabase URL (public)
- REACT_APP_SUPABASE_KEY: Supabase anon key (public, safe with RLS)

Supabase notes: see SUPABASE_SETUP.md.

## Security & Compliance

- No hardcoded secrets. Use environment variables.
- Avoid logging PII; logger sanitizes common secret fields.
- Input validation and defensive error handling applied on forms and API client.
- Network communications should be HTTPS in production.

## Project Structure (key files)

- src/lib/apiClient.js — Fetch wrapper with retries and stubs
- src/lib/featureFlags.js — Feature flag utilities
- src/lib/logger.js — Log utility using REACT_APP_LOG_LEVEL
- src/components/layout/SidebarLayout.js — Sidebar wrapper
- src/pages/CoursesPage.js — Courses grid
- src/pages/AssignmentsPage.js — Assignments grid
- src/pages/ProfilePage.js — Profile details
- src/pages/HealthcheckPage.js — Health endpoint UI
- src/routes/AppRoutes.js — Route table and health route
- src/styles/theme.css — Ocean Professional theme

## Healthcheck

Expose a simple health page under:
- Path: value of REACT_APP_HEALTHCHECK_PATH, else `/health`
- Returns a minimal OK status with environment info useful for probes

## Feature Flags

- Provide flags via REACT_APP_FEATURE_FLAGS as JSON or `k:v` pairs.
- Example: `REACT_APP_FEATURE_FLAGS='{"reports":true}'`
- Experiments master switch: `REACT_APP_EXPERIMENTS_ENABLED=true`

## Authorization notes

- Supabase auth with email/password; role is stored in `profiles.role`.
- Protected routes wait briefly for role resolution to avoid false "Unauthorized".

## Build and Test

- npm run build — production build
- npm test — runs tests

