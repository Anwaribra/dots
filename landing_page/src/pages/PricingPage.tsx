import React, { useState } from 'react';
import {
  Check,
  Shield,
  ArrowRight,
  Lock,
  ChevronDown,
  Clock,
  Flame,
  Award,
} from 'lucide-react';
import { DotsLogo } from '../components/brand/DotsLogo';

interface PricingPageProps {
  onBackToHome?: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onBackToHome }) => {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'Can I start using Dots completely free?',
      a: 'Yes! Our Free tier gives you full access to the core weekly planner, capacity budgeting, and 5 automated AI schedule repairs every month with no credit card required.',
    },
    {
      q: 'How does the Telegram & messaging integration work?',
      a: 'You simply link your Telegram account in two clicks. Whenever an urgent task or unexpected meeting arrives, text or send a voice note to Dots. Dots analyzes your commitments and sends a proposed adjustment card with one-tap approval.',
    },
    {
      q: 'Do I have to approve every schedule change?',
      a: 'Always. Dots is an execution copilot, not an unruly scheduler. It proposes intelligent replans that protect your deep work and fixed commitments, but never touches your calendar without your explicit tap.',
    },
    {
      q: 'Can I cancel or switch plans at any time?',
      a: 'Absolutely. Subscriptions are billed via Stripe with zero lock-in. You can upgrade, downgrade, or cancel anytime with one click in your account billing portal.',
    },
    {
      q: 'Is my calendar and personal schedule data secure?',
      a: 'We use bank-grade end-to-end encryption in transit and at rest. We never sell your schedule data or train public foundation models on your private tasks and calendar details.',
    },
  ];

  return (
    <div className="pricing-page-wrapper">
      {/* Specular Ambient Background Lights */}
      <div className="pricing-ambient-glow" aria-hidden="true">
        <div className="glow-orb orb-1" />
        <div className="glow-orb orb-2" />
        <div className="glow-orb orb-3" />
      </div>

      <div className="pricing-container">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="pricing-breadcrumb">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (onBackToHome) onBackToHome();
              else window.location.hash = '';
            }}
            className="breadcrumb-link"
          >
            Home
          </a>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Pricing</span>
        </nav>

        {/* Hero Header */}
        <header className="pricing-header">
          <div className="pricing-kicker-badge">
            <span>Simple, honest execution pricing</span>
          </div>

          <h1 className="pricing-title">
            Free to plan. <span className="title-highlight">Watched for $7.80.</span>
          </h1>

          <p className="pricing-subtitle">
            Connect what matters, defend your priorities, and let Dots adapt when life changes.
            No bloated project dashboards, no rigid lock-in, and zero busywork.
          </p>

          {/* Interactive Liquid Billing Toggle */}
          <div className="pricing-toggle-wrapper">
            <div className="pricing-toggle-capsule" role="group" aria-label="Billing frequency">
              <button
                type="button"
                className={`toggle-btn ${billing === 'monthly' ? 'is-active' : ''}`}
                onClick={() => setBilling('monthly')}
                aria-pressed={billing === 'monthly'}
              >
                Monthly
              </button>
              <button
                type="button"
                className={`toggle-btn ${billing === 'annual' ? 'is-active' : ''}`}
                onClick={() => setBilling('annual')}
                aria-pressed={billing === 'annual'}
              >
                Annual
              </button>
              <span className="save-badge">Save 35%</span>
            </div>
          </div>
        </header>

        {/* 3-Tier Asymmetric Plan Architecture */}
        <section className="pricing-plans-grid" aria-label="Pricing plans">
          {/* TIER 1: Starter / Free */}
          <div className="pricing-card card-starter">
            <div className="card-top">
              <span className="plan-label">Starter</span>
              <div className="price-row">
                <span className="currency">$</span>
                <span className="amount">0</span>
                <span className="frequency">/forever</span>
              </div>
              <p className="plan-summary">
                Core weekly planning and capacity budgeting for individuals building consistent focus.
              </p>
            </div>

            <a href="#app" className="plan-cta-btn cta-outline">
              Start for free
            </a>
            <p className="fine-print">No credit card needed · Instant access</p>

            <div className="divider-line" />

            <ul className="features-list">
              <li>
                <div className="check-icon-box">
                  <Check size={13} strokeWidth={2.8} />
                </div>
                <span>1 connected calendar (Google or Outlook)</span>
              </li>
              <li>
                <div className="check-icon-box">
                  <Check size={13} strokeWidth={2.8} />
                </div>
                <span>Weekly priority planner & capacity limits</span>
              </li>
              <li>
                <div className="check-icon-box">
                  <Check size={13} strokeWidth={2.8} />
                </div>
                <span>5 AI adaptive replans per month</span>
              </li>
              <li>
                <div className="check-icon-box">
                  <Check size={13} strokeWidth={2.8} />
                </div>
                <span>Conflict detection with manual fixes</span>
              </li>
              <li>
                <div className="check-icon-box">
                  <Check size={13} strokeWidth={2.8} />
                </div>
                <span>Web & mobile responsive dashboard</span>
              </li>
            </ul>
          </div>

          {/* TIER 2: Dots Unlimited (THE HERO LIQUID GLASS CARD) */}
          <div className="pricing-card card-unlimited feat">
            {/* Ambient Animated Drift Lights inside the card */}
            <div className="drift-fields" aria-hidden="true">
              <i className="drift-orb d1" />
              <i className="drift-orb d2" />
              <i className="drift-orb d3" />
            </div>

            <div className="floating-hero-badge">
              <Flame size={12} strokeWidth={2.8} />
              <span>Most Popular</span>
            </div>

            <div className="card-top">
              <span className="plan-label-hero">Unlimited</span>
              <div className="price-row hero-price">
                <span className="currency">$</span>
                <span className="amount">{billing === 'annual' ? '7.80' : '12'}</span>
                <span className="frequency">
                  {billing === 'annual' ? '/mo, billed $94/yr' : '/month'}
                </span>
              </div>
              <p className="plan-summary hero-summary">
                Full execution autonomy. Proactive schedule defense, instant Telegram assistant,
                and unlimited automated replans.
              </p>
            </div>

            <a href="#app" className="plan-cta-btn cta-hero">
              <span>Go Unlimited</span>
              <ArrowRight size={16} strokeWidth={2.6} />
            </a>
            <p className="fine-print hero-fine">Cancel anytime · 30-day money-back guarantee</p>

            <div className="divider-line hero-divider" />

            <ul className="features-list hero-list">
              <li>
                <div className="check-icon-box hero-check">
                  <Check size={13} strokeWidth={2.8} />
                </div>
                <span>
                  <strong>Unlimited</strong> AI automated replans & adjustments
                </span>
              </li>
              <li>
                <div className="check-icon-box hero-check">
                  <Check size={13} strokeWidth={2.8} />
                </div>
                <span>
                  <strong>Full Telegram Bot access</strong> (voice memos & text commands)
                </span>
              </li>
              <li>
                <div className="check-icon-box hero-check">
                  <Check size={13} strokeWidth={2.8} />
                </div>
                <span>Proactive conflict shield & protected deep work buffers</span>
              </li>
              <li>
                <div className="check-icon-box hero-check">
                  <Check size={13} strokeWidth={2.8} />
                </div>
                <span>Multi-calendar 2-way live sync (work & personal)</span>
              </li>
              <li>
                <div className="check-icon-box hero-check">
                  <Check size={13} strokeWidth={2.8} />
                </div>
                <span>Weekly execution analytics & energy retro</span>
              </li>
              <li>
                <div className="check-icon-box hero-check">
                  <Check size={13} strokeWidth={2.8} />
                </div>
                <span>Priority AI reasoning model & zero-latency execution</span>
              </li>
            </ul>
          </div>

          {/* TIER 3: Executive & Teams */}
          <div className="pricing-card card-executive">
            <div className="card-top">
              <span className="plan-label">Executive & Teams</span>
              <div className="price-row">
                <span className="currency">$</span>
                <span className="amount">{billing === 'annual' ? '24' : '29'}</span>
                <span className="frequency">/seat/month</span>
              </div>
              <p className="plan-summary">
                For executives, founders, and high-velocity teams who need shared commitment alignment.
              </p>
            </div>

            <a href="#app" className="plan-cta-btn cta-outline">
              Start team trial
            </a>
            <p className="fine-print">Includes dedicated concierge onboarding</p>

            <div className="divider-line" />

            <ul className="features-list">
              <li>
                <div className="check-icon-box">
                  <Check size={13} strokeWidth={2.8} />
                </div>
                <span>Everything in Unlimited for all seats</span>
              </li>
              <li>
                <div className="check-icon-box">
                  <Check size={13} strokeWidth={2.8} />
                </div>
                <span>Cross-calendar team capacity defense</span>
              </li>
              <li>
                <div className="check-icon-box">
                  <Check size={13} strokeWidth={2.8} />
                </div>
                <span>Executive assistant delegation workflow</span>
              </li>
              <li>
                <div className="check-icon-box">
                  <Check size={13} strokeWidth={2.8} />
                </div>
                <span>Client booking buffer protection</span>
              </li>
              <li>
                <div className="check-icon-box">
                  <Check size={13} strokeWidth={2.8} />
                </div>
                <span>Custom team integrations & priority 24/7 SLA</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Trust Signals Strip */}
        <div className="pricing-trust-strip">
          <div className="trust-item">
            <Lock size={15} color="#2B2FD9" />
            <span>Encrypted Stripe billing</span>
          </div>
          <div className="trust-item">
            <Award size={15} color="#2B2FD9" />
            <span>30-day money-back guarantee</span>
          </div>
          <div className="trust-item">
            <Clock size={15} color="#2B2FD9" />
            <span>Cancel anytime in 1 click</span>
          </div>
          <div className="trust-item">
            <Shield size={15} color="#2B2FD9" />
            <span>Zero calendar lock-in</span>
          </div>
        </div>

        {/* DETAILED COMPARISON TABLE */}
        <section className="comparison-section">
          <div className="comparison-card">
            <div className="comparison-head-row">
              <div className="cmp-title-col">
                <h3>Compare plan capabilities</h3>
                <p>Full transparency on every feature</p>
              </div>
              <div className="cmp-col-header">
                <span className="col-plan-name">Starter</span>
                <span className="col-plan-price">$0</span>
              </div>
              <div className="cmp-col-header feat-header">
                <div className="col-featured-tag">MOST POPULAR</div>
                <span className="col-plan-name">Unlimited</span>
                <span className="col-plan-price">{billing === 'annual' ? '$7.80/mo' : '$9.80/mo'}</span>
              </div>
              <div className="cmp-col-header">
                <span className="col-plan-name">Executive</span>
                <span className="col-plan-price">{billing === 'annual' ? '$24/mo' : '$29/mo'}</span>
              </div>
            </div>

            {/* Group 1: Core Execution */}
            <div className="cmp-group-heading">Core Execution & Planning</div>
            <div className="cmp-row">
              <div className="cmp-feature-name">Weekly priority alignment</div>
              <div className="cmp-val">Included</div>
              <div className="cmp-val feat-val">Advanced</div>
              <div className="cmp-val">Custom</div>
            </div>
            <div className="cmp-row">
              <div className="cmp-feature-name">AI Automated Replanning</div>
              <div className="cmp-val">5 / month</div>
              <div className="cmp-val feat-val font-bold">Unlimited</div>
              <div className="cmp-val font-bold">Unlimited</div>
            </div>
            <div className="cmp-row">
              <div className="cmp-feature-name">Fixed commitment defense</div>
              <div className="cmp-val">Basic</div>
              <div className="cmp-val feat-val">Proactive shield</div>
              <div className="cmp-val">Team buffer shield</div>
            </div>

            {/* Group 2: Integrations & Channels */}
            <div className="cmp-group-heading">Channels & External Inputs</div>
            <div className="cmp-row">
              <div className="cmp-feature-name">Telegram Bot (Text & Voice)</div>
              <div className="cmp-val text-muted">—</div>
              <div className="cmp-val feat-val font-bold">Full 2-way bot</div>
              <div className="cmp-val font-bold">Full 2-way bot</div>
            </div>
            <div className="cmp-row">
              <div className="cmp-feature-name">Calendar 2-way sync</div>
              <div className="cmp-val">1 calendar</div>
              <div className="cmp-val feat-val font-bold">Unlimited</div>
              <div className="cmp-val font-bold">Unlimited multi-user</div>
            </div>
            <div className="cmp-row">
              <div className="cmp-feature-name">Voice note replanning</div>
              <div className="cmp-val text-muted">—</div>
              <div className="cmp-val feat-val">Included</div>
              <div className="cmp-val">Included</div>
            </div>

            {/* Group 3: Privacy & Support */}
            <div className="cmp-group-heading">Privacy, Data & Support</div>
            <div className="cmp-row">
              <div className="cmp-feature-name">Zero data selling & encryption</div>
              <div className="cmp-val">Yes</div>
              <div className="cmp-val feat-val font-bold">Yes</div>
              <div className="cmp-val font-bold">Yes + Audit logs</div>
            </div>
            <div className="cmp-row">
              <div className="cmp-feature-name">Support SLA</div>
              <div className="cmp-val">Community</div>
              <div className="cmp-val feat-val font-bold">Priority (under 4h)</div>
              <div className="cmp-val font-bold">Dedicated Concierge</div>
            </div>
          </div>
        </section>

        {/* PRICING FAQ ACCORDION */}
        <section className="pricing-faq-section">
          <div className="faq-header">
            <span className="faq-tag">Frequently asked questions</span>
            <h2 className="faq-title">Everything you need to know</h2>
          </div>

          <div className="faq-accordion-container">
            {faqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div key={idx} className={`faq-card ${isOpen ? 'is-open' : ''}`}>
                  <button
                    type="button"
                    className="faq-question-btn"
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`chevron-icon ${isOpen ? 'rotate' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="faq-answer-panel">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* BOTTOM CALL TO ACTION CARD */}
        <div className="pricing-bottom-cta">
          <div className="cta-dots-mark">
            <DotsLogo size={36} showWordmark={false} />
          </div>
          <h2 className="bottom-cta-heading">Ready to reclaim your week?</h2>
          <p className="bottom-cta-desc">
            Join hundreds of focused professionals using Dots to turn noisy commitments into calm execution.
          </p>
          <a href="#app" className="bottom-cta-btn">
            <span>Get started with Dots</span>
            <ArrowRight size={17} strokeWidth={2.4} />
          </a>
        </div>
      </div>

      <style>{`
        .pricing-page-wrapper {
          min-height: 100vh;
          background: #F8F9FE;
          color: #111827;
          position: relative;
          overflow-x: clip;
          padding-top: clamp(124px, 14vw, 156px);
          padding-bottom: 96px;
        }

        .pricing-ambient-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 900px;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }

        .glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.55;
        }

        .orb-1 {
          width: 520px;
          height: 520px;
          top: -120px;
          left: 15%;
          background: radial-gradient(circle, rgba(67, 70, 226, 0.28) 0%, rgba(67, 70, 226, 0) 70%);
        }

        .orb-2 {
          width: 480px;
          height: 480px;
          top: 100px;
          right: 12%;
          background: radial-gradient(circle, rgba(210, 246, 76, 0.22) 0%, rgba(210, 246, 76, 0) 70%);
        }

        .orb-3 {
          width: 600px;
          height: 600px;
          top: 400px;
          left: 35%;
          background: radial-gradient(circle, rgba(43, 47, 217, 0.16) 0%, rgba(43, 47, 217, 0) 70%);
        }

        .pricing-container {
          position: relative;
          z-index: 1;
          max-width: 1240px;
          margin-inline: auto;
          padding-inline: clamp(20px, 4vw, 36px);
        }

        .pricing-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
          font-weight: 600;
          margin-bottom: 24px;
        }

        .breadcrumb-link {
          color: #6B7280;
          text-decoration: none;
          transition: color 0.15s ease;
        }

        .breadcrumb-link:hover {
          color: #2B2FD9;
        }

        .breadcrumb-separator {
          color: #D1D5DB;
        }

        .breadcrumb-current {
          color: #111827;
        }

        .pricing-header {
          text-align: center;
          max-width: 760px;
          margin-inline: auto;
          margin-bottom: clamp(40px, 5vw, 64px);
        }

        .pricing-kicker-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(43, 47, 217, 0.12);
          box-shadow: 0 4px 12px rgba(43, 47, 217, 0.04);
          font-size: 0.76rem;
          font-weight: 700;
          color: #2B2FD9;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 18px;
        }

        .kicker-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #D2F64C;
        }

        .pricing-title {
          font-size: clamp(2.4rem, 5vw, 3.8rem);
          font-weight: 800;
          line-height: 1.08;
          letter-spacing: -0.04em;
          color: #111827;
          margin-bottom: 16px;
        }

        .title-highlight {
          color: #2B2FD9;
        }

        .pricing-subtitle {
          font-size: clamp(1rem, 1.35vw, 1.18rem);
          line-height: 1.6;
          color: #52526B;
          margin-bottom: 30px;
        }

        /* Segmented Capsule Toggle */
        .pricing-toggle-wrapper {
          display: flex;
          justify-content: center;
        }

        .pricing-toggle-capsule {
          position: relative;
          display: inline-flex;
          align-items: center;
          padding: 5px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(23, 23, 43, 0.08);
          box-shadow: 0 10px 26px -8px rgba(43, 47, 217, 0.14), inset 0 1px 1px #FFFFFF;
        }

        .toggle-btn {
          border: none;
          background: transparent;
          padding: 9px 20px;
          border-radius: 9999px;
          font-size: 0.88rem;
          font-weight: 600;
          color: #6B7280;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .toggle-btn.is-active {
          color: #FFFFFF;
          background: #2B2FD9;
          box-shadow: 0 4px 14px rgba(43, 47, 217, 0.4);
        }

        .save-badge {
          background: #D2F64C;
          color: #111827;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 5px 10px;
          border-radius: 9999px;
          margin-left: 6px;
          letter-spacing: 0.02em;
        }

        /* 3-Card Plans Grid */
        .pricing-plans-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          align-items: stretch;
          margin-bottom: 36px;
        }

        @media (min-width: 980px) {
          .pricing-plans-grid {
            grid-template-columns: 1fr 1.14fr 1fr;
            gap: 20px;
            align-items: stretch;
          }
        }

        .pricing-card {
          position: relative;
          background: #FFFFFF;
          border-radius: 28px;
          padding: 34px 28px 30px;
          border: 1px solid rgba(23, 23, 43, 0.06);
          box-shadow: 0 18px 42px -16px rgba(27, 31, 100, 0.08);
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }

        .pricing-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 24px 50px -12px rgba(27, 31, 100, 0.14);
        }

        .plan-label {
          font-size: 0.78rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #6B7280;
          margin-bottom: 12px;
          display: block;
        }

        .price-row {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-bottom: 12px;
        }

        .currency {
          font-size: 1.6rem;
          font-weight: 700;
          color: #111827;
        }

        .amount {
          font-size: clamp(2.4rem, 4vw, 3.2rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          color: #111827;
          line-height: 1;
        }

        .frequency {
          font-size: 0.88rem;
          font-weight: 500;
          color: #6B7280;
          margin-left: 4px;
        }

        .plan-summary {
          font-size: 0.92rem;
          line-height: 1.5;
          color: #52526B;
          margin-bottom: 24px;
          min-height: 48px;
        }

        .plan-cta-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 22px;
          border-radius: 9999px;
          font-size: 0.92rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .cta-outline {
          background: rgba(255, 255, 255, 0.85);
          border: 1.5px solid rgba(43, 47, 217, 0.2);
          color: #2B2FD9;
        }

        .cta-outline:hover {
          border-color: #2B2FD9;
          background: rgba(43, 47, 217, 0.04);
        }

        .fine-print {
          font-size: 0.74rem;
          color: #9CA3AF;
          text-align: center;
          margin-top: 8px;
          margin-bottom: 20px;
        }

        .divider-line {
          height: 1px;
          background: rgba(0, 0, 0, 0.06);
          margin-bottom: 22px;
        }

        .features-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .features-list li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.88rem;
          line-height: 1.45;
          color: #374151;
        }

        .check-icon-box {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(43, 47, 217, 0.1);
          color: #2B2FD9;
          display: flex;
          align-items: center;
          justifyContent: center;
          flex-shrink: 0;
          margin-top: 1px;
        }

        /* HERO CARD: Dots Unlimited (Elevated Liquid Blue) */
        .card-unlimited {
          background: radial-gradient(120% 90% at 100% 0%, #3B40F5 0%, transparent 60%),
                      radial-gradient(90% 80% at 0% 100%, #1518A8 0%, transparent 65%),
                      #2529CA;
          color: #FFFFFF;
          border: 1px solid rgba(255, 255, 255, 0.25);
          box-shadow: 0 34px 74px -18px rgba(35, 40, 195, 0.45);
          overflow: visible;
          isolation: isolate;
        }

        @media (min-width: 980px) {
          .card-unlimited {
            margin-top: -14px;
            margin-bottom: -14px;
            padding-top: 42px;
            padding-bottom: 38px;
          }
        }

        .floating-hero-badge {
          position: absolute;
          top: -14px;
          right: 28px;
          background: #D2F64C;
          color: #111827;
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 6px 14px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          gap: 5px;
          box-shadow: 0 6px 18px rgba(163, 230, 53, 0.45), 0 2px 4px rgba(0, 0, 0, 0.1);
          z-index: 10;
        }

        /* Drift fields animated ambient glowing shapes */
        .drift-fields {
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          overflow: hidden;
          border-radius: 28px;
        }

        .drift-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(44px);
          animation: orbDrift 20s ease-in-out infinite alternate;
        }

        .d1 {
          width: 70%;
          aspect-ratio: 1;
          left: -15%;
          top: -20%;
          background: #6858FF;
          opacity: 0.6;
        }

        .d2 {
          width: 60%;
          aspect-ratio: 1;
          right: -20%;
          top: 35%;
          background: #38BDF8;
          opacity: 0.35;
          animation-duration: 26s;
        }

        .d3 {
          width: 50%;
          aspect-ratio: 1;
          left: 20%;
          bottom: -20%;
          background: #D2F64C;
          opacity: 0.25;
          animation-duration: 30s;
        }

        @keyframes orbDrift {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(8%, 6%, 0) scale(1.12); }
          100% { transform: translate3d(-6%, 4%, 0) scale(0.95); }
        }

        .plan-label-hero {
          font-size: 0.78rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: rgba(255, 255, 255, 0.85);
          margin-bottom: 12px;
          display: block;
        }

        .hero-price .currency,
        .hero-price .amount {
          color: #FFFFFF;
        }

        .hero-price .frequency {
          color: rgba(255, 255, 255, 0.8);
        }

        .hero-summary {
          color: rgba(255, 255, 255, 0.9);
        }

        .cta-hero {
          background: #FFFFFF;
          color: #2529CA;
          box-shadow: 0 10px 26px -6px rgba(0, 0, 0, 0.35);
        }

        .cta-hero:hover {
          background: #F3F4F6;
          transform: translateY(-1px);
          box-shadow: 0 14px 30px -4px rgba(0, 0, 0, 0.4);
        }

        .hero-fine {
          color: rgba(255, 255, 255, 0.7);
        }

        .hero-divider {
          background: rgba(255, 255, 255, 0.18);
        }

        .hero-list li {
          color: rgba(255, 255, 255, 0.96);
        }

        .hero-check {
          background: #D2F64C;
          color: #111827;
        }

        /* Trust Strip */
        .pricing-trust-strip {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 16px clamp(20px, 3.5vw, 40px);
          margin-bottom: clamp(54px, 7vw, 84px);
          padding: 18px 24px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(23, 23, 43, 0.05);
        }

        .trust-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.84rem;
          font-weight: 600;
          color: #4B5563;
        }

        /* COMPARISON TABLE */
        .comparison-section {
          margin-bottom: clamp(60px, 8vw, 96px);
        }

        .comparison-card {
          background: #FFFFFF;
          border-radius: 32px;
          border: 1px solid rgba(23, 23, 43, 0.06);
          box-shadow: 0 20px 50px -16px rgba(27, 31, 100, 0.07);
          position: relative;
        }

        .comparison-head-row {
          position: sticky;
          top: 76px;
          z-index: 25;
          display: grid;
          grid-template-columns: 2fr 1fr 1.2fr 1fr;
          align-items: center;
          padding: 16px 28px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-top-left-radius: 32px;
          border-top-right-radius: 32px;
          border-bottom: 1px solid rgba(23, 23, 43, 0.08);
          box-shadow: 0 8px 24px -4px rgba(27, 31, 100, 0.08);
        }

        .cmp-title-col h3 {
          font-size: 1.15rem;
          font-weight: 800;
          color: #111827;
          margin: 0 0 2px;
        }

        .cmp-title-col p {
          font-size: 0.8rem;
          color: #6B7280;
          margin: 0;
        }

        .cmp-col-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .col-plan-name {
          font-size: 0.95rem;
          font-weight: 800;
          color: #1F2937;
        }

        .col-plan-price {
          font-size: 0.78rem;
          font-weight: 600;
          color: #6B7280;
        }

        .feat-header .col-plan-name {
          color: #2B2FD9;
        }

        .feat-header .col-plan-price {
          color: #2B2FD9;
          font-weight: 700;
        }

        .col-featured-tag {
          font-size: 0.6rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          padding: 2px 7px;
          border-radius: 9999px;
          background: #D2F64C;
          color: #111827;
          margin-bottom: 2px;
        }

        .cmp-group-heading {
          background: #F3F5FC;
          padding: 12px 28px;
          font-size: 0.76rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #4B5563;
        }

        .cmp-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1.2fr 1fr;
          align-items: center;
          padding: 16px 28px;
          border-bottom: 1px solid rgba(23, 23, 43, 0.04);
        }

        .cmp-row:last-child {
          border-bottom: none;
          border-bottom-left-radius: 32px;
          border-bottom-right-radius: 32px;
        }

        .cmp-feature-name {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1F2937;
        }

        .cmp-val {
          text-align: center;
          font-size: 0.88rem;
          color: #4B5563;
        }

        .feat-val {
          color: #2B2FD9;
        }

        .font-bold {
          font-weight: 700;
        }

        .text-muted {
          color: #D1D5DB;
        }

        @media (max-width: 720px) {
          .comparison-head-row,
          .cmp-row {
            grid-template-columns: 1.6fr 1fr 1fr 1fr;
            padding: 14px 16px;
          }
          .cmp-group-heading {
            padding: 10px 16px;
          }
        }

        /* FAQ SECTION */
        .pricing-faq-section {
          margin-bottom: clamp(60px, 8vw, 96px);
        }

        .faq-header {
          text-align: center;
          max-width: 600px;
          margin-inline: auto;
          margin-bottom: 36px;
        }

        .faq-tag {
          font-size: 0.74rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: #2B2FD9;
          margin-bottom: 8px;
          display: block;
        }

        .faq-title {
          font-size: clamp(1.8rem, 3.2vw, 2.5rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #111827;
        }

        .faq-accordion-container {
          max-width: 820px;
          margin-inline: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .faq-card {
          background: #FFFFFF;
          border-radius: 20px;
          border: 1px solid rgba(23, 23, 43, 0.05);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.02);
          overflow: hidden;
          transition: border-color 0.18s ease;
        }

        .faq-card.is-open {
          border-color: rgba(43, 47, 217, 0.3);
        }

        .faq-question-btn {
          width: 100%;
          border: none;
          background: transparent;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-align: left;
          font-size: 1rem;
          font-weight: 700;
          color: #111827;
          cursor: pointer;
        }

        .chevron-icon {
          color: #6B7280;
          transition: transform 0.22s ease;
          flex-shrink: 0;
        }

        .chevron-icon.rotate {
          transform: rotate(180deg);
          color: #2B2FD9;
        }

        .faq-answer-panel {
          padding: 0 24px 22px;
          font-size: 0.92rem;
          line-height: 1.6;
          color: #52526B;
        }

        .faq-answer-panel p {
          margin: 0;
        }

        /* BOTTOM CTA */
        .pricing-bottom-cta {
          text-align: center;
          padding: clamp(48px, 6vw, 72px) clamp(24px, 4vw, 48px);
          border-radius: 36px;
          background: radial-gradient(110% 90% at 50% 0%, #2024BD 0%, #171A8E 100%);
          color: #FFFFFF;
          box-shadow: 0 30px 70px -20px rgba(32, 36, 189, 0.45);
        }

        .cta-dots-mark {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        .bottom-cta-heading {
          font-size: clamp(2rem, 3.6vw, 2.8rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-bottom: 12px;
        }

        .bottom-cta-desc {
          font-size: 1.05rem;
          color: rgba(255, 255, 255, 0.82);
          max-width: 580px;
          margin-inline: auto;
          margin-bottom: 28px;
          line-height: 1.55;
        }

        .bottom-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          border-radius: 9999px;
          background: #D2F64C;
          color: #111827;
          font-size: 0.96rem;
          font-weight: 800;
          text-decoration: none;
          box-shadow: 0 10px 24px -4px rgba(210, 246, 76, 0.4);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .bottom-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px -4px rgba(210, 246, 76, 0.55);
        }
      `}</style>
    </div>
  );
};
