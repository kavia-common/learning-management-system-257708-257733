import supabase from "../supabaseClient";

/**
 * PUBLIC_INTERFACE
 * runSupabaseHealthcheck performs a minimal Supabase connectivity verification.
 * It checks:
 * 1) Auth: attempts to getSession (validates anon key and URL)
 * 2) DB: executes a lightweight select on 'learning_paths' limited to 1 row
 *
 * This is intended for development diagnostics. Do not block application UX on failures.
 * @returns {Promise<{ ok: boolean, details: { sessionOk: boolean, dbOk: boolean, errors: string[] } }>}
 */
export async function runSupabaseHealthcheck() {
  const errors = [];
  let sessionOk = false;
  let dbOk = false;

  try {
    const { error } = await supabase.auth.getSession();
    if (error) {
      errors.push(`auth.getSession error: ${error.message}`);
    } else {
      sessionOk = true;
    }
  } catch (e) {
    errors.push(`auth.getSession exception: ${e?.message || String(e)}`);
  }

  try {
    // Try a minimal query - table should exist per project setup; tolerate RLS blocking
    const { error } = await supabase
      .from("learning_paths")
      .select("id", { count: "exact", head: true })
      .limit(1);

    if (error) {
      // RLS or permissions may cause an error; still useful to surface for devs
      errors.push(`db select error: ${error.message}`);
    } else {
      dbOk = true;
    }
  } catch (e) {
    errors.push(`db select exception: ${e?.message || String(e)}`);
  }

  return {
    ok: sessionOk && dbOk,
    details: { sessionOk, dbOk, errors },
  };
}

export default runSupabaseHealthcheck;
