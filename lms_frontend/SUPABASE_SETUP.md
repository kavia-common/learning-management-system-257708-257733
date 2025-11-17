# Supabase setup (frontend notes, PKCE)

This frontend uses Supabase PKCE OAuth flow with Supabase’s public anon key and project URL provided via environment variables. The anon key is intended to be exposed in client-side apps when Row Level Security (RLS) is enabled.

Required tables (unchanged):
- profiles (id uuid PK, email text, role text, created_at timestamptz default now())
- learning_paths (id, name, description, external_url, created_at)
- courses (id, learning_path_id -> learning_paths.id, title, sequence, url, created_at)
- enrollments (user_id -> profiles.id, learning_path_id -> learning_paths.id, created_at, PK (user_id, learning_path_id))
- course_progress (user_id, course_id, percent_complete, started_at, completed_at, PK (user_id, course_id))

Minimal RLS (example):
- profiles: enable RLS; allow user to select/update own row (id = auth.uid()).
- enrollments: enable RLS; allow user to manage rows where user_id = auth.uid().
- course_progress: enable RLS; allow user to manage rows where user_id = auth.uid().
- learning_paths, courses: readable by authenticated users.

Environment variables (client):
- REACT_APP_SUPABASE_URL = https://<your-project-ref>.supabase.co
- REACT_APP_SUPABASE_KEY = <your anon/public key>

These are required for the browser Supabase client to function (including PKCE). The keys are public and safe in the browser with proper RLS policies.

PKCE configuration in Supabase Dashboard:
1) Go to Authentication → URL Configuration
   - Site URL: set to your frontend origin, e.g., http://localhost:3000 (or your preview/prod URL)
   - Additional Redirect URLs:
     - http://localhost:3000/auth/callback
     - https://<your-domain>/auth/callback
   - Save changes.
2) Providers (Authentication → Providers):
   - Enable your desired OAuth providers (e.g., Google, GitHub, Microsoft).
   - Add the provider credentials (Client ID/Secret).
   - Set the authorized redirect URL(s) at the provider to match:
     - https://<your-domain>/auth/callback
     - http://localhost:3000/auth/callback (for local dev)
3) Anon key usage (public):
   - The frontend supplies SUPABASE_URL and SUPABASE_KEY (anon/public) at runtime via env vars.
   - This is required by supabase-js; do not use service keys in the client.
4) Email/Password (optional):
   - If you also enable email/password, the app still supports signInWithPassword, but PKCE OAuth is the primary flow.

Frontend routes involved:
- /login → starts OAuth sign-in (default: Google) using PKCE.
- /auth/callback → exchanges the authorization code for a session.
- /dashboard → protected Employee dashboard (requires session).

Notes:
- Session is persisted in the browser; token auto-refresh is enabled.
- No secrets are logged (anon key is public and not a secret).
- If sign-in fails, users are redirected back to /login with a basic message.

Troubleshooting:
- If redirect loop occurs, verify Site URL and Redirect URLs match the actual origin exactly (protocol, host, port).
- Ensure the OAuth provider’s console also includes the same redirect URL.
- Check browser console for any Supabase auth errors during callback.

Healthcheck (developer aid):
- A lightweight dev-only healthcheck runs on app mount (console-only) via src/health/supabaseHealthcheck.js.
- It calls supabase.auth.getSession and a minimal select from 'learning_paths' to verify connectivity.
- This does not log secrets; intended for local diagnostics.

.env.example (place in project root of lms_frontend and copy to .env):
```
# PUBLIC Supabase values (safe to expose with RLS enabled)
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_KEY=eyJhbGciOi...<anon-key>...
# Optional other frontend settings
REACT_APP_FRONTEND_URL=http://localhost:3000
```
