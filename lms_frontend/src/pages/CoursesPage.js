import React, { useEffect, useState } from 'react';
import SidebarLayout from '../components/layout/SidebarLayout';
import CourseCard from '../components/CourseCard';
import { lmsApi } from '../lib/apiClient';
import { useNavigate } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * CoursesPage lists available courses using the API client. Falls back gracefully if API missing.
 */
export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: '' });
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    (async () => {
      setStatus({ loading: true, error: '' });
      try {
        const data = await lmsApi.listCourses();
        if (active) setCourses(Array.isArray(data) ? data : []);
      } catch (e) {
        if (active) setStatus({ loading: false, error: e?.message || 'Failed to load courses' });
        return;
      }
      if (active) setStatus({ loading: false, error: '' });
    })();
    return () => { active = false; };
  }, []);

  const openCourse = (c) => {
    const id = c?.id ?? '';
    if (id) navigate(`/courses/${id}`);
  };

  return (
    <SidebarLayout>
      <div className="container" style={{ padding: 0 }}>
        <h2 className="h2" style={{ marginBottom: 12 }}>Courses</h2>
        {status.loading && <p>Loading...</p>}
        {status.error && <p role="alert" className="field-error">{status.error}</p>}
        {!status.loading && !status.error && (
          <div className="grid-2">
            {courses.map((c) => (
              <CourseCard key={c.id || Math.random()} course={c} onOpen={openCourse} />
            ))}
            {courses.length === 0 && <p className="text-muted">No courses available.</p>}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
