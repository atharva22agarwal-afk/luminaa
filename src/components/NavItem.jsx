import React from 'react';
import Tooltip from '../Tooltip';

/**
 * Memoized sidebar navigation item.
 * Uses a proper <button> element for accessibility (keyboard navigation, screen readers).
 */
export const NavItem = React.memo(function NavItem({ icon: Icon, label, active = false, onClick, tooltip }) {
  const item = (
    <button
      className={`nav-item ${active ? 'active' : ''}`}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
    >
      <Icon size={18} aria-hidden="true" />
      <span>{label}</span>
      {active && <div className="icon-active-glow" aria-hidden="true" />}
    </button>
  );

  return (
    <Tooltip description={tooltip} position="right" className="sidebar-tooltip">
      {item}
    </Tooltip>
  );
});
