import React from 'react';
import {
  Calendar as CalendarIcon,
  Mic,
  FileText,
  ShieldCheck,
  ArrowRightLeft,
  Paperclip,
  ArrowRight,
  MoreHorizontal,
} from 'lucide-react';
import { DotsLogo } from '../../components/brand/DotsLogo';
import { TelegramIcon } from '../../components/brand/TelegramIcon';

export const ChannelsAndIntegrations: React.FC = () => {
  return (
    <section
      id="channels"
      style={{
        paddingBlock: '70px 110px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="SectionCanvas" style={{ maxWidth: '1460px', position: 'relative' }}>
        {/* Section Heading & Subtitle */}
        <div style={{ textAlign: 'center', maxWidth: '820px', marginInline: 'auto', marginBottom: '56px' }}>
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
            Ambient Interaction.<br />
            Life happens outside the app.
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
            Dots meets you where life happens. Message, speak, or drop a note — we’ll adapt your plan, protect what matters, and keep you moving forward.
          </p>
        </div>

        {/* 3-Column Connected Stage */}
        <div
          className="ambient-stage-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 320px) minmax(360px, 1fr) minmax(300px, 340px)',
            gap: '24px',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* ================= COL 1: 4 INTEGRATION CHANNELS ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
            {/* Channel 1: Telegram */}
            <div className="integration-channel-card">
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: '#2AABEE',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(42, 171, 238, 0.35)',
                }}
              >
                <TelegramIcon size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#17172B' }}>
                  Telegram Bot & Chat
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px' }}>
                  Just message Dots.
                </div>
              </div>
            </div>

            {/* Channel 2: Calendar */}
            <div className="integration-channel-card">
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: '#EEF2FF',
                  color: '#4338F2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CalendarIcon size={19} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#17172B' }}>
                  Calendar
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px' }}>
                  Your real schedule.
                </div>
              </div>
            </div>

            {/* Channel 3: Voice Memos */}
            <div className="integration-channel-card">
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: '#EEF2FF',
                  color: '#4338F2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Mic size={19} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#17172B' }}>
                  Voice Memos
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px' }}>
                  Speak your mind.
                </div>
              </div>
            </div>

            {/* Channel 4: Daily Execution Briefing */}
            <div className="integration-channel-card">
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: '#EEF2FF',
                  color: '#4338F2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FileText size={19} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#17172B' }}>
                  Daily Execution Briefing
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px' }}>
                  Clarity, every morning.
                </div>
              </div>
            </div>
          </div>

          {/* ================= COL 2: CENTER COBALT PUDDLE + TELEGRAM CHAT ================= */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            {/* Organic Cobalt Puddle Background */}
            <div
              style={{
                position: 'absolute',
                inset: '-20px -25px',
                background: 'linear-gradient(135deg, #363CE8 0%, #252BD5 100%)',
                borderRadius: '42px',
                boxShadow: '0 24px 60px -8px rgba(37, 43, 213, 0.38)',
                zIndex: 0,
              }}
            />

            {/* Inner White Telegram Conversation Surface */}
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                background: '#FFFFFF',
                borderRadius: '26px',
                padding: '24px 22px',
                width: '100%',
                maxWidth: '430px',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.12)',
              }}
            >
              {/* Telegram Window Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: '#2AABEE',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 3px 10px rgba(42, 171, 238, 0.3)',
                    }}
                  >
                    <TelegramIcon size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#17172B' }}>Telegram</div>
                    <div style={{ fontSize: '0.74rem', color: '#6B7280' }}>Chat with Dots</div>
                  </div>
                </div>
                <MoreHorizontal size={18} color="#9CA3AF" />
              </div>

              {/* Chat Thread */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '18px' }}>
                {/* Date */}
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '0.68rem', color: '#9CA3AF', background: '#F3F4F6', padding: '3px 10px', borderRadius: '9999px', fontWeight: 600 }}>
                    Today
                  </span>
                </div>

                {/* User Message Bubble */}
                <div
                  style={{
                    alignSelf: 'flex-end',
                    background: '#EEF2FF',
                    color: '#1E1B4B',
                    borderRadius: '16px 16px 4px 16px',
                    padding: '12px 16px',
                    maxWidth: '85%',
                    fontSize: '0.82rem',
                    lineHeight: 1.45,
                    boxShadow: '0 2px 8px rgba(67, 56, 242, 0.06)',
                  }}
                >
                  <div>I have an urgent client request that needs two hours now. Can you adjust my plan?</div>
                  <div style={{ fontSize: '0.64rem', color: '#6366F1', textAlign: 'right', marginTop: '4px' }}>
                    9:14 AM ✓✓
                  </div>
                </div>

                {/* Dots Assistant Response Bubble */}
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
                  <div
                    style={{
                      background: '#F9FAFB',
                      color: '#17172B',
                      borderRadius: '16px 16px 16px 4px',
                      padding: '12px 16px',
                      maxWidth: '85%',
                      fontSize: '0.82rem',
                      lineHeight: 1.45,
                      border: '1px solid rgba(23, 23, 43, 0.05)',
                    }}
                  >
                    <div>Got it. I’ll find time for this, move flexible items, and keep your key commitments protected.</div>
                    <div style={{ fontSize: '0.64rem', color: '#9CA3AF', marginTop: '4px' }}>
                      9:14 AM
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#F9FAFB',
                  border: '1px solid rgba(23, 23, 43, 0.08)',
                  borderRadius: '9999px',
                  padding: '6px 12px',
                }}
              >
                <Paperclip size={15} color="#9CA3AF" />
                <input
                  type="text"
                  placeholder="Message Dots..."
                  readOnly
                  style={{
                    border: 'none',
                    background: 'none',
                    outline: 'none',
                    fontSize: '0.78rem',
                    color: '#4B5563',
                    flex: 1,
                  }}
                />
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: '#4338F2',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ArrowRight size={13} />
                </div>
              </div>
            </div>
          </div>

          {/* ================= COL 3: RIGHT PROPOSED PLAN UPDATE ================= */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '26px',
              padding: '24px 22px',
              boxShadow: '0 16px 40px rgba(23, 23, 43, 0.06)',
              border: '1px solid rgba(23, 23, 43, 0.06)',
              position: 'relative',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <DotsLogo size={22} showWordmark={true} />
              <span style={{ fontSize: '0.76rem', color: '#6B7280', fontWeight: 600 }}>
                Proposed plan update
              </span>
            </div>

            {/* Added Card */}
            <div
              style={{
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '14px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                marginBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: '#DCFCE7',
                    color: '#16A34A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#17172B' }}>
                    New urgent task
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#4B5563', marginTop: '2px' }}>
                    Client request • 9:00 – 11:00 AM
                  </div>
                </div>
              </div>
              <span
                style={{
                  background: '#D4F94C',
                  color: '#14532D',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: '6px',
                }}
              >
                Added
              </span>
            </div>

            {/* Moved Card */}
            <div
              style={{
                background: '#F5F3FF',
                border: '1px solid #DDD6FE',
                borderRadius: '14px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: '#EDE9FE',
                    color: '#7C3AED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <ArrowRightLeft size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#17172B' }}>
                    Moved to make space
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#4B5563', marginTop: '2px' }}>
                    Team sync • 3:00 – 4:00 PM
                  </div>
                </div>
              </div>
              <span
                style={{
                  background: '#EDE9FE',
                  color: '#6D28D9',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '6px',
                }}
              >
                Moved
              </span>
            </div>

            {/* Protected Confirmation Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#EEF2FF',
                color: '#312E81',
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={16} color="#4338F2" />
              <span>Your client review stays protected.</span>
            </div>
          </div>
        </div>

        {/* Bottom Editorial Labels */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '44px',
            paddingInline: '12px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: '#9CA3AF', textTransform: 'uppercase' }}>
              YOUR WORLD
            </div>
            <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#17172B', marginTop: '3px' }}>
              Multiple ways in. One intelligent plan.
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: '#9CA3AF', textTransform: 'uppercase' }}>
              ADJUSTED FOR YOU
            </div>
            <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#17172B', marginTop: '3px' }}>
              Same priorities. A plan that flexes.
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .integration-channel-card {
          background: #FFFFFF;
          border-radius: 18px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          border: 1px solid rgba(23, 23, 43, 0.06);
          box-shadow: 0 4px 16px rgba(23, 23, 43, 0.04);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .integration-channel-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(23, 23, 43, 0.08);
        }
        @media (max-width: 1040px) {
          .ambient-stage-grid {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
        }
      `}</style>
    </section>
  );
};
