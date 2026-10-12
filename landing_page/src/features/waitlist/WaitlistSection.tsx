import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { dotsAdapter } from '../../lib/api/client';
import { WaitlistStatus } from '../../domain/waitlist';

export const WaitlistSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<WaitlistStatus>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
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
    <section
      id="early-access"
      style={{
        paddingBlock: '60px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className="SectionCanvas" style={{ maxWidth: '1440px', position: 'relative' }}>
        {/* Master Cobalt Organic Puddle Silhouette */}
        <div
          className="early-access-puddle"
          style={{
            background: 'linear-gradient(135deg, #363CE8 0%, #252BD5 100%)',
            borderRadius: '44px',
            padding: '64px 48px',
            boxShadow: '0 24px 64px -10px rgba(37, 43, 213, 0.4)',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          {/* Subtle Constellation Arc Graphics on Right */}
          <div
            className="puddle-constellation"
            style={{
              position: 'absolute',
              top: '20px',
              right: '40px',
              bottom: '20px',
              width: '180px',
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-end',
            }}
          >
            <svg
              width="180"
              height="180"
              viewBox="0 0 180 180"
              fill="none"
              style={{ position: 'absolute', top: '10px', right: '0' }}
            >
              <path
                d="M 10 160 C 80 140, 140 80, 160 20"
                stroke="rgba(255, 255, 255, 0.35)"
                strokeWidth="1.5"
                strokeDasharray="4 6"
              />
              <circle cx="80" cy="110" r="7" fill="#C9F455" />
              <circle cx="80" cy="110" r="14" fill="#C9F455" fillOpacity="0.25" />
              <circle cx="140" cy="50" r="5" fill="#4338F2" />
            </svg>
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                fontSize: '0.64rem',
                fontWeight: 800,
                letterSpacing: '0.14em',
                color: 'rgba(255, 255, 255, 0.45)',
                lineHeight: 1.6,
                textAlign: 'right',
              }}
            >
              <div>PLANS</div>
              <div>ADAPT</div>
              <div>LIFE FLOWS</div>
            </div>
          </div>

          {/* Eyebrow */}
          <div
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(255, 255, 255, 0.75)',
              marginBottom: '12px',
            }}
          >
            A MORE BALANCED YOU
          </div>

          {/* Title */}
          <h2
            style={{
              fontSize: 'clamp(2.4rem, 4.4vw, 3.8rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.04em',
              color: '#FFFFFF',
              marginBottom: '14px',
            }}
          >
            Get Early Access
          </h2>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '1.08rem',
              color: 'rgba(255, 255, 255, 0.88)',
              lineHeight: 1.6,
              maxWidth: '560px',
              margin: '0 auto 32px',
            }}
          >
            Be the first to experience a calmer, more flexible way to plan your week with Dots.
          </p>

          {/* Email Input Form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            style={{
              width: '100%',
              maxWidth: '520px',
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.16)',
              backdropFilter: 'blur(16px)',
              borderRadius: '9999px',
              padding: '6px 6px 6px 18px',
              border: '1px solid rgba(255, 255, 255, 0.28)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            }}
          >
            <label className="sr-only" htmlFor="waitlist-email">Email address</label>
            <Mail size={18} color="rgba(255, 255, 255, 0.7)" style={{ flexShrink: 0, marginRight: '10px' }} />
            <input
              id="waitlist-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status !== 'idle') setStatus('idle');
              }}
              placeholder="Enter your email"
              disabled={status === 'submitting'}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#FFFFFF',
                fontSize: '0.92rem',
                flex: 1,
              }}
              className="waitlist-email-input"
            />
            <button
              type="submit"
              disabled={status === 'submitting'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#C9F455',
                color: '#17172B',
                fontWeight: 700,
                fontSize: '0.88rem',
                padding: '12px 24px',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(201, 244, 85, 0.4)',
                transition: 'transform 0.15s ease',
                flexShrink: 0,
              }}
            >
              <span>{status === 'submitting' ? 'Joining...' : 'Get Early Access'}</span>
              <ArrowRight size={15} />
            </button>
          </form>

          {/* Status Feedback */}
          {status !== 'idle' && (
            <div
              style={{
                marginTop: '14px',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: status === 'success' ? '#C9F455' : '#FECACA',
              }}
            >
              {status === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{message}</span>
            </div>
          )}

          {/* Footnote */}
          <div
            style={{
              fontSize: '0.74rem',
              color: 'rgba(255, 255, 255, 0.65)',
              marginTop: '16px',
            }}
          >
            No spam. Just progress.
          </div>
        </div>
      </div>

      <style>{`
        .waitlist-email-input::placeholder {
          color: rgba(255, 255, 255, 0.65) !important;
        }
        @media (max-width: 640px) {
          .puddle-constellation {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
};
