import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client initialization using environment variables.
 * Ensure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set in your environment.
 *
 * Security note: Never hardcode secrets. Use environment variables and secret management.
 */
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Developer guidance to help map non-React var names to CRA-compatible ones
if (process.env.NODE_ENV === 'development') {
  if (!supabaseUrl || !supabaseAnonKey) {
    // eslint-disable-next-line no-console
    console.warn(
      'Supabase vars missing. React requires REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY. ' +
        'If your pipeline provides SUPABASE_URL/SUPABASE_KEY, map them at build time to the REACT_APP_* equivalents.'
    );
  }
}

// PUBLIC_INTERFACE
/**
 * Returns a configured Supabase client instance for app-wide use.
 * @returns {import('@supabase/supabase-js').SupabaseClient} Supabase client
 */
const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export default supabase;
