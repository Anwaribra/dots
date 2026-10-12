import React, { useState } from 'react';
import {
  ArrowRight,
  Mail,
  CheckCircle2,
  AlertCircle,
  Globe,
  Github,
  Twitter,
  Linkedin,
} from 'lucide-react';
import { DotsLogo } from '../brand/DotsLogo';
import { TelegramIcon } from '../brand/TelegramIcon';
import { dotsAdapter } from '../../lib/api/client';
import { WaitlistStatus } from '../../domain/waitlist';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<WaitlistStatus>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('submitting');
    try {
      const res = await dotsAdapter.submitWaitlist(email.trim());
      setStatus(res.status);
      setMessage(res.message);
    } catch {
      setStatus('unavailable');
      setMessage('Subscription endpoint temporarily unavailable.');
    }
  };

  return (
    <div className="footer-outer-shell">
      <footer className="footer-rounded-card" aria-label="Site Footer">
        {/* Soft Ambient Brand Glow Orbs (Cobalt Blue + Electric Lime mix) */}
        <div className="footer-ambient-glow" aria-hidden="true">
          <div className="footer-orb orb-cobalt" />
          <div className="footer-orb orb-lime" />
        </div>

        <div className="footer-inner-content">
          {/* 1. Top Newsletter & Vision Capsule */}
          <div className="footer-top-banner">
            <div className="banner-text-column">
              <div className="banner-kicker">
                <span className="banner-kicker-dot" />
                <span>EXECUTION ENGINE · POWERED BY DOTS</span>
              </div>
              <h3 className="banner-headline">
                Make room for a week that can <span className="highlight-blue">breathe.</span>
              </h3>
              <p className="banner-subtext">
                Join founders, builders, and operators using Dots to protect high-leverage work without burning out.
              </p>
            </div>

            <div className="banner-action-column">
              <form onSubmit={handleSubscribe} className="footer-newsletter-form" noValidate>
                <div className="newsletter-pill-input">
                  <Mail size={16} className="newsletter-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status !== 'idle') setStatus('idle');
                    }}
                    placeholder="Enter your email"
                    className="newsletter-field"
                    disabled={status === 'submitting'}
                  />
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="newsletter-btn"
                  >
                    <span>{status === 'submitting' ? 'Joining...' : 'Get early access'}</span>
                    <ArrowRight size={14} strokeWidth={2.5} />
                  </button>
                </div>

                {status !== 'idle' && (
                  <div className={`newsletter-feedback ${status === 'success' ? 'is-success' : 'is-error'}`}>
                    {status === 'success' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                    <span>{message}</span>
                  </div>
                )}
                <span className="newsletter-reassurance">No spam. Only product drops & tactical planning insights.</span>
              </form>
            </div>
          </div>

          {/* 2. Main Multi-Column Directory */}
          <div className="footer-nav-grid">
            {/* Brand Information Column with Authentic Logo Colors */}
            <div className="footer-col col-brand">
              <a href="#hero" className="footer-brand-link" aria-label="Dots Home">
                <DotsLogo size={32} theme="light" />
              </a>

              <p className="footer-brand-mission">
                The AI personal execution platform that connects your goals, plans your week, and adapts when real life changes.
              </p>

              {/* Social Channels */}
              <div className="footer-social-row">
                <a
                  href="https://t.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-btn"
                  aria-label="Telegram"
                >
                  <TelegramIcon size={16} />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-btn"
                  aria-label="Twitter / X"
                >
                  <Twitter size={15} />
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-btn"
                  aria-label="GitHub"
                >
                  <Github size={15} />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-btn"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={15} />
                </a>
              </div>
            </div>

            {/* Column: Product */}
            <div className="footer-col">
              <h4 className="footer-col-title">Product</h4>
              <ul className="footer-col-links">
                <li><a href="#how-it-works">Overview & Demo</a></li>
                <li><a href="#the-dots-loop">The Dots Loop</a></li>
                <li><a href="#product">Adaptive Engine</a></li>
                <li><a href="#use-cases">3 Responsibilities</a></li>
                <li><a href="#pricing">Pricing & Tiers</a></li>
                <li><a href="#early-access">Early Access Program</a></li>
                <li><a href="#faq">Telegram & Voice Bot</a></li>
              </ul>
            </div>

            {/* Column: Philosophy & Guides */}
            <div className="footer-col">
              <h4 className="footer-col-title">Philosophy</h4>
              <ul className="footer-col-links">
                <li><a href="#planning">40-Hour Reality Rule</a></li>
                <li><a href="#planning">Capacity Budgeting</a></li>
                <li><a href="#how-it-works">Why To-Do Lists Fail</a></li>
                <li><a href="#use-cases">Deep Work Protection</a></li>
                <li><a href="#the-dots-loop">Emergency Buffer Ratio</a></li>
                <li><a href="#how-it-works">Sunday Weekly Ritual</a></li>
              </ul>
            </div>

            {/* Column: Resources & Developers */}
            <div className="footer-col">
              <h4 className="footer-col-title">Resources</h4>
              <ul className="footer-col-links">
                <li><a href="#faq">Product FAQs</a></li>
                <li><a href="#how-it-works">Documentation</a></li>
                <li>
                  <a href="#changelog" className="link-with-badge">
                    <span>Changelog</span>
                    <span className="nav-tag-lime">New</span>
                  </a>
                </li>
                <li><a href="#integrations">Calendar Integrations</a></li>
                <li><a href="#community">Builder Community</a></li>
                <li><a href="#security">Security & Privacy</a></li>
              </ul>
            </div>

            {/* Column: Company & Legal */}
            <div className="footer-col">
              <h4 className="footer-col-title">Company</h4>
              <ul className="footer-col-links">
                <li><a href="#hero">About Dots</a></li>
                <li><a href="#manifesto">The Manifesto</a></li>
                <li>
                  <a href="#careers" className="link-with-badge">
                    <span>Careers</span>
                    <span className="nav-tag-hiring">Hiring</span>
                  </a>
                </li>
                <li><a href="#brand">Brand Assets</a></li>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Service</a></li>
                <li><a href="mailto:support@dots.app">Contact Team</a></li>
              </ul>
            </div>
          </div>

          {/* 3. Bottom Signature Bar */}
          <div className="footer-bottom-bar">
            {/* Left: Copyright */}
            <div className="footer-copyright-group">
              <span className="copyright-text">
                © {new Date().getFullYear()} Dots Technologies Inc. All rights reserved.
              </span>
            </div>

            {/* Center: The Three Dots Motif & Motto */}
            <div className="footer-center-motto" aria-hidden="true">
              <div className="footer-dots-constellation">
                <span className="constellation-dot dot-cobalt" />
                <span className="constellation-dot dot-lime" />
                <span className="constellation-dot dot-ink" />
              </div>
              <span className="footer-motto-text">No perfect week required. Just progress.</span>
            </div>

            {/* Right: Security & Region */}
            <div className="footer-trust-group">
              <a href="#privacy" className="footer-legal-link">Privacy</a>
              <span className="footer-legal-dot">·</span>
              <a href="#terms" className="footer-legal-link">Terms</a>
              <span className="footer-legal-dot">·</span>
              <div className="trust-badge">
                <Globe size={13} className="trust-icon" />
                <span>EN (US)</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        /* ==================== ROUNDED BRAND FOOTER STYLES ==================== */
        .footer-outer-shell {
          width: 100%;
          padding: 0 clamp(16px, 3.5vw, 40px) clamp(24px, 4vw, 48px);
          background: transparent;
          box-sizing: border-box;
          position: relative;
          z-index: 10;
        }

        .footer-rounded-card {
          max-width: 1360px;
          margin-inline: auto;
          background: #FFFFFF !important;
          border-radius: clamp(28px, 4.5vw, 44px);
          border: 1px solid rgba(43, 47, 217, 0.12) !important;
          box-shadow:
            0 24px 64px -16px rgba(27, 31, 100, 0.08),
            0 2px 10px rgba(0, 0, 0, 0.02),
            inset 0 1px 1px rgba(255, 255, 255, 1) !important;
          position: relative;
          overflow: hidden;
          color: #0F172A !important;
        }

        /* Ambient Glow Layer: Subtle Cobalt Blue + Electric Lime */
        .footer-ambient-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }

        .footer-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.6;
        }

        .orb-cobalt {
          width: 500px;
          height: 500px;
          top: -120px;
          left: -100px;
          background: radial-gradient(circle, rgba(56, 70, 248, 0.1) 0%, rgba(56, 70, 248, 0) 70%);
        }

        .orb-lime {
          width: 440px;
          height: 440px;
          bottom: -100px;
          right: -80px;
          background: radial-gradient(circle, rgba(210, 246, 76, 0.18) 0%, rgba(210, 246, 76, 0) 70%);
        }

        .footer-inner-content {
          position: relative;
          z-index: 1;
          padding: clamp(36px, 5vw, 60px) clamp(24px, 4.5vw, 56px) clamp(24px, 3vw, 36px);
        }

        /* 1. Top Newsletter Banner */
        .footer-top-banner {
          display: grid;
          grid-template-columns: 1fr;
          gap: 28px;
          padding-bottom: clamp(32px, 4vw, 48px);
          border-bottom: 1px solid rgba(226, 232, 240, 0.9);
          align-items: center;
        }

        @media (min-width: 980px) {
          .footer-top-banner {
            grid-template-columns: 1.15fr 1fr;
            gap: 48px;
          }
        }

        .banner-text-column {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .banner-kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #2B2FD9;
        }

        .banner-kicker-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #2B2FD9;
          box-shadow: 0 0 8px rgba(43, 47, 217, 0.5);
        }

        .banner-headline {
          font-size: clamp(1.6rem, 2.8vw, 2.3rem);
          font-weight: 800;
          line-height: 1.18;
          color: #0F172A;
          letter-spacing: -0.03em;
          margin: 0;
        }

        .highlight-blue {
          color: #2B2FD9;
        }

        .banner-subtext {
          font-size: 0.92rem;
          line-height: 1.5;
          color: #475569;
          margin: 0;
          max-width: 520px;
        }

        /* Newsletter Input Capsule */
        .footer-newsletter-form {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-width: 480px;
        }

        .newsletter-pill-input {
          display: flex;
          align-items: center;
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          border-radius: 9999px;
          padding: 5px 6px 5px 16px;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }

        .newsletter-pill-input:focus-within {
          border-color: #2B2FD9;
          box-shadow: 0 0 0 3px rgba(43, 47, 217, 0.15);
        }

        .newsletter-icon {
          color: #94A3B8;
          margin-right: 10px;
          flex-shrink: 0;
        }

        .newsletter-field {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 0.9rem;
          color: #0F172A;
          outline: none;
        }

        .newsletter-field::placeholder {
          color: #94A3B8;
        }

        .newsletter-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #D2F64C;
          color: #0F172A;
          font-size: 0.86rem;
          font-weight: 800;
          padding: 10px 18px;
          border-radius: 9999px;
          border: none;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(163, 230, 53, 0.45);
        }

        .newsletter-btn:hover:not(:disabled) {
          background: #C4EE38;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px -3px rgba(163, 230, 53, 0.65);
        }

        .newsletter-feedback {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.76rem;
          padding-left: 14px;
        }

        .newsletter-feedback.is-success {
          color: #15803D;
        }

        .newsletter-feedback.is-error {
          color: #DC2626;
        }

        .newsletter-reassurance {
          font-size: 0.72rem;
          color: #64748B;
          padding-left: 14px;
        }

        /* 2. Main Multi-Column Grid */
        .footer-nav-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 36px 24px;
          padding-block: clamp(36px, 4.5vw, 52px);
          border-bottom: 1px solid rgba(226, 232, 240, 0.9);
        }

        @media (min-width: 768px) {
          .footer-nav-grid {
            grid-template-columns: 1.8fr 1fr 1fr 1fr 1fr;
            gap: 36px;
          }
        }

        .footer-col {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .col-brand {
          grid-column: 1 / -1;
        }

        @media (min-width: 768px) {
          .col-brand {
            grid-column: auto;
            padding-right: 20px;
          }
        }

        .footer-brand-link {
          text-decoration: none;
          display: inline-block;
          margin-bottom: 2px;
        }

        .footer-brand-mission {
          font-size: 0.86rem;
          line-height: 1.55;
          color: #475569;
          margin: 0;
          max-width: 290px;
        }

        /* Social Icons */
        .footer-social-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 6px;
        }

        .social-icon-btn {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          color: #475569;
          display: flex;
          align-items: center;
          justifyContent: center;
          text-decoration: none;
          transition: all 0.18s ease;
        }

        .social-icon-btn:hover {
          color: #2B2FD9;
          background: #EEF2FF;
          border-color: rgba(43, 47, 217, 0.3);
          transform: translateY(-2px);
        }

        .footer-col-title {
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #0F172A;
          margin: 0;
        }

        .footer-col-links {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .footer-col-links a {
          font-size: 0.84rem;
          color: #475569;
          text-decoration: none;
          transition: color 0.15s ease, transform 0.15s ease;
          display: inline-flex;
          align-items: center;
        }

        .footer-col-links a:hover {
          color: #2B2FD9;
          transform: translateX(2px);
        }

        .link-with-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .nav-tag-lime {
          font-size: 0.62rem;
          font-weight: 800;
          text-transform: uppercase;
          background: rgba(210, 246, 76, 0.3);
          color: #15803D;
          border: 1px solid rgba(132, 204, 22, 0.35);
          padding: 1px 5px;
          border-radius: 4px;
        }

        .nav-tag-hiring {
          font-size: 0.62rem;
          font-weight: 800;
          text-transform: uppercase;
          background: #EEF2FF;
          color: #2B2FD9;
          border: 1px solid rgba(43, 47, 217, 0.25);
          padding: 1px 5px;
          border-radius: 4px;
        }

        /* 3. Bottom Signature Bar */
        .footer-bottom-bar {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          flex-wrap: wrap;
          gap: 20px;
          padding-top: clamp(20px, 2.8vw, 30px);
        }

        .footer-copyright-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .copyright-text {
          font-size: 0.78rem;
          color: #64748B;
        }

        /* Center Motif: Logo 3 Dots + Motto */
        .footer-center-motto {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .footer-dots-constellation {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .constellation-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }

        .dot-cobalt {
          background: #3846F8;
          box-shadow: 0 0 6px rgba(56, 70, 248, 0.5);
        }

        .dot-lime {
          background: #D2F64C;
          box-shadow: 0 0 6px rgba(210, 246, 76, 0.6);
        }

        .dot-ink {
          background: #111827;
        }

        .footer-motto-text {
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: #475569;
        }

        /* Right Legal & Region */
        .footer-trust-group {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .footer-legal-link {
          font-size: 0.74rem;
          color: #64748B;
          text-decoration: none;
          transition: color 0.15s ease;
        }

        .footer-legal-link:hover {
          color: #2B2FD9;
        }

        .footer-legal-dot {
          color: #CBD5E1;
          font-size: 0.74rem;
        }

        .trust-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.72rem;
          color: #64748B;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          padding: 4px 9px;
          border-radius: 6px;
        }

        .trust-icon {
          color: #2B2FD9;
        }

        /* Mobile adjustments */
        @media (max-width: 767px) {
          .footer-bottom-bar {
            flex-direction: column;
            align-items: flex-start;
          }
          .footer-center-motto {
            order: 2;
          }
          .footer-trust-group {
            order: 3;
          }
          .footer-copyright-group {
            order: 1;
          }
        }
      `}</style>
    </div>
  );
};
