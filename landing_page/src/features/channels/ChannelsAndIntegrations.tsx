import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Mic,
  FileText,
  ShieldCheck,
  Clock,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { DotsLogo } from '../../components/brand/DotsLogo';
import { TelegramIcon } from '../../components/brand/TelegramIcon';

type ChannelType = 'telegram' | 'calendar' | 'voice' | 'briefing';

interface ChannelTabConfig {
  id: ChannelType;
  title: string;
  subtitle: string;
  badge: string;
  icon: (active: boolean) => React.ReactNode;
}

export const ChannelsAndIntegrations: React.FC = () => {
  const [activeChannel, setActiveChannel] = useState<ChannelType>('telegram');

  const channels: ChannelTabConfig[] = [
    {
      id: 'telegram',
      title: 'Telegram Bot & Chat',
      subtitle: 'Natural text & voice commands on the go',
      badge: 'Bot & Chat',
      icon: () => <TelegramIcon size={22} variant="circle" />,
    },
    {
      id: 'calendar',
      title: 'Google & Apple Calendar',
      subtitle: 'Two-way background sync for meetings',
      badge: 'Two-way Sync',
      icon: (active) => (
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: active ? '#4338F2' : '#EEF2FF',
            color: active ? '#FFFFFF' : '#4338F2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s ease, color 0.2s ease',
          }}
        >
          <CalendarIcon size={15} />
        </div>
      ),
    },
    {
      id: 'voice',
      title: 'Voice Memos',
      subtitle: 'Speaks your thoughts into structured plans',
      badge: 'Audio AI',
      icon: (active) => (
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: active ? '#7C3AED' : '#F5F3FF',
            color: active ? '#FFFFFF' : '#7C3AED',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s ease, color 0.2s ease',
          }}
        >
          <Mic size={15} />
        </div>
      ),
    },
    {
      id: 'briefing',
      title: 'Daily Execution Brief',
      subtitle: 'A clear 60-second focus plan every morning',
      badge: 'Morning Brief',
      icon: (active) => (
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: active ? '#16A34A' : '#F0FDF4',
            color: active ? '#FFFFFF' : '#16A34A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s ease, color 0.2s ease',
          }}
        >
          <FileText size={15} />
        </div>
      ),
    },
  ];

  return (
    <section
      id="channels"
      className="channels-section"
      style={{
        paddingBlock: 'clamp(54px, 7vw, 84px)',
        position: 'relative',
        background: '#FAFBFD',
      }}
    >
      <div className="SectionCanvas" style={{ maxWidth: '1160px', marginInline: 'auto', paddingInline: '20px' }}>
        {/* Compact Editorial Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', marginInline: 'auto', marginBottom: '38px' }}>
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#4338F2',
              display: 'inline-block',
              marginBottom: '10px',
            }}
          >
            Channels & Integrations
          </span>

          <h2
            style={{
              fontSize: 'clamp(2.1rem, 3.6vw, 3.2rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.035em',
              color: '#111827',
              marginBottom: '12px',
            }}
          >
            Life happens outside the app.
          </h2>

          <p
            style={{
              fontSize: '1rem',
              color: '#4B5563',
              lineHeight: 1.6,
              maxWidth: '580px',
              marginInline: 'auto',
            }}
          >
            Send a voice note while walking, drop a quick Telegram message, or let your calendar sync. Dots captures changes in the flow of your day and protects what matters.
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="channels-grid-layout">
          {/* ================= LEFT: CHANNEL SELECTOR LIST ================= */}
          <div className="channels-selector-list" role="tablist" aria-label="Available channels">
            {channels.map((ch) => {
              const isActive = activeChannel === ch.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveChannel(ch.id)}
                  className={`channel-tab-item ${isActive ? 'is-active' : ''}`}
                >
                  <div className="channel-tab-icon-wrap">
                    {ch.icon(isActive)}
                  </div>

                  <div className="channel-tab-text-wrap">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <span className="channel-tab-title">{ch.title}</span>
                      <span className={`channel-tab-badge ${isActive ? 'is-active' : ''}`}>
                        {ch.badge}
                      </span>
                    </div>
                    <span className="channel-tab-sub">{ch.subtitle}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ================= RIGHT: LIVE PRODUCT SURFACE ================= */}
          <div className="channels-preview-container">
            <div className="channel-product-surface">
              <AnimatePresence mode="wait">
                {activeChannel === 'telegram' && (
                  <motion.div
                    key="telegram"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="channel-preview-card"
                  >
                    {/* Header */}
                    <div className="preview-top-bar">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <TelegramIcon size={24} variant="circle" />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#111827' }}>
                            Telegram Bot
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A' }} />
                            Connected · Instant reply
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>12:45 PM</span>
                    </div>

                    {/* Chat Thread */}
                    <div className="chat-thread-box">
                      {/* User message */}
                      <div className="chat-bubble-user">
                        <div>Running 30 mins late from lunch. Can we push the team sync?</div>
                        <span className="chat-meta-time">12:45 PM ✓✓</span>
                      </div>

                      {/* Dots response */}
                      <div className="chat-bubble-dots">
                        <div className="dots-avatar-small">
                          <DotsLogo size={15} showWordmark={false} />
                        </div>
                        <div className="dots-bubble-content">
                          <div>Done. Moved Team Sync to 3:30 PM and kept your 4:30 PM Deep Work protected.</div>
                          <span className="chat-meta-time">12:45 PM</span>
                        </div>
                      </div>
                    </div>

                    {/* Automatic Plan Adjustment Card */}
                    <div className="preview-outcome-box">
                      <div className="outcome-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={15} color="#16A34A" />
                          <span style={{ fontWeight: 700, fontSize: '0.78rem', color: '#166534' }}>
                            Schedule adjusted in Dots
                          </span>
                        </div>
                        <span style={{ fontSize: '0.68rem', color: '#6B7280' }}>Updated just now</span>
                      </div>

                      <div className="outcome-items">
                        <div className="outcome-row">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={13} color="#4338F2" />
                            <span style={{ fontWeight: 600, fontSize: '0.78rem', color: '#1E1B4B' }}>
                              Team sync · 3:30 – 4:00 PM
                            </span>
                          </div>
                          <span className="pill-status-moved">+30m shifted</span>
                        </div>

                        <div className="outcome-row">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShieldCheck size={13} color="#16A34A" />
                            <span style={{ fontWeight: 600, fontSize: '0.78rem', color: '#1E1B4B' }}>
                              Deep work · 4:30 – 6:00 PM
                            </span>
                          </div>
                          <span className="pill-status-protected">Protected</span>
                        </div>
                      </div>

                      <div className="outcome-footer-note">
                        ✓ Two-way sync updated Google Calendar & sent team update
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeChannel === 'calendar' && (
                  <motion.div
                    key="calendar"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="channel-preview-card"
                  >
                    {/* Header */}
                    <div className="preview-top-bar">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#EEF2FF', color: '#4338F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CalendarIcon size={14} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#111827' }}>
                            Google & Outlook Sync
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#4338F2' }}>
                            Background listener active
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>10:18 AM</span>
                    </div>

                    {/* External Calendar Event Notice */}
                    <div className="calendar-event-callout">
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', marginTop: 4, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#111827' }}>
                            Incoming invite: "Product Review" moved to 2:00 PM
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#6B7280', marginTop: '2px' }}>
                            Moved by Alex • Overlapped with scheduled Focus Block
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Resolution box */}
                    <div className="preview-outcome-box">
                      <div className="outcome-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={15} color="#16A34A" />
                          <span style={{ fontWeight: 700, fontSize: '0.78rem', color: '#166534' }}>
                            Conflict resolved automatically
                          </span>
                        </div>
                        <span style={{ fontSize: '0.68rem', color: '#6B7280' }}>No manual drag</span>
                      </div>

                      <div className="outcome-items">
                        <div className="outcome-row">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={13} color="#4338F2" />
                            <span style={{ fontWeight: 600, fontSize: '0.78rem', color: '#1E1B4B' }}>
                              Product Review · 2:00 – 3:00 PM
                            </span>
                          </div>
                          <span className="pill-status-moved">Accepted</span>
                        </div>

                        <div className="outcome-row">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ShieldCheck size={13} color="#16A34A" />
                            <span style={{ fontWeight: 600, fontSize: '0.78rem', color: '#1E1B4B' }}>
                              Focus Block · Shifted to 3:30 PM
                            </span>
                          </div>
                          <span className="pill-status-protected">Preserved</span>
                        </div>
                      </div>

                      <div className="outcome-footer-note">
                        ✓ Two-way sync keeps your work and personal calendars in sync
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeChannel === 'voice' && (
                  <motion.div
                    key="voice"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="channel-preview-card"
                  >
                    {/* Header */}
                    <div className="preview-top-bar">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Mic size={14} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#111827' }}>
                            Voice Memo Capture
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#7C3AED' }}>
                            Whisper transcription in 1.2s
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>Voice Note</span>
                    </div>

                    {/* Audio Player Card */}
                    <div className="voice-audio-card">
                      <div className="voice-play-circle">
                        <Play size={12} fill="currentColor" />
                      </div>
                      <div className="voice-waveform-bars">
                        {[40, 70, 90, 60, 30, 80, 100, 65, 45, 85, 55, 35, 75, 95, 60, 40, 80, 50, 30].map((h, i) => (
                          <span key={i} style={{ height: `${h}%` }} />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#6B7280' }}>0:12</span>
                    </div>

                    {/* Transcript Quote */}
                    <p style={{ fontSize: '0.8rem', color: '#374151', fontStyle: 'italic', background: '#F9FAFB', padding: '10px 14px', borderRadius: '12px', margin: '0 0 14px', border: '1px solid rgba(23, 23, 43, 0.05)' }}>
                      “Finished call with Sarah. Add proposal follow-up to today, and protect 2 hours for design tomorrow.”
                    </p>

                    {/* Outcome Box */}
                    <div className="preview-outcome-box">
                      <div className="outcome-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={15} color="#16A34A" />
                          <span style={{ fontWeight: 700, fontSize: '0.78rem', color: '#166534' }}>
                            2 actions scheduled from voice
                          </span>
                        </div>
                        <span style={{ fontSize: '0.68rem', color: '#6B7280' }}>Categorized</span>
                      </div>

                      <div className="outcome-items">
                        <div className="outcome-row">
                          <span style={{ fontWeight: 600, fontSize: '0.78rem', color: '#1E1B4B' }}>
                            Send proposal follow-up · Today 4:00 PM
                          </span>
                          <span className="pill-status-moved">Action</span>
                        </div>
                        <div className="outcome-row">
                          <span style={{ fontWeight: 600, fontSize: '0.78rem', color: '#1E1B4B' }}>
                            Design focus block · Tomorrow 10:00 AM
                          </span>
                          <span className="pill-status-protected">Protected</span>
                        </div>
                      </div>

                      <div className="outcome-footer-note">
                        ✓ Speak while walking or driving — Dots turns speech into plan
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeChannel === 'briefing' && (
                  <motion.div
                    key="briefing"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="channel-preview-card"
                  >
                    {/* Header */}
                    <div className="preview-top-bar">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={14} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#111827' }}>
                            Daily Execution Brief
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#16A34A' }}>
                            Delivered at 8:00 AM
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>Today</span>
                    </div>

                    {/* Briefing summary block */}
                    <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '14px', padding: '14px', marginBottom: '14px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#14532D', marginBottom: '4px' }}>
                        Good morning, Alex.
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#166534', margin: 0, lineHeight: 1.45 }}>
                        You have 2 meetings and 3.5h of protected deep work. Your highest leverage priority is shipping the client deliverable before 2:00 PM.
                      </p>
                    </div>

                    {/* Outcome Box */}
                    <div className="preview-outcome-box">
                      <div className="outcome-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle2 size={15} color="#16A34A" />
                          <span style={{ fontWeight: 700, fontSize: '0.78rem', color: '#166534' }}>
                            Day calibrated & balanced
                          </span>
                        </div>
                        <span style={{ fontSize: '0.68rem', color: '#6B7280' }}>82% capacity</span>
                      </div>

                      <div className="outcome-items">
                        <div className="outcome-row">
                          <span style={{ fontWeight: 600, fontSize: '0.78rem', color: '#1E1B4B' }}>
                            Morning focus: 9:00 – 11:30 AM
                          </span>
                          <span className="pill-status-protected">Locked</span>
                        </div>
                        <div className="outcome-row">
                          <span style={{ fontWeight: 600, fontSize: '0.78rem', color: '#1E1B4B' }}>
                            Client deliverable review · 2:00 PM
                          </span>
                          <span className="pill-status-moved">Priority 1</span>
                        </div>
                      </div>

                      <div className="outcome-footer-note">
                        ✓ Arrives in your Telegram or email so you start the day focused
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .channels-grid-layout {
          display: grid;
          grid-template-columns: minmax(290px, 340px) 1fr;
          gap: 28px;
          align-items: center;
          max-width: 1040px;
          margin-inline: auto;
        }

        .channels-selector-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .channel-tab-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 18px;
          border-radius: 18px;
          background: #FFFFFF;
          border: 1.5px solid rgba(23, 23, 43, 0.06);
          box-shadow: 0 2px 8px rgba(23, 23, 43, 0.02);
          cursor: pointer;
          text-align: left;
          width: 100%;
          transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
        }

        .channel-tab-item:hover {
          transform: translateY(-2px);
          border-color: rgba(67, 56, 242, 0.25);
          box-shadow: 0 6px 16px rgba(23, 23, 43, 0.06);
        }

        .channel-tab-item.is-active {
          background: #FFFFFF;
          border-color: #4338F2;
          box-shadow: 0 10px 24px -4px rgba(67, 56, 242, 0.12), 0 2px 8px rgba(23, 23, 43, 0.04);
        }

        .channel-tab-icon-wrap {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .channel-tab-text-wrap {
          flex: 1;
          min-width: 0;
        }

        .channel-tab-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: #111827;
        }

        .channel-tab-badge {
          font-size: 0.68rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 9999px;
          background: #F3F4F6;
          color: #6B7280;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .channel-tab-badge.is-active {
          background: #EEF2FF;
          color: #4338F2;
        }

        .channel-tab-sub {
          display: block;
          font-size: 0.74rem;
          color: #6B7280;
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .channels-preview-container {
          width: 100%;
          display: flex;
          justifyContent: center;
        }

        .channel-product-surface {
          width: 100%;
          max-width: 580px;
          background: #FFFFFF;
          border-radius: 24px;
          border: 1px solid rgba(23, 23, 43, 0.08);
          box-shadow: 0 20px 50px -12px rgba(23, 23, 43, 0.09), 0 4px 14px rgba(23, 23, 43, 0.03);
          padding: clamp(20px, 3.2vw, 26px);
        }

        .preview-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(23, 23, 43, 0.06);
          margin-bottom: 14px;
        }

        .chat-thread-box {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .chat-bubble-user {
          align-self: flex-end;
          background: #EEF2FF;
          color: #1E1B4B;
          border-radius: 16px 16px 4px 16px;
          padding: 10px 14px;
          max-width: 86%;
          font-size: 0.8rem;
          line-height: 1.45;
        }

        .chat-meta-time {
          display: block;
          font-size: 0.64rem;
          color: #6366F1;
          text-align: right;
          margin-top: 3px;
        }

        .chat-bubble-dots {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .dots-avatar-small {
          width: 24,
          height: 24,
          border-radius: 50%;
          background: #EEF2FF;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .dots-bubble-content {
          background: #F9FAFB;
          color: #17172B;
          border-radius: 16px 16px 16px 4px;
          padding: 10px 14px;
          max-width: 86%;
          font-size: 0.8rem;
          line-height: 1.45;
          border: 1px solid rgba(23, 23, 43, 0.05);
        }

        .dots-bubble-content .chat-meta-time {
          color: #9CA3AF;
          text-align: left;
        }

        .calendar-event-callout {
          background: #FFFBEB;
          border: 1px solid #FDE68A;
          border-radius: 14px;
          padding: 12px 14px;
          margin-bottom: 14px;
        }

        .voice-audio-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #F5F3FF;
          border: 1px solid #DDD6FE;
          border-radius: 14px;
          padding: 10px 14px;
          margin-bottom: 12px;
        }

        .voice-play-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #7C3AED;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .voice-waveform-bars {
          display: flex;
          align-items: center;
          gap: 3px;
          height: 22px;
          flex: 1;
        }

        .voice-waveform-bars span {
          width: 3px;
          background: #8B5CF6;
          border-radius: 2px;
        }

        .preview-outcome-box {
          background: #FAFBFD;
          border: 1px solid rgba(23, 23, 43, 0.08);
          border-radius: 16px;
          padding: 14px 16px;
        }

        .outcome-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .outcome-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 10px;
        }

        .outcome-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          background: #FFFFFF;
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid rgba(23, 23, 43, 0.05);
        }

        .pill-status-moved {
          background: #F3F4F6;
          color: #4B5563;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
          white-space: nowrap;
        }

        .pill-status-protected {
          background: #DCFCE7;
          color: #15803D;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
          white-space: nowrap;
        }

        .outcome-footer-note {
          font-size: 0.7rem;
          color: #6B7280;
          font-weight: 500;
        }

        @media (max-width: 960px) {
          .channels-grid-layout {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .channels-selector-list {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
        }

        @media (max-width: 600px) {
          .channels-selector-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
};
