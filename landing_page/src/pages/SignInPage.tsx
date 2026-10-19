import React, { useState } from 'react';
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  Lock,
  ExternalLink,
  RefreshCw,
  User,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { DotsLogo } from '../components/brand/DotsLogo';
import { GoogleIcon } from '../components/brand/GoogleIcon';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface SignInPageProps {
  onBackToHome?: () => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onBackToHome }) => {
  const { signInWithEmail, signUpWithEmail, signInWithOtp } = useAuth();

  const [authMode, setAuthMode] = useState<'password' | 'magic-link'>('password');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('anwarmousa100@gmail.com');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!email || !email.includes('@')) {
      setAuthError('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      setAuthError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        const ok = await signUpWithEmail(email.trim(), password, displayName.trim());
        if (ok) {
          window.location.hash = '#app';
        } else {
          setAuthError('Sign up failed. Please check your credentials or try signing in.');
        }
      } else {
        const ok = await signInWithEmail(email.trim(), password);
        if (ok) {
          window.location.hash = '#app';
        } else {
          setAuthError('Invalid email or password. If you do not have an account, click "Create an account".');
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!email || !email.includes('@')) {
      setAuthError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const res = await signInWithOtp(email.trim());
      if (res.success) {
        setIsSubmitted(true);
      } else {
        setAuthError(res.message);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Could not send magic link.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/#app`,
        },
      });
      if (error) {
        if (error.message.includes('not enabled')) {
          setAuthError(
            'Google Sign-In is not enabled yet in your Supabase dashboard (requires Google Cloud OAuth keys). Please enter your password below to sign in instantly.'
          );
        } else {
          setAuthError(error.message);
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Google sign in failed');
    } finally {
      setIsLoading(false);
    }
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

        {/* Focused Centered Auth Card */}
        <div className="signin-glass-card">
          <div className="specular-line" aria-hidden="true" />

          <div className="signin-form-panel">
            {!isSubmitted ? (
              <>
                <div className="form-heading-group">
                  <div className="form-brand-mark">
                    <DotsLogo size={36} showWordmark={false} />
                  </div>
                  <h1 className="form-title">
                    {authMode === 'password' && isSignUp ? 'Create your Account' : 'Sign in to Dots'}
                  </h1>
                  <p className="form-subtitle">
                    {authMode === 'password' && isSignUp
                      ? 'Sign up in seconds to start managing your daily horizons.'
                      : 'Keep your plan in sync across Web & Telegram.'}
                  </p>
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
                  <span className="divider-label">or continue with email</span>
                  <div className="divider-hairline" />
                </div>

                {/* Auth Mode Tabs (Password vs Magic Link) */}
                <div
                  style={{
                    display: 'flex',
                    background: '#F3F4F6',
                    padding: '4px',
                    borderRadius: '9999px',
                    marginBottom: '18px',
                    gap: '4px',
                  }}
                  role="tablist"
                  aria-label="Authentication method"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('password');
                      setAuthError(null);
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 14px',
                      borderRadius: '9999px',
                      border: 'none',
                      background: authMode === 'password' ? '#FFFFFF' : 'transparent',
                      color: authMode === 'password' ? '#2B2FD9' : '#6B7280',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      boxShadow: authMode === 'password' ? '0 2px 6px rgba(0, 0, 0, 0.06)' : 'none',
                      transition: 'all 0.18s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <KeyRound size={14} />
                    <span>Password</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('magic-link');
                      setAuthError(null);
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 14px',
                      borderRadius: '9999px',
                      border: 'none',
                      background: authMode === 'magic-link' ? '#FFFFFF' : 'transparent',
                      color: authMode === 'magic-link' ? '#2B2FD9' : '#6B7280',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      boxShadow: authMode === 'magic-link' ? '0 2px 6px rgba(0, 0, 0, 0.06)' : 'none',
                      transition: 'all 0.18s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <Mail size={14} />
                    <span>Magic Link</span>
                  </button>
                </div>

                {/* Error Notice */}
                {authError && (
                  <div
                    style={{
                      padding: '10px 14px',
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      borderRadius: '12px',
                      color: '#DC2626',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      marginBottom: '14px',
                      lineHeight: 1.45,
                    }}
                  >
                    {authError}
                  </div>
                )}

                {/* Password Auth Form */}
                {authMode === 'password' ? (
                  <form onSubmit={handlePasswordSubmit} className="email-auth-form" noValidate>
                    {isSignUp && (
                      <div className="input-field-group">
                        <label htmlFor="signin-name" className="input-label">
                          Your Name
                        </label>
                        <div className="input-wrapper">
                          <User size={17} className="input-leading-icon" />
                          <input
                            id="signin-name"
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Anwar"
                            className="email-input"
                            autoComplete="name"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    )}

                    <div className="input-field-group">
                      <label htmlFor="signin-email" className="input-label">
                        Email Address
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
                          className="email-input"
                          autoComplete="email"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="input-field-group">
                      <label htmlFor="signin-password" className="input-label">
                        Password
                      </label>
                      <div className="input-wrapper">
                        <Lock size={17} className="input-leading-icon" />
                        <input
                          id="signin-password"
                          type="password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (authError) setAuthError(null);
                          }}
                          placeholder="••••••••"
                          className="email-input"
                          autoComplete={isSignUp ? 'new-password' : 'current-password'}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !email.trim() || !password}
                      className="email-submit-btn"
                    >
                      {isLoading ? (
                        <span className="btn-loading-state">
                          <RefreshCw size={16} className="spin-icon" />
                          <span>{isSignUp ? 'Creating account...' : 'Signing in...'}</span>
                        </span>
                      ) : (
                        <>
                          <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                          <ArrowRight size={16} strokeWidth={2.4} />
                        </>
                      )}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUp(!isSignUp);
                          setAuthError(null);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#2B2FD9',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          padding: '6px 10px',
                        }}
                      >
                        {isSignUp
                          ? 'Already have an account? Sign in here'
                          : "Don't have an account? Create one"}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Magic Link Form */
                  <form onSubmit={handleMagicLinkSubmit} className="email-auth-form" noValidate>
                    <div className="input-field-group">
                      <label htmlFor="signin-magic-email" className="input-label">
                        Email Address
                      </label>
                      <div className="input-wrapper">
                        <Mail size={17} className="input-leading-icon" />
                        <input
                          id="signin-magic-email"
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (authError) setAuthError(null);
                          }}
                          placeholder="you@domain.com"
                          className="email-input"
                          autoComplete="email"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <p style={{ fontSize: '0.80rem', color: '#6B7280', margin: '0 0 6px', lineHeight: 1.45 }}>
                      We will send a secure single-use sign-in link to your email via Supabase.
                    </p>

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
                          <span>Send Magic Sign-In Link</span>
                          <ArrowRight size={16} strokeWidth={2.4} />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Direct Dashboard Link */}
                <div style={{ marginTop: '14px', textAlign: 'center' }}>
                  <a
                    href="#app"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%',
                      background: 'rgba(43, 47, 217, 0.06)',
                      color: '#2B2FD9',
                      border: '1px solid rgba(43, 47, 217, 0.18)',
                      padding: '11px 18px',
                      borderRadius: '9999px',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      textDecoration: 'none',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <span>Open Live Dashboard</span>
                    <ArrowRight size={15} />
                  </a>
                </div>

                {/* Footer security note */}
                <div className="form-footer-meta" style={{ marginTop: '16px' }}>
                  <div className="security-guarantee">
                    <Sparkles size={13} color="#2B2FD9" />
                    <span>Linked to Telegram bot @DotsPersonalPlannerBot</span>
                  </div>
                </div>
              </>
            ) : (
              /* Success / Magic Link Sent View */
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
                  <br />
                  <span style={{ fontSize: '0.80rem', color: '#6B7280', marginTop: '6px', display: 'inline-block' }}>
                    Note: If the email doesn't arrive in 1-2 minutes, check your Spam folder or switch to Password login below.
                  </span>
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
                    onClick={() => {
                      setIsSubmitted(false);
                      setAuthMode('password');
                    }}
                    className="resend-link-btn"
                    style={{ fontWeight: 700, color: '#2B2FD9' }}
                  >
                    <span>Use Password Sign In Instead</span>
                  </button>

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
                  <span>Didn’t get it? Check your spam folder or try password sign-in.</span>
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
          width: 540px;
          height: 540px;
          top: -140px;
          right: 25%;
          background: radial-gradient(circle, rgba(43, 47, 217, 0.20) 0%, rgba(43, 47, 217, 0) 70%);
        }

        .orb-bottom {
          width: 480px;
          height: 480px;
          bottom: -100px;
          left: 20%;
          background: radial-gradient(circle, rgba(67, 70, 226, 0.18) 0%, rgba(67, 70, 226, 0) 70%);
        }

        .orb-lime {
          width: 400px;
          height: 400px;
          top: 30%;
          left: 50%;
          background: radial-gradient(circle, rgba(210, 246, 76, 0.20) 0%, rgba(210, 246, 76, 0) 70%);
        }

        .signin-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 460px;
          margin-inline: auto;
        }

        .signin-topbar {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          margin-bottom: 20px;
          padding-inline: 4px;
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

        /* Centered Glass Card */
        .signin-glass-card {
          position: relative;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(36px) saturate(180%);
          -webkit-backdrop-filter: blur(36px) saturate(180%);
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.95);
          box-shadow:
            0 24px 60px -12px rgba(28, 32, 115, 0.14),
            0 6px 18px -3px rgba(0, 0, 0, 0.03),
            inset 0 1.5px 2px rgba(255, 255, 255, 1);
          overflow: hidden;
        }

        .specular-line {
          position: absolute;
          top: 0;
          left: 24px;
          right: 24px;
          height: 1px;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 100%);
          pointer-events: none;
        }

        /* Form Panel */
        .signin-form-panel {
          padding: clamp(28px, 4vw, 40px) clamp(22px, 3.5vw, 36px);
          display: flex;
          flex-direction: column;
          justifyContent: center;
        }

        .form-heading-group {
          text-align: center;
          margin-bottom: 22px;
        }

        .form-brand-mark {
          display: flex;
          justifyContent: center;
          margin-bottom: 12px;
        }

        .form-title {
          font-size: clamp(1.4rem, 2.4vw, 1.75rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #111827;
          margin-bottom: 6px;
        }

        .form-subtitle {
          font-size: 0.86rem;
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
          padding: 12px 20px;
          border-radius: 9999px;
          font-size: 0.92rem;
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
          gap: 14px;
          margin: 18px 0;
        }

        .divider-hairline {
          flex: 1;
          height: 1px;
          background: #E5E7EB;
        }

        .divider-label {
          font-size: 0.74rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #9CA3AF;
        }

        /* Form Fields */
        .email-auth-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .input-field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-label {
          font-size: 0.80rem;
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
          left: 14px;
          color: #9CA3AF;
          pointer-events: none;
        }

        .email-input {
          width: 100%;
          background: #F9FAFB;
          border: 1.5px solid #E5E7EB;
          border-radius: 12px;
          padding: 11px 16px 11px 42px;
          font-size: 0.88rem;
          color: #111827;
          outline: none;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .email-input:focus {
          background: #FFFFFF;
          border-color: #2B2FD9;
          box-shadow: 0 0 0 3px rgba(43, 47, 217, 0.12);
        }

        .email-input::placeholder {
          color: #9CA3AF;
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
          border: none;
          font-size: 0.92rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(43, 47, 217, 0.28);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          margin-top: 4px;
        }

        .email-submit-btn:hover:not(:disabled) {
          background: #2327B8;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(43, 47, 217, 0.36);
        }

        .email-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .email-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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

        .form-footer-meta {
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: center;
          text-align: center;
        }

        .security-guarantee {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.74rem;
          color: #6B7280;
          font-weight: 500;
        }

        /* Magic Link Sent View */
        .magic-link-sent-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 12px 4px;
        }

        .sent-icon-container {
          position: relative;
          width: 68px;
          height: 68px;
          border-radius: 50%;
          background: rgba(43, 47, 217, 0.08);
          display: flex;
          align-items: center;
          justifyContent: center;
          margin-bottom: 18px;
        }

        .sent-pulse-ring {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 1.5px solid rgba(43, 47, 217, 0.25);
          animation: pulseRing 2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }

        @keyframes pulseRing {
          0% { transform: scale(0.9); opacity: 1; }
          100% { transform: scale(1.25); opacity: 0; }
        }

        .sent-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: #111827;
          margin-bottom: 8px;
        }

        .sent-desc {
          font-size: 0.88rem;
          color: #4B5563;
          line-height: 1.5;
          margin-bottom: 8px;
        }

        .sent-email-highlight {
          color: #2B2FD9;
          word-break: break-all;
        }

        .sent-instructions {
          font-size: 0.82rem;
          color: #6B7280;
          line-height: 1.5;
          max-width: 340px;
          margin-bottom: 22px;
        }

        .sent-action-buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }

        .open-gmail-btn {
          display: flex;
          align-items: center;
          justifyContent: center;
          gap: 8px;
          background: #2B2FD9;
          color: #FFFFFF;
          padding: 12px 20px;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 0.88rem;
          text-decoration: none;
          box-shadow: 0 4px 14px rgba(43, 47, 217, 0.28);
          transition: all 0.2s ease;
        }

        .open-gmail-btn:hover {
          background: #2327B8;
          transform: translateY(-1px);
        }

        .resend-link-btn {
          background: transparent;
          border: none;
          color: #6B7280;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          padding: 6px;
          transition: color 0.15s ease;
        }

        .resend-link-btn:hover {
          color: #111827;
        }
      `}</style>
    </div>
  );
};
