import React, { useState } from "react";
import supabase from "../supabaseClient";

/**
 * PUBLIC_INTERFACE
 * Login provides an OAuth sign-in button (default Google) using PKCE flow.
 * Configure providers in Supabase Dashboard.
 */
function Login() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const provider = "google"; // easily configurable provider

  const signInWithOAuth = async () => {
    setError("");
    setPending(true);
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (err) throw err;
      // Redirect happens automatically by Supabase; no-op here.
    } catch (e) {
      setError(e?.message || "Failed to start sign-in");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 520, margin: "32px auto", textAlign: "left" }}>
      <div className="card">
        <div className="stack">
          <div>
            <h2 className="h2" style={{ marginBottom: 6 }}>Sign in</h2>
            <p className="text-muted">Use your organization account to continue.</p>
          </div>

          <div>
            <button
              onClick={signInWithOAuth}
              disabled={pending}
              className="btn btn-primary"
              aria-label={`Continue with ${provider}`}
            >
              {pending ? "Redirecting..." : `Continue with ${capitalize(provider)}`}
            </button>
          </div>

          {error && (
            <p role="alert" className="field-error" style={{ marginTop: 6 }}>
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function capitalize(s) {
  try {
    return s.charAt(0).toUpperCase() + s.slice(1);
  } catch {
    return s;
  }
}

export default Login;
