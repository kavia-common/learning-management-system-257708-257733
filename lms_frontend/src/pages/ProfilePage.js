import React, { useEffect, useState } from 'react';
import SidebarLayout from '../components/layout/SidebarLayout';
import { lmsApi } from '../lib/apiClient';
import { useAuth } from '../auth/AuthProvider';

/**
 * PUBLIC_INTERFACE
 * ProfilePage shows minimal profile information. Uses Supabase user and optional backend /me.
 */
export default function ProfilePage() {
  const { user, profile } = useAuth();
  const [serverProfile, setServerProfile] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const p = await lmsApi.getProfile();
        if (active) setServerProfile(p);
      } catch {
        // ignore - optional
      }
    })();
    return () => { active = false; };
  }, []);

  return (
    <SidebarLayout>
      <div className="container" style={{ padding: 0 }}>
        <h2 className="h2" style={{ marginBottom: 12 }}>Profile</h2>
        <div className="grid-2">
          <div className="card">
            <div className="h3">App Profile</div>
            <div className="stack" style={{ marginTop: 8 }}>
              <Row label="User ID" value={user?.id || '—'} />
              <Row label="Email" value={user?.email || '—'} />
              <Row label="Role" value={profile?.role || '—'} />
            </div>
          </div>
          <div className="card">
            <div className="h3">Server Profile</div>
            {serverProfile ? (
              <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(serverProfile, null, 2)}</pre>
            ) : (
              <p className="text-muted">No server profile available.</p>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

function Row({ label, value }) {
  return (
    <div className="row" style={{ justifyContent: 'space-between' }}>
      <div className="text-muted">{label}</div>
      <div>{value}</div>
    </div>
  );
}
