import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";

/**
 * PUBLIC_INTERFACE
 * SignUpSignIn renders email/password auth with tabs for Sign In and Sign Up.
 * - Sign Up: full_name (optional), email, password, role (required: employee|admin)
 *   After signUp, upsert into 'profiles' { id, full_name, role }.
 * - Sign In: email, password.
 * Basic validation and friendly error display are included. Uses Ocean theme classes.
 */
function SignUpSignIn() {
  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState({ error: "", info: "" });

  const navigate = useNavigate();

  const resetMessages = () => setMessage({ error: "", info: "" });

  const isValidEmail = (val) => /\S+@\S+\.\S+/.test(val);
  const validatePassword = (val) => (val || "").length >= 6;

  const navigateByRole = (roleValue) => {
    if (roleValue === "admin") {
      navigate("/admin/dashboard", { replace: true });
    } else {
      // default to employee dashboard
      navigate("/employee/dashboard", { replace: true });
    }
  };

  const onSignIn = async () => {
    resetMessages();
    if (!email?.trim()) {
      setMessage({ error: "Email is required.", info: "" });
      return;
    }
    if (!isValidEmail(email)) {
      setMessage({ error: "Please enter a valid email address.", info: "" });
      return;
    }
    if (!validatePassword(password)) {
      setMessage({ error: "Password must be at least 6 characters.", info: "" });
      return;
    }

    setPending(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Attempt to fetch profile to know where to navigate
      const userId = data?.user?.id;
      if (userId) {
        const { data: prof, error: profErr } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .maybeSingle();
        if (profErr) {
          // eslint-disable-next-line no-console
          console.warn("Profile fetch after sign-in failed:", profErr.message);
        }
        navigateByRole(prof?.role || "employee");
        return;
      }

      // Fallback success message if we can't navigate for some reason
      setMessage({ error: "", info: "Signed in successfully." });
    } catch (e) {
      setMessage({ error: e?.message || "Failed to sign in", info: "" });
    } finally {
      setPending(false);
    }
  };

  const onSignUp = async () => {
    resetMessages();
    if (!email?.trim()) {
      setMessage({ error: "Email is required.", info: "" });
      return;
    }
    if (!isValidEmail(email)) {
      setMessage({ error: "Please enter a valid email address.", info: "" });
      return;
    }
    if (!validatePassword(password)) {
      setMessage({ error: "Password must be at least 6 characters.", info: "" });
      return;
    }
    if (!role) {
      setMessage({ error: "Please select a role.", info: "" });
      return;
    }

    setPending(true);
    try {
      const redirectTo =
        process.env.REACT_APP_FRONTEND_URL
          ? `${process.env.REACT_APP_FRONTEND_URL}/auth/callback`
          : `${window.location.origin}/auth/callback`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
        },
      });
      if (error) throw error;

      const newUser = data?.user;

      // Upsert profile immediately when we have the user id (if email confirmation disabled,
      // user may be created and available immediately). Otherwise, this upsert will succeed later
      // after confirmation on next session.
      if (newUser?.id) {
        const { error: upErr } = await supabase
          .from("profiles")
          .upsert(
            {
              id: newUser.id,
              full_name: fullName?.trim() || null,
              role: role,
            },
            { onConflict: "id" }
          );
        if (upErr) {
          // eslint-disable-next-line no-console
          console.warn("Profile upsert warning:", upErr.message);
        }
      }

      // If session is already active (no email confirmation needed), navigate by role
      if (data?.session?.user?.id) {
        navigateByRole(role);
        return;
      }

      setMessage({
        error: "",
        info:
          "Signup successful. Please check your email to confirm your account (if required), then sign in.",
      });
      setMode("signin");
    } catch (e) {
      setMessage({ error: e?.message || "Failed to sign up", info: "" });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 560, margin: "32px auto", textAlign: "left" }}>
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
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
          {mode === "signup" && (
            <div>
              <label htmlFor="full_name" className="label">Full name (optional)</label>
              <input
                id="full_name"
                className="input"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          )}

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
              aria-invalid={!!(message.error && !email)}
            />
            <div className="helper">Use your work email if applicable.</div>
          </div>

          <div>
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password"
              className={`input ${message.error && !validatePassword(password) ? "error" : ""}`}
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              aria-invalid={!!(message.error && !validatePassword(password))}
            />
          </div>

          {mode === "signup" && (
            <div>
              <label htmlFor="role" className="label">Role</label>
              <select
                id="role"
                className={`select ${message.error && !role ? "error" : ""}`}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="">Select a role</option>
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
              <div className="helper">Choose your role for access control.</div>
            </div>
          )}

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
                {pending ? "Creating account..." : "Create Account"}
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
