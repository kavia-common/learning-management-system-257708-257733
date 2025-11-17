import React, { useEffect, useState } from 'react';
import supabase from '../supabaseClient';

/**
 * List of learning paths. Emits selection via onSelect callback.
 * @param {{onSelect?: (path: any)=>void}} props
 */
function LearningPathsList({ onSelect }) {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data, error: err } = await supabase
          .from('learning_paths')
          .select('*')
          .order('name', { ascending: true });
        if (err) throw err;
        if (isMounted) setPaths(data || []);
      } catch (e) {
        if (isMounted) setError(e.message || 'Failed to load learning paths');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div style={{ textAlign: 'left' }}>
      <h3 style={{ marginBottom: 12 }}>Learning Paths</h3>
      {loading && <p>Loading...</p>}
      {error && <p role="alert" style={{ color: '#EF4444' }}>{error}</p>}
      {!loading && !error && paths.length === 0 && <p>No learning paths found.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {paths.map((p) => (
          <li
            key={p.id}
            style={{
              padding: '8px 12px',
              marginBottom: 8,
              border: '1px solid var(--border-color)',
              borderRadius: 8,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{p.description}</div>
              {p.external_url && (
                <div style={{ marginTop: 6 }}>
                  <a
                    href={p.external_url}
                    className="App-link"
                    target="_blank"
                    rel="noreferrer"
                    title="Open external link"
                  >
                    External link
                  </a>
                </div>
              )}
            </div>
            {onSelect && (
              <button
                onClick={() => onSelect(p)}
                className="btn"
                style={{
                  background: 'var(--button-bg)',
                  color: 'var(--button-text)',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: 8,
                  cursor: 'pointer'
                }}
              >
                View Courses
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LearningPathsList;
