import { createBrowserClient } from '@supabase/ssr';

/**
 * PUBLIC_INTERFACE
 * Returns a configured Supabase browser client for PKCE auth flow.
 *
 * Notes:
 * - Supabase client in the browser STILL requires the project's public anon key and URL.
 *   The anon key is safe to expose in the client when Row Level Security (RLS) is enabled.
 * - PKCE controls the OAuth flow and token handling, not the need for anon key.
 * - Configure the following env vars in the frontend:
 *   - REACT_APP_SUPABASE_URL
 *   - REACT_APP_SUPABASE_KEY (anon/public key)
 */
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_KEY;

// In development, provide a gentle console warning if misconfigured
if (process.env.NODE_ENV === 'development') {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    // eslint-disable-next-line no-console
    console.warn(
      '[Supabase] Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_KEY. Set these in your .env file. ' +
        'Auth and DB calls will fail until configured.'
    );
  }
}

const supabase = createBrowserClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '', {
  auth: {
    flowType: 'pkce',
    detectSessionInUrl: true,
    autoRefreshToken: true,
    persistSession: true,
  },
});

export default supabase;
