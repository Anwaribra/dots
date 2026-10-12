import React from 'react';
import { Target, Calendar, BarChart3 } from 'lucide-react';
import { PrioritySignal } from './types';

interface PrioritySignalCardProps {
  signal: PrioritySignal;
}

export const PrioritySignalCard: React.FC<PrioritySignalCardProps> = ({ signal }) => {
  const renderIcon = () => {
    switch (signal.iconType) {
      case 'target':
        return <Target size={17} strokeWidth={2.4} color="#2D32D4" />;
      case 'calendar':
        return <Calendar size={17} strokeWidth={2.4} color="#2D32D4" />;
      case 'capacity':
        return <BarChart3 size={17} strokeWidth={2.4} color="#2D32D4" />;
    }
  };

  return (
    <div
      className="priority-signal-card"
      style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 4px 16px rgba(35, 45, 120, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.95)',
        transition: 'transform 0.16s ease, box-shadow 0.16s ease',
        cursor: 'default',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: '#EEF3FD',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {renderIcon()}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
        <span
          style={{
            fontSize: '0.85rem',
            fontWeight: 800,
            color: '#111827',
            letterSpacing: '-0.015em',
            lineHeight: 1.25,
          }}
        >
          {signal.label}
        </span>
        <span
          style={{
            fontSize: '0.78rem',
            fontWeight: 500,
            color: '#6B7280',
            lineHeight: 1.25,
          }}
        >
          {signal.value}
        </span>
      </div>

      <style>{`
        .priority-signal-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(35, 45, 120, 0.08) !important;
        }
      `}</style>
    </div>
  );
};
