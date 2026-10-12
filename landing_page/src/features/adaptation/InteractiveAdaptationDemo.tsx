import React, { useState } from 'react';
import {
  Zap,
  Calendar,
  BarChart2,
  Home,
  CalendarRange,
  CheckSquare,
  Settings,
  Paperclip,
  ArrowRight,
  ShieldCheck,
  Check,
  Sparkles,
} from 'lucide-react';
import { DotsLogo } from '../../components/brand/DotsLogo';

export const InteractiveAdaptationDemo: React.FC = () => {
  const [isApproved, setIsApproved] = useState(false);

  return (
    <section
      id="demo"
      style={{
        paddingBlock: '60px 100px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="SectionCanvas" style={{ maxWidth: '1440px', position: 'relative' }}>
        {/* Section Heading & Subtitle */}
        <div style={{ textAlign: 'center', maxWidth: '780px', marginInline: 'auto', marginBottom: '48px' }}>
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
            When life changes, your plan moves with you.
          </h2>
          <p
            style={{
              fontSize: '1.08rem',
              color: '#52526B',
              lineHeight: 1.6,
              maxWidth: '640px',
              marginInline: 'auto',
            }}
          >
            Tell Dots what’s happening. We’ll adapt your plan, keep what matters, and show you the new plan.
          </p>
        </div>

        {/* Master Cobalt Container */}
        <div
          className="adaptation-cobalt-shell"
          style={{
            background: 'linear-gradient(135deg, #3238E3 0%, #252BD5 100%)',
            borderRadius: '34px',
            padding: '36px 36px',
            boxShadow: '0 24px 60px -8px rgba(37, 43, 213, 0.35)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Main 2-Column Content: Left Badges + Right App Window */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '260px 1fr',
              gap: '32px',
              alignItems: 'center',
            }}
            className="adaptation-grid"
          >
            {/* Left Column: Title & 3 Feature Badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <h3
                style={{
                  color: '#FFFFFF',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  lineHeight: 1.2,
                  letterSpacing: '-0.02em',
                  margin: 0,
                }}
              >
                A plan that flexes with real life.
              </h3>

              {/* 3 Circular Feature Badges */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Badge 1: Quick to adjust */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: '#C9F455',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 4px 14px rgba(201, 244, 85, 0.4)',
                    }}
                  >
                    <Zap size={20} color="#17172B" />
                  </div>
                  <div>
                    <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.92rem' }}>
                      Quick to adjust
                    </div>
                    <div style={{ color: '#C7D2FE', fontSize: '0.78rem', marginTop: '2px' }}>
                      Tell us what changed.
                    </div>
                  </div>
                </div>

                {/* Badge 2: Protects your priorities */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.16)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Calendar size={19} color="#FFFFFF" />
                  </div>
                  <div>
                    <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.92rem' }}>
                      Protects your priorities
                    </div>
                    <div style={{ color: '#C7D2FE', fontSize: '0.78rem', marginTop: '2px' }}>
                      Keeps what matters.
                    </div>
                  </div>
                </div>

                {/* Badge 3: A calmer day */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.16)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <BarChart2 size={19} color="#FFFFFF" />
                  </div>
                  <div>
                    <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.92rem' }}>
                      A calmer day
                    </div>
                    <div style={{ color: '#C7D2FE', fontSize: '0.78rem', marginTop: '2px' }}>
                      Less juggling, more progress.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Master White Glass Application Window */}
            <div
              className="adaptation-app-window"
              style={{
                background: '#FFFFFF',
                borderRadius: '24px',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.14)',
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: '110px 1.1fr 1.35fr',
                minHeight: '440px',
              }}
            >
              {/* ============ SUB-COL 1: APP SIDEBAR ============ */}
              <div
                style={{
                  borderRight: '1px solid rgba(23, 23, 43, 0.06)',
                  padding: '16px 10px',
                  background: '#FAFAFD',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                }}
              >
                {/* Logo Lockup */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingInline: '6px' }}>
                  <DotsLogo size={20} showWordmark={true} />
                </div>

                {/* Nav Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 10px',
                      borderRadius: '8px',
                      background: '#F3F4F6',
                      color: '#17172B',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                    }}
                  >
                    <Home size={14} color="#17172B" />
                    <span>Today</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 10px',
                      borderRadius: '8px',
                      color: '#6B7280',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                    }}
                  >
                    <Calendar size={14} />
                    <span>Tomorrow</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 10px',
                      borderRadius: '8px',
                      color: '#6B7280',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                    }}
                  >
                    <CalendarRange size={14} />
                    <span>Calendar</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 10px',
                      borderRadius: '8px',
                      color: '#6B7280',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                    }}
                  >
                    <CheckSquare size={14} />
                    <span>Tasks</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 10px',
                      borderRadius: '8px',
                      color: '#6B7280',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                    }}
                  >
                    <Settings size={14} />
                    <span>Settings</span>
                  </div>
                </div>
              </div>

              {/* ============ SUB-COL 2: CHAT CONVERSATION ============ */}
              <div
                style={{
                  borderRight: '1px solid rgba(23, 23, 43, 0.06)',
                  padding: '16px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: '#FFFFFF',
                }}
              >
                <div>
                  {/* Today date indicator */}
                  <div
                    style={{
                      textAlign: 'center',
                      fontSize: '0.72rem',
                      color: '#9CA3AF',
                      fontWeight: 600,
                      marginBottom: '14px',
                    }}
                  >
                    Today
                  </div>

                  {/* User Message */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '14px' }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: '#FBCFE8',
                        color: '#9D174D',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        flexShrink: 0,
                      }}
                    >
                      U
                    </div>
                    <div>
                      <div
                        style={{
                          background: '#EEF2FF',
                          borderRadius: '12px',
                          padding: '10px 12px',
                          fontSize: '0.78rem',
                          color: '#1E1B4B',
                          lineHeight: 1.4,
                        }}
                      >
                        I need two hours for an urgent task today.
                      </div>
                      <div style={{ fontSize: '0.66rem', color: '#9CA3AF', textAlign: 'right', marginTop: '3px' }}>
                        9:14 AM
                      </div>
                    </div>
                  </div>

                  {/* Dots Assistant Response */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: '#EEF2FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <DotsLogo size={16} showWordmark={false} />
                    </div>
                    <div>
                      <div
                        style={{
                          background: '#F9FAFB',
                          borderRadius: '12px',
                          padding: '10px 12px',
                          fontSize: '0.78rem',
                          color: '#17172B',
                          lineHeight: 1.4,
                          border: '1px solid rgba(23, 23, 43, 0.04)',
                        }}
                      >
                        I’ll move research to tomorrow and keep your fixed commitments.
                      </div>
                      <div style={{ fontSize: '0.66rem', color: '#9CA3AF', marginTop: '3px' }}>
                        9:14 AM
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input Bar at Bottom */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#F9FAFB',
                    border: '1px solid rgba(23, 23, 43, 0.08)',
                    borderRadius: '9999px',
                    padding: '6px 10px',
                    marginTop: '16px',
                  }}
                >
                  <Paperclip size={14} color="#9CA3AF" />
                  <input
                    type="text"
                    placeholder="Message Dots..."
                    readOnly
                    style={{
                      border: 'none',
                      background: 'none',
                      outline: 'none',
                      fontSize: '0.75rem',
                      color: '#4B5563',
                      flex: 1,
                    }}
                  />
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: '#4338F2',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ArrowRight size={12} />
                  </div>
                </div>
              </div>

              {/* ============ SUB-COL 3: PROPOSED CHANGES STAGE ============ */}
              <div
                style={{
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: '#FFFFFF',
                }}
              >
                <div>
                  {/* Top Header: Title + Approve Button */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={14} color="#16A34A" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#17172B' }}>
                        Proposed changes
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsApproved(!isApproved)}
                      style={{
                        background: isApproved ? '#10B981' : '#C9F455',
                        color: isApproved ? '#FFFFFF' : '#17172B',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.18s ease',
                      }}
                    >
                      {isApproved ? (
                        <>
                          <Check size={13} />
                          <span>Approved</span>
                        </>
                      ) : (
                        <span>Approve changes</span>
                      )}
                    </button>
                  </div>

                  {/* Two Schedules Side by Side */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '12px',
                      fontSize: '0.68rem',
                    }}
                  >
                    {/* Left: Today Current plan */}
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginBottom: '8px',
                        }}
                      >
                        <span style={{ fontWeight: 700, color: '#17172B', fontSize: '0.74rem' }}>Today</span>
                        <span
                          style={{
                            background: '#F3F4F6',
                            color: '#6B7280',
                            fontSize: '0.62rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: 600,
                          }}
                        >
                          Current plan
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: '#F9FAFB', borderRadius: '4px' }}>
                          <span style={{ color: '#6B7280' }}>9:00 AM</span>
                          <span style={{ color: '#17172B', fontWeight: 600 }}>Deep work</span>
                          <span style={{ color: '#9CA3AF' }}>2h</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: '#EEF2FF', borderRadius: '4px', borderLeft: '2px solid #4338F2' }}>
                          <span style={{ color: '#4338F2' }}>11:00 AM</span>
                          <span style={{ color: '#1E1B4B', fontWeight: 600 }}>Client review</span>
                          <span style={{ color: '#4338F2' }}>1h</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: '#F9FAFB', borderRadius: '4px' }}>
                          <span style={{ color: '#6B7280' }}>12:00 PM</span>
                          <span style={{ color: '#17172B' }}>Lunch</span>
                          <span style={{ color: '#9CA3AF' }}>1h</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: '#F5F3FF', borderRadius: '4px', borderLeft: '2px solid #A855F7' }}>
                          <span style={{ color: '#7C3AED' }}>1:00 PM</span>
                          <span style={{ color: '#581C87', fontWeight: 600 }}>Research</span>
                          <span style={{ color: '#7C3AED' }}>2h</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: '#F9FAFB', borderRadius: '4px' }}>
                          <span style={{ color: '#6B7280' }}>3:00 PM</span>
                          <span style={{ color: '#17172B' }}>Team sync</span>
                          <span style={{ color: '#9CA3AF' }}>1h</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: '#F9FAFB', borderRadius: '4px' }}>
                          <span style={{ color: '#6B7280' }}>4:00 PM</span>
                          <span style={{ color: '#17172B' }}>Wrap up</span>
                          <span style={{ color: '#9CA3AF' }}>1h</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Today Proposed changes */}
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginBottom: '8px',
                        }}
                      >
                        <span style={{ fontWeight: 700, color: '#17172B', fontSize: '0.74rem' }}>Today</span>
                        <span
                          style={{
                            background: '#ECFCCB',
                            color: '#365314',
                            fontSize: '0.62rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: 700,
                          }}
                        >
                          Proposed changes
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: '#F9FAFB', borderRadius: '4px' }}>
                          <span style={{ color: '#6B7280' }}>9:00 AM</span>
                          <span style={{ color: '#17172B', fontWeight: 600 }}>Deep work</span>
                          <span style={{ color: '#9CA3AF' }}>2h</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: '#F9FAFB', borderRadius: '4px' }}>
                          <span style={{ color: '#6B7280' }}>11:00 AM</span>
                          <span style={{ color: '#17172B' }}>Client review</span>
                          <span style={{ color: '#9CA3AF' }}>1h</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: '#F9FAFB', borderRadius: '4px' }}>
                          <span style={{ color: '#6B7280' }}>12:00 PM</span>
                          <span style={{ color: '#17172B' }}>Lunch</span>
                          <span style={{ color: '#9CA3AF' }}>1h</span>
                        </div>

                        {/* Acid Lime Urgent Task Injected */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '5px 6px',
                            background: '#D4F94C',
                            borderRadius: '6px',
                            boxShadow: '0 2px 8px rgba(201, 244, 85, 0.4)',
                          }}
                        >
                          <span style={{ color: '#2C400B', fontWeight: 700 }}>1:00 PM</span>
                          <span style={{ color: '#17172B', fontWeight: 800 }}>Urgent task</span>
                          <span style={{ color: '#2C400B', fontWeight: 700 }}>2h</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: '#F9FAFB', borderRadius: '4px' }}>
                          <span style={{ color: '#6B7280' }}>3:00 PM</span>
                          <span style={{ color: '#17172B' }}>Team sync</span>
                          <span style={{ color: '#9CA3AF' }}>1h</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 6px', background: '#F9FAFB', borderRadius: '4px' }}>
                          <span style={{ color: '#6B7280' }}>4:00 PM</span>
                          <span style={{ color: '#17172B' }}>Wrap up</span>
                          <span style={{ color: '#9CA3AF' }}>1h</span>
                        </div>

                        {/* Tomorrow with Research shifted */}
                        <div style={{ marginTop: '4px' }}>
                          <span style={{ fontWeight: 700, color: '#17172B', fontSize: '0.72rem' }}>Tomorrow</span>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              padding: '4px 6px',
                              background: '#F5F3FF',
                              borderRadius: '4px',
                              borderLeft: '2px solid #A855F7',
                              marginTop: '3px',
                            }}
                          >
                            <span style={{ color: '#7C3AED' }}>9:00 AM</span>
                            <span style={{ color: '#581C87', fontWeight: 600 }}>Research</span>
                            <span style={{ color: '#7C3AED' }}>2h</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Protection Banner */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#ECFCCB',
                    color: '#166534',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    marginTop: '12px',
                  }}
                >
                  <ShieldCheck size={16} color="#16A34A" />
                  <span>Your client review stays protected.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom 3-Column Metrics Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
            marginTop: '36px',
            textAlign: 'center',
          }}
          className="adaptation-metrics-row"
        >
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#17172B' }}>Less stress</div>
            <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '3px' }}>More headspace</div>
          </div>

          <div style={{ borderLeft: '1px solid rgba(23, 23, 43, 0.08)', borderRight: '1px solid rgba(23, 23, 43, 0.08)' }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#17172B' }}>Plans that adapt</div>
            <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '3px' }}>To your real life</div>
          </div>

          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#17172B' }}>You’re in control</div>
            <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '3px' }}>Always</div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1040px) {
          .adaptation-grid {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
          .adaptation-app-window {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};
