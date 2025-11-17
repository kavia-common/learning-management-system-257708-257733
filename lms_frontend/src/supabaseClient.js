import { createClient } from '@supabase/supabase-js';

/**
 * PUBLIC_INTERFACE
 * getSupabaseClient initializes and returns a configured Supabase client instance.
 * 
 * Env var resolution order (Create React App build-time variables only):
 * 1. REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY
 * 2. If not present, try SUPABASE_URL and SUPABASE_KEY (fallback mapping), with a console.warn so CI/CD can fix mapping.
 *
 * Notes:
 * - CRA only exposes variables prefixed with REACT_APP_ to the client at build time.
 * - We never log secrets. In development we only log the presence/absence of variables.
 */
function resolveSupabaseConfig() {
  const reactUrl = process.env.REACT_APP_SUPABASE_URL;
  const reactAnon = process.env.REACT_APP_SUPABASE_ANON_KEY;

  let url = reactUrl;
  let anonKey = reactAnon;
  let usedFallback = false;

  if (!url || !anonKey) {
    // Fallback to commonly used unprefixed names if present in the environment at build-time
    const fallbackUrl = process.env.SUPABASE_URL;
    const fallbackKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!url && fallbackUrl) {
      url = fallbackUrl;
      usedFallback = true;
    }
    if (!anonKey && fallbackKey) {
      anonKey = fallbackKey;
      usedFallback = true;
    }

    if (usedFallback) {
      // eslint-disable-next-line no-console
      console.warn(
        '[Supabase] Using fallback env vars (SUPABASE_URL / SUPABASE_KEY). ' +
        'For Create React App builds, map them to REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY at build time.'
      );
    }
  }

  // Development diagnostics: log only presence, never values
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('[Supabase] Env presence:', {
      REACT_APP_SUPABASE_URL: !!reactUrl,
      REACT_APP_SUPABASE_ANON_KEY: !!(reactAnon && reactAnon.length > 0),
      SUPABASE_URL_present: !!process.env.SUPABASE_URL,
      SUPABASE_KEY_present: !!(process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY),
      usedFallback,
    });
  }

  // Explicit invariant checks with actionable guidance
  const missing = [];
  if (!url) missing.push('REACT_APP_SUPABASE_URL');
  if (!anonKey) missing.push('REACT_APP_SUPABASE_ANON_KEY');

  if (missing.length > 0) {
    const guidance =
      'Supabase configuration is missing. This is a build-time configuration for Create React App.\n' +
      `Missing: ${missing.join(', ')}\n\n` +
      'How to fix:\n' +
      '1) Preferred: set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your environment at build time (.env, CI/CD).\n' +
      '2) If your secret store provides SUPABASE_URL/SUPABASE_KEY, map them to the REACT_APP_* names before running "npm run build" or "npm start".\n' +
      'Example mapping (bash):\n' +
      '  export REACT_APP_SUPABASE_URL="$SUPABASE_URL"\n' +
      '  export REACT_APP_SUPABASE_ANON_KEY="$SUPABASE_KEY"\n\n' +
      'See lms_frontend/SUPABASE_SETUP.md for details.';
    // Throwing here prevents silent misconfiguration causing confusing runtime errors downstream.
    throw new Error(guidance);
  }

  return { url, anonKey };
}

// PUBLIC_INTERFACE
/**
 * Returns a configured Supabase client instance for app-wide use.
 * @returns {import('@supabase/supabase-js').SupabaseClient} Supabase client
 */
const { url: supabaseUrl, anonKey: supabaseAnonKey } = resolveSupabaseConfig();
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
