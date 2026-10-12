import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Check,
  CheckCircle2,
  ShieldCheck,
  ArrowDown,
  Zap,
  Mail,
} from 'lucide-react';

export const DotsLoopSection: React.FC = () => {
  return (
    <section id="the-dots-loop" className="dots-loop-section" aria-label="The Dots Loop">
      {/* Anchor target to preserve navbar links */}
      <div id="early-access" style={{ position: 'relative', top: '-80px', height: 0, visibility: 'hidden' }} />

      {/* Ambient background accent orbs */}
      <div className="loop-ambient-layer" aria-hidden="true">
        <div className="loop-bg-bubble bubble-left" />
        <div className="loop-bg-bubble bubble-right" />
      </div>

      <div className="loop-container">
        {/* 1. Section Introduction */}
        <header className="loop-header">
          <span className="loop-kicker">THE DOTS LOOP</span>
          <h2 className="loop-title">
            When life changes, your plan changes <span className="loop-title-highlight">with you.</span>
          </h2>
          <p className="loop-subtitle">
            Dots protects what matters, makes space for what is real, and keeps the next step clear.
          </p>
        </header>

        {/* 2. The Three-Stage Product Story */}
        <div className="loop-composition-wrapper">
          {/* Organic Cobalt/Indigo Backdrop Shape */}
          <div className="organic-blob-backdrop" aria-hidden="true">
            <svg
              viewBox="0 0 1200 520"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="organic-blob-svg"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="blobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#252BD5" stopOpacity="0.88" />
                  <stop offset="45%" stopColor="#3A40F5" stopOpacity="0.94" />
                  <stop offset="85%" stopColor="#2B2FD9" stopOpacity="0.90" />
                  <stop offset="100%" stopColor="#1E23B8" stopOpacity="0.85" />
                </linearGradient>
                <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="30" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <path
                d="M 60,260 C 90,140 220,110 380,120 C 560,130 680,60 850,70 C 1020,80 1140,160 1160,280 C 1180,380 1060,460 900,470 C 720,480 580,450 400,460 C 220,470 40,380 60,260 Z"
                fill="url(#blobGrad)"
                filter="url(#softGlow)"
              />
            </svg>
          </div>

          {/* Connected Curved Path Overlay (Desktop) */}
          <div className="connector-path-container" aria-hidden="true">
            <svg
              viewBox="0 0 1200 480"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="connector-svg"
            >
              {/* Outer start dot (Indigo left) */}
              <circle cx="95" cy="275" r="5" fill="#2B2FD9" />
              <line x1="95" y1="275" x2="235" y2="185" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="1.5" strokeDasharray="3 4" />

              {/* Main fluid continuous connector wave */}
              <path
                d="M 235,185 C 360,195 440,160 595,170 C 720,180 840,240 955,185 C 1020,150 1080,140 1150,115"
                stroke="rgba(255, 255, 255, 0.95)"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="animated-connector-line"
              />

              {/* Lime Node 1 (Stage 1 top center: ~235, 185) */}
              <circle cx="235" cy="185" r="9" fill="#D2F64C" className="lime-node node-1" />
              <circle cx="235" cy="185" r="16" fill="#D2F64C" fillOpacity="0.28" />

              {/* Lime Node 2 (Stage 2 top center: ~595, 170) */}
              <circle cx="595" cy="170" r="9" fill="#D2F64C" className="lime-node node-2" />
              <circle cx="595" cy="170" r="16" fill="#D2F64C" fillOpacity="0.28" />

              {/* Lime Node 3 (Stage 3 top center: ~955, 185) */}
              <circle cx="955" cy="185" r="9" fill="#D2F64C" className="lime-node node-3" />
              <circle cx="955" cy="185" r="16" fill="#D2F64C" fillOpacity="0.28" />

              {/* End Lime Node (Right exit: ~1150, 115) */}
              <circle cx="1150" cy="115" r="8" fill="#D2F64C" />
              <circle cx="1150" cy="115" r="14" fill="#D2F64C" fillOpacity="0.25" />
            </svg>
          </div>

          {/* Side Annotation: 'No perfect week required.' */}
          <div className="loop-annotation" aria-hidden="true">
            <span className="annotation-script">No perfect week required.</span>
            <svg width="74" height="14" viewBox="0 0 74 14" fill="none" className="annotation-swoosh">
              <path d="M 2 8 C 24 2, 52 2, 72 10" stroke="#2B2FD9" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>

          {/* 3 Horizontal Cards Group with Framer Motion */}
          <ol className="loop-cards-grid">
            {/* STAGE 1 — Notice */}
            <motion.li
              className="loop-stage-card card-notice"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="card-mobile-node" aria-hidden="true">
                <span className="mobile-dot" />
              </div>

              <div className="card-header">
                <span className="stage-step-num">01</span>
                <h3 className="stage-title">Notice</h3>
                <p className="stage-desc">
                  Life happens. Dots sees it, so you don't have to replan everything.
                </p>
              </div>

              {/* Mini UI 1 - Rich Incoming Event + Realtime Impact Analysis */}
              <div className="mini-ui-card ui-notice-card">
                {/* Incoming Request Pill */}
                <div className="notice-incoming-item">
                  <div className="ui-icon-box ui-blue-icon">
                    <Mail size={16} strokeWidth={2.4} />
                    <span className="live-ping-dot" aria-hidden="true" />
                  </div>
                  <div className="ui-text-column">
                    <div className="notice-title-row">
                      <span className="ui-primary-text">A client request came up</span>
                      <span className="notice-urgent-pill">Urgent</span>
                    </div>
                    <span className="ui-sub-text">10:24 AM · 2 hours needed</span>
                  </div>
                  <div className="ui-accent-slashes" aria-hidden="true">//</div>
                </div>

                {/* Conflict Detection & Dots Auto-assessment */}
                <div className="notice-impact-panel">
                  <div className="impact-header-row">
                    <div className="impact-badge">
                      <Zap size={13} className="impact-alert-icon" />
                      <span>Conflict detected</span>
                    </div>
                    <span className="impact-target">10:00 AM slot</span>
                  </div>
                  <div className="impact-desc-row">
                    <span>Overlaps scheduled <strong>Deep work</strong>. Dots calculates flexible reschedule...</span>
                  </div>
                  <div className="impact-status-bar">
                    <span className="impact-evaluating-dot" />
                    <span>Evaluating 3 trade-off scenarios</span>
                  </div>
                </div>
              </div>
            </motion.li>

            {/* STAGE 2 — Rebalance */}
            <motion.li
              className="loop-stage-card card-rebalance is-elevated"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="card-mobile-node" aria-hidden="true">
                <span className="mobile-dot" />
              </div>

              <div className="card-header">
                <span className="stage-step-num">02</span>
                <h3 className="stage-title">Rebalance</h3>
                <p className="stage-desc">
                  Dots automatically adjusts your plan, finds space, and keeps your priorities intact.
                </p>
              </div>

              {/* Mini UI 2 - Clear Before / After Slot Reschedule Flow */}
              <div className="mini-ui-card ui-rebalance-card">
                {/* Original scheduled block (Moved) */}
                <div className="rebalance-slot slot-original">
                  <div className="slot-side-indicator indicator-muted" />
                  <div className="rebalance-info">
                    <span className="rebalance-title">Deep work</span>
                    <span className="rebalance-time">10:00 – 12:00</span>
                  </div>
                  <span className="slot-badge-shifted">Shifted</span>
                </div>

                {/* Dedicated SVG Connecting Flow Bridge */}
                <div className="rebalance-flow-bridge" aria-hidden="true">
                  <div className="flow-bridge-track">
                    <svg width="100%" height="26" viewBox="0 0 240 26" fill="none" preserveAspectRatio="none">
                      <path
                        d="M 30 2 C 30 18, 170 8, 170 24"
                        stroke="#6366F1"
                        strokeWidth="1.75"
                        strokeDasharray="4 3"
                        strokeLinecap="round"
                        className="bridge-curve-line"
                      />
                      <polygon points="170,26 166,19 174,19" fill="#6366F1" />
                    </svg>
                  </div>
                  <div className="flow-bridge-tag">
                    <ArrowDown size={10} strokeWidth={3} />
                    <span>Auto-moved to afternoon</span>
                  </div>
                </div>

                {/* Adjusted protected block (Zero text collision) */}
                <div className="rebalance-slot slot-adjusted">
                  <div className="slot-side-indicator indicator-active" />
                  <div className="rebalance-info">
                    <span className="rebalance-title">Deep work</span>
                    <span className="rebalance-time text-adjusted">2:00 – 4:00</span>
                  </div>
                  <div className="rebalance-protected-badge">
                    <div className="badge-check-circle">
                      <Check size={11} strokeWidth={3.2} />
                    </div>
                    <span>Protected</span>
                  </div>
                </div>

                {/* Space made pill */}
                <div className="space-made-pill">
                  <Sparkles size={13} className="space-sparkle-icon" />
                  <span className="space-label">Space made for client</span>
                  <span className="space-value">+ 2 hours</span>
                </div>
              </div>
            </motion.li>

            {/* STAGE 3 — Move forward */}
            <motion.li
              className="loop-stage-card card-forward"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="card-mobile-node" aria-hidden="true">
                <span className="mobile-dot" />
              </div>

              <div className="card-header">
                <span className="stage-step-num">03</span>
                <h3 className="stage-title">Move forward</h3>
                <p className="stage-desc">
                  You stay in control, with a plan that fits your real life — and still moves you forward.
                </p>
              </div>

              {/* Mini UI 3 - Execution Tracker & Protected Priorities */}
              <div className="mini-ui-card ui-forward-card">
                <div className="ui-forward-header">
                  <div className="ui-icon-box ui-blue-icon">
                    <ShieldCheck size={17} strokeWidth={2.4} />
                  </div>
                  <div className="ui-forward-title-group">
                    <div className="forward-title-row">
                      <span className="ui-primary-text">Your week still works</span>
                      <span className="forward-status-chip">100% on track</span>
                    </div>
                    <span className="ui-sub-text">3 priorities fully protected</span>
                  </div>
                </div>

                {/* 3-Step Protected Progress Segments */}
                <div className="forward-progress-track" aria-hidden="true">
                  <div className="progress-seg is-active" />
                  <div className="progress-seg is-active" />
                  <div className="progress-seg is-active" />
                </div>

                {/* Structured Priority Checklist */}
                <ul className="forward-checklist" aria-label="Protected priorities">
                  <li className="checklist-item">
                    <span className="check-bullet"><Check size={12} strokeWidth={2.8} /></span>
                    <span className="item-name">Launch product update</span>
                    <span className="item-priority-pill pill-p1">P1</span>
                  </li>
                  <li className="checklist-item">
                    <span className="check-bullet"><Check size={12} strokeWidth={2.8} /></span>
                    <span className="item-name">Client call</span>
                    <span className="item-priority-pill pill-client">Scheduled</span>
                  </li>
                  <li className="checklist-item">
                    <span className="check-bullet"><Check size={12} strokeWidth={2.8} /></span>
                    <span className="item-name">Plan team offsite</span>
                    <span className="item-priority-pill pill-protected">Protected</span>
                  </li>
                </ul>

                <div className="forward-reassurance-footer">
                  <CheckCircle2 size={12} className="footer-check-icon" />
                  <span>All commitments intact · Zero burnout</span>
                </div>
              </div>
            </motion.li>
          </ol>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&display=swap');

        .dots-loop-section {
          padding-top: clamp(24px, 3.2vw, 44px);
          padding-bottom: clamp(64px, 7vw, 100px);
          background: transparent !important;
          position: relative;
          overflow: hidden;
          color: #111827;
        }

        .loop-ambient-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }

        .loop-bg-bubble {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.45;
        }

        .bubble-left {
          width: 440px;
          height: 440px;
          top: 25%;
          left: -120px;
          background: radial-gradient(circle, rgba(67, 70, 226, 0.18) 0%, rgba(67, 70, 226, 0) 70%);
        }

        .bubble-right {
          width: 460px;
          height: 460px;
          bottom: 10%;
          right: -100px;
          background: radial-gradient(circle, rgba(210, 246, 76, 0.22) 0%, rgba(210, 246, 76, 0) 70%);
        }

        .loop-container {
          position: relative;
          z-index: 1;
          max-width: 1360px;
          margin-inline: auto;
          padding-inline: clamp(20px, 4vw, 48px);
        }

        /* 1. Section Introduction */
        .loop-header {
          max-width: 680px;
          margin-bottom: clamp(24px, 3.5vw, 38px);
        }

        .loop-kicker {
          display: block;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #6366F1;
          margin-bottom: 8px;
        }

        .loop-title {
          font-size: clamp(2.3rem, 4.4vw, 3.6rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.04em;
          color: #0F172A;
          margin-bottom: 14px;
        }

        .loop-title-highlight {
          color: #2B2FD9;
        }

        .loop-subtitle {
          font-size: clamp(1rem, 1.4vw, 1.14rem);
          line-height: 1.55;
          color: #475569;
          margin: 0;
        }

        /* 2. Composition Area */
        .loop-composition-wrapper {
          position: relative;
          margin-bottom: clamp(48px, 6vw, 72px);
          padding-block: 28px 24px;
        }

        /* Organic Background Blob */
        .organic-blob-backdrop {
          position: absolute;
          inset: -20px 4% -20px 4%;
          z-index: 0;
          pointer-events: none;
        }

        .organic-blob-svg {
          width: 100%;
          height: 100%;
          display: block;
        }

        /* Continuous SVG Connector Path */
        .connector-path-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 2;
          pointer-events: none;
        }

        .connector-svg {
          width: 100%;
          height: 100%;
          display: block;
        }

        .animated-connector-line {
          stroke-dasharray: 1200;
          stroke-dashoffset: 0;
          animation: drawConnector 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes drawConnector {
          from { stroke-dashoffset: 1200; }
          to { stroke-dashoffset: 0; }
        }

        .lime-node {
          filter: drop-shadow(0 2px 8px rgba(210, 246, 76, 0.6));
          animation: popNode 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        .node-1 { animation-delay: 0.3s; }
        .node-2 { animation-delay: 0.6s; }
        .node-3 { animation-delay: 0.9s; }

        @keyframes popNode {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        /* Annotation Top Right */
        .loop-annotation {
          position: absolute;
          top: -14px;
          right: 8%;
          z-index: 4;
          display: flex;
          flex-direction: column;
          align-items: center;
          transform: rotate(4deg);
        }

        .annotation-script {
          font-family: 'Caveat', cursive;
          font-size: 1.55rem;
          font-weight: 700;
          color: #2B2FD9;
          letter-spacing: -0.01em;
          white-space: nowrap;
          line-height: 1;
        }

        .annotation-swoosh {
          margin-top: 2px;
          opacity: 0.85;
        }

        /* 3 Cards Grid */
        .loop-cards-grid {
          position: relative;
          z-index: 3;
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: 1fr;
          gap: 22px;
        }

        @media (min-width: 960px) {
          .loop-cards-grid {
            grid-template-columns: 1fr 1fr 1fr;
            gap: 24px;
            align-items: stretch;
          }
        }

        .loop-stage-card {
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(28px) saturate(160%);
          -webkit-backdrop-filter: blur(28px) saturate(160%);
          border-radius: 30px;
          padding: 38px 26px 30px;
          border: 1px solid rgba(255, 255, 255, 0.98);
          box-shadow:
            0 24px 54px -14px rgba(27, 31, 100, 0.12),
            0 2px 8px rgba(0, 0, 0, 0.02),
            inset 0 1px 1px rgba(255, 255, 255, 1);
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          position: relative;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }

        .loop-stage-card:hover {
          transform: translateY(-4px);
          box-shadow:
            0 32px 64px -16px rgba(27, 31, 100, 0.18),
            inset 0 1px 1px rgba(255, 255, 255, 1);
        }

        .card-rebalance.is-elevated {
          background: rgba(255, 255, 255, 0.96);
          box-shadow:
            0 28px 60px -14px rgba(27, 31, 100, 0.16),
            0 0 0 1px rgba(255, 255, 255, 1),
            inset 0 1.5px 2px rgba(255, 255, 255, 1);
        }

        .card-mobile-node {
          display: none;
        }

        .card-header {
          margin-bottom: 24px;
        }

        .stage-step-num {
          font-size: 0.76rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          color: #64748B;
          display: block;
          margin-bottom: 4px;
        }

        .stage-title {
          font-size: 1.55rem;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.03em;
          margin: 0 0 8px;
        }

        .stage-desc {
          font-size: 0.88rem;
          line-height: 1.52;
          color: #475569;
          margin: 0;
          min-height: 40px;
        }

        /* Mini UI Cards */
        .mini-ui-card {
          background: #FFFFFF;
          border-radius: 20px;
          border: 1px solid rgba(226, 232, 240, 0.95);
          box-shadow: 0 10px 28px -8px rgba(15, 23, 42, 0.08);
          padding: 16px;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          min-height: 258px;
          box-sizing: border-box;
        }

        /* ---------------- Stage 1: Notice Mini UI ---------------- */
        .ui-notice-card {
          gap: 12px;
        }

        .notice-incoming-item {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          padding: 12px 14px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
        }

        .ui-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justifyContent: center;
          flex-shrink: 0;
          position: relative;
        }

        .ui-blue-icon {
          background: #EEF2FF;
          color: #2B2FD9;
        }

        .live-ping-dot {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22C55E;
          box-shadow: 0 0 0 2px #FFFFFF, 0 0 8px rgba(34, 197, 94, 0.8);
          animation: pingDot 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes pingDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.25); opacity: 0.75; }
        }

        .ui-text-column {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
          min-width: 0;
        }

        .notice-title-row {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .ui-primary-text {
          font-size: 0.84rem;
          font-weight: 700;
          color: #0F172A;
          letter-spacing: -0.01em;
        }

        .notice-urgent-pill {
          font-size: 0.64rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          padding: 1px 6px;
          border-radius: 9999px;
          background: #FEE2E2;
          color: #DC2626;
        }

        .ui-sub-text {
          font-size: 0.74rem;
          color: #64748B;
        }

        .ui-accent-slashes {
          color: #D2F64C;
          font-size: 1.1rem;
          font-weight: 900;
          letter-spacing: -0.08em;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.12));
          flex-shrink: 0;
        }

        /* Notice Impact / Conflict Panel */
        .notice-impact-panel {
          padding: 12px 14px;
          background: #EEF2FF;
          border: 1px solid rgba(99, 102, 241, 0.22);
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .impact-header-row {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .impact-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #3730A3;
        }

        .impact-alert-icon {
          color: #6366F1;
        }

        .impact-target {
          font-size: 0.7rem;
          color: #4F46E5;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.85);
          padding: 1px 6px;
          border-radius: 6px;
        }

        .impact-desc-row {
          font-size: 0.73rem;
          line-height: 1.45;
          color: #4338CA;
        }

        .impact-status-bar {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.69rem;
          font-weight: 600;
          color: #4F46E5;
          margin-top: 2px;
        }

        .impact-evaluating-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #6366F1;
          animation: pulseDot 1.4s ease-in-out infinite;
        }

        @keyframes pulseDot {
          0%, 100% { opacity: 0.4; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.15); }
        }

        /* ---------------- Stage 2: Rebalance Mini UI ---------------- */
        .ui-rebalance-card {
          gap: 8px;
        }

        .rebalance-slot {
          padding: 10px 14px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          width: 100%;
          box-sizing: border-box;
        }

        .slot-original {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
        }

        .slot-side-indicator {
          width: 3px;
          height: 24px;
          border-radius: 2px;
          flex-shrink: 0;
        }

        .indicator-muted {
          background: #94A3B8;
        }

        .indicator-active {
          background: #10B981;
        }

        .rebalance-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
          flex: 1;
          min-width: 0;
        }

        .rebalance-title {
          font-size: 0.82rem;
          font-weight: 700;
          color: #0F172A;
        }

        .rebalance-time {
          font-size: 0.74rem;
          color: #64748B;
          font-variant-numeric: tabular-nums;
        }

        .slot-badge-shifted {
          font-size: 0.68rem;
          font-weight: 600;
          color: #64748B;
          background: #E2E8F0;
          padding: 2px 7px;
          border-radius: 6px;
          flex-shrink: 0;
          margin-left: auto;
        }

        /* SVG Flow Bridge */
        .rebalance-flow-bridge {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-inline: 8px;
          margin-block: 2px;
        }

        .flow-bridge-track {
          flex: 1;
          height: 26px;
          max-width: 90px;
        }

        .bridge-curve-line {
          animation: dashMove 2.5s linear infinite;
        }

        @keyframes dashMove {
          from { stroke-dashoffset: 20; }
          to { stroke-dashoffset: 0; }
        }

        .flow-bridge-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          color: #4F46E5;
          background: #EEF2FF;
          padding: 3px 9px;
          border-radius: 9999px;
          border: 1px solid rgba(99, 102, 241, 0.22);
          box-shadow: 0 1px 3px rgba(99, 102, 241, 0.08);
        }

        .slot-adjusted {
          background: rgba(210, 246, 76, 0.16);
          border: 1px solid rgba(132, 204, 22, 0.35);
        }

        .text-adjusted {
          color: #15803D;
          font-weight: 700;
          font-size: 0.76rem;
        }

        .rebalance-protected-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          flex-shrink: 0;
          margin-left: auto;
          font-size: 0.71rem;
          font-weight: 700;
          color: #15803D;
          background: rgba(34, 197, 94, 0.12);
          padding: 3px 8px;
          border-radius: 9999px;
        }

        .badge-check-circle {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: #16A34A;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justifyContent: center;
          flex-shrink: 0;
        }

        .space-made-pill {
          margin-top: 4px;
          background: linear-gradient(90deg, rgba(210, 246, 76, 0.35) 0%, rgba(210, 246, 76, 0.18) 100%);
          border: 1px solid rgba(132, 204, 22, 0.35);
          border-radius: 9999px;
          padding: 7px 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .space-sparkle-icon {
          color: #15803D;
        }

        .space-label {
          font-size: 0.74rem;
          font-weight: 700;
          color: #166534;
        }

        .space-value {
          font-size: 0.74rem;
          font-weight: 800;
          color: #0F172A;
          margin-left: auto;
        }

        /* ---------------- Stage 3: Move Forward Mini UI ---------------- */
        .ui-forward-card {
          gap: 8px;
        }

        .ui-forward-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-bottom: 8px;
          border-bottom: 1px solid #F1F5F9;
        }

        .ui-forward-title-group {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .forward-title-row {
          display: flex;
          align-items: center;
          justifyContent: space-between;
        }

        .forward-status-chip {
          font-size: 0.67rem;
          font-weight: 800;
          color: #15803D;
          background: #DCFCE7;
          padding: 2px 7px;
          border-radius: 9999px;
        }

        .forward-progress-track {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 4px;
          margin-block: 4px 6px;
        }

        .progress-seg {
          height: 4px;
          border-radius: 2px;
          background: #E2E8F0;
        }

        .progress-seg.is-active {
          background: #10B981;
        }

        .forward-checklist {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .checklist-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.78rem;
          font-weight: 600;
          color: #1E293B;
          padding: 5px 8px;
          border-radius: 8px;
          background: #F8FAFC;
          border: 1px solid #F1F5F9;
          transition: background 0.15s ease;
        }

        .checklist-item:hover {
          background: #F1F5F9;
        }

        .item-name {
          flex: 1;
          min-width: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .check-bullet {
          width: 17px;
          height: 17px;
          border-radius: 50%;
          background: #EEF2FF;
          color: #2B2FD9;
          display: flex;
          align-items: center;
          justifyContent: center;
          flex-shrink: 0;
        }

        .item-priority-pill {
          font-size: 0.64rem;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 4px;
          flex-shrink: 0;
        }

        .pill-p1 {
          background: #EEF2FF;
          color: #4338CA;
        }

        .pill-client {
          background: #F1F5F9;
          color: #475569;
        }

        .pill-protected {
          background: #DCFCE7;
          color: #166534;
        }

        .forward-reassurance-footer {
          margin-top: 4px;
          padding-top: 6px;
          border-top: 1px dashed #E2E8F0;
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.68rem;
          font-weight: 600;
          color: #64748B;
        }

        .footer-check-icon {
          color: #10B981;
          flex-shrink: 0;
        }

        /* Responsive Mobile Layout */
        @media (max-width: 959px) {
          .connector-path-container {
            display: none !important;
          }

          .organic-blob-backdrop {
            display: none !important;
          }

          .loop-annotation {
            position: relative;
            top: auto;
            right: auto;
            margin-bottom: 24px;
            align-self: flex-start;
          }

          .card-mobile-node {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
          }

          .mobile-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #D2F64C;
            box-shadow: 0 0 0 3px rgba(210, 246, 76, 0.4);
          }

          .loop-stage-card {
            background: #FFFFFF;
            border: 1px solid #E2E8F0;
          }
        }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          .animated-connector-line,
          .lime-node,
          .loop-stage-card {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
};

