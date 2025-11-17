import React from "react";
import { Navigate } from "react-router-dom";
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
  const { user, profile } = useAuth();

  // If not authenticated, go to sign-in.
  // Use replace to avoid leaving a protected entry in the history stack and do NOT carry forward state.
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // If a specific role is required:
  if (requireRole) {
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
