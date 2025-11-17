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
    <div className="container" style={{ maxWidth: 460, margin: "48px auto", textAlign: "left" }}>
      <h2 style={{ marginBottom: 12 }}>Sign in</h2>
      <p style={{ marginBottom: 16, color: "var(--text-secondary)" }}>
        Use your organization account to continue.
      </p>

      <button
        onClick={signInWithOAuth}
        disabled={pending}
        className="btn"
        style={{
          background: "var(--button-bg)",
          color: "var(--button-text)",
          border: "none",
          padding: "10px 16px",
          borderRadius: 8,
          cursor: "pointer",
        }}
        aria-label={`Continue with ${provider}`}
      >
        {pending ? "Redirecting..." : `Continue with ${capitalize(provider)}`}
      </button>

      {error && (
        <p role="alert" style={{ color: "#EF4444", marginTop: 12 }}>
          {error}
        </p>
      )}
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
