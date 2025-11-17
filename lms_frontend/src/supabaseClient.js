import { createBrowserClient } from '@supabase/ssr';

/**
 * PUBLIC_INTERFACE
 * Returns a configured Supabase browser client for PKCE auth flow.
 * - No URL or anon key is embedded in the client code.
 * - Supabase Dashboard must be configured with Site URL and Redirect URLs.
 */
const supabase = createBrowserClient(
  '', // URL resolved by Supabase via PKCE when using Auth providers and deep links
  '', // Key not required for PKCE in the browser; do not provide anon key
  {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: true,
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);

export default supabase;
