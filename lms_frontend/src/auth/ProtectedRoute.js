import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

/**
 * PUBLIC_INTERFACE
 * ProtectedRoute guards children components based on auth state and optional role requirement.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Protected content.
 * @param {string=} props.requireRole - Optional role required to access (e.g., 'admin' or 'employee').
 */
function ProtectedRoute({ children, requireRole }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // While the auth bootstrap is running, show a short-loading state
  if (loading) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  // If not authenticated, go to sign-in
  if (!user) {
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  // If a specific role is required:
  if (requireRole) {
    // If we don't have a profile yet, do not block forever; allow but show fallback if role unknown
    const effectiveRole = profile?.role;
    if (!effectiveRole) {
      // Conservative behavior: deny until role is known to avoid privilege escalation
      return <Navigate to="/unauthorized" replace />;
    }
    if (effectiveRole !== requireRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}

export default ProtectedRoute;
