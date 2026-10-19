import React from 'react';
import { ArrowRight } from 'lucide-react';

export const FinalCta: React.FC = () => {
  return (
    <section style={{ paddingBlock: '80px 40px' }}>
      <div className="container">
        <div
          className="liquid-glass-dark"
          style={{
            borderRadius: 'var(--radius-panel)',
            padding: '64px 40px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            boxShadow: 'var(--shadow-panel-dark)',
            background: 'linear-gradient(145deg, rgba(26, 22, 75, 0.96) 0%, rgba(18, 15, 52, 0.98) 100%)',
            border: '1px solid rgba(99, 91, 255, 0.22)',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(2rem, 3.8vw, 3rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#FFFFFF',
              maxWidth: '700px',
            }}
          >
            Less time managing your life. More time living it.
          </h2>

          <p style={{ fontSize: '1.05rem', color: '#BAC2D6', maxWidth: '520px', marginBottom: '8px' }}>
            Experience realistic planning that bends when life changes without breaking your commitments.
          </p>

          <a href="#app" className="btn btn-primary btn-lg">
            <span>Launch Dots App</span>
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
};
