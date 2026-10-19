import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2, AlertCircle, Sparkles, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const WaitlistSection: React.FC = () => {
  const { signInWithOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
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
      const res = await signInWithOtp(email.trim());
      if (res.success) {
        setStatus('success');
        setMessage(`We sent a magic sign-in link to ${email.trim()}. Check your inbox or spam folder!`);
      } else {
        setStatus('error');
        setMessage(res.message || 'Could not dispatch sign-in email. Please try signing in directly with password.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Authentication service error. Try signing in on the sign-in page.');
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
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={14} color="#C9F455" />
            <span>LIVE ADAPTIVE ENGINE</span>
          </div>

          {/* Title */}
          <h2
            style={{
              fontSize: 'clamp(2.2rem, 4.2vw, 3.6rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.04em',
              color: '#FFFFFF',
              marginBottom: '14px',
            }}
          >
            Start Using Dots Today
          </h2>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '1.05rem',
              color: 'rgba(255, 255, 255, 0.88)',
              lineHeight: 1.6,
              maxWidth: '580px',
              margin: '0 auto 28px',
            }}
          >
            Sign in with a real magic link to sync your schedules across Web and Telegram, or jump right into the live app.
          </p>

          {/* Real Supabase Magic Link Form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            style={{
              width: '100%',
              maxWidth: '540px',
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
              placeholder="Enter your email to receive sign-in link"
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
              <span>{status === 'submitting' ? 'Sending link...' : 'Get Magic Link'}</span>
              <ArrowRight size={15} />
            </button>
          </form>

          {/* Status Feedback */}
          {status !== 'idle' && (
            <div
              style={{
                marginTop: '16px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: status === 'success' ? '#C9F455' : '#FECACA',
                background: status === 'success' ? 'rgba(201, 244, 85, 0.12)' : 'rgba(239, 68, 68, 0.15)',
                padding: '8px 16px',
                borderRadius: '12px',
                border: `1px solid ${status === 'success' ? 'rgba(201, 244, 85, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                maxWidth: '540px',
              }}
            >
              {status === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{message}</span>
            </div>
          )}

          {/* Instant Direct Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginTop: '28px',
              flexWrap: 'wrap',
            }}
          >
            <a
              href="#app"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#FFFFFF',
                color: '#252BD5',
                fontWeight: 700,
                fontSize: '0.88rem',
                padding: '10px 22px',
                borderRadius: '9999px',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.18s ease',
              }}
            >
              <span>Open Web App</span>
              <ArrowRight size={15} />
            </a>

            <a
              href="#signin"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.14)',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.88rem',
                padding: '10px 20px',
                borderRadius: '9999px',
                textDecoration: 'none',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <span>Sign In with Password</span>
            </a>

            <a
              href="https://t.me/DotsPersonalPlannerBot"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.14)',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '0.88rem',
                padding: '10px 20px',
                borderRadius: '9999px',
                textDecoration: 'none',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Send size={14} />
              <span>Telegram Bot</span>
            </a>
          </div>

          {/* Footnote */}
          <div
            style={{
              fontSize: '0.74rem',
              color: 'rgba(255, 255, 255, 0.65)',
              marginTop: '20px',
            }}
          >
            Secured by Supabase Auth · Deterministic replanning engine active
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
