import React from 'react';

/**
 * PUBLIC_INTERFACE
 * CourseCard renders a course preview tile.
 *
 * @param {object} props
 * @param {{ id: string|number, title?: string, description?: string }} props.course
 * @param {(course:any)=>void} [props.onOpen]
 */
export default function CourseCard({ course, onOpen }) {
  const title = course?.title || `Course ${course?.id ?? ''}`;
  const desc = course?.description || 'Course description will appear here.';

  return (
    <div className="card" role="article" aria-label={title}>
      <div className="h4">{title}</div>
      <p className="text-muted" style={{ marginTop: 6 }}>{desc}</p>
      <div className="row" style={{ marginTop: 10 }}>
        <button className="btn btn-primary" onClick={() => onOpen?.(course)}>
          Open
        </button>
      </div>
    </div>
  );
}
