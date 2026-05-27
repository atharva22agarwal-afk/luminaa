import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

const positionStyles = {
  top: {
    transform: 'translate(-50%, -100%)',
    offset: { x: 0, y: -12 },
    arrow: { top: '100%', left: '50%', transform: 'translateX(-50%)', borderTopColor: 'var(--tooltip-bg)' },
  },
  bottom: {
    transform: 'translate(-50%, 0)',
    offset: { x: 0, y: 12 },
    arrow: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', borderBottomColor: 'var(--tooltip-bg)' },
  },
  left: {
    transform: 'translate(-100%, -50%)',
    offset: { x: -12, y: 0 },
    arrow: { left: '100%', top: '50%', transform: 'translateY(-50%)', borderLeftColor: 'var(--tooltip-bg)' },
  },
  right: {
    transform: 'translate(0, -50%)',
    offset: { x: 12, y: 0 },
    arrow: { right: '100%', top: '50%', transform: 'translateY(-50%)', borderRightColor: 'var(--tooltip-bg)' },
  },
};

export default function Tooltip({ children, description, position = 'top', className = '' }) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [activePosition, setActivePosition] = useState(position);
  const triggerRef = useRef(null);
  const placement = positionStyles[activePosition] || positionStyles.top;

  const updatePosition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const nextPosition = window.innerWidth <= 768 && className.includes('sidebar-tooltip')
      ? 'top'
      : position;
    const nextPlacement = positionStyles[nextPosition] || positionStyles.top;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const nextCoords = {
      top: nextPosition === 'top' ? rect.top : nextPosition === 'bottom' ? rect.bottom : centerY,
      left: nextPosition === 'left' ? rect.left : nextPosition === 'right' ? rect.right : centerX,
    };

    setActivePosition(nextPosition);
    setCoords({
      top: nextCoords.top + nextPlacement.offset.y,
      left: nextCoords.left + nextPlacement.offset.x,
    });
  }, [className, position]);

  const showTooltip = () => {
    updatePosition();
    setVisible(true);
  };

  useEffect(() => {
    if (!visible) return undefined;

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [updatePosition, visible]);

  if (!description) return children;

  return (
    <span
      ref={triggerRef}
      className={`tooltip-wrap ${className}`.trim()}
      onMouseEnter={showTooltip}
      onMouseLeave={() => setVisible(false)}
      onFocus={showTooltip}
      onBlur={() => setVisible(false)}
    >
      {children}
      {createPortal(
        <AnimatePresence>
          {visible && (
            <motion.span
              className="tooltip-bubble"
              role="tooltip"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{
                top: coords.top,
                left: coords.left,
                transform: placement.transform,
              }}
            >
              {description}
              <span className="tooltip-arrow" style={placement.arrow} aria-hidden="true" />
            </motion.span>
          )}
        </AnimatePresence>,
        document.body
      )}
    </span>
  );
}
