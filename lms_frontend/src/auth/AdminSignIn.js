import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import { useAuth } from "./AuthProvider";

/**
 * PUBLIC_INTERFACE
 * AdminSignIn provides a dedicated entry point for administrators to sign in using email/password.
 * Flow:
 * - If already signed in and role === 'admin' => redirect to /admin/dashboard
 * - If already signed in but not admin => show inline error
 * - On submit:
 *    - supabase.auth.signInWithPassword({ email, password })
 *    - fetch role from profiles by user id
 *    - if role === 'admin' => navigate('/admin/dashboard')
 *    - else => show error "This account is not an admin"
 */
function AdminSignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState({ error: "", info: "" });

  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, ensure only admins proceed
  useEffect(() => {
    if (user) {
      const roleVal = profile?.role || "employee";
      if (roleVal === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        setMessage({ error: "This account is not an admin.", info: "" });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, profile?.role]);

  const resetMessages = () => setMessage({ error: "", info: "" });

  const isValidEmail = (val) => /\S+@\S+\.\S+/.test(val);
  const validatePassword = (val) => (val || "").length >= 6;

  const onAdminSignIn = async () => {
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

      const userId = data?.user?.id;
      if (!userId) {
        setMessage({ error: "Unable to complete sign in. Please try again.", info: "" });
        return;
      }

      // Fetch profile to confirm admin role
      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (profErr) {
        // eslint-disable-next-line no-console
        console.warn("Profile fetch failed:", profErr.message);
      }

      if (prof?.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        // Not an admin -> sign out for safety and show message
        try {
          await supabase.auth.signOut();
        } catch (_) {
          // ignore
        }
        setMessage({ error: "This account is not an admin.", info: "" });
      }
    } catch (e) {
      setMessage({ error: e?.message || "Failed to sign in", info: "" });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 560, margin: "32px auto", textAlign: "left" }}>
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="h2" style={{ margin: 0 }}>Admin Sign In</h2>
          <div className="badge" aria-label="Admin only">Admin</div>
        </div>

        <div className="stack" style={{ marginTop: 12 }}>
          <div>
            <label htmlFor="email" className="label">Work Email</label>
            <input
              id="email"
              className={`input ${message.error && !email ? "error" : ""}`}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@company.com"
              aria-invalid={!!(message.error && !email)}
            />
          </div>

          <div>
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password"
              className={`input ${message.error && !validatePassword(password) ? "error" : ""}`}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              aria-invalid={!!(message.error && !validatePassword(password))}
            />
          </div>

          <div className="row">
            <button
              className="btn btn-primary"
              onClick={onAdminSignIn}
              disabled={pending}
            >
              {pending ? "Signing in..." : "Sign In as Admin"}
            </button>
            <Link to="/signin" className="btn" aria-label="Go to general sign in">
              Employee or general sign in
            </Link>
          </div>

          {message.error && <p role="alert" className="field-error">{message.error}</p>}
          {message.info && <p style={{ color: "var(--color-primary)" }}>{message.info}</p>}

          <div className="helper">
            Not an admin? Use the general <Link to="/signin" className="link">Sign In</Link> page.
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSignIn;
