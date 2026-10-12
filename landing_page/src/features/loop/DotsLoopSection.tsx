import React, { useState } from 'react';
import {
  ArrowRight,
  Mail,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Sparkles,
  BarChart2,
  Check,
  X,
} from 'lucide-react';
import { dotsAdapter } from '../../lib/api/client';
import { WaitlistStatus } from '../../domain/waitlist';

interface CompactFaqItem {
  id: string;
  q: string;
  a: string;
}

const COMPACT_FAQS: CompactFaqItem[] = [
  {
    id: 'loop-faq-1',
    q: 'What is Dots?',
    a: 'Dots is an AI personal execution platform that connects your goals, plans your week, and adapts when life changes. It protects your key commitments and makes sure your daily schedule reflects reality.',
  },
  {
    id: 'loop-faq-2',
    q: 'Do I approve changes?',
    a: 'Yes. You are always in control. Dots evaluates trade-offs, protects your fixed meetings, and proposes reasoned adjustments for your one-tap approval.',
  },
  {
    id: 'loop-faq-3',
    q: 'Can I change my plan?',
    a: 'Always. You can add tasks, lock specific commitments, or trigger manual adjustments anytime. Dots recalculates buffer space and keeps your week balanced.',
  },
];

export const DotsLoopSection: React.FC = () => {
  // Early access form state
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<WaitlistStatus>('idle');
  const [message, setMessage] = useState('');
  const [showInput, setShowInput] = useState(false);

  // Compact FAQ state
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('submitting');
    try {
      const result = await dotsAdapter.submitWaitlist(email.trim());
      setStatus(result.status);
      setMessage(result.message);
    } catch {
      setStatus('unavailable');
      setMessage('The early access endpoint is currently unavailable. Please check back soon.');
    }
  };

  return (
    <section id="the-dots-loop" className="dots-loop-section" aria-label="The Dots Loop">
      {/* Anchor targets to preserve existing navbar links */}
      <div id="early-access" style={{ position: 'relative', top: '-80px', height: 0, visibility: 'hidden' }} />
      <div id="faq" style={{ position: 'relative', top: '-80px', height: 0, visibility: 'hidden' }} />

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

          {/* 3 Horizontal Cards Group */}
          <ol className="loop-cards-grid">
            {/* STAGE 1 — Notice */}
            <li className="loop-stage-card card-notice">
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

              {/* Mini UI 1 */}
              <div className="mini-ui-card ui-notice-card">
                <div className="ui-notice-inner">
                  <div className="ui-icon-box ui-blue-icon">
                    <Mail size={16} strokeWidth={2.4} />
                  </div>
                  <div className="ui-text-column">
                    <span className="ui-primary-text">A client request came up</span>
                    <span className="ui-sub-text">10:24 AM · 2 hours needed</span>
                  </div>
                  <div className="ui-accent-slashes" aria-hidden="true">//</div>
                </div>
              </div>
            </li>

            {/* STAGE 2 — Rebalance */}
            <li className="loop-stage-card card-rebalance is-elevated">
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

              {/* Mini UI 2 */}
              <div className="mini-ui-card ui-rebalance-card">
                {/* Original scheduled block */}
                <div className="rebalance-item original-item">
                  <div className="rebalance-info">
                    <span className="rebalance-title">Deep work</span>
                    <span className="rebalance-time">10:00 – 12:00</span>
                  </div>
                </div>

                {/* Dotted curve transition arrow */}
                <div className="rebalance-transition-indicator" aria-hidden="true">
                  <svg width="24" height="28" viewBox="0 0 24 28" fill="none">
                    <path
                      d="M 6 2 C 18 2, 20 16, 12 24"
                      stroke="#2B2FD9"
                      strokeWidth="1.6"
                      strokeDasharray="3 3"
                      strokeLinecap="round"
                    />
                    <path d="M 9 22 L 12 25 L 15 22" stroke="#2B2FD9" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </div>

                {/* Adjusted flexible block with green check */}
                <div className="rebalance-item moved-item">
                  <div className="rebalance-info">
                    <span className="rebalance-title">Deep work</span>
                    <span className="rebalance-time text-adjusted">2:00 – 4:00</span>
                  </div>
                  <div className="rebalance-check-icon">
                    <Check size={14} strokeWidth={3} />
                  </div>
                </div>

                {/* Space made pill */}
                <div className="space-made-pill">
                  <Sparkles size={13} className="space-sparkle-icon" />
                  <span className="space-label">Space made</span>
                  <span className="space-value">+ 2 hours</span>
                </div>
              </div>
            </li>

            {/* STAGE 3 — Move forward */}
            <li className="loop-stage-card card-forward">
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

              {/* Mini UI 3 */}
              <div className="mini-ui-card ui-forward-card">
                <div className="ui-forward-header">
                  <div className="ui-icon-box ui-blue-icon">
                    <BarChart2 size={16} strokeWidth={2.4} />
                  </div>
                  <div className="ui-forward-title-group">
                    <span className="ui-primary-text">Your week still works</span>
                    <span className="ui-sub-text">3 priorities protected</span>
                  </div>
                </div>

                <ul className="forward-checklist" aria-label="Protected priorities">
                  <li className="checklist-item">
                    <span className="check-bullet"><Check size={12} strokeWidth={2.8} /></span>
                    <span>Launch product update</span>
                  </li>
                  <li className="checklist-item">
                    <span className="check-bullet"><Check size={12} strokeWidth={2.8} /></span>
                    <span>Client call</span>
                  </li>
                  <li className="checklist-item">
                    <span className="check-bullet"><Check size={12} strokeWidth={2.8} /></span>
                    <span>Plan team offsite</span>
                  </li>
                </ul>
              </div>
            </li>
          </ol>
        </div>

        {/* 3. Bottom Row: CTA + Compact FAQ */}
        <div className="loop-bottom-row">
          {/* Subtle horizontal separator line with acid lime node */}
          <div className="bottom-separator-line" aria-hidden="true">
            <span className="separator-dot" />
            <div className="separator-hairline" />
          </div>

          <div className="bottom-columns-layout">
            {/* Left Column: CTA */}
            <div className="loop-cta-block">
              <h3 className="cta-headline">
                Make room for a week that can breathe.
              </h3>

              {!showInput ? (
                <div className="cta-action-row">
                  <button
                    type="button"
                    onClick={() => setShowInput(true)}
                    className="cta-lime-btn"
                  >
                    <span>Get early access</span>
                    <ArrowRight size={16} strokeWidth={2.4} />
                  </button>

                  <div className="cta-reassurance">
                    <span className="reassurance-divider" aria-hidden="true" />
                    <span>No spam. Just progress.</span>
                  </div>
                </div>
              ) : (
                /* Interactive Real Waitlist Form */
                <form onSubmit={handleWaitlistSubmit} className="cta-inline-form" noValidate>
                  <div className="form-input-pill">
                    <Mail size={16} className="form-mail-icon" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status !== 'idle') setStatus('idle');
                      }}
                      placeholder="Enter your email"
                      className="form-email-field"
                      autoFocus
                      disabled={status === 'submitting'}
                    />
                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      className="form-submit-btn"
                    >
                      <span>{status === 'submitting' ? 'Joining...' : 'Join'}</span>
                      <ArrowRight size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowInput(false)}
                      className="form-cancel-btn"
                      aria-label="Close email input"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {status !== 'idle' && (
                    <div className={`form-feedback-msg ${status === 'success' ? 'is-success' : 'is-error'}`}>
                      {status === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                      <span>{message}</span>
                    </div>
                  )}

                  <div className="cta-reassurance" style={{ marginTop: '6px' }}>
                    <span>No spam. Just progress.</span>
                  </div>
                </form>
              )}
            </div>

            {/* Vertical Divider */}
            <div className="columns-vertical-divider" aria-hidden="true" />

            {/* Right Column: Compact FAQ */}
            <div className="loop-compact-faq-block">
              <h4 className="compact-faq-heading">A few clear answers</h4>

              <div className="compact-faq-list">
                {COMPACT_FAQS.map((item) => {
                  const isOpen = openFaqId === item.id;
                  return (
                    <div key={item.id} className={`compact-faq-row ${isOpen ? 'is-expanded' : ''}`}>
                      <button
                        type="button"
                        onClick={() => toggleFaq(item.id)}
                        className="compact-faq-trigger"
                        aria-expanded={isOpen}
                        aria-controls={`${item.id}-desc`}
                      >
                        <span className="faq-question-text">{item.q}</span>
                        <ChevronDown
                          size={18}
                          className={`faq-chevron-icon ${isOpen ? 'is-rotated' : ''}`}
                        />
                      </button>

                      {isOpen && (
                        <div id={`${item.id}-desc`} className="compact-faq-answer">
                          <p>{item.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&display=swap');

        .dots-loop-section {
          padding-block: clamp(72px, 8vw, 112px);
          background: #F8F9FE;
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
          margin-bottom: clamp(32px, 5vw, 54px);
        }

        .loop-kicker {
          display: block;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #6366F1;
          margin-bottom: 12px;
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
          border: 1px solid rgba(226, 232, 240, 0.9);
          box-shadow: 0 8px 24px -6px rgba(15, 23, 42, 0.06);
          padding: 16px;
        }

        /* Notice Mini UI */
        .ui-notice-card {
          padding: 18px 16px;
        }

        .ui-notice-inner {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
        }

        .ui-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justifyContent: center;
          flex-shrink: 0;
        }

        .ui-blue-icon {
          background: #EEF2FF;
          color: #2B2FD9;
        }

        .ui-text-column {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .ui-primary-text {
          font-size: 0.86rem;
          font-weight: 700;
          color: #0F172A;
        }

        .ui-sub-text {
          font-size: 0.74rem;
          color: #64748B;
        }

        .ui-accent-slashes {
          position: absolute;
          top: -8px;
          right: -2px;
          color: #D2F64C;
          font-size: 1.05rem;
          font-weight: 900;
          letter-spacing: -0.08em;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
        }

        /* Rebalance Mini UI */
        .ui-rebalance-card {
          padding: 14px 16px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .rebalance-item {
          padding: 10px 14px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justifyContent: space-between;
        }

        .original-item {
          background: #F1F5F9;
          border-left: 3px solid #94A3B8;
        }

        .moved-item {
          background: rgba(210, 246, 76, 0.18);
          border-left: 3px solid #84CC16;
          border: 1px solid rgba(132, 204, 22, 0.25);
          border-left-width: 3px;
        }

        .rebalance-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
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

        .text-adjusted {
          color: #15803D;
          font-weight: 600;
        }

        .rebalance-transition-indicator {
          display: flex;
          justify-content: flex-end;
          padding-right: 18px;
          margin-block: -4px;
        }

        .rebalance-check-icon {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #22C55E;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justifyContent: center;
        }

        .space-made-pill {
          margin-top: 4px;
          background: rgba(210, 246, 76, 0.22);
          border: 1px solid rgba(132, 204, 22, 0.25);
          border-radius: 9999px;
          padding: 6px 14px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .space-sparkle-icon {
          color: #15803D;
        }

        .space-label {
          font-size: 0.74rem;
          font-weight: 600;
          color: #15803D;
        }

        .space-value {
          font-size: 0.74rem;
          font-weight: 800;
          color: #0F172A;
          margin-left: auto;
        }

        /* Move Forward Mini UI */
        .ui-forward-card {
          padding: 16px;
        }

        .ui-forward-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          margin-bottom: 12px;
        }

        .ui-forward-title-group {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .forward-checklist {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .checklist-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #1E293B;
        }

        .check-bullet {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #EEF2FF;
          color: #2B2FD9;
          display: flex;
          align-items: center;
          justifyContent: center;
          flex-shrink: 0;
        }

        /* 3. Bottom Row: CTA + Compact FAQ */
        .loop-bottom-row {
          position: relative;
        }

        .bottom-separator-line {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 36px;
        }

        .separator-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #D2F64C;
          box-shadow: 0 0 0 3px rgba(210, 246, 76, 0.35);
          flex-shrink: 0;
        }

        .separator-hairline {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(203, 213, 225, 0.8) 0%, rgba(203, 213, 225, 0.2) 100%);
        }

        .bottom-columns-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 36px;
          align-items: start;
        }

        @media (min-width: 960px) {
          .bottom-columns-layout {
            grid-template-columns: 1.1fr auto 1fr;
            gap: 40px;
            align-items: center;
          }
        }

        /* Left CTA Column */
        .loop-cta-block {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .cta-headline {
          font-size: clamp(1.4rem, 2.2vw, 1.85rem);
          font-weight: 800;
          line-height: 1.2;
          letter-spacing: -0.03em;
          color: #0F172A;
          margin: 0;
          max-width: 380px;
        }

        .cta-action-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 18px;
        }

        .cta-lime-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #D2F64C;
          color: #0F172A;
          font-size: 0.94rem;
          font-weight: 800;
          padding: 13px 26px;
          border-radius: 9999px;
          border: none;
          cursor: pointer;
          box-shadow: 0 6px 20px -4px rgba(163, 230, 53, 0.55);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .cta-lime-btn:hover {
          background: #C4EE38;
          transform: translateY(-2px);
          box-shadow: 0 10px 26px -4px rgba(163, 230, 53, 0.7);
        }

        .cta-lime-btn:active {
          transform: translateY(0);
        }

        .cta-reassurance {
          display: flex;
          align-items: center;
          gap: 14px;
          font-size: 0.82rem;
          color: #64748B;
          font-weight: 500;
        }

        .reassurance-divider {
          width: 1px;
          height: 18px;
          background: #CBD5E1;
        }

        /* Interactive Inline Form */
        .cta-inline-form {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-width: 480px;
        }

        .form-input-pill {
          display: flex;
          align-items: center;
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          border-radius: 9999px;
          padding: 5px 6px 5px 16px;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
          transition: border-color 0.15s ease;
        }

        .form-input-pill:focus-within {
          border-color: #2B2FD9;
          box-shadow: 0 0 0 3px rgba(43, 47, 217, 0.15);
        }

        .form-mail-icon {
          color: #94A3B8;
          flex-shrink: 0;
          margin-right: 8px;
        }

        .form-email-field {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 0.9rem;
          color: #0F172A;
          outline: none;
        }

        .form-submit-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #D2F64C;
          color: #0F172A;
          font-size: 0.84rem;
          font-weight: 800;
          padding: 9px 18px;
          border-radius: 9999px;
          border: none;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .form-submit-btn:hover:not(:disabled) {
          background: #C4EE38;
        }

        .form-cancel-btn {
          background: transparent;
          border: none;
          color: #94A3B8;
          padding: 6px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justifyContent: center;
          margin-left: 2px;
        }

        .form-cancel-btn:hover {
          color: #0F172A;
          background: #F1F5F9;
        }

        .form-feedback-msg {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          padding-left: 12px;
        }

        .form-feedback-msg.is-success {
          color: #15803D;
        }

        .form-feedback-msg.is-error {
          color: #DC2626;
        }

        /* Vertical Divider */
        .columns-vertical-divider {
          display: none;
          width: 1px;
          height: 110px;
          background: rgba(203, 213, 225, 0.6);
        }

        @media (min-width: 960px) {
          .columns-vertical-divider {
            display: block;
          }
        }

        /* Right Column: Compact FAQ */
        .loop-compact-faq-block {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .compact-faq-heading {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.02em;
          margin: 0 0 6px;
        }

        .compact-faq-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .compact-faq-row {
          border-bottom: 1px solid rgba(226, 232, 240, 0.9);
          transition: background 0.15s ease;
        }

        .compact-faq-row.is-expanded {
          background: rgba(255, 255, 255, 0.7);
          border-radius: 12px;
          padding-inline: 8px;
          border-bottom-color: transparent;
        }

        .compact-faq-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justifyContent: space-between;
          padding: 11px 4px;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          color: #1E293B;
          font-size: 0.92rem;
          font-weight: 600;
          transition: color 0.15s ease;
        }

        .compact-faq-trigger:hover {
          color: #2B2FD9;
        }

        .faq-chevron-icon {
          color: #64748B;
          transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), color 0.15s ease;
          flex-shrink: 0;
          margin-left: 12px;
        }

        .faq-chevron-icon.is-rotated {
          transform: rotate(180deg);
          color: #2B2FD9;
        }

        .compact-faq-answer {
          padding: 0 4px 14px;
          font-size: 0.86rem;
          line-height: 1.55;
          color: #475569;
          animation: faqFade 0.2s ease-out;
        }

        @keyframes faqFade {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .compact-faq-answer p {
          margin: 0;
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
          .loop-stage-card,
          .compact-faq-answer {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
};
