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
      <h2 className="h2" style={{ marginBottom: 12 }}>Admin Dashboard</h2>
      {status.loading && <p>Loading...</p>}
      {status.error && <p role="alert" className="field-error">{status.error}</p>}

      {!status.loading && !status.error && (
        <>
          <div className="row" style={{ marginBottom: 16 }}>
            <StatCard label="Total Users" value={stats.totalUsers} />
            <StatCard label="Total Enrollments" value={stats.totalEnrollments} />
            <StatCard label="Avg Completion (%)" value={stats.avgCompletion} />
          </div>

          <div className="chart" style={{ height: 320 }}>
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
    <div className="card" style={{ flex: "1 1 240px" }}>
      <div className="text-muted" style={{ fontSize: 12 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

export default AdminDashboard;
