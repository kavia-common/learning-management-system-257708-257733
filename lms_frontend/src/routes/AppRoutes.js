import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import EmployeeDashboard from "../dashboards/EmployeeDashboard";
import AdminDashboard from "../dashboards/AdminDashboard";
import LearningPathsList from "../components/LearningPathsList";
import CoursesList from "../components/CoursesList";
import CoursePlayer from "../courses/CoursePlayer";
import SignUpSignIn from "../auth/SignUpSignIn";

/**
 * PUBLIC_INTERFACE
 * AppRoutes defines top-level routes for the LMS app, with email/password auth at /signin.
 */
function AppRoutes() {
  const Unauthorized = () => (
    <div className="container" style={{ maxWidth: 640, margin: "32px auto" }}>
      <div className="card">
        <h2 className="h2">Unauthorized</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    </div>
  );

  const PathsPage = () => (
    <div className="container" style={{ maxWidth: 960, margin: "24px auto" }}>
      <h2 className="h2" style={{ textAlign: "left" }}>Learning Paths</h2>
      <LearningPathsList />
    </div>
  );

  const CoursesByPath = () => {
    const { id } = useParamsShim();
    return (
      <div className="container" style={{ maxWidth: 960, margin: "24px auto" }}>
        <h2 className="h2" style={{ textAlign: "left" }}>Courses for Path {id}</h2>
        <CoursesList learningPathId={id} />
      </div>
    );
  };

  return (
    <Routes>
      {/* Auth: only email/password with role selection via SignUpSignIn */}
      <Route path="/signin" element={<SignUpSignIn />} />

      {/* Primary dashboards */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requireRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Public content */}
      <Route path="/paths" element={<PathsPage />} />
      <Route path="/paths/:id" element={<CoursesByPath />} />

      {/* Protected content */}
      <Route
        path="/courses/:id"
        element={
          <ProtectedRoute>
            <CoursePlayer />
          </ProtectedRoute>
        }
      />

      {/* Misc */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Default */}
      <Route path="*" element={<PathsPage />} />
    </Routes>
  );
}

function useParamsShim() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { useParams } = require("react-router-dom");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useParams();
}

export default AppRoutes;
