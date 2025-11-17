import React, { useEffect, useState } from 'react';
import supabase from '../supabaseClient';

/**
 * Lists courses for a specific learning path.
 * @param {{learningPathId: string|number}} props
 */
function CoursesList({ learningPathId }) {
  const [courses, setCourses] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: '' });

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setStatus({ loading: true, error: '' });
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('learning_path_id', learningPathId)
          .order('sequence', { ascending: true });
        if (error) throw error;
        if (isMounted) setCourses(data || []);
      } catch (e) {
        if (isMounted) setStatus({ loading: false, error: e.message || 'Failed to load courses' });
        return;
      }
      if (isMounted) setStatus({ loading: false, error: '' });
    };
    if (learningPathId) {
      load();
    }
    return () => {
      isMounted = false;
    };
  }, [learningPathId]);

  if (!learningPathId) return null;

  return (
    <div style={{ textAlign: 'left', marginTop: 16 }}>
      <h3 className="h3" style={{ marginBottom: 12 }}>Courses</h3>
      {status.loading && <p>Loading...</p>}
      {status.error && <p role="alert" className="field-error">{status.error}</p>}
      {!status.loading && !status.error && courses.length === 0 && <p className="text-muted">No courses found.</p>}
      <ol style={{ paddingLeft: 18 }}>
        {courses.map((c) => (
          <li key={c.id} className="card" style={{ marginBottom: 8 }}>
            <div className="h4">{c.title}</div>
            <div className="text-muted" style={{ fontSize: 14 }}>Sequence: {c.sequence}</div>
            {c.url && (
              <div style={{ marginTop: 6 }}>
                <a
                  href={c.url}
                  className="link"
                  target="_blank"
                  rel="noreferrer"
                  title="Open course link"
                >
                  Open Course
                </a>
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

export default CoursesList;
