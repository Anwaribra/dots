import React from 'react';
import {
  Sun,
  CheckCircle2,
  Sparkles,
  BarChart2,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';

export const TypicalWeek: React.FC = () => {
  return (
    <section
      id="how-it-works"
      style={{
        paddingBlock: '70px 110px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="SectionCanvas" style={{ maxWidth: '1480px', position: 'relative' }}>
        {/* Section Heading & Subtitle */}
        <div style={{ textAlign: 'center', maxWidth: '820px', marginInline: 'auto', marginBottom: '56px' }}>
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
            FROM PLANS TO PROGRESS
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
            A typical week with{' '}
            <span style={{ color: '#4338F2' }}>Dots.</span>
          </h2>
          <p
            style={{
              fontSize: '1.08rem',
              color: '#52526B',
              lineHeight: 1.62,
              maxWidth: '640px',
              marginInline: 'auto',
            }}
          >
            One system, every step. Plan, focus, adapt, and reflect — so your goals keep moving, whatever the week brings.
          </p>
        </div>

        {/* Start / Keep Going Badges */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '12px',
            paddingInline: '10px',
          }}
          className="workflow-journey-indicators"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#84CC16', fontWeight: 800 }}>//</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#17172B' }}>Start here</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#84CC16', fontWeight: 800 }}>//</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#17172B' }}>Keep going</span>
            <ArrowUpRight size={15} color="#4338F2" />
          </div>
        </div>

        {/* 5-Stage Continuous Flow Row */}
        <div
          className="workflow-five-stages-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, minmax(210px, 1fr))',
            gap: '18px',
            alignItems: 'stretch',
            position: 'relative',
          }}
        >
          {/* ================= STAGE 01: PLANNING DAY ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {/* Scene Card */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '22px',
                padding: '16px 14px',
                border: '1px solid rgba(23, 23, 43, 0.08)',
                boxShadow: '0 8px 24px rgba(23, 23, 43, 0.05)',
                minHeight: '230px',
              }}
            >
              {/* Mini Calendar Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <ChevronLeft size={13} color="#9CA3AF" />
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#17172B' }}>
                  Apr 21 – Apr 27, 2025
                </span>
                <ChevronRight size={13} color="#9CA3AF" />
              </div>

              {/* Day Headers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center', fontSize: '0.66rem', color: '#6B7280', fontWeight: 600, marginBottom: '8px' }}>
                <div>Mon 21</div>
                <div>Tue 22</div>
                <div>Wed 23</div>
              </div>

              {/* Schedule Blocks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.66rem' }}>
                <div style={{ background: '#EEF2FF', padding: '6px 8px', borderRadius: '6px', borderLeft: '2px solid #4338F2' }}>
                  <div style={{ fontWeight: 700, color: '#1E1B4B' }}>Product launch</div>
                  <div style={{ color: '#6366F1' }}>9 – 11</div>
                </div>

                <div style={{ background: '#F7FEE7', padding: '6px 8px', borderRadius: '6px', borderLeft: '2px solid #84CC16', marginLeft: '25%' }}>
                  <div style={{ fontWeight: 700, color: '#365314' }}>Team sync</div>
                  <div style={{ color: '#65A30D' }}>11 – 12</div>
                </div>

                <div style={{ background: '#EEF2FF', padding: '6px 8px', borderRadius: '6px', borderLeft: '2px solid #4338F2' }}>
                  <div style={{ fontWeight: 700, color: '#1E1B4B' }}>Planning</div>
                  <div style={{ color: '#6366F1' }}>1 – 2</div>
                </div>
              </div>
            </div>

            {/* Stage Label */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#C9F455' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#6B7280' }}>01</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#17172B' }}>
                Planning Day
              </div>
              <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '4px', lineHeight: 1.4 }}>
                Bring together your goals, priorities, and availability for the week ahead.
              </div>
            </div>
          </div>

          {/* ================= STAGE 02: EVERY MORNING ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {/* Scene Card */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '22px',
                padding: '18px 16px',
                border: '1px solid rgba(23, 23, 43, 0.08)',
                boxShadow: '0 8px 24px rgba(23, 23, 43, 0.05)',
                minHeight: '230px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Sun size={17} color="#4338F2" />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.8rem', color: '#17172B' }}>Good morning!</div>
                  <div style={{ fontSize: '0.68rem', color: '#6B7280' }}>Here’s your plan for today.</div>
                </div>
              </div>

              {/* Checkboxes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.72rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', background: '#EEF2FF', padding: '6px 8px', borderRadius: '6px' }}>
                  <div style={{ width: 14, height: 14, borderRadius: '3px', background: '#4338F2', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700 }}>✓</div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1E1B4B' }}>Product review</div>
                    <div style={{ color: '#6366F1', fontSize: '0.64rem' }}>9:00 – 10:00</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '4px 6px' }}>
                  <div style={{ width: 14, height: 14, borderRadius: '3px', border: '1.5px solid #D1D5DB' }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#374151' }}>Customer calls</div>
                    <div style={{ color: '#9CA3AF', fontSize: '0.64rem' }}>10:30 – 11:30</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '4px 6px' }}>
                  <div style={{ width: 14, height: 14, borderRadius: '3px', border: '1.5px solid #D1D5DB' }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#374151' }}>Write blog post</div>
                    <div style={{ color: '#9CA3AF', fontSize: '0.64rem' }}>1:00 – 2:00</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stage Label */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#C9F455' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#6B7280' }}>02</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#17172B' }}>
                Every Morning
              </div>
              <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '4px', lineHeight: 1.4 }}>
                Get a clear, realistic plan for the day, based on your priorities.
              </div>
            </div>
          </div>

          {/* ================= STAGE 03: THROUGHOUT THE DAY (FEATURED COBALT) ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
            {/* Cobalt Wrapper */}
            <div
              style={{
                background: 'linear-gradient(135deg, #363CE8 0%, #252BD5 100%)',
                borderRadius: '26px',
                padding: '14px',
                boxShadow: '0 16px 36px rgba(37, 43, 213, 0.35)',
                minHeight: '230px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              {/* White Focus Box Inside */}
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '18px',
                  padding: '16px 14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#4338F2', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={13} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.8rem', color: '#17172B' }}>Focusing</div>
                    <div style={{ fontSize: '0.66rem', color: '#6B7280' }}>You’re on track.</div>
                  </div>
                </div>

                <div
                  style={{
                    background: '#EEF2FF',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.74rem', color: '#1E1B4B' }}>Design work</div>
                    <div style={{ fontSize: '0.64rem', color: '#6366F1' }}>10:00 – 12:00</div>
                  </div>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2.5px solid #C9F455', borderTopColor: 'transparent' }} />
                </div>

                <div style={{ fontSize: '0.68rem', color: '#6B7280' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span>Daily progress</span>
                    <span style={{ fontWeight: 700, color: '#17172B' }}>3/5</span>
                  </div>
                  <div style={{ width: '100%', height: '5px', borderRadius: '3px', background: '#F3F4F6', overflow: 'hidden' }}>
                    <div style={{ width: '60%', height: '100%', background: '#4338F2', borderRadius: '3px' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Stage Label */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#C9F455' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#6B7280' }}>03</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#17172B' }}>
                Throughout the Day
              </div>
              <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '4px', lineHeight: 1.4 }}>
                Stay focused, check progress, and let Dots keep the big picture in view.
              </div>
            </div>
          </div>

          {/* ================= STAGE 04: WHEN PLANS CHANGE ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {/* Scene Card */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '22px',
                padding: '16px 14px',
                border: '1px solid rgba(23, 23, 43, 0.08)',
                boxShadow: '0 8px 24px rgba(23, 23, 43, 0.05)',
                minHeight: '230px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Sparkles size={16} color="#4338F2" />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.78rem', color: '#17172B' }}>Adapting your plan</div>
                  <div style={{ fontSize: '0.66rem', color: '#6B7280' }}>A new request came up.</div>
                </div>
              </div>

              {/* Shifted Blocks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ background: '#F9FAFB', padding: '8px 10px', borderRadius: '8px' }}>
                  <div style={{ color: '#9CA3AF', fontSize: '0.7rem', fontWeight: 600 }}>Client call</div>
                  <div style={{ color: '#D1D5DB', fontSize: '0.64rem', textDecoration: 'line-through' }}>3:00 – 4:00</div>
                </div>

                <div
                  style={{
                    background: '#D4F94C',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(201, 244, 85, 0.4)',
                  }}
                >
                  <div style={{ color: '#17172B', fontSize: '0.72rem', fontWeight: 800 }}>Client call</div>
                  <div style={{ color: '#273A0A', fontSize: '0.64rem', fontWeight: 700 }}>4:00 – 5:00</div>
                </div>
              </div>
            </div>

            {/* Stage Label */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#C9F455' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#6B7280' }}>04</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#17172B' }}>
                When Plans Change
              </div>
              <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '4px', lineHeight: 1.4 }}>
                Dots prepares a revised plan, suggests the best next steps, and keeps you on track.
              </div>
            </div>
          </div>

          {/* ================= STAGE 05: END OF WEEK ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {/* Scene Card */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '22px',
                padding: '16px 14px',
                border: '1px solid rgba(23, 23, 43, 0.08)',
                boxShadow: '0 8px 24px rgba(23, 23, 43, 0.05)',
                minHeight: '230px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <BarChart2 size={16} color="#4338F2" />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.78rem', color: '#17172B' }}>A productive week</div>
                  <div style={{ fontSize: '0.66rem', color: '#6B7280' }}>You made great progress!</div>
                </div>
              </div>

              {/* Metric rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.72rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F9FAFB', padding: '6px 8px', borderRadius: '6px' }}>
                  <CheckCircle2 size={13} color="#4338F2" />
                  <span style={{ fontWeight: 600, color: '#17172B' }}>12 tasks completed</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F9FAFB', padding: '6px 8px', borderRadius: '6px' }}>
                  <Clock size={13} color="#4338F2" />
                  <span style={{ fontWeight: 600, color: '#17172B' }}>20 hrs of focused work</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F9FAFB', padding: '6px 8px', borderRadius: '6px' }}>
                  <Star size={13} color="#F59E0B" />
                  <span style={{ fontWeight: 600, color: '#17172B' }}>Launched product update</span>
                </div>
              </div>
            </div>

            {/* Stage Label */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#C9F455' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#6B7280' }}>05</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#17172B' }}>
                End of Week
              </div>
              <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '4px', lineHeight: 1.4 }}>
                Look back, celebrate progress, and set yourself up for what’s next.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Editorial Detail */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '60px',
          }}
        >
          <div style={{ width: '40px', height: '1px', background: '#E5E7EB' }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9CA3AF' }}>
            A MORE FOCUSED TOMORROW
          </span>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9F455' }} />
          <div style={{ width: '40px', height: '1px', background: '#E5E7EB' }} />
        </div>
      </div>

      <style>{`
        @media (max-width: 1040px) {
          .workflow-five-stages-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 24px !important;
          }
        }
        @media (max-width: 640px) {
          .workflow-five-stages-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .workflow-journey-indicators {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
};
