import React from 'react';
import '../index.css';

/**
 * Reusable LuminaButton component to standardize buttons across the app.
 *
 * @param {string} variant - 'primary' | 'secondary' | 'ghost' | 'icon' | 'circle' | 'action'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {elementType} icon - Lucide icon component
 * @param {boolean} active - Active state for toggle buttons
 * @param {boolean} disabled - Disabled state
 */
export const LuminaButton = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className = '',
  active = false,
  disabled = false,
  onClick,
  ...props
}, ref) => {
  const baseClass = `lumina-btn lumina-btn-${variant} lumina-btn-${size} ${active ? 'active' : ''} ${className}`.trim();

  // For circle or icon buttons, they might not have children
  return (
    <button
      ref={ref}
      className={baseClass}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} className="lumina-btn-icon" />}
      {children && <span className="lumina-btn-text">{children}</span>}
    </button>
  );
});

LuminaButton.displayName = 'LuminaButton';

export default LuminaButton;

