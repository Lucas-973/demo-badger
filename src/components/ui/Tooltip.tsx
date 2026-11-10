import React, { useState } from 'react';

/**
 * Elegant Custom Tooltip Component
 * Matches the app's design system with a subtle dark background
 */
interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  className = '',
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      {children}

      {/* Tooltip - renders to the right of the element */}
      {visible && (
        <div
          role="tooltip"
          style={{
            position: 'absolute' as const,
            right: '100%',
            top: '50%',
            transform: 'translateY(-50%)',
            marginLeft: '0.75rem',
            backgroundColor: '#242424',
            color: '#F5F5F5',
            padding: '0.375rem 0.75rem',
            borderRadius: '6px',
            fontSize: '12px',
            lineHeight: '1.4',
            fontWeight: 400,
            maxWidth: 'max-content',
            whiteSpace: 'nowrap',
            boxShadow: '0 3px 8px -3px rgba(0, 0, 0, 0.25), 0 4px 16px 0 rgba(0, 0, 0, 0.1)',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};
