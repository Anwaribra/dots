import React from 'react';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'light' | 'dark';
  className?: string;
  children: React.ReactNode;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  variant = 'light',
  className = '',
  children,
  style,
  ...props
}) => {
  const glassClass = variant === 'dark' ? 'liquid-glass-dark' : 'liquid-glass-card';

  return (
    <div
      className={`${glassClass} ${className}`}
      style={{
        borderRadius: 'var(--radius-panel)',
        padding: '32px',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};
