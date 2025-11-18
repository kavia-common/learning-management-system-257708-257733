import React from "react";
import { Routes, Route, useParams } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import EmployeeDashboard from "../dashboards/EmployeeDashboard";
import AdminDashboard from "../dashboards/AdminDashboard";
import LearningPathsList from "../components/LearningPathsList";
import CoursesList from "../components/CoursesList";
import CoursePlayer from "../courses/CoursePlayer";
import SignUpSignIn from "../auth/SignUpSignIn";
import AdminSignIn from "../auth/AdminSignIn";
import CoursesPage from "../pages/CoursesPage";
import AssignmentsPage from "../pages/AssignmentsPage";
import ProfilePage from "../pages/ProfilePage";
import HealthcheckPage from "../pages/HealthcheckPage";

/**
 * PUBLIC_INTERFACE
 * AppRoutes defines top-level routes for the LMS app, with email/password auth at /signin.
 * Includes healthcheck path (REACT_APP_HEALTHCHECK_PATH or /health).
 */
function AppRoutes() {
  const healthPath = process.env.REACT_APP_HEALTHCHECK_PATH || '/health';

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
    const { id } = useParams();
    return (
      <div className="container" style={{ maxWidth: 960, margin: "24px auto" }}>
        <h2 className="h2" style={{ textAlign: "left" }}>Courses for Path {id}</h2>
        <CoursesList learningPathId={id} />
      </div>
    );
  };

  return (
    <Routes>
      {/* Health */}
      <Route path={healthPath} element={<HealthcheckPage />} />

      {/* Auth: only email/password with role selection via SignUpSignIn */}
      <Route path="/signin" element={<SignUpSignIn />} />
      {/* Dedicated admin sign-in route (public) */}
      <Route path="/admin/signin" element={<AdminSignIn />} />

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

      {/* App sections with sidebar */}
      <Route
        path="/courses"
        element={
          <ProtectedRoute>
            <CoursesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assignments"
        element={
          <ProtectedRoute>
            <AssignmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
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

export default AppRoutes;
