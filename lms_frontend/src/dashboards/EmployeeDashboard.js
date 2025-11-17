import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { fetchUserProgress } from "../progress/progressApi";

/**
 * PUBLIC_INTERFACE
 * EmployeeDashboard shows the signed-in user's course progress list.
 */
function EmployeeDashboard() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });

  useEffect(() => {
    let active = true;
    const load = async () => {
      setStatus({ loading: true, error: "" });
      try {
        if (user?.id) {
          const data = await fetchUserProgress(user.id);
          if (active) setRows(data);
        }
      } catch (e) {
        if (active) setStatus({ loading: false, error: e.message || "Failed to load progress" });
        return;
      }
      if (active) setStatus({ loading: false, error: "" });
    };
    load();
    return () => {
      active = false;
    };
  }, [user?.id]);

  return (
    <div className="container" style={{ maxWidth: 840, margin: "24px auto", textAlign: "left" }}>
      <h2 style={{ marginBottom: 12 }}>My Progress</h2>
      {status.loading && <p>Loading...</p>}
      {status.error && <p role="alert" style={{ color: "#EF4444" }}>{status.error}</p>}
      {!status.loading && !status.error && rows.length === 0 && <p>No progress yet.</p>}

      <div style={{ display: "grid", gap: 12 }}>
        {rows.map((r) => (
          <div key={r.course_id} style={{ border: "1px solid var(--border-color)", borderRadius: 8, padding: 12 }}>
            <div style={{ fontWeight: 600 }}>Course: {r.course_id}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              {r.started_at ? `Started: ${new Date(r.started_at).toLocaleString()}` : "Not started"}
              {r.completed_at ? ` • Completed: ${new Date(r.completed_at).toLocaleString()}` : ""}
            </div>
            <div style={{ marginTop: 8, height: 10, background: "#e5e7eb", borderRadius: 999 }}>
              <div
                style={{
                  width: `${Math.max(0, Math.min(100, r.percent_complete || 0))}%`,
                  height: "100%",
                  background: "var(--button-bg)",
                  borderRadius: 999,
                  transition: "width .3s ease",
                }}
                aria-label={`Progress ${r.percent_complete || 0}%`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EmployeeDashboard;
