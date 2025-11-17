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

Never commit secrets to the repo. Configure these in your deployment environment.
