import React from 'react';
import {
  FileText,
  Sliders,
  CreditCard,
  CheckCircle2,
  ArrowLeft,
  Mail,
  Zap,
} from 'lucide-react';

interface TermsPageProps {
  onBackToHome?: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBackToHome }) => {
  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onBackToHome) {
      onBackToHome();
    } else {
      window.location.hash = '';
    }
  };

  return (
    <div className="legal-page-wrapper">
      {/* Soft Ambient Background Lights */}
      <div className="legal-ambient-glow" aria-hidden="true">
        <div className="glow-orb orb-1" />
        <div className="glow-orb orb-2" />
      </div>

      <div className="legal-container">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="legal-breadcrumb">
          <a href="#" onClick={handleBack} className="breadcrumb-back-link">
            <ArrowLeft size={15} />
            <span>Back to Home</span>
          </a>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Terms of Service</span>
        </nav>

        {/* Header */}
        <header className="legal-header">
          <div className="legal-kicker-badge">
            <FileText size={14} className="kicker-icon" />
            <span>USER AGREEMENT & SERVICE TERMS</span>
          </div>

          <h1 className="legal-title">
            Clear, fair terms. <span className="title-highlight">No hidden traps.</span>
          </h1>

          <p className="legal-subtitle">
            Dots is designed to protect your focus and help you navigate a real day. Here is a straightforward breakdown
            of how we work together, what you can expect from us, and what we ask of you.
          </p>

          <div className="legal-meta-row">
            <span>Effective: October 2026</span>
            <span className="meta-dot">·</span>
            <span>Version 2.4</span>
            <span className="meta-dot">·</span>
            <span>Applicable Worldwide</span>
          </div>
        </header>

        {/* 4 Core Principles */}
        <div className="guarantees-grid">
          <div className="guarantee-card">
            <div className="guarantee-icon-wrap icon-purple">
              <Sliders size={20} />
            </div>
            <h3 className="guarantee-title">You Stay in Control</h3>
            <p className="guarantee-desc">
              Dots suggests intelligent replans, buffer adjustments, and trade-offs. You always approve changes before anything touches your external calendar.
            </p>
          </div>

          <div className="guarantee-card">
            <div className="guarantee-icon-wrap icon-blue">
              <CreditCard size={20} />
            </div>
            <h3 className="guarantee-title">Zero Lock-In & Fair Billing</h3>
            <p className="guarantee-desc">
              Core weekly planning is free. Paid Pro tiers come with a 14-day trial, prorated billing, and 1-click self-serve cancellation at any time.
            </p>
          </div>

          <div className="guarantee-card">
            <div className="guarantee-icon-wrap icon-lime">
              <Zap size={20} />
            </div>
            <h3 className="guarantee-title">High-Availability Sync</h3>
            <p className="guarantee-desc">
              We maintain continuous bidirectional calendar synchronization across Google, Microsoft, and Apple Calendars with real-time conflict handling.
            </p>
          </div>

          <div className="guarantee-card">
            <div className="guarantee-icon-wrap icon-rose">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="guarantee-title">Your Content Is Yours</h3>
            <p className="guarantee-desc">
              We claim no ownership over your tasks, notes, or schedules. You have the right to export or erase your data at any moment.
            </p>
          </div>
        </div>

        {/* Detailed Legal Sections */}
        <div className="legal-content-card">
          <section className="legal-section">
            <h2 className="section-title">1. Acceptance of Terms</h2>
            <p>
              By accessing or creating an account on Dots (“the Service”), provided by Dots Technologies Inc. (“Dots”, “we”, “us”, or “our”), you agree to be bound by these Terms of Service. If you do not agree to all terms, you must discontinue using the platform.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="section-title">2. Description of Service</h2>
            <p>
              Dots is an AI-powered personal weekly planning, calendar coordination, and execution platform. Key capabilities include:
            </p>
            <ul className="legal-list">
              <li>Realistic capacity budgeting (deducting meetings, transit, and buffer time from a bounded weekly target).</li>
              <li>Dynamic rescheduling proposals when delays or unscheduled emergencies arise.</li>
              <li>Telegram bot and voice memo integrations for rapid on-the-go task capture and timeline updates.</li>
              <li>Sunday weekly reflection rituals and priority protection.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2 className="section-title">3. User Accounts and Calendar Access</h2>
            <p>
              To deliver adaptive schedule coordination, Dots requires access tokens to read and synchronize events with your authorized calendar accounts (such as Google Calendar, Apple Calendar, or Outlook).
            </p>
            <ul className="legal-list">
              <li>You are responsible for safeguarding your login credentials and authenticating only accounts that you have legal permission to connect.</li>
              <li>You may disconnect any calendar or revoke sync permissions immediately via your Account Integrations page or directly in your provider's security portal.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2 className="section-title">4. Human Approval and Schedule Autonomy</h2>
            <div className="callout-box">
              <CheckCircle2 size={18} className="callout-check" />
              <div>
                <strong>Strict Copilot Principle:</strong> Dots operates as an advisory planning copilot. By default, Dots generates proposed schedule adjustments for your review. Unless you explicitly enable auto-rebalance rules for designated low-priority tasks, Dots will never alter external calendar meetings without your one-tap authorization.
              </div>
            </div>
          </section>

          <section className="legal-section">
            <h2 className="section-title">5. Subscriptions, Payments & Cancellation</h2>
            <ul className="legal-list">
              <li>
                <strong>Free Tier:</strong> Basic weekly planning, capacity calculation, and limited AI repairs are offered free of charge.
              </li>
              <li>
                <strong>Pro Tier:</strong> Paid subscriptions unlock unlimited automated schedule repairs, audio voice transcription, and team calendar sync. Subscriptions are billed in advance on a monthly or annual cycle through Stripe.
              </li>
              <li>
                <strong>Cancellation:</strong> You may cancel your subscription at any time. Access continues through the end of your current billing period with zero cancellation penalties.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2 className="section-title">6. Acceptable Use Policy</h2>
            <p>You agree not to misuse Dots. Specifically, you agree not to:</p>
            <ul className="legal-list">
              <li>Attempt to probe, scan, or breach the security of our application infrastructure or API endpoints.</li>
              <li>Reverse engineer, decompile, or copy the underlying proprietary algorithms of our Reality Capacity Engine.</li>
              <li>Use automated scrapers, bots, or excessive automated requests outside of authorized API rate limits.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2 className="section-title">7. Limitation of Liability</h2>
            <p>
              While Dots is built to maintain accurate schedule forecasting and resilient calendar sync, real life is unpredictable. Dots is provided “as is” and “as available”. We are not liable for missed meetings, travel delays, third-party calendar provider outages, or indirect damages resulting from your use of the platform.
            </p>
          </section>

          <section className="legal-section legal-contact-box">
            <div className="contact-icon-bubble">
              <Mail size={22} />
            </div>
            <div>
              <h3 className="contact-heading">Questions about our Terms?</h3>
              <p className="contact-subtext">
                If you have questions regarding these Terms or need enterprise agreements, our legal team is ready to assist.
              </p>
              <a href="mailto:legal@dots.app" className="contact-email-link">
                legal@dots.app
              </a>
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .legal-page-wrapper {
          min-height: 100vh;
          background: #F8F9FE;
          color: #0F172A;
          position: relative;
          overflow: hidden;
          padding-top: clamp(80px, 10vw, 110px);
          padding-bottom: clamp(60px, 8vw, 100px);
        }

        .legal-ambient-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.5;
        }

        .orb-1 {
          width: 500px;
          height: 500px;
          top: -100px;
          right: -100px;
          background: radial-gradient(circle, rgba(56, 70, 248, 0.12) 0%, rgba(56, 70, 248, 0) 70%);
        }

        .orb-2 {
          width: 450px;
          height: 450px;
          top: 30%;
          left: -120px;
          background: radial-gradient(circle, rgba(210, 246, 76, 0.16) 0%, rgba(210, 246, 76, 0) 70%);
        }

        .legal-container {
          max-width: 980px;
          margin-inline: auto;
          padding-inline: clamp(20px, 4vw, 36px);
          position: relative;
          z-index: 2;
        }

        /* Breadcrumbs */
        .legal-breadcrumb {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.86rem;
          margin-bottom: 32px;
        }

        .breadcrumb-back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #2B2FD9;
          text-decoration: none;
          font-weight: 700;
          transition: transform 0.18s ease;
        }

        .breadcrumb-back-link:hover {
          transform: translateX(-3px);
        }

        .breadcrumb-separator {
          color: #CBD5E1;
        }

        .breadcrumb-current {
          color: #64748B;
          font-weight: 500;
        }

        /* Header */
        .legal-header {
          margin-bottom: 44px;
        }

        .legal-kicker-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: #EEF2FF;
          color: #2B2FD9;
          font-size: 0.74rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          padding: 6px 14px;
          border-radius: 9999px;
          border: 1px solid rgba(43, 47, 217, 0.15);
          margin-bottom: 16px;
        }

        .kicker-icon {
          color: #2B2FD9;
        }

        .legal-title {
          font-size: clamp(2.3rem, 4.5vw, 3.6rem);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.04em;
          color: #0F172A;
          margin: 0 0 16px;
        }

        .title-highlight {
          color: #2B2FD9;
        }

        .legal-subtitle {
          font-size: clamp(1.05rem, 1.4vw, 1.2rem);
          line-height: 1.6;
          color: #475569;
          margin: 0 0 20px;
          max-width: 740px;
        }

        .legal-meta-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #64748B;
        }

        .meta-dot {
          color: #CBD5E1;
        }

        /* Core Guarantees Grid */
        .guarantees-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
          margin-bottom: 48px;
        }

        @media (min-width: 640px) {
          .guarantees-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .guarantee-card {
          background: #FFFFFF;
          border: 1px solid rgba(226, 232, 240, 0.95);
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .guarantee-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(43, 47, 217, 0.06);
        }

        .guarantee-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .icon-purple {
          background: #EEF2FF;
          color: #2B2FD9;
        }

        .icon-blue {
          background: #E0F2FE;
          color: #0284C7;
        }

        .icon-lime {
          background: #F4FCE3;
          color: #4D7C0F;
        }

        .icon-rose {
          background: #FFE4E6;
          color: #E11D48;
        }

        .guarantee-title {
          font-size: 1.08rem;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 8px;
          letter-spacing: -0.015em;
        }

        .guarantee-desc {
          font-size: 0.88rem;
          line-height: 1.55;
          color: #475569;
          margin: 0;
        }

        /* Main Legal Content Card */
        .legal-content-card {
          background: #FFFFFF;
          border: 1px solid rgba(226, 232, 240, 0.95);
          border-radius: 24px;
          padding: clamp(28px, 4.5vw, 48px);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.02);
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .legal-section {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .section-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.02em;
          margin: 0;
          padding-bottom: 10px;
          border-bottom: 1px solid #F1F5F9;
        }

        .legal-section p {
          font-size: 0.94rem;
          line-height: 1.7;
          color: #475569;
          margin: 0;
        }

        .legal-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .legal-list li {
          font-size: 0.92rem;
          line-height: 1.65;
          color: #475569;
          padding-left: 20px;
          position: relative;
        }

        .legal-list li::before {
          content: '•';
          position: absolute;
          left: 4px;
          color: #2B2FD9;
          font-weight: bold;
        }

        .legal-list strong {
          color: #0F172A;
        }

        .callout-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: #F5F7FF;
          border: 1px solid rgba(43, 47, 217, 0.16);
          border-radius: 14px;
          padding: 16px 20px;
          font-size: 0.9rem;
          line-height: 1.6;
          color: #1E1B4B;
        }

        .callout-check {
          color: #2B2FD9;
          flex-shrink: 0;
          margin-top: 3px;
        }

        /* Contact Box */
        .legal-contact-box {
          background: linear-gradient(135deg, #EEF2FF 0%, #F5F7FF 100%);
          border: 1px solid rgba(43, 47, 217, 0.16);
          border-radius: 18px;
          padding: 28px;
          display: flex;
          align-items: flex-start;
          gap: 18px;
        }

        .contact-icon-bubble {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #2B2FD9;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .contact-heading {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 6px;
        }

        .contact-subtext {
          font-size: 0.88rem;
          color: #64748B;
          line-height: 1.5;
          margin: 0 0 12px;
        }

        .contact-email-link {
          display: inline-block;
          font-size: 0.92rem;
          font-weight: 800;
          color: #2B2FD9;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};
