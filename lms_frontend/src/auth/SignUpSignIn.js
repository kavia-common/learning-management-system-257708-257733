import React, { useState } from "react";
import supabase from "../supabaseClient";

/**
 * PUBLIC_INTERFACE
 * SignUpSignIn renders a simple email/password auth form with tabs for Sign In and Sign Up.
 * On signup, it upserts into 'profiles' table with a default role 'employee'.
 */
function SignUpSignIn() {
  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState({ error: "", info: "" });

  const resetMessages = () => setMessage({ error: "", info: "" });

  const onSignIn = async () => {
    resetMessages();
    if (!email || !password) {
      setMessage({ error: "Email and password are required.", info: "" });
      return;
    }
    setPending(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setMessage({ error: "", info: "Signed in successfully." });
    } catch (e) {
      setMessage({ error: e.message || "Failed to sign in", info: "" });
    } finally {
      setPending(false);
    }
  };

  const onSignUp = async () => {
    resetMessages();
    if (!email || !password) {
      setMessage({ error: "Email and password are required.", info: "" });
      return;
    }
    setPending(true);
    try {
      const redirectTo = process.env.REACT_APP_FRONTEND_URL || window.location.origin;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
        },
      });
      if (error) throw error;

      // If user created immediately (depends on email confirmation settings)
      const newUser = data.user;
      if (newUser?.id) {
        // Upsert profile with default role 'employee'
        const { error: upErr } = await supabase
          .from("profiles")
          .upsert(
            {
              id: newUser.id,
              email,
              role: "employee",
            },
            { onConflict: "id" }
          );
        if (upErr) {
          // eslint-disable-next-line no-console
          console.warn("Profile upsert warning:", upErr.message);
        }
      }

      setMessage({
        error: "",
        info:
          "Signup successful. Check your email to confirm (if required), then sign in.",
      });
      setMode("signin");
    } catch (e) {
      setMessage({ error: e.message || "Failed to sign up", info: "" });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420, margin: "48px auto", textAlign: "left" }}>
      <h2 style={{ marginBottom: 12 }}>Welcome</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          className="btn"
          onClick={() => setMode("signin")}
          aria-pressed={mode === "signin"}
          style={{
            background: mode === "signin" ? "var(--button-bg)" : "transparent",
            color: mode === "signin" ? "var(--button-text)" : "var(--text-primary)",
            border: "1px solid var(--border-color)",
            padding: "8px 12px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Sign In
        </button>
        <button
          className="btn"
          onClick={() => setMode("signup")}
          aria-pressed={mode === "signup"}
          style={{
            background: mode === "signup" ? "var(--button-bg)" : "transparent",
            color: mode === "signup" ? "var(--button-text)" : "var(--text-primary)",
            border: "1px solid var(--border-color)",
            padding: "8px 12px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Sign Up
        </button>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        <div>
          <label htmlFor="email" style={{ display: "block", marginBottom: 6 }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid var(--border-color)" }}
          />
        </div>
        <div>
          <label htmlFor="password" style={{ display: "block", marginBottom: 6 }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid var(--border-color)" }}
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {mode === "signin" ? (
            <button
              className="btn"
              onClick={onSignIn}
              disabled={pending}
              style={{
                background: "var(--button-bg)",
                color: "var(--button-text)",
                border: "none",
                padding: "10px 16px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              {pending ? "Signing in..." : "Sign In"}
            </button>
          ) : (
            <button
              className="btn"
              onClick={onSignUp}
              disabled={pending}
              style={{
                background: "var(--button-bg)",
                color: "var(--button-text)",
                border: "none",
                padding: "10px 16px",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              {pending ? "Signing up..." : "Create Account"}
            </button>
          )}
        </div>

        {message.error && <p role="alert" style={{ color: "#EF4444" }}>{message.error}</p>}
        {message.info && <p style={{ color: "#2563EB" }}>{message.info}</p>}
      </div>
    </div>
  );
}

export default SignUpSignIn;
