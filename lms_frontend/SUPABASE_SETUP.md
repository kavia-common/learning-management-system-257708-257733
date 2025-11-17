# Supabase setup (frontend notes)

This app expects the following tables in your Supabase project:

- profiles
  - id (uuid) PRIMARY KEY, references auth.users.id
  - email (text)
  - role (text) -- e.g., 'employee' or 'admin'
  - created_at (timestamptz) default now()

- learning_paths
  - id (uuid) PRIMARY KEY (or bigint)
  - name (text)
  - description (text)
  - external_url (text)
  - created_at timestamptz default now()

- courses
  - id (uuid) PRIMARY KEY (or bigint)
  - learning_path_id (uuid/bigint) REFERENCES learning_paths(id)
  - title (text)
  - sequence (int)
  - url (text)
  - created_at timestamptz default now()

- enrollments
  - user_id (uuid) REFERENCES profiles(id)
  - learning_path_id (uuid/bigint) REFERENCES learning_paths(id)
  - created_at timestamptz default now()
  - PRIMARY KEY (user_id, learning_path_id)

- course_progress
  - user_id (uuid) REFERENCES profiles(id)
  - course_id (uuid/bigint) REFERENCES courses(id)
  - percent_complete (int) default 0
  - started_at timestamptz
  - completed_at timestamptz
  - PRIMARY KEY (user_id, course_id)

Minimal RLS policies (adjust for your needs):

- profiles: enable RLS.
  - Allow a user to select their own profile: (id = auth.uid()).
  - Allow admin service role to manage as needed.
- enrollments: enable RLS.
  - Allow user to manage rows where user_id = auth.uid().
- course_progress: enable RLS.
  - Allow user to manage rows where user_id = auth.uid().
- learning_paths, courses: read for all authenticated users.

Environment variables (for frontend build):
- SUPABASE_URL (required)
- SUPABASE_KEY (required)
- REACT_APP_FRONTEND_URL (optional; used for emailRedirectTo on sign up)

Important:
- The frontend now reads SUPABASE_URL and SUPABASE_KEY directly at build time.
- Do not provide or use an "anon" key variable name. Only SUPABASE_KEY is expected.

Troubleshooting: Missing SUPABASE_URL/SUPABASE_KEY
- Symptom: Error "Supabase configuration is missing (SUPABASE_URL/SUPABASE_KEY)."
- Cause: SUPABASE_URL and/or SUPABASE_KEY are not set in the environment at build/start.
- Fix:
  1) Ensure these are set before `npm start` / `npm run build`:
     export SUPABASE_URL="https://<your-project>.supabase.co"
     export SUPABASE_KEY="<your-public-key>"
  2) Or create a local .env (do NOT commit real secrets) using .env.example as reference.
  3) Rebuild/restart the app.
- Dev hint: In development, the console logs presence booleans (never values) for SUPABASE_URL/SUPABASE_KEY.

Security note:
- We never log secrets. Only presence is logged in development.
- Never commit real keys to the repo. Use environment configuration/secrets management service.

Healthcheck (developer aid):
- A lightweight dev-only healthcheck runs on app mount (console-only) via src/health/supabaseHealthcheck.js.
- It calls supabase.auth.getSession and a minimal select from 'learning_paths' to verify connectivity.
- This is non-blocking and logs to the dev console for quick diagnostics.
