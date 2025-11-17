import React from "react";
import { Routes, Route } from "react-router-dom";
import SignUpSignIn from "../auth/SignUpSignIn";
import ProtectedRoute from "../auth/ProtectedRoute";
import EmployeeDashboard from "../dashboards/EmployeeDashboard";
import AdminDashboard from "../dashboards/AdminDashboard";
import LearningPathsList from "../components/LearningPathsList";
import CoursesList from "../components/CoursesList";
import CoursePlayer from "../courses/CoursePlayer";

/**
 * PUBLIC_INTERFACE
 * AppRoutes defines top-level routes for the LMS app.
 */
function AppRoutes() {
  const Unauthorized = () => (
    <div className="container" style={{ maxWidth: 640, margin: "48px auto" }}>
      <h2>Unauthorized</h2>
      <p>You do not have permission to view this page.</p>
    </div>
  );

  const PathsPage = () => (
    <div className="container" style={{ maxWidth: 960, margin: "24px auto" }}>
      <h2 style={{ textAlign: "left" }}>Learning Paths</h2>
      <LearningPathsList />
    </div>
  );

  const CoursesByPath = () => {
    // In a real app, CoursesList expects learningPathId prop; here we read from URL param
    // and directly render the list using that id.
    // Note: Keeping existing CoursesList signature: it accepts learningPathId prop.
    const { id } = useParamsShim();
    return (
      <div className="container" style={{ maxWidth: 960, margin: "24px auto" }}>
        <h2 style={{ textAlign: "left" }}>Courses for Path {id}</h2>
        <CoursesList learningPathId={id} />
      </div>
    );
  };

  return (
    <Routes>
      <Route path="/signin" element={<SignUpSignIn />} />
      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute requireRole="employee">
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
      <Route path="/paths" element={<PathsPage />} />
      <Route path="/paths/:id" element={<CoursesByPath />} />
      <Route
        path="/courses/:id"
        element={
          <ProtectedRoute>
            <CoursePlayer />
          </ProtectedRoute>
        }
      />
      <Route path="/unauthorized" element={<Unauthorized />} />
      {/* Default route */}
      <Route path="*" element={<PathsPage />} />
    </Routes>
  );
}

// Helper to access params without importing useParams in multiple places here
function useParamsShim() {
  // Lazy import to avoid named import at top in case bundlers tree-shake differently
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { useParams } = require("react-router-dom");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useParams();
}

export default AppRoutes;
