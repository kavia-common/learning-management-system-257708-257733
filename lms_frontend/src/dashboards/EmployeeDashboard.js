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
      <h2 className="h2" style={{ marginBottom: 12 }}>My Progress</h2>
      {status.loading && <p>Loading...</p>}
      {status.error && <p role="alert" className="field-error">{status.error}</p>}
      {!status.loading && !status.error && rows.length === 0 && <p className="text-muted">No progress yet.</p>}

      <div className="stack">
        {rows.map((r) => {
          const pct = Math.max(0, Math.min(100, r.percent_complete || 0));
          return (
            <div key={r.course_id} className="card">
              <div className="h4">Course: {r.course_id}</div>
              <div className="text-muted" style={{ fontSize: 12 }}>
                {r.started_at ? `Started: ${new Date(r.started_at).toLocaleString()}` : "Not started"}
                {r.completed_at ? ` • Completed: ${new Date(r.completed_at).toLocaleString()}` : ""}
              </div>
              <div style={{ marginTop: 8 }}>
                <div className="progress" aria-label={`Progress ${pct}%`}>
                  <div className="bar" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EmployeeDashboard;
