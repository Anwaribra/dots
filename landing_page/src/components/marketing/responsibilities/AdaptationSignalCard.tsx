import React from 'react';
import { Zap, ChevronRight } from 'lucide-react';
import { AdaptationSignal } from './types';

interface AdaptationSignalCardProps {
  signal: AdaptationSignal;
}

export const AdaptationSignalCard: React.FC<AdaptationSignalCardProps> = ({ signal }) => {
  const isUrgent = signal.iconType === 'urgent';

  return (
    <div
      className="adaptation-signal-card"
      style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        boxShadow: '0 4px 16px rgba(35, 45, 120, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.95)',
        transition: 'transform 0.16s ease, box-shadow 0.16s ease',
        cursor: 'default',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: isUrgent ? '#EEF3FD' : '#E5F97D',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {isUrgent ? (
            <Zap size={16} color="#2D32D4" fill="#2D32D4" />
          ) : (
            /* Horizontal transfer arrows (two arrows pointing in opposite directions) */
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              stroke="#203D06"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M 4 8 L 20 8 M 16 4 L 20 8 L 16 12" />
              <path d="M 20 16 L 4 16 M 8 12 L 4 16 L 8 20" />
            </svg>
          )}
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
            {signal.detail}
          </span>
          <span
            style={{
              fontSize: '0.72rem',
              color: '#9CA3AF',
              lineHeight: 1.25,
              marginTop: '1px',
            }}
          >
            {signal.time}
          </span>
        </div>
      </div>

      <div
        style={{
          color: '#9CA3AF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ChevronRight size={15} />
      </div>

      <style>{`
        .adaptation-signal-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(35, 45, 120, 0.08) !important;
        }
      `}</style>
    </div>
  );
};
