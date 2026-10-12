import React, { useState } from 'react';
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  Lock,
  Check,
  X,
  Shield,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { DotsLogo } from '../components/brand/DotsLogo';
import { GoogleIcon } from '../components/brand/GoogleIcon';

interface SignInPageProps {
  onBackToHome?: () => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onBackToHome }) => {
  const [email, setEmail] = useState('');
  const [dayView, setDayView] = useState<'dots' | 'fragmented'>('dots');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setAuthError('Please enter a valid email address');
      return;
    }
    setAuthError(null);
    setIsLoading(true);

    // Simulate instant secure magic link generation
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 750);
  };

  const handleGoogleSignIn = () => {
    // In production, trigger Google OAuth flow; for preview, simulate smooth feedback
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      window.location.hash = '#early-access';
    }, 500);
  };

  const handleBack = () => {
    if (onBackToHome) {
      onBackToHome();
    } else {
      window.location.hash = '';
    }
  };

  return (
    <div className="signin-page-wrapper">
      {/* Specular Ambient Background Lights */}
      <div className="signin-ambient-glow" aria-hidden="true">
        <div className="signin-orb orb-top" />
        <div className="signin-orb orb-bottom" />
        <div className="signin-orb orb-lime" />
      </div>

      <div className="signin-container">
        {/* Top Back Navigation Bar */}
        <header className="signin-topbar">
          <button
            type="button"
            onClick={handleBack}
            className="signin-back-btn"
            aria-label="Back to home"
          >
            <ArrowLeft size={16} strokeWidth={2.4} />
            <span>Back to home</span>
          </button>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleBack();
            }}
            className="signin-brand-link"
          >
            <DotsLogo size={28} />
          </a>
        </header>

        {/* Main Dual-Column Hero Card */}
        <div className="signin-glass-card">
          {/* Specular Edge Top Line */}
          <div className="specular-line" aria-hidden="true" />

          {/* Left Column: Creative Visual Architecture & Day Comparator */}
          <div className="signin-showcase-panel">
            <div className="showcase-top-meta">
              <span className="showcase-kicker">The Execution Paradigm</span>
              <h2 className="showcase-title">
                Reclaim your day from <span className="highlight-text">the noise.</span>
              </h2>
              <p className="showcase-desc">
                Conventional calendars fracture your attention into 15-minute panic blocks.
                Dots clusters your obligations and defends unbroken horizons of deep craft.
              </p>
            </div>

            {/* Creative Interactive Day Reality Comparator */}
            <div className="day-comparator-card">
              <div className="comparator-tabs-bar" role="tablist" aria-label="Schedule comparison">
                <button
                  type="button"
                  onClick={() => setDayView('dots')}
                  className={`comparator-tab ${dayView === 'dots' ? 'is-active is-dots-tab' : ''}`}
                  role="tab"
                  aria-selected={dayView === 'dots'}
                >
                  <span className="tab-indicator-bar" />
                  <span>The Dots Horizon</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDayView('fragmented')}
                  className={`comparator-tab ${dayView === 'fragmented' ? 'is-active is-frag-tab' : ''}`}
                  role="tab"
                  aria-selected={dayView === 'fragmented'}
                >
                  <span>Fragmented Day</span>
                </button>
              </div>

              {dayView === 'dots' ? (
                <div className="schedule-stream stream-dots">
                  <div className="stream-stat-header">
                    <span className="stream-metric">6.0 hrs deep craft</span>
                    <span className="stream-badge">1 context switch</span>
                  </div>

                  <div className="stream-block block-focus-1">
                    <div className="block-time">09:00 — 12:30</div>
                    <div className="block-content">
                      <div className="block-title">Core Architecture & Flow</div>
                      <span className="block-tag-pill">Protected Horizon</span>
                    </div>
                  </div>

                  <div className="stream-block block-sync">
                    <div className="block-time">13:30 — 14:15</div>
                    <div className="block-content">
                      <div className="block-title">Consolidated Team Sync</div>
                      <span className="block-tag-pill muted-pill">Clustered Window</span>
                    </div>
                  </div>

                  <div className="stream-block block-focus-2">
                    <div className="block-time">14:30 — 17:00</div>
                    <div className="block-content">
                      <div className="block-title">System Build & Review</div>
                      <span className="block-tag-pill">Protected Horizon</span>
                    </div>
                  </div>

                  <div className="stream-footer-callout callout-serene">
                    <Check size={14} strokeWidth={2.8} />
                    <span>Evening preserved · Main priorities completed early</span>
                  </div>
                </div>
              ) : (
                <div className="schedule-stream stream-fragmented">
                  <div className="stream-stat-header">
                    <span className="stream-metric text-danger">35 min max focus</span>
                    <span className="stream-badge badge-danger">7 context switches</span>
                  </div>

                  <div className="stream-block block-frag">
                    <div className="block-time">09:30 — 10:00</div>
                    <div className="block-title">Ad-hoc Status Sync</div>
                  </div>

                  <div className="stream-block block-frag">
                    <div className="block-time">10:30 — 11:15</div>
                    <div className="block-title">Urgent Alignment Call</div>
                  </div>

                  <div className="stream-block block-frag">
                    <div className="block-time">11:45 — 12:15</div>
                    <div className="block-title">Touchpoint Catchup</div>
                  </div>

                  <div className="stream-block block-frag">
                    <div className="block-time">14:00 — 14:45</div>
                    <div className="block-title">Cross-Team Review</div>
                  </div>

                  <div className="stream-footer-callout callout-warning">
                    <X size={14} strokeWidth={2.8} />
                    <span>0 deep work completed · High mental exhaustion</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Testimonial Quote & Security */}
            <div className="showcase-bottom-area">
              <blockquote className="showcase-quote">
                “The first calendar tool in 10 years that actually helped me think,
                instead of just inviting more people to book my time.”
              </blockquote>
              <div className="quote-author">
                <span className="author-name">Marcus Sterling</span>
                <span className="author-separator">·</span>
                <span className="author-title">Principal Systems Architect</span>
              </div>

              <div className="showcase-security-tag">
                <Shield size={13} color="#2B2FD9" />
                <span>Zero calendar lock-in · End-to-end encrypted</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-End Auth Form */}
          <div className="signin-form-panel">
            {!isSubmitted ? (
              <>
                <div className="form-heading-group">
                  <div className="form-brand-mark">
                    <DotsLogo size={34} showWordmark={false} />
                  </div>
                  <h1 className="form-title">Welcome to Dots</h1>
                  <p className="form-subtitle">Sign in to keep your plan and calendar in sync.</p>
                </div>

                {/* 1-Tap Google Sign In Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="google-auth-btn"
                  aria-label="Continue with Google"
                >
                  <GoogleIcon size={20} />
                  <span>Continue with Google</span>
                </button>

                {/* Elegant Divider */}
                <div className="auth-divider" aria-hidden="true">
                  <div className="divider-hairline" />
                  <span className="divider-label">or sign in with email</span>
                  <div className="divider-hairline" />
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailSubmit} className="email-auth-form" noValidate>
                  <div className="input-field-group">
                    <label htmlFor="signin-email" className="input-label">
                      Work or Personal Email
                    </label>
                    <div className="input-wrapper">
                      <Mail size={17} className="input-leading-icon" />
                      <input
                        id="signin-email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (authError) setAuthError(null);
                        }}
                        placeholder="you@domain.com"
                        className={`email-input ${authError ? 'is-error' : ''}`}
                        autoComplete="email"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    {authError && <p className="input-error-msg">{authError}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email.trim()}
                    className="email-submit-btn"
                  >
                    {isLoading ? (
                      <span className="btn-loading-state">
                        <RefreshCw size={16} className="spin-icon" />
                        <span>Sending magic link...</span>
                      </span>
                    ) : (
                      <>
                        <span>Continue with Email</span>
                        <ArrowRight size={16} strokeWidth={2.4} />
                      </>
                    )}
                  </button>
                </form>

                {/* Early Access Alternative */}
                <div className="form-footer-meta">
                  <p className="footer-switch-text">
                    Don’t have an account yet?{' '}
                    <a
                      href="#early-access"
                      onClick={() => {
                        window.location.hash = '#early-access';
                      }}
                      className="early-access-link"
                    >
                      Get early access
                    </a>
                  </p>

                  <div className="security-guarantee">
                    <Lock size={13} color="#6B7280" />
                    <span>No passwords required. We’ll email you a secure 1-tap link.</span>
                  </div>
                </div>
              </>
            ) : (
              /* Success / Magic Link Sent State */
              <div className="magic-link-sent-view">
                <div className="sent-icon-container">
                  <div className="sent-pulse-ring" />
                  <Mail size={32} color="#2B2FD9" strokeWidth={2.2} />
                </div>

                <h3 className="sent-title">Check your inbox</h3>
                <p className="sent-desc">
                  We sent a magic sign-in link to:
                  <br />
                  <strong className="sent-email-highlight">{email}</strong>
                </p>

                <p className="sent-instructions">
                  Click the link in your email to sign in instantly. The link expires in 15 minutes.
                </p>

                <div className="sent-action-buttons">
                  <a
                    href="https://mail.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="open-gmail-btn"
                  >
                    <span>Open Gmail</span>
                    <ExternalLink size={15} />
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="resend-link-btn"
                  >
                    <span>Use a different email address</span>
                  </button>
                </div>

                <div className="security-guarantee" style={{ marginTop: '28px' }}>
                  <Lock size={13} color="#6B7280" />
                  <span>Didn’t get it? Check your spam folder or resend.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .signin-page-wrapper {
          min-height: 100vh;
          background: #F8F9FE;
          color: #111827;
          position: relative;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justifyContent: center;
          padding: clamp(24px, 4vw, 48px) 16px;
        }

        .signin-ambient-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }

        .signin-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.6;
        }

        .orb-top {
          width: 580px;
          height: 580px;
          top: -160px;
          right: 15%;
          background: radial-gradient(circle, rgba(43, 47, 217, 0.22) 0%, rgba(43, 47, 217, 0) 70%);
        }

        .orb-bottom {
          width: 520px;
          height: 520px;
          bottom: -120px;
          left: 10%;
          background: radial-gradient(circle, rgba(67, 70, 226, 0.2) 0%, rgba(67, 70, 226, 0) 70%);
        }

        .orb-lime {
          width: 440px;
          height: 440px;
          top: 35%;
          left: 45%;
          background: radial-gradient(circle, rgba(210, 246, 76, 0.24) 0%, rgba(210, 246, 76, 0) 70%);
        }

        .signin-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 980px;
          margin-inline: auto;
        }

        .signin-topbar {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          margin-bottom: 24px;
          padding-inline: 8px;
        }

        .signin-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(230, 235, 250, 0.9);
          padding: 8px 16px;
          border-radius: 9999px;
          font-size: 0.84rem;
          font-weight: 600;
          color: #4B5563;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
        }

        .signin-back-btn:hover {
          color: #111827;
          background: #FFFFFF;
          transform: translateX(-2px);
          box-shadow: 0 4px 14px rgba(43, 47, 217, 0.1);
        }

        .signin-brand-link {
          text-decoration: none;
          display: flex;
          align-items: center;
        }

        /* Glass Card Container */
        .signin-glass-card {
          position: relative;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(36px) saturate(180%);
          -webkit-backdrop-filter: blur(36px) saturate(180%);
          border-radius: 32px;
          border: 1px solid rgba(255, 255, 255, 0.95);
          box-shadow:
            0 32px 72px -16px rgba(28, 32, 115, 0.16),
            0 8px 24px -4px rgba(0, 0, 0, 0.04),
            inset 0 1.5px 2px rgba(255, 255, 255, 1);
          display: grid;
          grid-template-columns: 1fr;
          overflow: hidden;
        }

        @media (min-width: 860px) {
          .signin-glass-card {
            grid-template-columns: 1.05fr 1fr;
          }
        }

        .specular-line {
          position: absolute;
          top: 0;
          left: 36px;
          right: 36px;
          height: 1px;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 100%);
          pointer-events: none;
        }

        /* Left Showcase Panel */
        .signin-showcase-panel {
          padding: clamp(32px, 5vw, 56px) clamp(28px, 4vw, 44px);
          background: linear-gradient(180deg, rgba(246, 248, 255, 0.8) 0%, rgba(241, 244, 254, 0.6) 100%);
          border-bottom: 1px solid rgba(230, 235, 250, 0.8);
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
        }

        @media (min-width: 860px) {
          .signin-showcase-panel {
            border-bottom: none;
            border-right: 1px solid rgba(230, 235, 250, 0.8);
          }
        }

        .showcase-top-meta {
          margin-bottom: 22px;
        }

        .showcase-kicker {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: #2B2FD9;
          margin-bottom: 10px;
        }

        .showcase-title {
          font-size: clamp(1.6rem, 2.8vw, 2.1rem);
          font-weight: 800;
          line-height: 1.18;
          letter-spacing: -0.03em;
          color: #111827;
          margin-bottom: 12px;
        }

        .highlight-text {
          color: #2B2FD9;
        }

        .showcase-desc {
          font-size: 0.90rem;
          line-height: 1.55;
          color: #52526B;
          margin: 0;
        }

        /* Day Reality Comparator Card */
        .day-comparator-card {
          background: #FFFFFF;
          border-radius: 24px;
          padding: 18px 20px 20px;
          border: 1px solid rgba(230, 235, 250, 0.95);
          box-shadow: 0 14px 34px -10px rgba(43, 47, 217, 0.09);
          margin-bottom: 24px;
        }

        .comparator-tabs-bar {
          display: flex;
          background: #F3F4F6;
          padding: 4px;
          border-radius: 9999px;
          margin-bottom: 16px;
          gap: 4px;
        }

        .comparator-tab {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justifyContent: center;
          gap: 6px;
          padding: 7px 12px;
          border-radius: 9999px;
          border: none;
          background: transparent;
          font-size: 0.78rem;
          font-weight: 600;
          color: #6B7280;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .comparator-tab.is-active {
          background: #FFFFFF;
          color: #111827;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .comparator-tab.is-dots-tab.is-active {
          color: #2B2FD9;
          font-weight: 700;
        }

        .tab-indicator-bar {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #D2F64C;
        }

        .schedule-stream {
          display: flex;
          flex-direction: column;
          gap: 8px;
          animation: streamFade 0.2s ease-out;
        }

        @keyframes streamFade {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .stream-stat-header {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          padding-inline: 4px;
          margin-bottom: 4px;
        }

        .stream-metric {
          font-size: 0.8rem;
          font-weight: 700;
          color: #111827;
        }

        .stream-metric.text-danger {
          color: #DC2626;
        }

        .stream-badge {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 9999px;
          background: rgba(43, 47, 217, 0.08);
          color: #2B2FD9;
        }

        .stream-badge.badge-danger {
          background: rgba(239, 68, 68, 0.1);
          color: #DC2626;
        }

        .stream-block {
          padding: 9px 12px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justifyContent: space-between;
          gap: 10px;
          transition: transform 0.15s ease;
        }

        .block-focus-1,
        .block-focus-2 {
          background: linear-gradient(90deg, rgba(43, 47, 217, 0.06) 0%, rgba(210, 246, 76, 0.06) 100%);
          border-left: 3px solid #2B2FD9;
        }

        .block-sync {
          background: #F9FAFB;
          border-left: 3px solid #9CA3AF;
        }

        .block-frag {
          background: rgba(239, 68, 68, 0.04);
          border-left: 3px solid #EF4444;
        }

        .block-time {
          font-size: 0.72rem;
          font-weight: 700;
          color: #6B7280;
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
        }

        .block-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .block-title {
          font-size: 0.78rem;
          font-weight: 700;
          color: #111827;
        }

        .block-tag-pill {
          font-size: 0.68rem;
          font-weight: 700;
          color: #2B2FD9;
          background: rgba(255, 255, 255, 0.85);
          padding: 2px 7px;
          border-radius: 9999px;
          border: 1px solid rgba(43, 47, 217, 0.15);
        }

        .block-tag-pill.muted-pill {
          color: #6B7280;
          border-color: rgba(0, 0, 0, 0.08);
        }

        .stream-footer-callout {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 0.74rem;
          font-weight: 600;
          margin-top: 4px;
        }

        .callout-serene {
          background: rgba(16, 185, 129, 0.08);
          color: #065F46;
        }

        .callout-warning {
          background: rgba(239, 68, 68, 0.08);
          color: #991B1B;
        }

        /* Showcase Bottom Testimonial & Security */
        .showcase-bottom-area {
          border-top: 1px solid rgba(0, 0, 0, 0.06);
          padding-top: 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .showcase-quote {
          margin: 0;
          font-size: 0.84rem;
          line-height: 1.48;
          color: #4B5563;
          font-style: italic;
        }

        .quote-author {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.74rem;
        }

        .author-name {
          font-weight: 700;
          color: #111827;
        }

        .author-separator {
          color: #9CA3AF;
        }

        .author-title {
          color: #6B7280;
        }

        .showcase-security-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.74rem;
          color: #6B7280;
          font-weight: 500;
          margin-top: 2px;
        }

        /* Right Form Panel */
        .signin-form-panel {
          padding: clamp(32px, 5vw, 56px) clamp(28px, 4vw, 44px);
          display: flex;
          flex-direction: column;
          justifyContent: center;
        }

        .form-heading-group {
          text-align: center;
          margin-bottom: 26px;
        }

        .form-brand-mark {
          display: flex;
          justify-content: center;
          margin-bottom: 14px;
        }

        .form-title {
          font-size: clamp(1.5rem, 2.5vw, 1.85rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #111827;
          margin-bottom: 6px;
        }

        .form-subtitle {
          font-size: 0.88rem;
          color: #6B7280;
          line-height: 1.45;
        }

        /* Google Auth Button */
        .google-auth-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justifyContent: center;
          gap: 12px;
          background: #FFFFFF;
          color: #1F2937;
          padding: 13px 20px;
          border-radius: 9999px;
          font-size: 0.93rem;
          font-weight: 600;
          border: 1px solid #E5E7EB;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .google-auth-btn:hover:not(:disabled) {
          background: #F9FAFB;
          border-color: #D1D5DB;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
        }

        .google-auth-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        /* Divider */
        .auth-divider {
          display: flex;
          align-items: center;
          margin: 20px 0;
          color: #9CA3AF;
          font-size: 0.74rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .divider-hairline {
          flex: 1;
          height: 1px;
          background: rgba(0, 0, 0, 0.08);
        }

        .divider-label {
          padding-inline: 12px;
        }

        /* Email Form */
        .email-auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }

        .input-field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: #374151;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-leading-icon {
          position: absolute;
          left: 16px;
          color: #9CA3AF;
          pointer-events: none;
        }

        .email-input {
          width: 100%;
          padding: 12px 16px 12px 44px;
          border-radius: 9999px;
          background: #FFFFFF;
          border: 1px solid #D1D5DB;
          font-size: 0.92rem;
          color: #111827;
          outline: none;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .email-input:focus {
          border-color: #2B2FD9;
          box-shadow: 0 0 0 3px rgba(43, 47, 217, 0.16);
        }

        .email-input.is-error {
          border-color: #EF4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
        }

        .input-error-msg {
          font-size: 0.76rem;
          color: #EF4444;
          font-weight: 600;
          margin-top: 2px;
          padding-left: 12px;
        }

        .email-submit-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justifyContent: center;
          gap: 8px;
          background: #2B2FD9;
          color: #FFFFFF;
          padding: 13px 22px;
          border-radius: 9999px;
          font-size: 0.93rem;
          font-weight: 700;
          border: none;
          box-shadow: 0 8px 24px -6px rgba(43, 47, 217, 0.45);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .email-submit-btn:hover:not(:disabled) {
          background: #2024BC;
          transform: translateY(-1px);
          box-shadow: 0 12px 28px -6px rgba(43, 47, 217, 0.6);
        }

        .email-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .email-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
        }

        .btn-loading-state {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .spin-icon {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Footer Meta */
        .form-footer-meta {
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .footer-switch-text {
          font-size: 0.85rem;
          color: #6B7280;
        }

        .early-access-link {
          color: #2B2FD9;
          font-weight: 700;
          text-decoration: none;
          transition: opacity 0.15s ease;
        }

        .early-access-link:hover {
          text-decoration: underline;
        }

        .security-guarantee {
          display: flex;
          align-items: center;
          justifyContent: center;
          gap: 6px;
          color: #6B7280;
          font-size: 0.77rem;
          font-weight: 500;
          line-height: 1.4;
        }

        /* Magic Link Sent View */
        .magic-link-sent-view {
          text-align: center;
          padding: 10px 0;
          animation: fadeInCard 0.25s ease-out forwards;
        }

        @keyframes fadeInCard {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .sent-icon-container {
          position: relative;
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(43, 47, 217, 0.08);
          display: flex;
          align-items: center;
          justifyContent: center;
          margin-inline: auto;
          margin-bottom: 20px;
        }

        .sent-pulse-ring {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid rgba(43, 47, 217, 0.2);
          animation: pulseRing 2.4s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }

        @keyframes pulseRing {
          0% { transform: scale(0.9); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 0.3; }
          100% { transform: scale(0.9); opacity: 0.8; }
        }

        .sent-title {
          font-size: 1.6rem;
          font-weight: 800;
          color: #111827;
          margin-bottom: 8px;
          letter-spacing: -0.03em;
        }

        .sent-desc {
          font-size: 0.94rem;
          color: #4B5563;
          line-height: 1.5;
          margin-bottom: 14px;
        }

        .sent-email-highlight {
          color: #2B2FD9;
          font-weight: 700;
        }

        .sent-instructions {
          font-size: 0.84rem;
          color: #6B7280;
          line-height: 1.45;
          margin-bottom: 24px;
        }

        .sent-action-buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .open-gmail-btn {
          display: inline-flex;
          align-items: center;
          justifyContent: center;
          gap: 8px;
          background: #2B2FD9;
          color: #FFFFFF;
          padding: 12px 22px;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 0.92rem;
          text-decoration: none;
          box-shadow: 0 8px 20px -6px rgba(43, 47, 217, 0.45);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .open-gmail-btn:hover {
          background: #2024BC;
          transform: translateY(-1px);
        }

        .resend-link-btn {
          background: transparent;
          border: none;
          color: #2B2FD9;
          font-weight: 600;
          font-size: 0.86rem;
          padding: 8px;
          cursor: pointer;
          transition: opacity 0.15s ease;
        }

        .resend-link-btn:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};
