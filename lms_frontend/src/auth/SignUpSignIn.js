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
        info: "Signup successful. Check your email to confirm (if required), then sign in.",
      });
      setMode("signin");
    } catch (e) {
      setMessage({ error: e.message || "Failed to sign up", info: "" });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 520, margin: "32px auto", textAlign: "left" }}>
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h2 className="h2" style={{ margin: 0 }}>Welcome</h2>
          <div className="row" role="tablist" aria-label="Auth mode">
            <button
              className={`btn ${mode === "signin" ? "btn-primary" : ""}`}
              onClick={() => setMode("signin")}
              aria-pressed={mode === "signin"}
              role="tab"
              aria-selected={mode === "signin"}
            >
              Sign In
            </button>
            <button
              className={`btn ${mode === "signup" ? "btn-primary" : ""}`}
              onClick={() => setMode("signup")}
              aria-pressed={mode === "signup"}
              role="tab"
              aria-selected={mode === "signup"}
            >
              Sign Up
            </button>
          </div>
        </div>

        <div className="stack" style={{ marginTop: 12 }}>
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input
              id="email"
              className={`input ${message.error && !email ? "error" : ""}`}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password"
              className={`input ${message.error && !password ? "error" : ""}`}
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div className="row">
            {mode === "signin" ? (
              <button
                className="btn btn-primary"
                onClick={onSignIn}
                disabled={pending}
              >
                {pending ? "Signing in..." : "Sign In"}
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={onSignUp}
                disabled={pending}
              >
                {pending ? "Signing up..." : "Create Account"}
              </button>
            )}
          </div>

          {message.error && <p role="alert" className="field-error">{message.error}</p>}
          {message.info && <p style={{ color: "var(--color-primary)" }}>{message.info}</p>}
        </div>
      </div>
    </div>
  );
}

export default SignUpSignIn;
