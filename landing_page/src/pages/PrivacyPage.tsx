import React from 'react';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Database,
  Trash2,
  ArrowLeft,
  Mail,
  CheckCircle2,
} from 'lucide-react';

interface PrivacyPageProps {
  onBackToHome?: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBackToHome }) => {
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
          <span className="breadcrumb-current">Privacy Policy</span>
        </nav>

        {/* Header */}
        <header className="legal-header">
          <div className="legal-kicker-badge">
            <ShieldCheck size={14} className="kicker-icon" />
            <span>PRIVACY & DATA PROTECTION</span>
          </div>

          <h1 className="legal-title">
            Your schedule is your life. <span className="title-highlight">We protect it.</span>
          </h1>

          <p className="legal-subtitle">
            Dots is built on a simple foundation: planning software must respect boundaries. We do not sell your data,
            and your private calendar is never used to train public AI models.
          </p>

          <div className="legal-meta-row">
            <span>Effective: October 2026</span>
            <span className="meta-dot">·</span>
            <span>Version 2.4</span>
            <span className="meta-dot">·</span>
            <span>Global Standard (GDPR & CCPA Compliant)</span>
          </div>
        </header>

        {/* Core Guarantees 4-Grid */}
        <div className="guarantees-grid">
          <div className="guarantee-card">
            <div className="guarantee-icon-wrap icon-purple">
              <EyeOff size={20} />
            </div>
            <h3 className="guarantee-title">Zero LLM Model Training</h3>
            <p className="guarantee-desc">
              Your calendar events, meeting notes, and task descriptions are strictly quarantined. They are never fed into foundation models for training.
            </p>
          </div>

          <div className="guarantee-card">
            <div className="guarantee-icon-wrap icon-blue">
              <Lock size={20} />
            </div>
            <h3 className="guarantee-title">Bank-Grade 256-Bit Encryption</h3>
            <p className="guarantee-desc">
              All credentials, OAuth access tokens, and task details are encrypted at rest using AES-256 and transmitted exclusively via TLS 1.3.
            </p>
          </div>

          <div className="guarantee-card">
            <div className="guarantee-icon-wrap icon-lime">
              <Database size={20} />
            </div>
            <h3 className="guarantee-title">Ephemeral Voice Processing</h3>
            <p className="guarantee-desc">
              Telegram voice memos sent to the Dots bot are parsed in isolated memory for intent extraction and purged immediately after processing.
            </p>
          </div>

          <div className="guarantee-card">
            <div className="guarantee-icon-wrap icon-rose">
              <Trash2 size={20} />
            </div>
            <h3 className="guarantee-title">1-Click Full Erasure</h3>
            <p className="guarantee-desc">
              You own your data. Export your full calendar history in standard iCal/JSON format or completely wipe your account and tokens in one tap.
            </p>
          </div>
        </div>

        {/* Detailed Legal Sections */}
        <div className="legal-content-card">
          <section className="legal-section">
            <h2 className="section-title">1. Information We Access and Collect</h2>
            <p>
              When you use Dots, we only collect the minimum amount of information necessary to deliver our weekly planning and execution assistance:
            </p>
            <ul className="legal-list">
              <li>
                <strong>Account Credentials:</strong> Name, email address, and authentication identifiers provided through Google OAuth or email magic links.
              </li>
              <li>
                <strong>Connected Calendar Metadata:</strong> Event titles, start and end times, attendee status, and busy/free availability from your connected Google Calendar, Apple Calendar, or Microsoft Outlook accounts.
              </li>
              <li>
                <strong>Tasks and Commitments:</strong> Items you explicitly add to Dots, weekly focus priorities, and duration estimates.
              </li>
              <li>
                <strong>Telegram & Voice Inputs:</strong> Audio voice notes or text messages sent directly to the official Dots Telegram bot to request calendar adjustments.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2 className="section-title">2. How We Use Your Information</h2>
            <p>
              Dots uses your data exclusively to calculate capacity, balance your week, and shield your high-impact work:
            </p>
            <ul className="legal-list">
              <li>
                <strong>Capacity & Reality Budgeting:</strong> Calculating your true weekly focus hours by deducting fixed meetings, transit times, and buffer allocations.
              </li>
              <li>
                <strong>Adaptive Schedule Proposals:</strong> Generating one-tap replan options when an unexpected meeting or delay disrupts your planned day.
              </li>
              <li>
                <strong>Weekly Ritual Insights:</strong> Providing summary reflections during your Sunday weekly planning ritual.
              </li>
            </ul>
            <p>
              We do <strong>not</strong> sell, rent, or monetize your schedule information, contact lists, or personal calendar data to any third-party advertisers or data brokers.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="section-title">3. AI Architecture & Zero-Training Commitment</h2>
            <p>
              Dots utilizes private, enterprise-tier AI infrastructure with strict contractual guarantees:
            </p>
            <div className="callout-box">
              <CheckCircle2 size={18} className="callout-check" />
              <div>
                <strong>Zero Data Retention by Model Providers:</strong> User inputs processed through our AI inference pipeline are processed ephemerally and explicitly excluded from provider training or fine-tuning datasets under commercial API terms.
              </div>
            </div>
            <p>
              Your schedule details exist solely within your authenticated tenant session and our encrypted database.
            </p>
          </section>

          <section className="legal-section">
            <h2 className="section-title">4. Third-Party Integrations & Calendar Permissions</h2>
            <p>
              Dots connects to third-party services only with your explicit authorization:
            </p>
            <ul className="legal-list">
              <li>
                <strong>Calendar Providers (Google, Apple, Microsoft):</strong> We request the minimum OAuth scopes necessary to read your calendar events and propose or write adjustments that you approve. You may revoke these access tokens at any time in your provider account settings.
              </li>
              <li>
                <strong>Stripe:</strong> Payment processing for paid tiers is handled entirely by Stripe. Dots never stores your full credit card number or billing CVV.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2 className="section-title">5. Data Retention, Portability & Deletion</h2>
            <p>
              You maintain sovereign ownership of your data at all times:
            </p>
            <ul className="legal-list">
              <li>
                <strong>Data Export:</strong> You can export your tasks, weekly logs, and planning archives at any time in machine-readable JSON or standard .ics calendar format.
              </li>
              <li>
                <strong>Account Deletion:</strong> If you delete your account, all associated database records, sync tokens, and task histories are permanently purged from our active systems within 48 hours.
              </li>
            </ul>
          </section>

          <section className="legal-section">
            <h2 className="section-title">6. Security Infrastructure</h2>
            <p>
              We employ defense-in-depth security measures to protect your schedule:
            </p>
            <ul className="legal-list">
              <li>All databases are hosted in SOC 2 Type II certified data centers with automated vulnerability scanning.</li>
              <li>Row-Level Security (RLS) guarantees that tenant data is isolated cryptographically.</li>
              <li>Continuous audit logging tracks all token usage and authentication events.</li>
            </ul>
          </section>

          <section className="legal-section legal-contact-box">
            <div className="contact-icon-bubble">
              <Mail size={22} />
            </div>
            <div>
              <h3 className="contact-heading">Questions about your privacy?</h3>
              <p className="contact-subtext">
                Our Data Protection Officer and security team are available to assist with any questions, GDPR requests, or data export needs.
              </p>
              <a href="mailto:privacy@dots.app" className="contact-email-link">
                privacy@dots.app
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
          color: #475569;
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
