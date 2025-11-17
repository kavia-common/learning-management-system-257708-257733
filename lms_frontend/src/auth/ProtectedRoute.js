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

  if (loading) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireRole && profile?.role && profile.role !== requireRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
