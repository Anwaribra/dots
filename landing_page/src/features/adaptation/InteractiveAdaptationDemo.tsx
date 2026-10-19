import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  Users,
  AlertCircle,
  CheckSquare,
  Square,
  Check,
  Shield,
  UserCheck,
  RotateCcw,
} from 'lucide-react';
import { TelegramIcon } from '../../components/brand/TelegramIcon';

export const InteractiveAdaptationDemo: React.FC = () => {
  const [isApproved, setIsApproved] = useState(false);

  return (
    <section
      id="adaptive-engine"
      className="adaptive-engine-section"
      aria-label="The Adaptive Engine"
    >
      {/* Anchor targets to preserve external links */}
      <div id="product" style={{ position: 'relative', top: '-80px', height: 0, visibility: 'hidden' }} />
      <div id="demo" style={{ position: 'relative', top: '-80px', height: 0, visibility: 'hidden' }} />

      <div className="adaptive-engine-container">
        {/* ================= LEFT: EDITORIAL COPY ================= */}
        <div className="adaptive-engine-copy">
          <span className="adaptive-eyebrow">THE ADAPTIVE ENGINE</span>

          <h2 className="adaptive-heading">
            The moment your day <span className="highlight-blue">changes.</span>
          </h2>

          <p className="adaptive-subtext">
            Tell Dots what changed. It finds the right place, protects what matters, and gives you one clear next step.
          </p>

          <div className="adaptive-control-pill" aria-label="Control guarantee">
            <span className="lime-dot" aria-hidden="true" />
            <span>You stay in control.</span>
          </div>

          <div>
            <a href="#how-it-works" className="adaptive-see-how-btn">
              <span>See how it works</span>
              <ArrowRight size={15} strokeWidth={2.4} />
            </a>
          </div>
        </div>

        {/* ================= RIGHT: PRODUCT SURFACE ================= */}
        <div className="adaptive-engine-visual">
          <div className="adaptive-engine-surface">
            <div className="adaptive-engine-flow">
            {/* Main Stage Grid: Left Stepper + Right UI Cards */}
            <div className="flow-grid-layout">
              {/* Stepper Column */}
              <div className="flow-stepper-track" aria-hidden="true">
                <div className="flow-vertical-line" />

                {/* Step 1 */}
                <div className="flow-step-meta">
                  <div className="flow-step-node" />
                  <div className="flow-step-text">
                    <span className="flow-step-num">01</span>
                    <h3 className="flow-step-title">A change comes in</h3>
                    <p className="flow-step-desc">Tell Dots what's new.</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flow-step-meta">
                  <div className="flow-step-node" />
                  <div className="flow-step-text">
                    <span className="flow-step-num">02</span>
                    <h3 className="flow-step-title">Dots sees the impact</h3>
                    <p className="flow-step-desc">We check your plan and find what's affected.</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flow-step-meta">
                  <div className="flow-step-node" />
                  <div className="flow-step-text">
                    <span className="flow-step-num">03</span>
                    <h3 className="flow-step-title">One plan, ready to approve</h3>
                    <p className="flow-step-desc">Dots adjusts your plan and gives you the next step.</p>
                  </div>
                </div>
              </div>

              {/* Product UI Cards Column */}
              <div className="flow-cards-column">
                {/* Stage 1: Telegram Message Card */}
                <motion.div
                  className="flow-stage-card"
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flow-mobile-step-tag">
                    <span className="mobile-lime-dot" />
                    <span>01 · A change comes in</span>
                  </div>

                  <div className="telegram-chat-bubble-card">
                    <TelegramIcon size={34} variant="circle" />

                    <div className="telegram-bubble-body">
                      <p className="telegram-bubble-text">
                        I need two hours for an urgent task today.
                      </p>
                      <span className="telegram-timestamp">9:14 AM</span>
                    </div>
                  </div>
                </motion.div>

                {/* Stage 2: Conflict Impact Card */}
                <motion.div
                  className="flow-stage-card"
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.24, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flow-mobile-step-tag">
                    <span className="mobile-lime-dot" />
                    <span>02 · Dots sees the impact</span>
                  </div>

                  <div className="impact-evaluation-card">
                    <div className="impact-items-list">
                      <div className="impact-row">
                        <div className="impact-icon-box box-calendar">
                          <Calendar size={14} />
                        </div>
                        <div className="impact-row-info">
                          <span className="impact-event-name">Deep work</span>
                          <span className="impact-event-time">1:00 – 3:00 PM</span>
                        </div>
                      </div>

                      <div className="impact-row">
                        <div className="impact-icon-box box-users">
                          <Users size={14} />
                        </div>
                        <div className="impact-row-info">
                          <span className="impact-event-name">Team sync</span>
                          <span className="impact-event-time">3:00 – 4:00 PM</span>
                        </div>
                      </div>
                    </div>

                    <div className="tradeoffs-pill" role="status">
                      <AlertCircle size={14} className="tradeoffs-icon" />
                      <span>2 trade-offs found</span>
                    </div>
                  </div>
                </motion.div>

                {/* Stage 3: Revised Timeline & Approval Action */}
                <motion.div
                  className="flow-stage-card"
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.24, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flow-mobile-step-tag">
                    <span className="mobile-lime-dot" />
                    <span>03 · One plan, ready to approve</span>
                  </div>

                  <div className="revised-plan-card">
                    <div className="revised-plan-rows">
                      <div className="plan-item-row is-urgent">
                        <div className="plan-item-left">
                          <CheckSquare size={15} className="plan-check-icon icon-checked" />
                          <span className="plan-item-title">Urgent task</span>
                        </div>
                        <span className="plan-item-time time-highlight">1:00 – 3:00 PM</span>
                      </div>

                      <div className="plan-item-row">
                        <div className="plan-item-left">
                          <Square size={15} className="plan-check-icon icon-muted" />
                          <span className="plan-item-title">Team sync</span>
                        </div>
                        <span className="plan-item-time">3:00 – 4:00 PM</span>
                      </div>

                      <div className="plan-item-row is-deferred">
                        <div className="plan-item-left">
                          <Square size={15} className="plan-check-icon icon-muted" />
                          <span className="plan-item-title text-deferred">Research moved to tomorrow</span>
                        </div>
                        <span className="deferred-tag">Protected</span>
                      </div>
                    </div>

                    {/* Primary Action Button */}
                    <div className="approve-action-area">
                      <button
                        type="button"
                        onClick={() => setIsApproved((prev) => !prev)}
                        className={`approve-btn ${isApproved ? 'is-approved' : ''}`}
                        aria-pressed={isApproved}
                      >
                        {isApproved ? (
                          <>
                            <Check size={16} strokeWidth={3} />
                            <span>Changes approved · Plan updated</span>
                          </>
                        ) : (
                          <span>Approve changes</span>
                        )}
                      </button>
                      {isApproved && (
                        <button
                          type="button"
                          onClick={() => setIsApproved(false)}
                          className="reset-demo-link"
                        >
                          Reset demo state
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Bottom Trust Bar */}
            <div className="flow-trust-bar">
              <div className="trust-item">
                <div className="trust-icon-box">
                  <Shield size={14} />
                </div>
                <span className="trust-label">Fixed commitments protected</span>
              </div>

              <div className="trust-item">
                <div className="trust-icon-box">
                  <UserCheck size={14} />
                </div>
                <span className="trust-label">You approve every change</span>
              </div>

              <div className="trust-item">
                <div className="trust-icon-box">
                  <RotateCcw size={14} />
                </div>
                <span className="trust-label">No replanning from scratch</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      <style>{`
        /* ==================== THE ADAPTIVE ENGINE STYLES ==================== */
        .adaptive-engine-section {
          padding-block: clamp(64px, 8vw, 110px);
          position: relative;
          background: #F8F9FE;
          color: #111827;
          overflow: hidden;
        }

        .adaptive-engine-container {
          max-width: 1320px;
          margin-inline: auto;
          padding-inline: clamp(20px, 4vw, 44px);
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(36px, 5vw, 64px);
          align-items: center;
        }

        @media (min-width: 1040px) {
          .adaptive-engine-container {
            grid-template-columns: minmax(360px, 440px) minmax(580px, 680px);
            justify-content: space-between;
          }
        }

        /* 1. Left Editorial Copy */
        .adaptive-engine-copy {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          z-index: 2;
        }

        .adaptive-eyebrow {
          font-size: 0.74rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #2B2FD9;
          margin-bottom: 14px;
        }

        .adaptive-heading {
          font-size: clamp(2.3rem, 4.2vw, 3.6rem);
          font-weight: 800;
          line-height: 1.12;
          letter-spacing: -0.04em;
          color: #0F172A;
          margin: 0 0 18px;
        }

        .highlight-blue {
          color: #2B2FD9;
        }

        .adaptive-subtext {
          font-size: clamp(1rem, 1.35vw, 1.12rem);
          line-height: 1.62;
          color: #52526B;
          margin: 0 0 24px;
          max-width: 440px;
        }

        /* Pill: You stay in control */
        .adaptive-control-pill {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 8px 18px;
          border-radius: 9999px;
          background: #FFFFFF;
          border: 1.5px solid #D2F64C;
          color: #0F172A;
          font-size: 0.86rem;
          font-weight: 700;
          box-shadow: 0 2px 10px rgba(190, 242, 60, 0.22);
          margin-bottom: 26px;
        }

        .lime-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #84CC16;
          box-shadow: 0 0 0 2.5px rgba(210, 246, 76, 0.55);
        }

        /* Secondary Button: See how it works */
        .adaptive-see-how-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 9999px;
          background: #EEF2FF;
          color: #1E1B4B;
          font-size: 0.92rem;
          font-weight: 700;
          text-decoration: none;
          border: 1px solid rgba(43, 47, 217, 0.14);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .adaptive-see-how-btn:hover {
          background: #E0E7FF;
          color: #2B2FD9;
          transform: translateX(3px);
          box-shadow: 0 4px 14px rgba(43, 47, 217, 0.12);
        }

        /* 2. Product Surface */
        .adaptive-engine-visual {
          position: relative;
          display: flex;
          align-items: center;
          justifyContent: center;
          width: 100%;
          max-width: 680px;
          margin-inline: auto;
        }

        .adaptive-engine-surface {
          position: relative;
          z-index: 1;
          width: 100%;
          border-radius: 26px;
          background: #FFFFFF;
          box-shadow: 0 24px 60px -12px rgba(23, 23, 43, 0.12), 0 4px 16px rgba(23, 23, 43, 0.04);
          border: 1px solid rgba(23, 23, 43, 0.08);
        }

        @media (max-width: 900px) {
          .adaptive-engine-surface {
            border-radius: 22px;
          }
        }

        /* Inside White Product Card Surface */
        .adaptive-engine-flow {
          padding: clamp(20px, 3.2vw, 28px);
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Grid inside white card: Stepper (Left) + UI Cards (Right) */
        .flow-grid-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 768px) {
          .flow-grid-layout {
            grid-template-columns: 175px 1fr;
            gap: 22px;
          }
        }

        /* Stepper Column (Desktop) */
        .flow-stepper-track {
          display: none;
          position: relative;
          padding-left: 22px;
        }

        @media (min-width: 768px) {
          .flow-stepper-track {
            display: flex;
            flex-direction: column;
            justifyContent: space-between;
            padding-block: 6px;
          }
        }

        .flow-vertical-line {
          position: absolute;
          left: 6px;
          top: 14px;
          bottom: 20px;
          width: 2px;
          background: #E2E8F0;
        }

        .flow-step-meta {
          position: relative;
          display: flex;
          align-items: flex-start;
        }

        .flow-step-node {
          position: absolute;
          left: -22px;
          top: 2px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #D2F64C;
          border: 2.5px solid #FFFFFF;
          box-shadow: 0 0 0 2px #A3E635;
          flex-shrink: 0;
          z-index: 2;
        }

        .flow-step-text {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .flow-step-num {
          font-size: 0.7rem;
          font-weight: 800;
          color: #94A3B8;
          letter-spacing: 0.05em;
        }

        .flow-step-title {
          font-size: 0.88rem;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.015em;
          margin: 0;
          line-height: 1.25;
        }

        .flow-step-desc {
          font-size: 0.72rem;
          color: #64748B;
          line-height: 1.4;
          margin: 0;
        }

        /* UI Cards Column */
        .flow-cards-column {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .flow-stage-card {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          padding: 12px 14px;
          transition: border-color 0.18s ease;
        }

        .flow-stage-card:hover {
          border-color: rgba(43, 47, 217, 0.25);
        }

        /* Mobile step badge */
        .flow-mobile-step-tag {
          display: none;
          align-items: center;
          gap: 7px;
          font-size: 0.7rem;
          font-weight: 800;
          color: #2B2FD9;
          margin-bottom: 8px;
        }

        @media (max-width: 767px) {
          .flow-mobile-step-tag {
            display: flex;
          }
        }

        .mobile-lime-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #D2F64C;
          box-shadow: 0 0 0 2px #A3E635;
        }

        /* Stage 1: Telegram Message Bubble */
        .telegram-chat-bubble-card {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .telegram-circle-icon {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #24A1DE 0%, #1E88E5 100%);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justifyContent: center;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(36, 161, 222, 0.35);
        }

        .telegram-bubble-body {
          flex: 1;
          display: flex;
          align-items: center;
          justifyContent: space-between;
          gap: 10px;
          background: #EEF2FF;
          border: 1px solid rgba(43, 47, 217, 0.12);
          border-radius: 12px;
          padding: 8px 14px;
        }

        .telegram-bubble-text {
          font-size: 0.82rem;
          font-weight: 600;
          color: #1E1B4B;
          margin: 0;
          line-height: 1.35;
        }

        .telegram-timestamp {
          font-size: 0.7rem;
          font-weight: 600;
          color: #64748B;
          flex-shrink: 0;
        }

        /* Stage 2: Conflict Impact Card */
        .impact-evaluation-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        @media (min-width: 520px) {
          .impact-evaluation-card {
            flex-direction: row;
            align-items: center;
            justifyContent: space-between;
          }
        }

        .impact-items-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }

        .impact-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .impact-icon-box {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justifyContent: center;
          flex-shrink: 0;
        }

        .box-calendar {
          background: #EEF2FF;
          color: #2B2FD9;
        }

        .box-users {
          background: #E0F2FE;
          color: #0284C7;
        }

        .impact-row-info {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }

        .impact-event-name {
          font-size: 0.82rem;
          font-weight: 700;
          color: #0F172A;
        }

        .impact-event-time {
          font-size: 0.72rem;
          color: #64748B;
          font-weight: 500;
        }

        .tradeoffs-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #FEF2F2;
          border: 1px solid #FEE2E2;
          border-radius: 9999px;
          padding: 6px 12px;
          color: #DC2626;
          font-size: 0.76rem;
          font-weight: 700;
          flex-shrink: 0;
          align-self: flex-start;
        }

        @media (min-width: 520px) {
          .tradeoffs-pill {
            align-self: center;
          }
        }

        .tradeoffs-icon {
          color: #EF4444;
          flex-shrink: 0;
        }

        /* Stage 3: Revised Timeline & Approval */
        .revised-plan-card {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .revised-plan-rows {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .plan-item-row {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          padding: 6px 10px;
          background: #FFFFFF;
          border-radius: 8px;
          border: 1px solid #E2E8F0;
        }

        .plan-item-row.is-urgent {
          border-color: rgba(43, 47, 217, 0.25);
          background: #FDFDFF;
          box-shadow: 0 1px 4px rgba(43, 47, 217, 0.04);
        }

        .plan-item-row.is-deferred {
          background: #FAFAFD;
          border-style: dashed;
        }

        .plan-item-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .plan-check-icon {
          flex-shrink: 0;
        }

        .icon-checked {
          color: #2B2FD9;
        }

        .icon-muted {
          color: #94A3B8;
        }

        .plan-item-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: #0F172A;
        }

        .text-deferred {
          color: #64748B;
          font-weight: 500;
        }

        .plan-item-time {
          font-size: 0.74rem;
          font-weight: 600;
          color: #64748B;
        }

        .time-highlight {
          color: #2B2FD9;
          font-weight: 700;
        }

        .deferred-tag {
          font-size: 0.68rem;
          font-weight: 700;
          color: #15803D;
          background: #F4FCE3;
          border: 1px solid #D9F99D;
          padding: 1px 6px;
          border-radius: 9999px;
        }

        /* Approve Action Button */
        .approve-action-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          margin-top: 2px;
        }

        .approve-btn {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #D2F64C;
          color: #0F172A;
          font-size: 0.9rem;
          font-weight: 800;
          padding: 11px 20px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 16px -2px rgba(163, 230, 53, 0.5);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .approve-btn:hover {
          background: #C4EE38;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px -2px rgba(163, 230, 53, 0.65);
        }

        .approve-btn:active {
          transform: translateY(0);
        }

        .approve-btn.is-approved {
          background: #10B981;
          color: #FFFFFF;
          box-shadow: 0 4px 16px -2px rgba(16, 185, 129, 0.45);
        }

        .reset-demo-link {
          background: transparent;
          border: none;
          font-size: 0.72rem;
          color: #64748B;
          text-decoration: underline;
          cursor: pointer;
          padding: 1px 4px;
        }

        .reset-demo-link:hover {
          color: #0F172A;
        }

        /* 3. Bottom Trust Bar */
        .flow-trust-bar {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px solid rgba(241, 245, 249, 0.95);
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .trust-icon-box {
          width: 26px;
          height: 26px;
          border-radius: 7px;
          background: #EEF2FF;
          color: #2B2FD9;
          display: flex;
          align-items: center;
          justifyContent: center;
          flex-shrink: 0;
        }

        .trust-label {
          font-size: 0.74rem;
          font-weight: 700;
          color: #475569;
        }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          .flow-stage-card,
          .approve-btn,
          .adaptive-see-how-btn {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
};
