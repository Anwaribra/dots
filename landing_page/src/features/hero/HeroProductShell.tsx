import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckSquare,
  Target,
  BarChart3,
  ChevronDown,
  ChevronLeft,
  Sparkles,
  Palmtree,
} from 'lucide-react';
import { TelegramIcon } from '../../components/brand/TelegramIcon';
import { DotsLogo } from '../../components/brand/DotsLogo';

const ProductPreviewPanel: React.FC<{ activeTab: 'Tasks' | 'Goals' | 'Insights' }> = ({ activeTab }) => {
  const content = {
    Tasks: { title: 'Today’s focus', value: '3 of 5', items: ['Finish launch brief', 'Prepare client notes', 'Protect deep work'], accent: '#4338F2' },
    Goals: { title: 'Product launch', value: '72%', items: ['Ship the landing page', 'Collect early feedback', 'Review the weekly plan'], accent: '#7C3AED' },
    Insights: { title: 'A balanced week', value: '18h', items: ['6h protected focus', '4 flexible blocks', '3 priorities on track'], accent: '#65A30D' },
  }[activeTab];

  return (
    <div role="tabpanel" aria-label={activeTab} className="hero-preview-panel">
      <div className="hero-preview-panel__top">
        <div>
          <p>{content.title}</p>
          <strong>{content.value}</strong>
        </div>
        <span style={{ background: content.accent }} />
      </div>
      <div className="hero-preview-panel__track"><i style={{ width: content.value === '72%' ? '72%' : '60%', background: content.accent }} /></div>
      <div className="hero-preview-panel__items">
        {content.items.map((item, index) => (
          <div key={item}><b style={{ color: content.accent }}>{String(index + 1).padStart(2, '0')}</b><span>{item}</span><em>✓</em></div>
        ))}
      </div>
    </div>
  );
};

export const HeroProductShell: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Plan' | 'Tasks' | 'Goals' | 'Insights'>('Plan');
  const [previousWeek, setPreviousWeek] = useState(false);
  const tabs = [
    { label: 'Plan' as const, icon: CalendarIcon },
    { label: 'Tasks' as const, icon: CheckSquare },
    { label: 'Goals' as const, icon: Target },
    { label: 'Insights' as const, icon: BarChart3 },
  ];

  return (
    <div
      className="hero-product-container ProductSurface"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '720px',
        marginInline: 'auto',
        overflow: 'visible',
      }}
    >
      {/* Master White Product Shell */}
      <div
        className="hero-calendar-window"
        style={{
          background: '#FFFFFF',
          borderRadius: '26px',
          border: '1px solid rgba(23, 23, 43, 0.08)',
          boxShadow: '0 24px 60px -12px rgba(23, 23, 43, 0.12), 0 4px 16px rgba(23, 23, 43, 0.04)',
          position: 'relative',
          overflow: 'visible',
        }}
      >
        {/* Window Top Navigation Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 22px',
            borderBottom: '1px solid rgba(23, 23, 43, 0.06)',
            borderRadius: '26px 26px 0 0',
            background: '#FFFFFF',
          }}
        >
          {/* Logo mark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DotsLogo size={22} showWordmark={false} />
          </div>

          {/* Week Selector Dropdown */}
          <button
            type="button"
            aria-label="Toggle week"
            onClick={() => setPreviousWeek(!previousWeek)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              background: 'none',
              fontSize: '1rem',
              fontWeight: 700,
              color: '#17172B',
              cursor: 'pointer',
            }}
          >
            <span>{previousWeek ? 'Last Week' : 'This Week'}</span>
            <ChevronDown size={16} color="#6B7280" />
          </button>

          {/* Controls: Prev & Today */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              aria-label="Previous week"
              onClick={() => setPreviousWeek(true)}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: '1px solid rgba(23, 23, 43, 0.08)',
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ChevronLeft size={16} color="#6B7280" />
            </button>
            <button
              type="button"
              aria-label="Return to this week"
              onClick={() => setPreviousWeek(false)}
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#4B5563',
                background: '#F3F4F6',
                padding: '4px 12px',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Today
            </button>
          </div>
        </div>

        {/* Compact, interactive product navigation. */}
        <div className="hero-app-content" style={{ display: 'grid', gridTemplateColumns: '95px 1fr', minHeight: '440px', overflow: 'hidden', borderRadius: '0 0 26px 26px' }}>
          {/* Inner Sidebar */}
          <div
            className="hero-app-sidebar"
            style={{
              borderRight: '1px solid rgba(23, 23, 43, 0.06)',
              padding: '18px 10px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: '#FAFAFD',
            }}
          >
            <div role="tablist" aria-label="Product preview sections" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {tabs.map(({ label, icon: Icon }) => {
                const selected = activeTab === label;
                return (
                  <button
                    key={label}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setActiveTab(label)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                      padding: '8px 10px', borderRadius: '10px', border: 'none',
                      background: selected ? '#EEF2FF' : 'transparent',
                      color: selected ? '#4338F2' : '#6B7280', fontSize: '0.8rem',
                      fontWeight: selected ? 700 : 600, cursor: 'pointer', textAlign: 'left',
                      transition: 'background-color 180ms ease, color 180ms ease',
                    }}
                  >
                    <Icon size={14} aria-hidden="true" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom sidebar message */}
            <div style={{ padding: '0 4px', fontSize: '0.64rem', color: '#9CA3AF', lineHeight: 1.35 }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4338F2' }} />
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#C9F455' }} />
              </div>
              A calmer, more capable you.
            </div>
          </div>

          {activeTab === 'Plan' ? (
          <div role="tabpanel" aria-label="Plan" style={{ overflowX: 'auto', padding: '14px 16px' }}>
            {/* Days Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, minmax(88px, 1fr))',
                gap: '10px',
                textAlign: 'center',
                paddingBottom: '12px',
                borderBottom: '1px solid rgba(23, 23, 43, 0.06)',
                marginBottom: '12px',
              }}
            >
              <div>
                <div style={{ fontSize: '0.74rem', color: '#6B7280', fontWeight: 600 }}>Mon</div>
                <div style={{ fontSize: '0.82rem', color: '#17172B', fontWeight: 700 }}>Apr 21</div>
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: '#6B7280', fontWeight: 600 }}>Tue</div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#4338F2',
                    color: '#FFFFFF',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  22
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: '#6B7280', fontWeight: 600 }}>Wed</div>
                <div style={{ fontSize: '0.82rem', color: '#17172B', fontWeight: 700 }}>Apr 23</div>
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: '#6B7280', fontWeight: 600 }}>Thu</div>
                <div style={{ fontSize: '0.82rem', color: '#17172B', fontWeight: 700 }}>Apr 24</div>
              </div>
              <div>
                <div style={{ fontSize: '0.74rem', color: '#6B7280', fontWeight: 600 }}>Fri</div>
                <div style={{ fontSize: '0.82rem', color: '#17172B', fontWeight: 700 }}>Apr 25</div>
              </div>
            </div>

            {/* Time Grid with Blocks */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, minmax(88px, 1fr))',
                gap: '10px',
                fontSize: '0.72rem',
                minHeight: '350px',
              }}
            >
              {/* Monday Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                <div
                  style={{
                    background: '#F3F4F8',
                    padding: '7px 9px',
                    borderRadius: '8px',
                    borderLeft: '3px solid #D1D5DB',
                  }}
                >
                  <div style={{ fontWeight: 600, color: '#374151', fontSize: '0.72rem' }}>Morning routine</div>
                  <div style={{ color: '#9CA3AF', fontSize: '0.64rem' }}>8:00 – 8:30</div>
                </div>

                <div
                  style={{
                    background: '#EEF2FF',
                    padding: '9px',
                    borderRadius: '8px',
                    borderLeft: '3px solid #4338F2',
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#1E1B4B', fontSize: '0.74rem' }}>Deep work</div>
                  <div style={{ color: '#6366F1', fontSize: '0.66rem' }}>9:00 – 11:00</div>
                </div>

                <div
                  style={{
                    background: '#F7FEE7',
                    padding: '7px 9px',
                    borderRadius: '8px',
                    borderLeft: '3px solid #84CC16',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C9F455' }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#365314', fontSize: '0.7rem' }}>Team sync</div>
                    <div style={{ color: '#65A30D', fontSize: '0.64rem' }}>11:00 – 11:30</div>
                  </div>
                </div>

                <div style={{ background: '#F9FAFB', padding: '6px 9px', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 500, color: '#6B7280', fontSize: '0.7rem' }}>Lunch</div>
                  <div style={{ color: '#9CA3AF', fontSize: '0.64rem' }}>12:00 – 1:00</div>
                </div>

                <div style={{ background: '#F7FEE7', padding: '7px 9px', borderRadius: '8px', borderLeft: '3px solid #A3E635' }}>
                  <div style={{ fontWeight: 600, color: '#365314', fontSize: '0.7rem' }}>Client prep</div>
                  <div style={{ color: '#65A30D', fontSize: '0.64rem' }}>1:00 – 2:00</div>
                </div>

                <div style={{ background: '#F5F3FF', padding: '7px 9px', borderRadius: '8px', borderLeft: '3px solid #A855F7' }}>
                  <div style={{ fontWeight: 600, color: '#581C87', fontSize: '0.7rem' }}>Gym</div>
                  <div style={{ color: '#9333EA', fontSize: '0.64rem' }}>3:00 – 4:00</div>
                </div>
              </div>

              {/* Tuesday Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                <div style={{ height: '36px' }} />
                <div style={{ background: '#F5F3FF', padding: '7px 9px', borderRadius: '8px', borderLeft: '3px solid #8B5CF6' }}>
                  <div style={{ fontWeight: 600, color: '#4C1D95', fontSize: '0.7rem' }}>Product review</div>
                  <div style={{ color: '#7C3AED', fontSize: '0.64rem' }}>9:00 – 10:00</div>
                </div>

                <div style={{ background: '#EEF2FF', padding: '7px 9px', borderRadius: '8px', borderLeft: '3px solid #6366F1' }}>
                  <div style={{ fontWeight: 600, color: '#1E1B4B', fontSize: '0.7rem' }}>Focus time</div>
                  <div style={{ color: '#6366F1', fontSize: '0.64rem' }}>10:30 – 12:00</div>
                </div>

                <div style={{ background: '#F9FAFB', padding: '6px 9px', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 500, color: '#6B7280', fontSize: '0.7rem' }}>Lunch</div>
                  <div style={{ color: '#9CA3AF', fontSize: '0.64rem' }}>12:00 – 1:00</div>
                </div>

                <div style={{ background: '#EEF2FF', padding: '9px', borderRadius: '8px', borderLeft: '3px solid #4338F2' }}>
                  <div style={{ fontWeight: 700, color: '#1E1B4B', fontSize: '0.74rem' }}>Build</div>
                  <div style={{ color: '#4338F2', fontSize: '0.64rem' }}>1:00 – 3:00</div>
                </div>

                <div style={{ background: '#F9FAFB', padding: '6px 9px', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 500, color: '#6B7280', fontSize: '0.7rem' }}>Drive to airport</div>
                  <div style={{ color: '#9CA3AF', fontSize: '0.64rem' }}>4:00 – 5:00</div>
                </div>

                <div
                  style={{
                    background: '#F5F3FF',
                    padding: '7px 9px',
                    borderRadius: '8px',
                    borderLeft: '3px solid #EC4899',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <Palmtree size={12} color="#DB2777" />
                  <div>
                    <div style={{ fontWeight: 600, color: '#831843', fontSize: '0.7rem' }}>Family time</div>
                    <div style={{ color: '#BE185D', fontSize: '0.64rem' }}>5:00 – 7:00</div>
                  </div>
                </div>
              </div>

              {/* Wednesday Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                <div style={{ height: '36px' }} />
                <div style={{ background: '#F5F3FF', padding: '7px 9px', borderRadius: '8px', borderLeft: '3px solid #A855F7' }}>
                  <div style={{ fontWeight: 600, color: '#581C87', fontSize: '0.7rem' }}>Marketing sync</div>
                  <div style={{ color: '#9333EA', fontSize: '0.64rem' }}>9:00 – 10:00</div>
                </div>
              </div>

              {/* Thursday Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                <div style={{ height: '70px' }} />
                <div style={{ background: '#F9FAFB', padding: '6px 9px', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 500, color: '#6B7280', fontSize: '0.7rem' }}>Prep notes</div>
                </div>
              </div>

              {/* Friday Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                <div style={{ height: '70px' }} />
                <div style={{ background: '#EEF2FF', padding: '7px 9px', borderRadius: '8px', borderLeft: '3px solid #4338F2' }}>
                  <div style={{ fontWeight: 600, color: '#1E1B4B', fontSize: '0.7rem' }}>Weekly wrap</div>
                </div>
              </div>
            </div>
          </div>
          ) : (
            <ProductPreviewPanel activeTab={activeTab} />
          )}
        </div>
      </div>

      {/* Floating Annotation Layer (Unclipped & Roomy) */}
      <div className="hero-floating-annotations">
        {/* Floating Overlay A: Spacious Unclipped Telegram Notification Card */}
        <div
          className="telegram-notification-card"
          style={{
            position: 'absolute',
            top: '85px',
            right: '-36px',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(16px)',
            borderRadius: '18px',
            padding: '14px 18px',
            width: '310px',
            boxShadow: '0 20px 42px -6px rgba(23, 23, 43, 0.16), 0 3px 12px rgba(23, 23, 43, 0.05)',
            border: '1px solid rgba(23, 23, 43, 0.08)',
            zIndex: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: '#2AABEE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(42, 171, 238, 0.35)',
                }}
              >
                <TelegramIcon size={14} />
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#17172B' }}>Telegram</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#9CA3AF', fontWeight: 500 }}>now</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8rem',
                color: '#4338F2',
                flexShrink: 0,
              }}
            >
              A
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#17172B' }}>Alex</div>
              <div
                style={{
                  fontSize: '0.82rem',
                  color: '#374151',
                  lineHeight: 1.45,
                  marginTop: '3px',
                }}
              >
                Can we move our call to 3pm? Something came up!
              </div>
            </div>
          </div>
        </div>

        {/* Curved Connection Path from Telegram Card to Proposed Adjustment Card */}
        <svg
          aria-hidden="true"
          className="hero-connector-svg"
          style={{
            position: 'absolute',
            top: '190px',
            right: '40px',
            width: '80px',
            height: '80px',
            pointerEvents: 'none',
            zIndex: 19,
            overflow: 'visible',
          }}
          viewBox="0 0 80 80"
          fill="none"
        >
          <path
            d="M 60 5 C 40 30, 15 45, 20 75"
            stroke="#4338F2"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeDasharray="4 4"
          />
          <circle cx="20" cy="75" r="4.5" fill="#C9F455" stroke="#4338F2" strokeWidth="1.5" />
        </svg>

        {/* Floating Overlay B: Proposed Adjustment Card (Non-overlapping & Truthful) */}
        <div
          className="rescheduled-lime-card"
          style={{
            position: 'absolute',
            top: '235px',
            right: '-24px',
            background: 'linear-gradient(135deg, #D4F94C 0%, #C3F03A 100%)',
            borderRadius: '18px',
            padding: '14px 18px',
            width: '280px',
            boxShadow: '0 16px 36px rgba(201, 244, 85, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.7)',
            zIndex: 21,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Sparkles size={16} color="#17172B" />
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#17172B' }}>
              Proposed adjustment
            </span>
          </div>
          <p style={{ fontSize: '0.74rem', color: '#273A0A', lineHeight: 1.4, margin: 0, fontWeight: 600 }}>
            Dots evaluated the change and prepared a new plan.
          </p>
        </div>

        {/* Floating Overlay C: Before / After Comparison Card */}
        <div
          className="before-after-card"
          style={{
            position: 'absolute',
            bottom: '-28px',
            right: '30px',
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '14px 18px',
            boxShadow: '0 16px 36px -4px rgba(23, 23, 43, 0.12), 0 2px 8px rgba(23, 23, 43, 0.04)',
            border: '1px solid rgba(23, 23, 43, 0.08)',
            zIndex: 22,
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          {/* Before */}
          <div style={{ fontSize: '0.74rem' }}>
            <div style={{ fontWeight: 700, color: '#9CA3AF', fontSize: '0.68rem', marginBottom: '4px' }}>
              Before
            </div>
            <div style={{ color: '#9CA3AF', textDecoration: 'line-through' }}>
              <span style={{ fontWeight: 600 }}>3:00 PM</span> Client call
            </div>
            <div style={{ color: '#4B5563', marginTop: '2px' }}>
              <span style={{ fontWeight: 600 }}>4:00 PM</span> Write deck
            </div>
          </div>

          {/* Vertical Divider */}
          <div style={{ width: '2px', height: '40px', background: '#4338F2', borderRadius: '1px' }} />

          {/* After */}
          <div style={{ fontSize: '0.74rem' }}>
            <div style={{ fontWeight: 700, color: '#4338F2', fontSize: '0.68rem', marginBottom: '4px' }}>
              After
            </div>
            <div style={{ color: '#17172B', fontWeight: 600 }}>
              <span style={{ color: '#4338F2' }}>3:00 PM</span> Client call
            </div>
            <div style={{ color: '#4B5563', marginTop: '2px' }}>
              <span style={{ fontWeight: 600 }}>4:00 PM</span> Write deck
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .hero-floating-annotations {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 20px;
          }
          .telegram-notification-card,
          .rescheduled-lime-card,
          .before-after-card {
            position: static !important;
            width: 100% !important;
          }
          .hero-connector-svg {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
