import { createClient } from '@supabase/supabase-js';

/**
 * PUBLIC_INTERFACE
 * getSupabaseClient initializes and returns a configured Supabase client instance.
 *
 * New configuration (build-time):
 * - SUPABASE_URL
 * - SUPABASE_KEY
 *
 * Notes:
 * - We never log secrets. Only presence (boolean) may be checked in dev, without printing values.
 */
function resolveSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;

  // Optional: dev-only presence log (no values)
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('[Supabase] Env presence:', {
      SUPABASE_URL_present: Boolean(url),
      SUPABASE_KEY_present: Boolean(key),
    });
  }

  if (!url || !key) {
    // Concise error per requirement
    throw new Error('Supabase configuration is missing (SUPABASE_URL/SUPABASE_KEY).');
  }

  return { url, key };
}

// PUBLIC_INTERFACE
/**
 * Returns a configured Supabase client instance for app-wide use.
 * @returns {import('@supabase/supabase-js').SupabaseClient} Supabase client
 */
const { url: supabaseUrl, key: supabaseKey } = resolveSupabaseConfig();
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
