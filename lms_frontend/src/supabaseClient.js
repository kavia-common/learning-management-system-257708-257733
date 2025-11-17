import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client initialization using environment variables.
 * Ensure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set in your environment.
 *
 * Security note: Never hardcode secrets. Use environment variables and secret management.
 */
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Basic guard to help DX during development; production environments should provide env vars.
if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase environment variables are not set. Please configure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your environment.'
  );
}

// PUBLIC_INTERFACE
/**
 * Returns a configured Supabase client instance for app-wide use.
 * @returns {import('@supabase/supabase-js').SupabaseClient} Supabase client
 */
const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export default supabase;
