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

Environment variables (in .env):
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_ANON_KEY
- REACT_APP_FRONTEND_URL (used for emailRedirectTo on sign up)

Note: This container's environment list may include REACT_APP_SUPABASE_KEY instead of REACT_APP_SUPABASE_ANON_KEY.
The app prefers REACT_APP_SUPABASE_ANON_KEY. If your CI only provides REACT_APP_SUPABASE_KEY,
map it to REACT_APP_SUPABASE_ANON_KEY at build time, or set both with the same value.

Mapping note for React (Create React App):
- CRA only exposes env vars prefixed with REACT_APP_ to the client bundle.
- If your CI/CD or secrets manager provides SUPABASE_URL and SUPABASE_KEY (common naming),
  ensure they are mapped to:
    - REACT_APP_SUPABASE_URL="${SUPABASE_URL}"
    - REACT_APP_SUPABASE_ANON_KEY="${SUPABASE_KEY}"
  at build time (e.g., in your pipeline step or Dockerfile).

Troubleshooting: Missing anon key / URL
- Symptom: "supabaseKey is required." or an error thrown from src/supabaseClient.js about missing variables.
- Cause: REACT_APP_SUPABASE_* are not set at build time; CRA strips non-REACT_APP_* from the client bundle.
- Fix:
  1) Ensure these are set before `npm start` / `npm run build`:
     export REACT_APP_SUPABASE_URL="$SUPABASE_URL"
     export REACT_APP_SUPABASE_ANON_KEY="$SUPABASE_KEY"
  2) Or put them in a .env (do NOT commit real secrets) using .env.example as reference.
  3) Rebuild/restart the app.
- Dev hint: In development, the console logs presence booleans (never values) for these env vars to help diagnose.

Security note:
- We never log secrets. Only presence is logged in development.
- Never commit real keys to the repo. Use environment configuration/secrets management service.

Healthcheck (developer aid):
- A lightweight dev-only healthcheck runs on app mount (console-only) via src/health/supabaseHealthcheck.js.
- It calls supabase.auth.getSession and a minimal select from 'learning_paths' to verify connectivity.
- This is non-blocking and logs to the dev console for quick diagnostics.
