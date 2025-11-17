import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";

/**
 * PUBLIC_INTERFACE
 * AuthCallback handles the OAuth PKCE redirect. It exchanges the authorization code
 * for a session and then navigates to the dashboard on success or login on failure.
 */
function AuthCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Finalizing sign-in...");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) throw error;

        // Success, go to dashboard
        if (active) navigate("/dashboard", { replace: true });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("AuthCallback error:", e);
        if (active) {
          setMessage(e?.message || "Sign-in failed. Redirecting to login...");
          setTimeout(() => navigate("/login", { replace: true }), 1200);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div className="container" style={{ maxWidth: 560, margin: "48px auto", textAlign: "left" }}>
      <h2>Authentication</h2>
      <p>{message}</p>
    </div>
  );
}

export default AuthCallback;
