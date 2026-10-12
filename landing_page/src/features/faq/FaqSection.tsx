import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  ChevronDown,
  Sparkles,
  Send,
  Mail,
} from 'lucide-react';

export interface FaqItem {
  id: string;
  q: string;
  a: string;
}

const TOP_7_FAQS: FaqItem[] = [
  {
    id: 'faq-what-is-dots',
    q: 'What is Dots, and how is it different from to-do lists and calendar apps?',
    a: 'Traditional to-do apps are static wishlists that pile up indefinitely, while digital calendars only show rigid time slots. Dots is an AI personal execution platform that connects your long-term goals directly to your weekly reality. Instead of leaving you to manually reschedule tasks when your day derails, Dots balances your actual capacity, protects deep focus blocks, and recalibrates your plan with one tap.',
  },
  {
    id: 'faq-capacity-calculation',
    q: 'How does Dots calculate my realistic weekly capacity?',
    a: 'Dots uses our Reality Capacity Engine. It connects to your existing calendars, identifies fixed meetings, and automatically deducts transit, administrative overhead, and essential personal buffer time. Instead of letting you plan an unrealistic 50-hour fantasy week, Dots keeps your target bounded to what actually fits within 40 focused hours, ending the perpetual cycle of burnout and rollover guilt.',
  },
  {
    id: 'faq-user-control',
    q: 'Do I stay in control of schedule adjustments, or does AI change things automatically?',
    a: 'You are always 100% in control. Dots never quietly scrambles your calendar behind your back. Whenever an interruption strikes, Dots formulates a reasoned trade-off proposal, explains which non-essential items can be deferred, and presents a 1-tap approval card with clear before/after context for you to confirm or tweak.',
  },
  {
    id: 'faq-urgent-delays',
    q: 'What happens when an urgent meeting or delay interrupts my workday?',
    a: 'Dots immediately assesses the ripple effect. First, it absorbs the delay into your pre-allocated emergency buffer. If the disruption exceeds buffer space, Dots intelligently shifts flexible, lower-priority tasks to tomorrow or later in the week while shielding your vital deep work and personal commitments intact.',
  },
  {
    id: 'faq-telegram-voice',
    q: 'Can I capture tasks and adjust my schedule on the go using Telegram or voice notes?',
    a: 'Yes! Dots offers bidirectional Telegram and audio voice memo support. You can record a quick voice message like "Client call ran 40 minutes over, push non-essential tasks to tomorrow", and Dots parses the audio, updates your timeline, and sends you back an updated agenda in seconds.',
  },
  {
    id: 'faq-supported-calendars',
    q: 'Which calendars and productivity tools does Dots integrate with?',
    a: 'Dots features native bidirectional synchronization with Google Calendar, Microsoft Outlook, and Apple Calendar. It also connects directly to Telegram and Slack for swift task capture and daily briefings, with Notion, Todoist, and Linear imports actively in development.',
  },
  {
    id: 'faq-data-security',
    q: 'Is my personal schedule and private calendar data secure?',
    a: 'Your privacy is paramount. All data is protected with bank-grade 256-bit AES encryption at rest and TLS 1.3 in transit. We never sell your personal information or metadata, and your calendar contents are never used to train public foundation models.',
  },
];

export const FaqSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq-what-is-dots');

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="faq-section" aria-label="Frequently Asked Questions">
      <div className="faq-container">
        {/* Section Header */}
        <header className="faq-header">
          <div className="faq-badge">
            <HelpCircle size={14} className="faq-badge-icon" />
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>

          <h2 className="faq-title">
            Questions, answered with <span className="faq-title-highlight">clarity.</span>
          </h2>

          <p className="faq-subtitle">
            Straightforward answers to how Dots connects your goals, plans your week, and adapts when real life changes.
          </p>
        </header>

        {/* Clean Accordion List (Top 7 Core Questions) */}
        <div className="faq-list" role="region" aria-label="FAQ items">
          {TOP_7_FAQS.map((item) => {
            const isOpen = openId === item.id;

            return (
              <article
                key={item.id}
                className={`faq-card ${isOpen ? 'is-open' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="faq-card-trigger"
                  aria-expanded={isOpen}
                  aria-controls={`${item.id}-answer`}
                >
                  <h3 className="faq-question-text">{item.q}</h3>

                  <div className="faq-trigger-icon-wrap">
                    <ChevronDown
                      size={19}
                      className={`faq-chevron ${isOpen ? 'is-rotated' : ''}`}
                    />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`${item.id}-answer`}
                      className="faq-answer-container"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="faq-answer-inner">
                        <p className="faq-answer-text">{item.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            );
          })}
        </div>

        {/* Bottom Support Callout */}
        <footer className="faq-footer-callout">
          <div className="callout-left">
            <div className="callout-badge">
              <Sparkles size={14} />
              <span>STILL HAVE QUESTIONS?</span>
            </div>
            <h4 className="callout-title">Talk with the founding team</h4>
            <p className="callout-desc">
              Have specific workflow questions or curious about calendar migration? We respond within hours.
            </p>
          </div>

          <div className="callout-actions">
            <a
              href="https://t.me"
              target="_blank"
              rel="noopener noreferrer"
              className="callout-btn btn-telegram"
            >
              <Send size={15} />
              <span>Ask on Telegram</span>
            </a>
            <a
              href="mailto:founders@dots.app"
              className="callout-btn btn-email"
            >
              <Mail size={15} />
              <span>founders@dots.app</span>
            </a>
          </div>
        </footer>
      </div>

      <style>{`
        .faq-section {
          padding-block: clamp(60px, 7vw, 100px);
          position: relative;
          background: #F8F9FE;
          color: #111827;
          overflow: hidden;
        }

        .faq-container {
          max-width: 960px;
          margin-inline: auto;
          padding-inline: clamp(20px, 4vw, 36px);
          position: relative;
          z-index: 2;
        }

        /* 1. Header */
        .faq-header {
          text-align: center;
          max-width: 720px;
          margin-inline: auto;
          margin-bottom: 40px;
        }

        .faq-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: #EEF2FF;
          color: #2B2FD9;
          font-size: 0.74rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          padding: 6px 14px;
          border-radius: 9999px;
          border: 1px solid rgba(43, 47, 217, 0.12);
          margin-bottom: 14px;
        }

        .faq-badge-icon {
          color: #2B2FD9;
        }

        .faq-title {
          font-size: clamp(2.1rem, 3.8vw, 3.1rem);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.04em;
          color: #0F172A;
          margin: 0 0 14px;
        }

        .faq-title-highlight {
          color: #2B2FD9;
        }

        .faq-subtitle {
          font-size: clamp(0.98rem, 1.3vw, 1.08rem);
          line-height: 1.6;
          color: #52526B;
          margin: 0 auto;
          max-width: 580px;
        }

        /* 2. FAQ Cards */
        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 44px;
        }

        .faq-card {
          background: #FFFFFF;
          border: 1px solid rgba(226, 232, 240, 0.95);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
        }

        .faq-card:hover {
          border-color: rgba(43, 47, 217, 0.3);
          box-shadow: 0 6px 20px rgba(43, 47, 217, 0.05);
        }

        .faq-card.is-open {
          border-color: rgba(43, 47, 217, 0.35);
          background: #FFFFFF;
          box-shadow: 0 8px 26px rgba(43, 47, 217, 0.07);
        }

        .faq-card-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          gap: 16px;
        }

        .faq-question-text {
          font-size: clamp(0.98rem, 1.3vw, 1.08rem);
          font-weight: 700;
          line-height: 1.35;
          letter-spacing: -0.015em;
          color: #0F172A;
          margin: 0;
          transition: color 0.15s ease;
          flex: 1;
        }

        .faq-card:hover .faq-question-text,
        .faq-card.is-open .faq-question-text {
          color: #1E23B8;
        }

        .faq-trigger-icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #F8F9FE;
          border: 1px solid #E2E8F0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .faq-card.is-open .faq-trigger-icon-wrap {
          background: #2B2FD9;
          border-color: #2B2FD9;
        }

        .faq-chevron {
          color: #64748B;
          transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), color 0.2s ease;
        }

        .faq-chevron.is-rotated {
          transform: rotate(180deg);
          color: #FFFFFF;
        }

        /* Answer */
        .faq-answer-container {
          overflow: hidden;
        }

        .faq-answer-inner {
          padding: 0 24px 22px;
          border-top: 1px solid rgba(241, 245, 249, 0.9);
          margin-top: 2px;
        }

        .faq-answer-text {
          font-size: 0.94rem;
          line-height: 1.7;
          color: #475569;
          margin: 14px 0 0;
        }

        /* 3. Bottom Support Callout */
        .faq-footer-callout {
          background: linear-gradient(135deg, #FFFFFF 0%, #F5F7FF 100%);
          border: 1px solid rgba(219, 226, 255, 0.9);
          border-radius: 20px;
          padding: clamp(22px, 3.2vw, 32px);
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-shadow: 0 6px 24px rgba(43, 47, 217, 0.05);
        }

        @media (min-width: 860px) {
          .faq-footer-callout {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        .callout-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: #2B2FD9;
          margin-bottom: 8px;
        }

        .callout-title {
          font-size: 1.22rem;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 6px;
          letter-spacing: -0.02em;
        }

        .callout-desc {
          font-size: 0.88rem;
          color: #64748B;
          line-height: 1.5;
          margin: 0;
          max-width: 480px;
        }

        .callout-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .callout-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 9999px;
          font-size: 0.86rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .btn-telegram {
          background: #2B2FD9;
          color: #FFFFFF;
          box-shadow: 0 4px 14px rgba(43, 47, 217, 0.25);
        }

        .btn-telegram:hover {
          background: #1E23B8;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(43, 47, 217, 0.35);
        }

        .btn-email {
          background: #FFFFFF;
          color: #0F172A;
          border: 1px solid #CBD5E1;
        }

        .btn-email:hover {
          background: #F8F9FE;
          border-color: #94A3B8;
          transform: translateY(-2px);
        }
      `}</style>
    </section>
  );
};
