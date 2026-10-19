import React, { useState, useEffect, useRef } from 'react';
import { DotsLogo } from '../brand/DotsLogo';
import { ArrowRight, Menu, X, UserRound, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface FloatingNavbarProps {
  onCtaClick?: () => void;
}

export const FloatingNavbar: React.FC<FloatingNavbarProps> = () => {
  const { user, dotsUser, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState(() => (typeof window !== 'undefined' ? window.location.hash : ''));
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const hash = window.location.hash;
      if (
        hash === '#pricing' ||
        hash === '#signin' ||
        hash === '#login' ||
        hash === '#privacy' ||
        hash === '#terms'
      ) {
        return;
      }

      const scrollPos = window.scrollY + 200;
      const ids = ['faq', 'channels', 'how-it-works', 'product'];
      let matched = '';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPos) {
          matched = `#${id}`;
          break;
        }
      }
      setCurrentHash(matched);
    };
    const handleHash = () => {
      setCurrentHash(window.location.hash);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (profileOpen) setProfileOpen(false);
        if (mobileOpen) setMobileOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('hashchange', handleHash);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileOpen, profileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header
      className="floating-navbar-header"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: scrolled ? '10px 16px' : '14px 16px',
        width: '100%',
        pointerEvents: 'none',
        transition: 'padding 0.25s ease',
      }}
    >
      <nav
        aria-label="Main Navigation"
        className={`liquid-glass-nav ${scrolled ? 'is-scrolled' : ''}`}
        style={{
          pointerEvents: 'auto',
          maxWidth: scrolled ? '1040px' : '1080px',
          height: scrolled ? '56px' : '62px',
          marginInline: 'auto',
          borderRadius: '9999px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px 0 20px',
          position: 'relative',
          background: scrolled
            ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 255, 255, 0.74) 100%)'
            : 'linear-gradient(180deg, rgba(255, 255, 255, 0.80) 0%, rgba(255, 255, 255, 0.60) 100%)',
          backdropFilter: 'blur(32px) saturate(190%)',
          WebkitBackdropFilter: 'blur(32px) saturate(190%)',
          border: '1px solid rgba(255, 255, 255, 0.92)',
          boxShadow: scrolled
            ? '0 20px 48px -12px rgba(25, 28, 80, 0.13), 0 4px 12px -2px rgba(25, 28, 80, 0.05), inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 1), inset 0 -1px 2px 0 rgba(15, 23, 42, 0.04)'
            : '0 12px 36px -10px rgba(25, 28, 80, 0.07), 0 2px 6px rgba(0, 0, 0, 0.02), inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.95), inset 0 -1px 1px 0 rgba(15, 23, 42, 0.02)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Specular Liquid Top Reflection Line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '28px',
            right: '28px',
            height: '1px',
            background:
              'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.95) 25%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.95) 75%, rgba(255,255,255,0) 100%)',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />
        {/* Subsurface Glass Ambient Sheen */}
        <div
          style={{
            position: 'absolute',
            top: '1px',
            left: '14%',
            right: '14%',
            height: '8px',
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none',
            borderRadius: '9999px',
          }}
          aria-hidden="true"
        />

        {/* Brand Left */}
        <a
          href="#hero"
          aria-label="Dots Home"
          onClick={closeMobile}
          className="nav-brand-logo"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2 }}
        >
          <DotsLogo size={28} />
        </a>

        {/* Center Nav Links */}
        <ul
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            listStyle: 'none',
            margin: 0,
            padding: 0,
            zIndex: 1,
          }}
          className="desktop-nav-links"
        >
          <li>
            <a
              href="#product"
              className={`nav-link-pill ${currentHash === '#product' ? 'is-active' : ''}`}
            >
              Product
            </a>
          </li>
          <li>
            <a
              href="#how-it-works"
              className={`nav-link-pill ${currentHash === '#how-it-works' ? 'is-active' : ''}`}
            >
              How it works
            </a>
          </li>
          <li>
            <a
              href="#channels"
              className={`nav-link-pill ${currentHash === '#channels' ? 'is-active' : ''}`}
            >
              Integrations
            </a>
          </li>
          <li>
            <a
              href="#pricing"
              className={`nav-link-pill ${currentHash === '#pricing' ? 'is-active' : ''}`}
            >
              Pricing
            </a>
          </li>
          <li>
            <a
              href="#faq"
              className={`nav-link-pill ${currentHash === '#faq' ? 'is-active' : ''}`}
            >
              FAQ
            </a>
          </li>
        </ul>

        {/* Right Actions: [ Profile / Account Popover ] + [ Open App CTA ] */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 10,
          }}
          className="desktop-actions-group"
        >
          {/* Profile Trigger Container */}
          <div ref={profileRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className={`nav-profile-btn ${profileOpen ? 'is-active' : ''}`}
              aria-expanded={profileOpen}
              aria-haspopup="dialog"
              aria-label="Account"
              title={user ? (user.email || 'Account') : 'Sign In'}
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: user ? '#2B2FD9' : profileOpen ? '#2B2FD9' : '#374151',
                background: user ? 'rgba(43, 47, 217, 0.12)' : profileOpen ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)',
                border: user ? '1.5px solid rgba(43, 47, 217, 0.35)' : profileOpen ? '1px solid rgba(43, 47, 217, 0.4)' : '1px solid rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: profileOpen
                  ? '0 0 0 3px rgba(43, 47, 217, 0.15), 0 4px 14px rgba(25, 28, 80, 0.1)'
                  : '0 2px 6px rgba(0, 0, 0, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.95)',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                outline: 'none',
              }}
            >
              <UserRound size={17} strokeWidth={2.2} />
            </button>

            {/* Premium Liquid Glass Profile Popover */}
            {profileOpen && (
              <div
                className="profile-popover-card"
                role="dialog"
                aria-label="Account menu"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 14px)',
                  right: '-20px',
                  width: '316px',
                  padding: '24px 22px 20px',
                  borderRadius: '26px',
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFBFF 100%)',
                  border: '1px solid rgba(230, 235, 250, 0.95)',
                  boxShadow:
                    '0 26px 58px -10px rgba(28, 32, 115, 0.22), 0 8px 20px -4px rgba(0, 0, 0, 0.04), inset 0 1.5px 2px rgba(255, 255, 255, 1)',
                  textAlign: 'center',
                  zIndex: 100,
                  animation: 'popoverFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                }}
              >
                {/* Pointer Arrow pointing to profile button */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-7px',
                    right: '33px',
                    width: '13px',
                    height: '13px',
                    background: '#FFFFFF',
                    borderLeft: '1px solid rgba(230, 235, 250, 0.95)',
                    borderTop: '1px solid rgba(230, 235, 250, 0.95)',
                    transform: 'rotate(45deg)',
                  }}
                  aria-hidden="true"
                />

                {/* Dots Brand Mark */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                  <DotsLogo size={32} showWordmark={false} />
                </div>

                {user ? (
                  <>
                    <h3
                      style={{
                        fontSize: '1.15rem',
                        fontWeight: 800,
                        color: '#111827',
                        margin: '0 0 4px',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {dotsUser?.display_name || 'Dots Account'}
                    </h3>
                    <p
                      style={{
                        fontSize: '0.82rem',
                        color: '#6B7280',
                        margin: '0 0 16px',
                        wordBreak: 'break-all',
                      }}
                    >
                      {user.email}
                    </p>

                    {dotsUser?.telegram_chat_id ? (
                      <div
                        style={{
                          background: 'rgba(34, 197, 94, 0.08)',
                          color: '#166534',
                          border: '1px solid rgba(34, 197, 94, 0.2)',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          marginBottom: '14px',
                        }}
                      >
                        ✓ Connected to Telegram (@{dotsUser.telegram_username || dotsUser.telegram_chat_id})
                      </div>
                    ) : (
                      <div
                        style={{
                          background: 'rgba(234, 179, 8, 0.08)',
                          color: '#854D0E',
                          border: '1px solid rgba(234, 179, 8, 0.2)',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          marginBottom: '14px',
                        }}
                      >
                        Telegram not connected yet
                      </div>
                    )}

                    <a
                      href="#app"
                      onClick={() => setProfileOpen(false)}
                      style={{
                        display: 'block',
                        background: '#2B2FD9',
                        color: '#FFFFFF',
                        padding: '10px 18px',
                        borderRadius: '9999px',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        textDecoration: 'none',
                        boxShadow: '0 8px 20px -6px rgba(43, 47, 217, 0.45)',
                        marginBottom: '8px',
                      }}
                    >
                      Open App Dashboard
                    </a>

                    <button
                      type="button"
                      onClick={async () => {
                        await signOut();
                        setProfileOpen(false);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        color: '#DC2626',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        padding: '8px 12px',
                        cursor: 'pointer',
                        borderRadius: '8px',
                      }}
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <h3
                      style={{
                        fontSize: '1.24rem',
                        fontWeight: 800,
                        color: '#111827',
                        margin: '0 0 6px',
                        letterSpacing: '-0.03em',
                      }}
                    >
                      Welcome to Dots
                    </h3>
                    <p
                      style={{
                        fontSize: '0.86rem',
                        color: '#6B7280',
                        margin: '0 0 18px',
                        lineHeight: 1.45,
                      }}
                    >
                      Sign in to keep your plan in sync across Web & Telegram.
                    </p>

                    <a
                      href="#signin"
                      onClick={() => setProfileOpen(false)}
                      style={{
                        display: 'block',
                        background: '#2B2FD9',
                        color: '#FFFFFF',
                        padding: '11px 20px',
                        borderRadius: '9999px',
                        fontWeight: 700,
                        fontSize: '0.90rem',
                        textDecoration: 'none',
                        boxShadow: '0 8px 20px -6px rgba(43, 47, 217, 0.45)',
                        marginBottom: '10px',
                      }}
                      className="popover-sign-in-btn"
                    >
                      Sign in to Dots
                    </a>

                    <a
                      href="#app"
                      onClick={() => setProfileOpen(false)}
                      style={{
                        display: 'block',
                        background: 'rgba(43, 47, 217, 0.08)',
                        color: '#2B2FD9',
                        padding: '9px 16px',
                        borderRadius: '9999px',
                        fontWeight: 600,
                        fontSize: '0.84rem',
                        textDecoration: 'none',
                      }}
                    >
                      View Live App
                    </a>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Unified Primary CTA: Takes user straight into the app! */}
          <a
            href="#app"
            className="nav-cta-button"
            style={{
              background: 'linear-gradient(135deg, #373BE8 0%, #2024BC 100%)',
              color: '#FFFFFF',
              fontSize: '0.84rem',
              fontWeight: 600,
              padding: '8px 18px',
              borderRadius: '9999px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              justifyContent: 'center',
              transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 8px 20px -4px rgba(43, 47, 217, 0.42), inset 0 1px 1px rgba(255, 255, 255, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            <span>{user ? 'Open App' : 'Get started'}</span>
            <ArrowRight size={14} strokeWidth={2.4} className="nav-cta-arrow" />
          </a>
        </div>

        {/* Mobile Toggle Button */}
        <button
          type="button"
          className="mobile-nav-toggle"
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation menu"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: 'rgba(0, 0, 0, 0.04)',
            border: 'none',
            color: '#111827',
            padding: '8px',
            marginRight: '4px',
            cursor: 'pointer',
            display: 'none',
            borderRadius: '50%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Mobile Dropdown Menu */}
        {mobileOpen && (
          <div
            className="mobile-glass-dropdown"
            style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              left: '8px',
              right: '8px',
              padding: '22px 24px',
              borderRadius: '26px',
              background: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(32px) saturate(180%)',
              WebkitBackdropFilter: 'blur(32px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: '0 24px 50px -12px rgba(23, 23, 43, 0.16), 0 2px 8px rgba(0, 0, 0, 0.04)',
            }}
          >
            <a
              href="#product"
              className={`mobile-link ${currentHash === '#product' ? 'is-active' : ''}`}
              onClick={closeMobile}
            >
              Product
            </a>
            <a
              href="#how-it-works"
              className={`mobile-link ${currentHash === '#how-it-works' ? 'is-active' : ''}`}
              onClick={closeMobile}
            >
              How it works
            </a>
            <a
              href="#channels"
              className={`mobile-link ${currentHash === '#channels' ? 'is-active' : ''}`}
              onClick={closeMobile}
            >
              Integrations
            </a>
            <a
              href="#pricing"
              className={`mobile-link ${currentHash === '#pricing' ? 'is-active' : ''}`}
              onClick={closeMobile}
            >
              Pricing
            </a>
            <a
              href="#faq"
              className={`mobile-link ${currentHash === '#faq' ? 'is-active' : ''}`}
              onClick={closeMobile}
            >
              FAQ
            </a>
            <a
              href="#app"
              className={`mobile-link ${currentHash === '#app' ? 'is-active' : ''}`}
              onClick={closeMobile}
              style={{ color: '#2B2FD9', fontWeight: 700 }}
            >
              Launch App
            </a>
            <hr style={{ border: 'none', borderTop: '1px solid rgba(0, 0, 0, 0.06)', margin: '4px 0' }} />
            <a
              href="#signin"
              className="mobile-link"
              onClick={closeMobile}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <UserRound size={18} />
              <span>{user ? (dotsUser?.display_name || 'My Account') : 'Sign In'}</span>
            </a>
            <a
              href="#app"
              onClick={closeMobile}
              style={{
                background: '#2B2FD9',
                color: '#FFFFFF',
                fontSize: '0.92rem',
                fontWeight: 600,
                padding: '12px 20px',
                borderRadius: '9999px',
                textAlign: 'center',
                textDecoration: 'none',
                boxShadow: '0 8px 20px -6px rgba(43, 47, 217, 0.45)',
              }}
            >
              {user ? 'Open App Dashboard' : 'Get started'}
            </a>
          </div>
        )}
      </nav>

      <style>{`
        .desktop-nav-dock {
          transition: transform 0.2s ease;
        }
        .nav-brand-logo {
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .nav-brand-logo:hover {
          transform: scale(1.04);
        }
        .nav-link-pill {
          font-size: 0.875rem;
          font-weight: 500;
          color: #4B5563;
          text-decoration: none;
          padding: 8px 14px;
          border-radius: 9999px;
          transition: all 0.18s ease;
          display: inline-block;
          white-space: nowrap;
        }
        .nav-link-pill:hover {
          color: #111827;
          background: rgba(0, 0, 0, 0.045);
        }
        .nav-link-pill.is-active {
          color: #2B2FD9;
          font-weight: 600;
          background: rgba(43, 47, 217, 0.08);
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.8), 0 1px 3px rgba(43, 47, 217, 0.08);
        }
        .nav-profile-btn:hover {
          color: #111827 !important;
          background: #FFFFFF !important;
          transform: scale(1.04);
          box-shadow: 0 4px 12px rgba(25, 28, 80, 0.08) !important;
        }
        .nav-cta-button:hover {
          background: linear-gradient(135deg, #4347F0 0%, #2024BC 100%) !important;
          transform: translateY(-1px) scale(1.02);
          box-shadow: 0 12px 28px -4px rgba(43, 47, 217, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.45) !important;
        }
        .nav-cta-arrow {
          transition: transform 0.2s ease;
        }
        .nav-cta-button:hover .nav-cta-arrow {
          transform: translateX(3px);
        }
        .nav-cta-button:active {
          transform: translateY(0) scale(0.99);
        }
        .mobile-link {
          font-size: 0.96rem;
          font-weight: 600;
          color: #1F2937;
          text-decoration: none;
          padding: 8px 12px;
          border-radius: 9999px;
          transition: color 0.15s ease, background 0.15s ease;
        }
        .mobile-link.is-active {
          color: #2B2FD9;
          background: rgba(43, 47, 217, 0.07);
          box-shadow: inset 0 0 0 1px rgba(43, 47, 217, 0.12);
        }
        .mobile-link:hover {
          color: #2B2FD9;
        }
        @keyframes popoverFadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .popover-google-btn:hover {
          background: #F9FAFB !important;
          border-color: #D1D5DB !important;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08) !important;
          transform: translateY(-1px);
        }
        .popover-google-btn:active {
          transform: translateY(0);
          background: #F3F4F6 !important;
        }
        .popover-sign-in-btn:hover {
          background: #2024BC !important;
          transform: translateY(-1px);
          box-shadow: 0 12px 24px -6px rgba(43, 47, 217, 0.6) !important;
        }
        .popover-early-link:hover {
          text-decoration: underline;
          opacity: 0.85;
        }
        @media (max-width: 980px) {
          .desktop-nav-links,
          .desktop-actions-group {
            display: none !important;
          }
          .mobile-nav-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
};
