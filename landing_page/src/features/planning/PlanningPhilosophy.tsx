import React from 'react';
import { Lock, BarChart2, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export const PlanningPhilosophy: React.FC = () => {
  return (
    <section
      id="planning"
      style={{
        paddingBlock: '70px 110px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="SectionCanvas" style={{ maxWidth: '1460px', position: 'relative' }}>
        {/* Section Heading & Subtitle */}
        <div style={{ textAlign: 'center', maxWidth: '780px', marginInline: 'auto', marginBottom: '52px' }}>
          <div
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#6B7280',
              marginBottom: '10px',
            }}
          >
            PLANNING PHILOSOPHY
          </div>
          <h2
            style={{
              fontSize: 'clamp(2.3rem, 4.2vw, 3.85rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.04em',
              color: '#111827',
              marginBottom: '14px',
            }}
          >
            Realistic, not perfect.
          </h2>
          <p
            style={{
              fontSize: '1.08rem',
              color: '#52526B',
              lineHeight: 1.62,
              maxWidth: '600px',
              marginInline: 'auto',
            }}
          >
            A plan that reflects real life, so you can move forward with confidence.
          </p>
        </div>

        {/* Central Interconnected Stage */}
        <div
          className="philosophy-stage-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(260px, 320px) minmax(360px, 440px) minmax(260px, 320px)',
            gap: '28px',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            marginInline: 'auto',
          }}
        >
          {/* ================= LEFT COLUMN: 2 CONNECTED CARDS ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', position: 'relative' }}>
            {/* Annotation 1 */}
            <div
              className="philosophy-annotation"
              style={{
                position: 'absolute',
                top: '-35px',
                left: '-10px',
                fontSize: '0.78rem',
                color: '#6B7280',
                fontStyle: 'italic',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>A more balanced you</span>
              <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
                <path d="M 2 2 C 10 2, 18 8, 20 14" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 16 12 L 20 14 L 20 10" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Card 1: Protected Commitments */}
            <div className="philosophy-feature-card">
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '14px',
                  background: '#EEF2FF',
                  color: '#4338F2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Lock size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#17172B' }}>
                  Protected Commitments
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px', lineHeight: 1.4 }}>
                  Your must-dos stay protected.
                </div>
              </div>
            </div>

            {/* Card 2: Flexible Focus Work */}
            <div className="philosophy-feature-card">
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '14px',
                  background: '#F5F3FF',
                  color: '#8B5CF6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <BarChart2 size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#17172B' }}>
                  Flexible Focus Work
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px', lineHeight: 1.4 }}>
                  Make progress on what moves you forward.
                </div>
              </div>
            </div>

            {/* Annotation 2 */}
            <div
              className="philosophy-annotation"
              style={{
                position: 'absolute',
                bottom: '-32px',
                left: '20px',
                fontSize: '0.78rem',
                color: '#6B7280',
                fontStyle: 'italic',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Space to do your best work</span>
              <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
                <path d="M 2 16 C 10 16, 18 10, 20 4" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 16 6 L 20 4 L 20 8" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* ================= CENTER COLUMN: COBALT PUDDLE + SCHEDULE ================= */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            {/* Cobalt Organic Puddle Background */}
            <div
              style={{
                position: 'absolute',
                inset: '-24px -28px',
                background: 'linear-gradient(135deg, #363CE8 0%, #252BD5 100%)',
                borderRadius: '44px',
                boxShadow: '0 24px 60px -8px rgba(37, 43, 213, 0.38)',
                zIndex: 0,
              }}
            />

            {/* White Daily Schedule Card */}
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                background: '#FFFFFF',
                borderRadius: '26px',
                padding: '24px 22px',
                width: '100%',
                boxShadow: '0 16px 44px rgba(0, 0, 0, 0.12)',
              }}
            >
              {/* Card Header: Today Wed, Apr 16 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#17172B' }}>
                  Today
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>
                    Wed, Apr 16
                  </span>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    <button
                      type="button"
                      aria-label="Previous day"
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        border: '1px solid #E5E7EB',
                        background: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <ChevronLeft size={14} color="#6B7280" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next day"
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        border: '1px solid #E5E7EB',
                        background: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <ChevronRight size={14} color="#6B7280" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Schedule Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* 8 AM - Protected */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: '#EEF2FF',
                    borderLeft: '3px solid #4338F2',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.74rem', color: '#4338F2', fontWeight: 700 }}>8 AM</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Lock size={12} color="#4338F2" />
                      <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1E1B4B' }}>Team sync</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#6366F1', fontWeight: 600 }}>30m</span>
                </div>

                {/* 9 AM - Deep Work */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: '#F5F3FF',
                    borderLeft: '3px solid #8B5CF6',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.74rem', color: '#7C3AED', fontWeight: 700 }}>9 AM</span>
                    <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#581C87' }}>Deep work</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#7C3AED', fontWeight: 600 }}>2h</span>
                </div>

                {/* 11 AM - Lunch */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: '#F9FAFB',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.74rem', color: '#9CA3AF', fontWeight: 600 }}>11 AM</span>
                    <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Lunch</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>1h</span>
                </div>

                {/* 12 PM - Client Review */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: '#EEF2FF',
                    borderLeft: '3px solid #4338F2',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.74rem', color: '#4338F2', fontWeight: 700 }}>12 PM</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Lock size={12} color="#4338F2" />
                      <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1E1B4B' }}>Client review</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#6366F1', fontWeight: 600 }}>1h</span>
                </div>

                {/* 1 PM - Buffer (Lime Highlight) */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    background: '#D4F94C',
                    boxShadow: '0 2px 10px rgba(201, 244, 85, 0.4)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.74rem', color: '#273A0A', fontWeight: 700 }}>1 PM</span>
                    <span style={{ fontWeight: 800, fontSize: '0.84rem', color: '#17172B' }}>Buffer</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#273A0A', fontWeight: 700 }}>1h</span>
                </div>

                {/* 2 PM - Focus Work */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: '#F5F3FF',
                    borderLeft: '3px solid #8B5CF6',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.74rem', color: '#7C3AED', fontWeight: 700 }}>2 PM</span>
                    <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#581C87' }}>Focus work</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#7C3AED', fontWeight: 600 }}>2h</span>
                </div>

                {/* 4 PM - Wrap Up */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: '#F9FAFB',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.74rem', color: '#9CA3AF', fontWeight: 600 }}>4 PM</span>
                    <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Wrap up</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>30m</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: 2 CONNECTED CARDS ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', position: 'relative' }}>
            {/* Annotation 3 */}
            <div
              className="philosophy-annotation"
              style={{
                position: 'absolute',
                top: '-35px',
                right: '-10px',
                fontSize: '0.78rem',
                color: '#6B7280',
                fontStyle: 'italic',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Because things change</span>
              <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
                <path d="M 22 2 C 14 2, 6 8, 4 14" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 8 12 L 4 14 L 4 10" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Card 3: Available Capacity */}
            <div className="philosophy-feature-card">
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '14px',
                  background: '#EEF2FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {/* Dotted Spinner Icon */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="3" r="1.8" fill="#4338F2" />
                  <circle cx="18.36" cy="5.64" r="1.8" fill="#4338F2" fillOpacity="0.8" />
                  <circle cx="21" cy="12" r="1.8" fill="#4338F2" fillOpacity="0.6" />
                  <circle cx="18.36" cy="18.36" r="1.8" fill="#4338F2" fillOpacity="0.4" />
                  <circle cx="12" cy="21" r="1.8" fill="#4338F2" fillOpacity="0.2" />
                  <circle cx="5.64" cy="18.36" r="1.8" fill="#4338F2" fillOpacity="0.2" />
                  <circle cx="3" cy="12" r="1.8" fill="#4338F2" fillOpacity="0.3" />
                  <circle cx="5.64" cy="5.64" r="1.8" fill="#4338F2" fillOpacity="0.5" />
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#17172B' }}>
                  Available Capacity
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px', lineHeight: 1.4 }}>
                  Room for what comes up.
                </div>
              </div>
            </div>

            {/* Card 4: Reality Buffer */}
            <div
              className="philosophy-feature-card"
              style={{
                border: '1px solid #D4F94C',
                background: '#F7FEE7',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '14px',
                  background: '#ECFCCB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="3" r="1.8" fill="#65A30D" />
                  <circle cx="18.36" cy="5.64" r="1.8" fill="#65A30D" />
                  <circle cx="21" cy="12" r="1.8" fill="#65A30D" />
                  <circle cx="18.36" cy="18.36" r="1.8" fill="#65A30D" />
                  <circle cx="12" cy="21" r="1.8" fill="#65A30D" fillOpacity="0.4" />
                  <circle cx="5.64" cy="18.36" r="1.8" fill="#65A30D" fillOpacity="0.4" />
                  <circle cx="3" cy="12" r="1.8" fill="#65A30D" fillOpacity="0.6" />
                  <circle cx="5.64" cy="5.64" r="1.8" fill="#65A30D" fillOpacity="0.8" />
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#17172B' }}>
                  Reality Buffer
                </div>
                <div style={{ fontSize: '0.8rem', color: '#365314', marginTop: '4px', lineHeight: 1.4 }}>
                  A calmer day when life happens.
                </div>
              </div>
            </div>

            {/* Annotation 4 */}
            <div
              className="philosophy-annotation"
              style={{
                position: 'absolute',
                bottom: '-32px',
                right: '10px',
                fontSize: '0.78rem',
                color: '#65A30D',
                fontStyle: 'italic',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>Plans that breathe</span>
              <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
                <path d="M 2 16 C 10 16, 18 10, 20 4" stroke="#84CC16" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 16 6 L 20 4 L 20 8" stroke="#84CC16" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom CTA Button */}
        <div style={{ textAlign: 'center', marginTop: '56px' }}>
          <a
            href="#app"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: '#4338F2',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.98rem',
              padding: '14px 34px',
              borderRadius: '9999px',
              textDecoration: 'none',
              boxShadow: '0 6px 22px rgba(67, 56, 242, 0.35)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            }}
            className="philosophy-cta-btn"
          >
            <span>See how it works</span>
            <ArrowRight size={17} />
          </a>
        </div>
      </div>

      <style>{`
        .philosophy-feature-card {
          background: #FFFFFF;
          border-radius: 20px;
          padding: 20px 22px;
          display: flex;
          align-items: center;
          gap: 16px;
          border: 1px solid rgba(23, 23, 43, 0.06);
          box-shadow: 0 8px 24px rgba(23, 23, 43, 0.05);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .philosophy-feature-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(23, 23, 43, 0.08);
        }
        .philosophy-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(67, 56, 242, 0.45) !important;
          background-color: #382ED2 !important;
        }
        @media (max-width: 1040px) {
          .philosophy-stage-grid {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
          .philosophy-annotation {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
};
