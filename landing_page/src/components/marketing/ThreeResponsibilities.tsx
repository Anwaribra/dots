import React from 'react';
import { PrioritySignalCard } from './responsibilities/PrioritySignalCard';
import { WeeklyPlanCalendar } from './responsibilities/WeeklyPlanCalendar';
import { AdaptationSignalCard } from './responsibilities/AdaptationSignalCard';
import { ConnectionPaths } from './responsibilities/ConnectionPaths';
import {
  PRIORITY_SIGNALS_FIXTURE,
  ADAPTATION_SIGNALS_FIXTURE,
} from './responsibilities/fixtures';

export const ThreeResponsibilities: React.FC = () => {
  return (
    <section
      id="responsibilities"
      style={{
        paddingBlock: '96px 112px',
        position: 'relative',
      }}
    >
      <div
        className="SectionCanvas"
        style={{
          maxWidth: '1760px',
        }}
      >
        {/* The Master White Rounded Canvas Card */}
        <div
          className="responsibilities-frame-canvas"
          style={{
            background: '#FFFFFF',
            borderRadius: '42px',
            padding: 'clamp(48px, 5vw, 80px) clamp(28px, 4vw, 64px) 48px',
            boxShadow: '0 28px 76px -28px rgba(45, 50, 212, 0.18), 0 2px 10px rgba(23, 23, 43, 0.03)',
            border: '1px solid rgba(23, 23, 43, 0.04)',
            position: 'relative',
          }}
        >
          {/* Section Main Title */}
          <div
            style={{
              textAlign: 'center',
              maxWidth: '1180px',
              marginInline: 'auto',
              marginBottom: 'clamp(56px, 6vw, 88px)',
            }}
          >
            <h2
              style={{
                fontSize: 'clamp(2.35rem, 4.35vw, 4.15rem)',
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.045em',
                color: '#111827',
                marginBottom: '16px',
              }}
            >
              One system. Three responsibilities.
            </h2>
            <p
              style={{
                fontSize: 'clamp(1rem, 1.35vw, 1.22rem)',
                lineHeight: 1.65,
                color: '#52526B',
                maxWidth: '780px',
                marginInline: 'auto',
                whiteSpace: 'pre-line',
              }}
            >
              {'Dots connects what matters, plans your time, and adapts when life changes —\nso you can keep moving forward.'}
            </p>
          </div>

          {/* Main 3-Panel Connected Stage */}
          <div
            className="composition-stage-wrapper"
            style={{
              position: 'relative',
              minHeight: '590px',
            }}
          >
            {/* SVG Connection Wires & Center Blue Organic Shape */}
            <ConnectionPaths />

            {/* 3 Panels Positioned Over the Canvas */}
            {/* 3 Panels Positioned Over the Canvas */}
            <div
              className="composition-panels-row"
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'grid',
                gridTemplateColumns: 'minmax(250px, 0.82fr) minmax(560px, 1.76fr) minmax(250px, 0.82fr)',
                gap: 'clamp(28px, 3vw, 52px)',
                alignItems: 'stretch',
              }}
            >
              {/* PANEL 01: Understand priorities (Left) */}
              <div
                id="stage-panel-left"
                className="stage-panel stage-panel-left"
                style={{
                  background: '#EEF3FD',
                  borderRadius: '24px',
                  padding: '34px 28px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '20px',
                  boxShadow: '0 4px 18px rgba(45, 50, 212, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  position: 'relative',
                }}
              >
                <div>
                  {/* Step 01 indicator */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '12px',
                    }}
                  >
                    <div
                      style={{
                        width: 11,
                        height: 11,
                        borderRadius: '50%',
                        background: '#D2F64C',
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: '#111827',
                        letterSpacing: '0.04em',
                      }}
                    >
                      01
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: 'clamp(1.5rem, 2vw, 2.05rem)',
                      fontWeight: 800,
                      lineHeight: 1.16,
                      color: '#111827',
                      letterSpacing: '-0.03em',
                      marginBottom: '8px',
                    }}
                  >
                    {'Understand\npriorities'}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.95rem',
                      lineHeight: 1.55,
                      color: '#6B7280',
                    }}
                  >
                    {'Bring together your goals,\ndeadlines and capacity.'}
                  </p>
                </div>

                {/* 3 Signal Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {PRIORITY_SIGNALS_FIXTURE.map((sig) => (
                    <PrioritySignalCard key={sig.id} signal={sig} />
                  ))}
                </div>
              </div>

              {/* PANEL 02: Plan your week (Center) — Sculpted Organic Silhouette */}
              <div
                id="stage-panel-center"
                className="stage-panel stage-panel-center"
                style={{
                  position: 'relative',
                  padding: '34px clamp(24px, 3.8vw, 52px) 40px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  color: '#FFFFFF',
                  background: 'transparent',
                }}
              >
                {/* Custom Organic Blue-Violet Silhouette Vector Background */}
                <div
                  className="center-silhouette-vector-bg"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: '-34px', // funnel pinch nozzle projects toward the right panel
                    bottom: 0,
                    zIndex: 0,
                    pointerEvents: 'none',
                  }}
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 1000 700"
                    preserveAspectRatio="none"
                    style={{
                      width: '100%',
                      height: '100%',
                      overflow: 'visible',
                    }}
                  >
                    <defs>
                      <linearGradient id="centralSilhouetteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4346E2" />
                        <stop offset="50%" stopColor="#2E31D6" />
                        <stop offset="100%" stopColor="#2221AC" />
                      </linearGradient>
                      <filter id="centralSilhouetteShadow" x="-15%" y="-15%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="24" stdDeviation="28" floodColor="#1B1F9E" floodOpacity="0.32" />
                      </filter>
                    </defs>
                    <path
                      d="M 80 14 C 320 6, 680 6, 800 16 C 855 20, 885 50, 898 105 C 905 145, 915 190, 935 220 C 955 244, 985 258, 1000 266 C 980 278, 955 295, 938 318 C 922 342, 917 368, 917 400 C 917 470, 917 540, 908 590 C 898 640, 860 682, 800 694 C 660 702, 340 702, 200 694 C 115 688, 55 645, 30 590 C 5 530, 0 450, 0 350 C 0 250, 2 150, 8 100 C 16 55, 40 22, 80 14 Z"
                      fill="url(#centralSilhouetteGradient)"
                      filter="url(#centralSilhouetteShadow)"
                    />
                  </svg>
                </div>

                {/* Relative Content Area Sitting on top of the Silhouette */}
                <div
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    paddingLeft: '16px',
                  }}
                >
                  {/* Step 02 indicator */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                    }}
                  >
                    <div
                      style={{
                        width: 11,
                        height: 11,
                        borderRadius: '50%',
                        background: '#D2F64C',
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: 'rgba(255, 255, 255, 0.95)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      02
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: 'clamp(1.7rem, 2.35vw, 2.45rem)',
                      fontWeight: 800,
                      lineHeight: 1.15,
                      color: '#FFFFFF',
                      letterSpacing: '-0.03em',
                      marginBottom: '4px',
                    }}
                  >
                    Plan your week
                  </h3>
                  <p
                    style={{
                      fontSize: '1rem',
                      lineHeight: 1.5,
                      color: 'rgba(255, 255, 255, 0.88)',
                    }}
                  >
                    {'Turn priorities into a realistic plan\nwith protected commitments.'}
                  </p>
                </div>

                {/* Embedded White Glass Calendar */}
                <div style={{ position: 'relative', zIndex: 2, width: '100%' }}>
                  <WeeklyPlanCalendar />
                </div>
              </div>

              {/* PANEL 03: Adapt when life changes (Right) */}
              <div
                id="stage-panel-right"
                className="stage-panel stage-panel-right"
                style={{
                  background: '#EEF3FD',
                  borderRadius: '24px',
                  padding: '34px 28px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '20px',
                  boxShadow: '0 4px 18px rgba(45, 50, 212, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  position: 'relative',
                }}
              >
                <div>
                  {/* Step 03 indicator */}
                  <div
                    id="badge-step-03"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '12px',
                    }}
                  >
                    <div
                      id="badge-step-03-dot"
                      style={{
                        width: 11,
                        height: 11,
                        borderRadius: '50%',
                        background: '#D2F64C',
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        color: '#111827',
                        letterSpacing: '0.04em',
                      }}
                    >
                      03
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: 'clamp(1.5rem, 2vw, 2.05rem)',
                      fontWeight: 800,
                      lineHeight: 1.16,
                      color: '#111827',
                      letterSpacing: '-0.03em',
                      marginBottom: '8px',
                    }}
                  >
                    {'Adapt when\nlife changes'}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.95rem',
                      lineHeight: 1.55,
                      color: '#6B7280',
                    }}
                  >
                    {'Prepare a clear adjustment when something new comes up.'}
                  </p>
                </div>

                {/* 2 Action Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }}>
                  {/* Two lime angled energy dashes above Card 1 */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-14px',
                      right: '10px',
                      display: 'flex',
                      gap: '3px',
                      transform: 'rotate(25deg)',
                      pointerEvents: 'none',
                    }}
                    aria-hidden="true"
                  >
                    <div style={{ width: 12, height: 3, borderRadius: 2, background: '#D2F64C' }} />
                    <div style={{ width: 8, height: 3, borderRadius: 2, background: '#D2F64C' }} />
                  </div>

                  {ADAPTATION_SIGNALS_FIXTURE.map((sig, idx) => (
                    <div key={sig.id} id={idx === 1 ? 'card-moved-to-make-space' : undefined}>
                      <AdaptationSignalCard signal={sig} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Lower Right Editorial Label: A MORE FOCUSED TOMORROW */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '6px',
              marginTop: '48px',
              paddingInlineEnd: '4px',
            }}
          >
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#9CA3AF',
              }}
            >
              A MORE FOCUSED TOMORROW
            </span>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#D2F64C',
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1180px) {
          .composition-panels-row {
            grid-template-columns: minmax(210px, 0.75fr) minmax(480px, 1.55fr) minmax(210px, 0.75fr) !important;
            gap: 24px !important;
          }
          .stage-panel-left, .stage-panel-right {
            padding: 28px 22px 24px !important;
          }
        }
        @media (max-width: 1024px) {
          .composition-panels-row {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .center-silhouette-vector-bg {
            display: none !important;
          }
          .stage-panel-center {
            background: linear-gradient(135deg, #4346E2 0%, #2E31D6 50%, #2221AC 100%) !important;
            border-radius: 24px !important;
          }
          .responsibilities-frame-canvas {
            padding: 32px 20px !important;
            border-radius: 26px !important;
          }
        }
      `}</style>
    </section>
  );
};
