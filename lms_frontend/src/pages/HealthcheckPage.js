import React from 'react';

/**
 * PUBLIC_INTERFACE
 * HealthcheckPage returns a simple OK with app/env diagnostics for uptime checks.
 * It is intentionally simple text content for load balancers.
 */
export default function HealthcheckPage() {
  const nodeEnv = process.env.REACT_APP_NODE_ENV || process.env.NODE_ENV;
  const healthPath = process.env.REACT_APP_HEALTHCHECK_PATH || '/health';
  const buildInfo = {
    nodeEnv,
    healthPath,
    features: process.env.REACT_APP_FEATURE_FLAGS || '',
  };

  return (
    <div className="container" style={{ maxWidth: 680, margin: '24px auto' }}>
      <div className="card" role="status" aria-live="polite">
        <div className="h3">OK</div>
        <p className="text-muted">Service healthy</p>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(buildInfo, null, 2)}</pre>
      </div>
    </div>
  );
}
