import React from 'react';
import { NavLink } from 'react-router-dom';
import { experimentsEnabled, isFeatureEnabled } from '../../lib/featureFlags';

/**
 * PUBLIC_INTERFACE
 * SidebarLayout renders a modern top navigation placeholder area (delegated to App header)
 * and a left sidebar for app sections. It wraps provided children as main content.
 *
 * Accessibility:
 * - <aside> with aria-label
 * - NavLinks with aria-current handling via react-router
 */
export default function SidebarLayout({ children }) {
  const exp = experimentsEnabled();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16 }}>
      <aside
        aria-label="Application navigation"
        className="card"
        style={{ height: 'fit-content', position: 'sticky', top: 16 }}
      >
        <nav className="stack">
          <SectionLabel>General</SectionLabel>
          <NavItem to="/dashboard" label="Dashboard" />
          <NavItem to="/courses" label="Courses" />
          <NavItem to="/assignments" label="Assignments" />
          <NavItem to="/profile" label="Profile" />
          {isFeatureEnabled('reports') && <NavItem to="/reports" label="Reports" />}

          <SectionLabel>Experiments</SectionLabel>
          <div className="helper" aria-live="polite">
            Experiments: {exp ? 'On' : 'Off'}
          </div>
        </nav>
      </aside>
      <section>{children}</section>
    </div>
  );
}

function SectionLabel({ children }) {
  return <div className="text-muted" style={{ fontSize: 12, textTransform: 'uppercase' }}>{children}</div>;
}

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `nav-link${isActive ? ' btn' : ''}`
      }
      end
    >
      {label}
    </NavLink>
  );
}
