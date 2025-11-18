import React, { useEffect, useState } from 'react';
import SidebarLayout from '../components/layout/SidebarLayout';
import AssignmentCard from '../components/AssignmentCard';
import { lmsApi } from '../lib/apiClient';

/**
 * PUBLIC_INTERFACE
 * AssignmentsPage lists assignments using the API client (stubbed if backend missing).
 */
export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: '' });

  useEffect(() => {
    let active = true;
    (async () => {
      setStatus({ loading: true, error: '' });
      try {
        const data = await lmsApi.listAssignments();
        if (active) setAssignments(Array.isArray(data) ? data : []);
      } catch (e) {
        if (active) setStatus({ loading: false, error: e?.message || 'Failed to load assignments' });
        return;
      }
      if (active) setStatus({ loading: false, error: '' });
    })();
    return () => { active = false; };
  }, []);

  return (
    <SidebarLayout>
      <div className="container" style={{ padding: 0 }}>
        <h2 className="h2" style={{ marginBottom: 12 }}>Assignments</h2>
        {status.loading && <p>Loading...</p>}
        {status.error && <p role="alert" className="field-error">{status.error}</p>}
        {!status.loading && !status.error && (
          <div className="grid-2">
            {assignments.map((a) => (
              <AssignmentCard key={a.id || Math.random()} assignment={a} />
            ))}
            {assignments.length === 0 && <p className="text-muted">No assignments available.</p>}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
