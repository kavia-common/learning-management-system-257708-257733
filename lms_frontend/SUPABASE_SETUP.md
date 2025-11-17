# Supabase setup (frontend notes, Email/Password only)

This frontend uses Supabase email/password authentication. OAuth/PKCE is removed. The app provides a single auth entry point at /signin where users can:
- Sign in with email/password
- Sign up with email/password and select a role (employee or admin)
  - On sign-up, the app upserts the user's role into the profiles table.

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

These are required for the browser Supabase client. The anon key is public and safe in the browser with proper RLS policies.

Email/Password configuration in Supabase Dashboard:
1) Authentication → Providers → Email
   - Enable "Email" provider.
   - Decide whether email confirmations are required.
     - If confirmations are required, users will need to confirm via email before getting a session.
2) Authentication → URL Configuration
   - Set "Site URL" to your frontend origin, e.g., http://localhost:3000 (or your preview/prod URL).
   - Email confirmation redirect is handled by Supabase automatically; the app's auth screen is at /signin.

Frontend routes involved:
- /signin → Sign up or sign in with email/password only.
- (The previous /login and /auth/callback routes for OAuth are removed.)

Notes:
- Session is persisted in the browser; token auto-refresh is enabled.
- No secrets are logged (anon key is public and not a secret).

Troubleshooting:
- If sign-in fails, check browser console for any Supabase auth errors.
- Ensure the Email provider is enabled in Supabase.
- Verify RLS policies match the intended behavior.

.env.example (place in project root of lms_frontend and copy to .env):
```
# PUBLIC Supabase values (safe to expose with RLS enabled)
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_KEY=eyJhbGciOi...<anon-key>...
# Optional other frontend settings
REACT_APP_FRONTEND_URL=http://localhost:3000
```
