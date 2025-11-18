import React from 'react';

/**
 * PUBLIC_INTERFACE
 * AssignmentCard renders a simple assignment tile.
 *
 * @param {object} props
 * @param {{ id: string|number, title?: string, due_at?: string, status?: string }} props.assignment
 * @param {(assignment:any)=>void} [props.onOpen]
 */
export default function AssignmentCard({ assignment, onOpen }) {
  const title = assignment?.title || `Assignment ${assignment?.id ?? ''}`;
  const due = assignment?.due_at ? new Date(assignment.due_at).toLocaleString() : 'No due date';

  return (
    <div className="card" role="article" aria-label={title}>
      <div className="h4">{title}</div>
      <div className="text-muted" style={{ fontSize: 12, marginTop: 6 }}>Due: {due}</div>
      <div className="row" style={{ marginTop: 10 }}>
        <button className="btn btn-primary" onClick={() => onOpen?.(assignment)}>
          View
        </button>
      </div>
    </div>
  );
}
