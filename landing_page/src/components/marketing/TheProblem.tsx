import React from 'react';
import { X, Lock, Sparkles, ArrowRight } from 'lucide-react';

export const TheProblem: React.FC = () => {
  return (
    <section
      id="problem"
      style={{
        paddingBlock: '60px 90px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="SectionCanvas" style={{ maxWidth: '1440px', position: 'relative' }}>
        {/* Section Heading */}
        <div style={{ textAlign: 'center', maxWidth: '780px', marginInline: 'auto', marginBottom: '56px' }}>
          <h2
            style={{
              fontSize: 'clamp(2.3rem, 4.2vw, 3.8rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.04em',
              color: '#111827',
              marginBottom: '14px',
            }}
          >
            Life doesn’t follow your plan.
          </h2>
          <p
            style={{
              fontSize: '1.1rem',
              color: '#52526B',
              lineHeight: 1.6,
              maxWidth: '560px',
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
            gap: '24px',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* ================= LEFT: RIGID PLAN ================= */}
          <div style={{ position: 'relative' }}>
            {/* Sticky Floating Pink Callouts on Left */}
            <div
              className="sticky-notes-left"
              style={{
                position: 'absolute',
                left: '-135px',
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
              <div style={{ position: 'relative', width: '120px' }}>
                <div
                  style={{
                    background: '#FFE4E6',
                    color: '#9F1239',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(225, 29, 72, 0.08)',
                    transform: 'rotate(-3deg)',
                    lineHeight: 1.3,
                  }}
                >
                  Plans keep shifting
                </div>
                {/* Curved Arrow to Schedule */}
                <svg
                  width="40"
                  height="26"
                  viewBox="0 0 40 26"
                  fill="none"
                  style={{ position: 'absolute', right: '-32px', top: '14px' }}
                >
                  <path d="M 4 8 C 18 12, 28 20, 36 22" stroke="#FDA4AF" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M 32 18 L 36 22 L 30 24" stroke="#FDA4AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Note 2 */}
              <div style={{ position: 'relative', width: '120px' }}>
                <div
                  style={{
                    background: '#FFE4E6',
                    color: '#9F1239',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(225, 29, 72, 0.08)',
                    transform: 'rotate(2deg)',
                    lineHeight: 1.3,
                  }}
                >
                  Always something urgent
                </div>
                <svg
                  width="40"
                  height="26"
                  viewBox="0 0 40 26"
                  fill="none"
                  style={{ position: 'absolute', right: '-32px', top: '14px' }}
                >
                  <path d="M 4 8 C 18 12, 28 20, 36 22" stroke="#FDA4AF" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M 32 18 L 36 22 L 30 24" stroke="#FDA4AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Note 3 */}
              <div style={{ position: 'relative', width: '120px' }}>
                <div
                  style={{
                    background: '#FFE4E6',
                    color: '#9F1239',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(225, 29, 72, 0.08)',
                    transform: 'rotate(-2deg)',
                    lineHeight: 1.3,
                  }}
                >
                  End the day still behind
                </div>
                <svg
                  width="40"
                  height="26"
                  viewBox="0 0 40 26"
                  fill="none"
                  style={{ position: 'absolute', right: '-32px', top: '14px' }}
                >
                  <path d="M 4 8 C 18 12, 28 20, 36 22" stroke="#FDA4AF" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M 32 18 L 36 22 L 30 24" stroke="#FDA4AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Rigid Card Shell */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '26px',
                padding: '24px 22px',
                boxShadow: '0 16px 40px rgba(23, 23, 43, 0.05)',
                border: '1px solid rgba(23, 23, 43, 0.06)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <span
                  style={{
                    background: '#E5E7EB',
                    color: '#1F2937',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                  }}
                >
                  Rigid plan
                </span>
                <span style={{ fontSize: '0.8rem', color: '#6B7280', lineHeight: 1.2 }}>
                  Looks good on paper.<br />Falls apart in real life.
                </span>
              </div>

              {/* Rows List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {/* 8 AM */}
                <div className="rigid-row">
                  <span className="row-time">8 AM</span>
                  <span className="row-text strike">Workout</span>
                  <X size={15} color="#9CA3AF" />
                </div>

                {/* 9 AM */}
                <div className="rigid-row">
                  <span className="row-time">9 AM</span>
                  <span className="row-text strike">Team sync</span>
                  <X size={15} color="#9CA3AF" />
                </div>

                {/* 10 AM - Urgent */}
                <div
                  className="rigid-row"
                  style={{
                    background: '#FEE2E2',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    border: '1px solid #FECACA',
                  }}
                >
                  <span className="row-time" style={{ color: '#991B1B' }}>10 AM</span>
                  <span style={{ color: '#991B1B', fontWeight: 700, fontSize: '0.82rem', flex: 1 }}>
                    Urgent: client issue
                  </span>
                  <X size={15} color="#DC2626" />
                </div>

                {/* 11 AM */}
                <div className="rigid-row">
                  <span className="row-time">11 AM</span>
                  <span className="row-text strike">Product work</span>
                  <X size={15} color="#9CA3AF" />
                </div>

                {/* 12 PM */}
                <div className="rigid-row">
                  <span className="row-time">12 PM</span>
                  <span className="row-text strike">Lunch</span>
                  <X size={15} color="#9CA3AF" />
                </div>

                {/* 1 PM */}
                <div className="rigid-row">
                  <span className="row-time">1 PM</span>
                  <span className="row-text strike">Investor prep</span>
                  <X size={15} color="#9CA3AF" />
                </div>

                {/* 2 PM - Another urgent */}
                <div
                  className="rigid-row"
                  style={{
                    background: '#FEE2E2',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    border: '1px solid #FECACA',
                  }}
                >
                  <span className="row-time" style={{ color: '#991B1B' }}>2 PM</span>
                  <span style={{ color: '#991B1B', fontWeight: 700, fontSize: '0.82rem', flex: 1 }}>
                    Another urgent task
                  </span>
                  <X size={15} color="#DC2626" />
                </div>

                {/* 3 PM */}
                <div className="rigid-row">
                  <span className="row-time">3 PM</span>
                  <span className="row-text strike">Design review</span>
                  <X size={15} color="#9CA3AF" />
                </div>

                {/* 4 PM */}
                <div className="rigid-row">
                  <span className="row-time">4 PM</span>
                  <span className="row-text strike">Catch up</span>
                  <X size={15} color="#9CA3AF" />
                </div>

                {/* 5 PM */}
                <div className="rigid-row">
                  <span className="row-time">5 PM</span>
                  <span className="row-text strike">Plan tomorrow</span>
                  <X size={15} color="#9CA3AF" />
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
              paddingInline: '12px',
              minWidth: '170px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#4B5563',
                marginBottom: '16px',
                maxWidth: '120px',
              }}
            >
              From a day that breaks...
            </div>

            {/* Trajectory Arc with Morphing Dots */}
            <svg width="150" height="90" viewBox="0 0 150 90" fill="none" style={{ overflow: 'visible' }}>
              {/* Curve arc */}
              <path
                d="M 10 70 C 40 85, 80 75, 128 32"
                stroke="rgba(67, 56, 242, 0.12)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* Dots sequence: gray -> blue -> lime */}
              <circle cx="15" cy="72" r="3" fill="#9CA3AF" />
              <circle cx="32" cy="78" r="3.2" fill="#9CA3AF" />
              <circle cx="52" cy="79" r="3.5" fill="#6B7280" />
              <circle cx="72" cy="74" r="3.8" fill="#4338F2" />
              <circle cx="92" cy="63" r="4.2" fill="#4338F2" />
              <circle cx="112" cy="48" r="4.6" fill="#C9F455" />

              {/* Final Lime Circle Badge with Arrow */}
              <circle cx="132" cy="30" r="13" fill="#C9F455" />
              <path d="M 129 30 L 135 30 M 133 27 L 136 30 L 133 33" stroke="#17172B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#17172B',
                marginTop: '16px',
                maxWidth: '120px',
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
                borderRadius: '26px',
                padding: '24px 22px',
                boxShadow: '0 16px 40px rgba(23, 23, 43, 0.05)',
                border: '1px solid rgba(23, 23, 43, 0.06)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <span
                  style={{
                    background: '#EEF2FF',
                    color: '#4338F2',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                  }}
                >
                  A plan that adapts
                </span>
                <span style={{ fontSize: '0.8rem', color: '#6B7280', lineHeight: 1.2 }}>
                  Same day.<br />A better way.
                </span>
              </div>

              {/* Rows List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {/* 8 AM - Protected */}
                <div
                  className="adaptive-row"
                  style={{
                    background: '#EEF2FF',
                    borderRadius: '8px',
                    padding: '7px 10px',
                  }}
                >
                  <span className="row-time" style={{ color: '#4338F2' }}>8 AM</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                    <Lock size={12} color="#4338F2" />
                    <span style={{ color: '#1E1B4B', fontWeight: 600, fontSize: '0.82rem' }}>Workout</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#4338F2' }}>Protected</span>
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
                    borderRadius: '8px',
                    padding: '7px 10px',
                  }}
                >
                  <span className="row-time">10 AM</span>
                  <span style={{ color: '#17172B', fontWeight: 600, fontSize: '0.82rem', flex: 1 }}>
                    Urgent: client issue
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#6B7280' }}>Proposed</span>
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
                    borderRadius: '8px',
                    padding: '7px 10px',
                  }}
                >
                  <span className="row-time" style={{ color: '#4338F2' }}>12 PM</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                    <Lock size={12} color="#4338F2" />
                    <span style={{ color: '#1E1B4B', fontWeight: 600, fontSize: '0.82rem' }}>Lunch</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#4338F2' }}>Protected</span>
                </div>

                {/* 1 PM - Flexible Block Moved */}
                <div
                  className="adaptive-row"
                  style={{
                    background: '#D4F94C',
                    borderRadius: '8px',
                    padding: '7px 10px',
                    boxShadow: '0 2px 8px rgba(201, 244, 85, 0.3)',
                  }}
                >
                  <span className="row-time" style={{ color: '#2C400B' }}>1 PM</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                    <Sparkles size={13} color="#17172B" />
                    <span style={{ color: '#17172B', fontWeight: 800, fontSize: '0.82rem' }}>Flexible block</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2C400B' }}>Moved for you</span>
                </div>

                {/* 2 PM */}
                <div className="adaptive-row">
                  <span className="row-time">2 PM</span>
                  <span className="row-text">Investor prep</span>
                </div>

                {/* 3 PM */}
                <div className="adaptive-row">
                  <span className="row-time">3 PM</span>
                  <span className="row-text">Design review</span>
                </div>

                {/* 4 PM */}
                <div className="adaptive-row">
                  <span className="row-time">4 PM</span>
                  <span className="row-text">Catch up</span>
                </div>

                {/* 5 PM */}
                <div className="adaptive-row">
                  <span className="row-time">5 PM</span>
                  <span className="row-text">Plan tomorrow</span>
                </div>
              </div>
            </div>

            {/* Sticky Floating Blue & Lime Callouts on Right */}
            <div
              className="sticky-notes-right"
              style={{
                position: 'absolute',
                right: '-145px',
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
              <div style={{ position: 'relative', width: '130px' }}>
                <svg
                  width="40"
                  height="26"
                  viewBox="0 0 40 26"
                  fill="none"
                  style={{ position: 'absolute', left: '-32px', top: '14px' }}
                >
                  <path d="M 36 8 C 22 12, 12 20, 4 22" stroke="#818CF8" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M 8 18 L 4 22 L 10 24" stroke="#818CF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div
                  style={{
                    background: '#EEF2FF',
                    color: '#4338F2',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(67, 56, 242, 0.08)',
                    transform: 'rotate(2deg)',
                    lineHeight: 1.3,
                  }}
                >
                  Your commitments stay protected
                </div>
              </div>

              {/* Note 2 */}
              <div style={{ position: 'relative', width: '130px' }}>
                <svg
                  width="40"
                  height="26"
                  viewBox="0 0 40 26"
                  fill="none"
                  style={{ position: 'absolute', left: '-32px', top: '14px' }}
                >
                  <path d="M 36 8 C 22 12, 12 20, 4 22" stroke="#84CC16" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M 8 18 L 4 22 L 10 24" stroke="#84CC16" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div
                  style={{
                    background: '#ECFCCB',
                    color: '#365314',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(132, 204, 22, 0.08)',
                    transform: 'rotate(-2deg)',
                    lineHeight: 1.3,
                  }}
                >
                  Dots finds the right place
                </div>
              </div>

              {/* Note 3 */}
              <div style={{ position: 'relative', width: '130px' }}>
                <svg
                  width="40"
                  height="26"
                  viewBox="0 0 40 26"
                  fill="none"
                  style={{ position: 'absolute', left: '-32px', top: '14px' }}
                >
                  <path d="M 36 8 C 22 12, 12 20, 4 22" stroke="#818CF8" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M 8 18 L 4 22 L 10 24" stroke="#818CF8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div
                  style={{
                    background: '#EEF2FF',
                    color: '#4338F2',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(67, 56, 242, 0.08)',
                    transform: 'rotate(1deg)',
                    lineHeight: 1.3,
                  }}
                >
                  A realistic day that still moves you forward
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Centered CTA */}
        <div style={{ textAlign: 'center', marginTop: '54px' }}>
          <a
            href="#demo"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: '#4338F2',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.98rem',
              padding: '14px 32px',
              borderRadius: '9999px',
              textDecoration: 'none',
              boxShadow: '0 6px 20px rgba(67, 56, 242, 0.35)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            className="problem-cta-btn"
          >
            <span>See how it works</span>
            <ArrowRight size={17} />
          </a>
        </div>
      </div>

      <style>{`
        .rigid-row, .adaptive-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 6px 4px;
        }
        .row-time {
          font-size: 0.75rem;
          color: #9CA3AF;
          font-weight: 600;
          width: 44px;
          flex-shrink: 0;
        }
        .row-text {
          font-size: 0.82rem;
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
          box-shadow: 0 10px 28px rgba(67, 56, 242, 0.45) !important;
          background-color: #382ED2 !important;
        }
        @media (max-width: 1100px) {
          .sticky-notes-left, .sticky-notes-right {
            display: none !important;
          }
        }
        @media (max-width: 820px) {
          .problem-comparison-stage {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </section>
  );
};
