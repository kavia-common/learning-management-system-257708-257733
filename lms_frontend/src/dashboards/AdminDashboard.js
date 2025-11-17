import React, { useEffect, useState } from "react";
import { fetchAggregateStats } from "../progress/progressApi";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

/**
 * PUBLIC_INTERFACE
 * AdminDashboard shows high-level stats for admins.
 */
function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalEnrollments: 0, avgCompletion: 0 });
  const [status, setStatus] = useState({ loading: true, error: "" });

  useEffect(() => {
    let active = true;
    const load = async () => {
      setStatus({ loading: true, error: "" });
      try {
        const s = await fetchAggregateStats();
        if (active) setStats(s);
      } catch (e) {
        if (active) setStatus({ loading: false, error: e.message || "Failed to load stats" });
        return;
      }
      if (active) setStatus({ loading: false, error: "" });
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const chartData = [
    { name: "Users", value: stats.totalUsers },
    { name: "Enrollments", value: stats.totalEnrollments },
    { name: "Avg Completion %", value: stats.avgCompletion },
  ];

  return (
    <div className="container" style={{ maxWidth: 960, margin: "24px auto", textAlign: "left" }}>
      <h2 style={{ marginBottom: 12 }}>Admin Dashboard</h2>
      {status.loading && <p>Loading...</p>}
      {status.error && <p role="alert" style={{ color: "#EF4444" }}>{status.error}</p>}

      {!status.loading && !status.error && (
        <>
          <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <StatCard label="Total Users" value={stats.totalUsers} />
            <StatCard label="Total Enrollments" value={stats.totalEnrollments} />
            <StatCard label="Avg Completion (%)" value={stats.avgCompletion} />
          </div>

          <div style={{ height: 320, border: "1px solid var(--border-color)", borderRadius: 8, padding: 12 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#2563EB" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{ flex: "1 1 240px", border: "1px solid var(--border-color)", borderRadius: 8, padding: 12 }}>
      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

export default AdminDashboard;
