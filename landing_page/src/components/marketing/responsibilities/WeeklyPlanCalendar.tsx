import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const WeeklyPlanCalendar: React.FC = () => {
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

  const dateRangeLabel =
    currentWeekIndex === 0
      ? 'Apr 21 – Apr 27, 2025'
      : currentWeekIndex < 0
      ? 'Apr 14 – Apr 20, 2025'
      : 'Apr 28 – May 04, 2025';

  return (
    <div
      className="weekly-plan-calendar-surface"
      style={{
        background: '#FFFFFF',
        borderRadius: '18px',
        padding: '22px 24px 20px',
        boxShadow: '0 16px 36px rgba(12, 18, 64, 0.16)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: '100%',
        maxWidth: '100%',
        marginInline: 'auto',
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          paddingBottom: '4px',
        }}
      >
        <button
          type="button"
          aria-label="Previous week"
          onClick={() => setCurrentWeekIndex((prev) => Math.max(-1, prev - 1))}
          style={{
            background: 'none',
            border: 'none',
            color: '#6B7280',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ChevronLeft size={16} />
        </button>

        <span
          style={{
            fontSize: '1rem',
            fontWeight: 800,
            color: '#111827',
            letterSpacing: '-0.02em',
          }}
        >
          {dateRangeLabel}
        </span>

        <button
          type="button"
          aria-label="Next week"
          onClick={() => setCurrentWeekIndex((prev) => Math.min(1, prev + 1))}
          style={{
            background: 'none',
            border: 'none',
            color: '#6B7280',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '38px 1fr', gap: '4px' }}>
        {/* Time Axis Column */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            paddingTop: '26px',
            paddingBottom: '2px',
            height: '175px',
          }}
        >
          {['9 AM', '11 AM', '1 PM', '3 PM', '5 PM'].map((t, i) => (
            <span
              key={i}
              style={{
                fontSize: '0.62rem',
                fontWeight: 600,
                color: '#9CA3AF',
                lineHeight: 1,
              }}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Schedule Columns Area */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Day Headers Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '4px',
              paddingBottom: '6px',
              textAlign: 'center',
            }}
          >
            {['Mon 21', 'Tue 22', 'Wed 23', 'Thu 24', 'Fri 25'].map((d, i) => (
              <span
                key={i}
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#4B5563',
                }}
              >
                {d}
              </span>
            ))}
          </div>

          {/* Grid Canvas with Faint Horizontal Lines and Absolutely Positioned Blocks */}
          <div
            style={{
              position: 'relative',
              height: '150px',
              borderTop: '1px solid #F1F4FA',
            }}
          >
            {/* 4 Intermediate Faint Horizontal Lines (at 11 AM, 1 PM, 3 PM, 5 PM) */}
            <div style={{ position: 'absolute', top: '37px', left: 0, right: 0, height: 1, background: '#F3F5FA' }} />
            <div style={{ position: 'absolute', top: '75px', left: 0, right: 0, height: 1, background: '#F3F5FA' }} />
            <div style={{ position: 'absolute', top: '112px', left: 0, right: 0, height: 1, background: '#F3F5FA' }} />
            <div style={{ position: 'absolute', top: '150px', left: 0, right: 0, height: 1, background: '#F3F5FA' }} />

            {/* 5 Column Blocks Layout Container */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '4px',
                height: '100%',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {/* COLUMN 1: Mon 21 */}
              <div style={{ position: 'relative', height: '100%' }}>
                {/* Deep work 9–11 */}
                <div
                  className="cal-block"
                  style={{
                    position: 'absolute',
                    top: '0px',
                    left: 0,
                    right: 0,
                    height: '34px',
                    background: '#E4ECFD',
                    borderRadius: '6px',
                    padding: '3px 4px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#1B2A5E', lineHeight: 1.1 }}>
                    Deep work
                  </span>
                  <span style={{ fontSize: '0.54rem', fontWeight: 600, color: '#455589', lineHeight: 1.1 }}>
                    9–11
                  </span>
                </div>

                {/* Build 1–4 */}
                <div
                  className="cal-block"
                  style={{
                    position: 'absolute',
                    top: '75px',
                    left: 0,
                    right: 0,
                    height: '52px',
                    background: '#E4ECFD',
                    borderRadius: '6px',
                    padding: '3px 4px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#1B2A5E', lineHeight: 1.1 }}>
                    Build
                  </span>
                  <span style={{ fontSize: '0.54rem', fontWeight: 600, color: '#455589', lineHeight: 1.1 }}>
                    1–4
                  </span>
                </div>
              </div>

              {/* COLUMN 2: Tue 22 */}
              <div style={{ position: 'relative', height: '100%' }}>
                {/* Team sync 11–12 (VIBRANT LIME PILL) */}
                <div
                  className="cal-block"
                  style={{
                    position: 'absolute',
                    top: '37px',
                    left: 0,
                    right: 0,
                    height: '24px',
                    background: '#D2F64C',
                    borderRadius: '6px',
                    padding: '2px 4px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(210, 246, 76, 0.35)',
                  }}
                >
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#162804', lineHeight: 1.1 }}>
                    Team sync
                  </span>
                  <span style={{ fontSize: '0.54rem', fontWeight: 600, color: '#2C4908', lineHeight: 1.1 }}>
                    11–12
                  </span>
                </div>
              </div>

              {/* COLUMN 3: Wed 23 */}
              <div style={{ position: 'relative', height: '100%' }}>
                {/* Design 10–12 */}
                <div
                  className="cal-block"
                  style={{
                    position: 'absolute',
                    top: '19px',
                    left: 0,
                    right: 0,
                    height: '35px',
                    background: '#E4ECFD',
                    borderRadius: '6px',
                    padding: '3px 4px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#1B2A5E', lineHeight: 1.1 }}>
                    Design
                  </span>
                  <span style={{ fontSize: '0.54rem', fontWeight: 600, color: '#455589', lineHeight: 1.1 }}>
                    10–12
                  </span>
                </div>

                {/* Customer calls 1–3 */}
                <div
                  className="cal-block"
                  style={{
                    position: 'absolute',
                    top: '75px',
                    left: 0,
                    right: 0,
                    height: '34px',
                    background: '#E4ECFD',
                    borderRadius: '6px',
                    padding: '3px 4px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#1B2A5E', lineHeight: 1.1 }}>
                    Customer calls
                  </span>
                  <span style={{ fontSize: '0.54rem', fontWeight: 600, color: '#455589', lineHeight: 1.1 }}>
                    1–3
                  </span>
                </div>
              </div>

              {/* COLUMN 4: Thu 24 */}
              <div style={{ position: 'relative', height: '100%' }}>
                {/* Gym 9–10 (PURPLE WITH DIAGONAL STRIPES) */}
                <div
                  className="cal-block"
                  style={{
                    position: 'absolute',
                    top: '0px',
                    left: 0,
                    right: 0,
                    height: '22px',
                    background:
                      'repeating-linear-gradient(135deg, #6B5EF6, #6B5EF6 5px, #7C71FA 5px, #7C71FA 9px)',
                    borderRadius: '6px',
                    padding: '2px 4px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                  }}
                >
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>
                    Gym
                  </span>
                  <span style={{ fontSize: '0.54rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.1 }}>
                    9–10
                  </span>
                </div>

                {/* Planning 1–2 */}
                <div
                  className="cal-block"
                  style={{
                    position: 'absolute',
                    top: '75px',
                    left: 0,
                    right: 0,
                    height: '24px',
                    background: '#E4ECFD',
                    borderRadius: '6px',
                    padding: '2px 4px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#1B2A5E', lineHeight: 1.1 }}>
                    Planning
                  </span>
                  <span style={{ fontSize: '0.54rem', fontWeight: 600, color: '#455589', lineHeight: 1.1 }}>
                    1–2
                  </span>
                </div>
              </div>

              {/* COLUMN 5: Fri 25 */}
              <div style={{ position: 'relative', height: '100%' }}>
                {/* Product review 10–11 */}
                <div
                  className="cal-block"
                  style={{
                    position: 'absolute',
                    top: '19px',
                    left: 0,
                    right: 0,
                    height: '24px',
                    background: '#E4ECFD',
                    borderRadius: '6px',
                    padding: '2px 4px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#1B2A5E', lineHeight: 1.1 }}>
                    Product review
                  </span>
                  <span style={{ fontSize: '0.54rem', fontWeight: 600, color: '#455589', lineHeight: 1.1 }}>
                    10–11
                  </span>
                </div>

                {/* Write 3–5 */}
                <div
                  className="cal-block"
                  style={{
                    position: 'absolute',
                    top: '112px',
                    left: 0,
                    right: 0,
                    height: '35px',
                    background: '#E4ECFD',
                    borderRadius: '6px',
                    padding: '3px 4px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#1B2A5E', lineHeight: 1.1 }}>
                    Write
                  </span>
                  <span style={{ fontSize: '0.54rem', fontWeight: 600, color: '#455589', lineHeight: 1.1 }}>
                    3–5
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          paddingTop: '6px',
          fontSize: '0.66rem',
          color: '#6B7280',
          fontWeight: 600,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#2D32D4',
            }}
          />
          <span>Fixed commitment</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#D1DCF4',
            }}
          />
          <span>Flexible task</span>
        </div>
      </div>

      <style>{`
        .weekly-plan-calendar-surface .cal-block {
          border-radius: 9px !important;
          padding: 5px 7px !important;
        }
        .weekly-plan-calendar-surface .cal-block > span:first-child {
          font-size: 0.72rem !important;
        }
        .weekly-plan-calendar-surface .cal-block > span:last-child {
          font-size: 0.64rem !important;
        }
        .cal-block {
          cursor: pointer;
          transition: transform 0.14s ease, filter 0.14s ease;
        }
        .cal-block:hover {
          transform: scale(1.02);
          filter: brightness(0.97);
        }
      `}</style>
    </div>
  );
};
