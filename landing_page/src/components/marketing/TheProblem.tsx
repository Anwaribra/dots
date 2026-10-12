import React from 'react';
import { X, Lock, Sparkles, ArrowRight } from 'lucide-react';

export const TheProblem: React.FC = () => {
  return (
    <section
      id="problem"
      style={{
        paddingBlock: 'clamp(36px, 4.5vw, 54px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="SectionCanvas problem-canvas" style={{ maxWidth: '1240px', position: 'relative' }}>
        {/* Section Heading */}
        <div style={{ textAlign: 'center', maxWidth: '720px', marginInline: 'auto', marginBottom: '28px' }}>
          <h2
            style={{
              fontSize: 'clamp(2rem, 3.4vw, 3rem)',
              fontWeight: 800,
              lineHeight: 1.14,
              letterSpacing: '-0.04em',
              color: '#111827',
              marginBottom: '10px',
            }}
          >
            Life doesn’t follow your plan.
          </h2>
          <p
            style={{
              fontSize: '1.02rem',
              color: '#52526B',
              lineHeight: 1.5,
              maxWidth: '520px',
              marginInline: 'auto',
            }}
          >
            Stop rebuilding your day every time something changes.
          </p>
        </div>

        {/* Comparison Stage Layout */}
        <div
          className="problem-comparison-stage"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '20px',
            alignItems: 'center',
            position: 'relative',
            maxWidth: '960px',
            marginInline: 'auto',
          }}
        >
          {/* ================= LEFT: RIGID PLAN ================= */}
          <div style={{ position: 'relative' }}>
            {/* Sticky Floating Pink Callouts on Left */}
            <div
              className="sticky-notes-left"
              style={{
                position: 'absolute',
                left: '-110px',
                top: '0',
                bottom: '0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-around',
                pointerEvents: 'none',
                zIndex: 5,
              }}
            >
              {/* Note 1 */}
              <div style={{ position: 'relative', width: '100px' }}>
                <div
                  style={{
                    background: '#FFE4E6',
                    color: '#9F1239',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '6px 10px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(225, 29, 72, 0.08)',
                    transform: 'rotate(-3deg)',
                    lineHeight: 1.25,
                  }}
                >
                  Plans keep shifting
                </div>
                {/* Curved Arrow to Schedule */}
                <svg
                  width="36"
                  height="22"
                  viewBox="0 0 36 22"
                  fill="none"
                  style={{ position: 'absolute', right: '-26px', top: '10px' }}
                >
                  <path d="M 4 6 C 16 10, 24 16, 32 18" stroke="#FDA4AF" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M 28 14 L 32 18 L 26 20" stroke="#FDA4AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Note 2 */}
              <div style={{ position: 'relative', width: '100px' }}>
                <div
                  style={{
                    background: '#FFE4E6',
                    color: '#9F1239',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '6px 10px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(225, 29, 72, 0.08)',
                    transform: 'rotate(2deg)',
                    lineHeight: 1.25,
                  }}
                >
                  Always urgent tasks
                </div>
                <svg
                  width="36"
                  height="22"
                  viewBox="0 0 36 22"
                  fill="none"
                  style={{ position: 'absolute', right: '-26px', top: '10px' }}
                >
                  <path d="M 4 6 C 16 10, 24 16, 32 18" stroke="#FDA4AF" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M 28 14 L 32 18 L 26 20" stroke="#FDA4AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Note 3 */}
              <div style={{ position: 'relative', width: '100px' }}>
                <div
                  style={{
                    background: '#FFE4E6',
                    color: '#9F1239',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '6px 10px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(225, 29, 72, 0.08)',
                    transform: 'rotate(-2deg)',
                    lineHeight: 1.25,
                  }}
                >
                  End day behind
                </div>
                <svg
                  width="36"
                  height="22"
                  viewBox="0 0 36 22"
                  fill="none"
                  style={{ position: 'absolute', right: '-26px', top: '10px' }}
                >
                  <path d="M 4 6 C 16 10, 24 16, 32 18" stroke="#FDA4AF" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M 28 14 L 32 18 L 26 20" stroke="#FDA4AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Rigid Card Shell */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '22px',
                padding: '18px 18px',
                boxShadow: '0 12px 32px rgba(23, 23, 43, 0.05)',
                border: '1px solid rgba(23, 23, 43, 0.06)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span
                  style={{
                    background: '#E5E7EB',
                    color: '#1F2937',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    padding: '5px 12px',
                    borderRadius: '9999px',
                  }}
                >
                  Rigid plan
                </span>
                <span style={{ fontSize: '0.78rem', color: '#6B7280', lineHeight: 1.2 }}>
                  Looks good on paper.<br />Falls apart in real life.
                </span>
              </div>

              {/* Rows List (7 Focused Rows) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {/* 8 AM */}
                <div className="rigid-row">
                  <span className="row-time">8 AM</span>
                  <span className="row-text strike">Workout</span>
                  <X size={14} color="#9CA3AF" />
                </div>

                {/* 9 AM */}
                <div className="rigid-row">
                  <span className="row-time">9 AM</span>
                  <span className="row-text strike">Team sync</span>
                  <X size={14} color="#9CA3AF" />
                </div>

                {/* 10 AM - Urgent */}
                <div
                  className="rigid-row"
                  style={{
                    background: '#FEE2E2',
                    borderRadius: '7px',
                    padding: '6px 8px',
                    border: '1px solid #FECACA',
                  }}
                >
                  <span className="row-time" style={{ color: '#991B1B' }}>10 AM</span>
                  <span style={{ color: '#991B1B', fontWeight: 700, fontSize: '0.8rem', flex: 1 }}>
                    Urgent: client issue
                  </span>
                  <X size={14} color="#DC2626" />
                </div>

                {/* 11 AM */}
                <div className="rigid-row">
                  <span className="row-time">11 AM</span>
                  <span className="row-text strike">Product work</span>
                  <X size={14} color="#9CA3AF" />
                </div>

                {/* 12 PM */}
                <div className="rigid-row">
                  <span className="row-time">12 PM</span>
                  <span className="row-text strike">Lunch</span>
                  <X size={14} color="#9CA3AF" />
                </div>

                {/* 1 PM - Another urgent */}
                <div
                  className="rigid-row"
                  style={{
                    background: '#FEE2E2',
                    borderRadius: '7px',
                    padding: '6px 8px',
                    border: '1px solid #FECACA',
                  }}
                >
                  <span className="row-time" style={{ color: '#991B1B' }}>1 PM</span>
                  <span style={{ color: '#991B1B', fontWeight: 700, fontSize: '0.8rem', flex: 1 }}>
                    Another urgent task
                  </span>
                  <X size={14} color="#DC2626" />
                </div>

                {/* 2 PM */}
                <div className="rigid-row">
                  <span className="row-time">2 PM</span>
                  <span className="row-text strike">Investor prep / Catch up</span>
                  <X size={14} color="#9CA3AF" />
                </div>
              </div>
            </div>
          </div>

          {/* ================= CENTER: TRANSITION TRAJECTORY ================= */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingInline: '6px',
              minWidth: '140px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#4B5563',
                marginBottom: '10px',
                maxWidth: '110px',
                lineHeight: 1.25,
              }}
            >
              From a day that breaks...
            </div>

            {/* Trajectory Arc with Morphing Dots */}
            <svg width="120" height="70" viewBox="0 0 150 90" fill="none" style={{ overflow: 'visible' }}>
              <path
                d="M 10 70 C 40 85, 80 75, 128 32"
                stroke="rgba(67, 56, 242, 0.16)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <circle cx="15" cy="72" r="3" fill="#9CA3AF" />
              <circle cx="32" cy="78" r="3.2" fill="#9CA3AF" />
              <circle cx="52" cy="79" r="3.5" fill="#6B7280" />
              <circle cx="72" cy="74" r="3.8" fill="#4338F2" />
              <circle cx="92" cy="63" r="4.2" fill="#4338F2" />
              <circle cx="112" cy="48" r="4.6" fill="#C9F455" />
              <circle cx="132" cy="30" r="12" fill="#C9F455" />
              <path d="M 129 30 L 135 30 M 133 27 L 136 30 L 133 33" stroke="#17172B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            <div
              style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#17172B',
                marginTop: '10px',
                maxWidth: '110px',
                lineHeight: 1.25,
              }}
            >
              ...to a plan that adapts.
            </div>
          </div>

          {/* ================= RIGHT: ADAPTIVE PLAN ================= */}
          <div style={{ position: 'relative' }}>
            {/* Adaptive Card Shell */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '22px',
                padding: '18px 18px',
                boxShadow: '0 12px 32px rgba(23, 23, 43, 0.05)',
                border: '1px solid rgba(23, 23, 43, 0.06)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span
                  style={{
                    background: '#EEF2FF',
                    color: '#4338F2',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    padding: '5px 12px',
                    borderRadius: '9999px',
                  }}
                >
                  A plan that adapts
                </span>
                <span style={{ fontSize: '0.78rem', color: '#6B7280', lineHeight: 1.2 }}>
                  Same day.<br />A better way.
                </span>
              </div>

              {/* Rows List (7 Focused Rows) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {/* 8 AM - Protected */}
                <div
                  className="adaptive-row"
                  style={{
                    background: '#EEF2FF',
                    borderRadius: '7px',
                    padding: '6px 8px',
                  }}
                >
                  <span className="row-time" style={{ color: '#4338F2' }}>8 AM</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1 }}>
                    <Lock size={11} color="#4338F2" />
                    <span style={{ color: '#1E1B4B', fontWeight: 600, fontSize: '0.8rem' }}>Workout</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#4338F2' }}>Protected</span>
                </div>

                {/* 9 AM */}
                <div className="adaptive-row">
                  <span className="row-time">9 AM</span>
                  <span className="row-text">Team sync</span>
                </div>

                {/* 10 AM - Proposed placement */}
                <div
                  className="adaptive-row"
                  style={{
                    background: '#F9FAFB',
                    borderRadius: '7px',
                    padding: '6px 8px',
                  }}
                >
                  <span className="row-time">10 AM</span>
                  <span style={{ color: '#17172B', fontWeight: 600, fontSize: '0.8rem', flex: 1 }}>
                    Urgent: client issue
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#6B7280' }}>Proposed</span>
                </div>

                {/* 11 AM */}
                <div className="adaptive-row">
                  <span className="row-time">11 AM</span>
                  <span className="row-text">Product work</span>
                </div>

                {/* 12 PM - Protected */}
                <div
                  className="adaptive-row"
                  style={{
                    background: '#EEF2FF',
                    borderRadius: '7px',
                    padding: '6px 8px',
                  }}
                >
                  <span className="row-time" style={{ color: '#4338F2' }}>12 PM</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1 }}>
                    <Lock size={11} color="#4338F2" />
                    <span style={{ color: '#1E1B4B', fontWeight: 600, fontSize: '0.8rem' }}>Lunch</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#4338F2' }}>Protected</span>
                </div>

                {/* 1 PM - Flexible Block Moved */}
                <div
                  className="adaptive-row"
                  style={{
                    background: '#D4F94C',
                    borderRadius: '7px',
                    padding: '6px 8px',
                    boxShadow: '0 2px 8px rgba(201, 244, 85, 0.3)',
                  }}
                >
                  <span className="row-time" style={{ color: '#2C400B' }}>1 PM</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1 }}>
                    <Sparkles size={12} color="#17172B" />
                    <span style={{ color: '#17172B', fontWeight: 800, fontSize: '0.8rem' }}>Flexible block</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#2C400B' }}>Moved for you</span>
                </div>

                {/* 2 PM */}
                <div className="adaptive-row">
                  <span className="row-time">2 PM</span>
                  <span className="row-text">Investor prep / Catch up</span>
                </div>
              </div>
            </div>

            {/* Sticky Floating Blue & Lime Callouts on Right */}
            <div
              className="sticky-notes-right"
              style={{
                position: 'absolute',
                right: '-115px',
                top: '0',
                bottom: '0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-around',
                pointerEvents: 'none',
                zIndex: 5,
              }}
            >
              {/* Note 1 */}
              <div style={{ position: 'relative', width: '105px' }}>
                <svg
                  width="36"
                  height="22"
                  viewBox="0 0 36 22"
                  fill="none"
                  style={{ position: 'absolute', left: '-26px', top: '10px' }}
                >
                  <path d="M 32 6 C 20 10, 12 16, 4 18" stroke="#818CF8" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M 8 14 L 4 18 L 10 20" stroke="#818CF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div
                  style={{
                    background: '#EEF2FF',
                    color: '#4338F2',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '6px 10px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(67, 56, 242, 0.08)',
                    transform: 'rotate(2deg)',
                    lineHeight: 1.25,
                  }}
                >
                  Commitments protected
                </div>
              </div>

              {/* Note 2 */}
              <div style={{ position: 'relative', width: '105px' }}>
                <svg
                  width="36"
                  height="22"
                  viewBox="0 0 36 22"
                  fill="none"
                  style={{ position: 'absolute', left: '-26px', top: '10px' }}
                >
                  <path d="M 32 6 C 20 10, 12 16, 4 18" stroke="#84CC16" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M 8 14 L 4 18 L 10 20" stroke="#84CC16" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div
                  style={{
                    background: '#ECFCCB',
                    color: '#365314',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '6px 10px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(132, 204, 22, 0.08)',
                    transform: 'rotate(-2deg)',
                    lineHeight: 1.25,
                  }}
                >
                  Finds the right place
                </div>
              </div>

              {/* Note 3 */}
              <div style={{ position: 'relative', width: '105px' }}>
                <svg
                  width="36"
                  height="22"
                  viewBox="0 0 36 22"
                  fill="none"
                  style={{ position: 'absolute', left: '-26px', top: '10px' }}
                >
                  <path d="M 32 6 C 20 10, 12 16, 4 18" stroke="#818CF8" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M 8 14 L 4 18 L 10 20" stroke="#818CF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div
                  style={{
                    background: '#EEF2FF',
                    color: '#4338F2',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '6px 10px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(67, 56, 242, 0.08)',
                    transform: 'rotate(1deg)',
                    lineHeight: 1.25,
                  }}
                >
                  Moves you forward
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Centered CTA */}
        <div style={{ textAlign: 'center', marginTop: '28px' }}>
          <a
            href="#demo"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#4338F2',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.92rem',
              padding: '11px 26px',
              borderRadius: '9999px',
              textDecoration: 'none',
              boxShadow: '0 6px 18px rgba(67, 56, 242, 0.3)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            className="problem-cta-btn"
          >
            <span>See how it works</span>
            <ArrowRight size={15} />
          </a>
        </div>
      </div>

      <style>{`
        .problem-canvas {
          padding-inline: clamp(16px, 3.5vw, 36px);
        }
        .rigid-row, .adaptive-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 5px 4px;
        }
        .row-time {
          font-size: 0.73rem;
          color: #9CA3AF;
          font-weight: 600;
          width: 38px;
          flex-shrink: 0;
        }
        .row-text {
          font-size: 0.8rem;
          color: #17172B;
          font-weight: 500;
          flex: 1;
        }
        .strike {
          color: #9CA3AF !important;
          text-decoration: line-through;
        }
        .problem-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(67, 56, 242, 0.42) !important;
          background-color: #382ED2 !important;
        }
        @media (max-width: 1220px) {
          .sticky-notes-left, .sticky-notes-right {
            display: none !important;
          }
        }
        @media (max-width: 820px) {
          .problem-comparison-stage {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </section>
  );
};
