import React, { useState, useEffect, useRef } from 'react';
import { DotsLogo } from '../brand/DotsLogo';
import { GoogleIcon } from '../brand/GoogleIcon';
import { ArrowRight, Menu, X, UserRound, Lock } from 'lucide-react';

interface FloatingNavbarProps {
  onCtaClick?: () => void;
}

export const FloatingNavbar: React.FC<FloatingNavbarProps> = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState(() => (typeof window !== 'undefined' ? window.location.hash : ''));
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
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
          maxWidth: '1200px',
          height: scrolled ? '58px' : '64px',
          marginInline: 'auto',
          borderRadius: '9999px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px 0 22px',
          position: 'relative',
          background: scrolled
            ? 'rgba(255, 255, 255, 0.78)'
            : 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.85)',
          boxShadow: scrolled
            ? '0 20px 44px -12px rgba(25, 28, 80, 0.12), 0 2px 8px -2px rgba(25, 28, 80, 0.04), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.02)'
            : '0 10px 32px -10px rgba(25, 28, 80, 0.08), 0 1px 4px rgba(0, 0, 0, 0.02), inset 0 1px 1px 0 rgba(255, 255, 255, 0.9)',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Specular Liquid Top Reflection Line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '32px',
            right: '32px',
            height: '1px',
            background:
              'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0) 100%)',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />

        {/* Brand Left */}
        <a
          href="#hero"
          aria-label="Dots Home"
          onClick={closeMobile}
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2 }}
        >
          <DotsLogo size={28} />
        </a>

        {/* Center Nav Links (Mathematically Centered in Navbar) */}
        <ul
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
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
              href="#use-cases"
              className={`nav-link-pill ${currentHash === '#use-cases' ? 'is-active' : ''}`}
            >
              Use cases
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

        {/* Right Actions: [ profile icon ] + [ Get started ] */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
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
              title="Account"
              style={{
                width: 38,
                height: 38,
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: profileOpen ? '#2B2FD9' : '#17172B',
                background: profileOpen
                  ? 'rgba(255, 255, 255, 0.96)'
                  : 'rgba(255, 255, 255, 0.72)',
                border: profileOpen
                  ? '1px solid rgba(43, 47, 217, 0.35)'
                  : '1px solid rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: profileOpen
                  ? '0 0 0 3px rgba(43, 47, 217, 0.15), 0 4px 14px rgba(25, 28, 80, 0.1)'
                  : '0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.95)',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                outline: 'none',
              }}
            >
              <UserRound size={18} strokeWidth={2.2} />
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
                  right: '-60px',
                  width: '316px',
                  padding: '28px 24px 22px',
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
                    right: '73px',
                    width: '13px',
                    height: '13px',
                    background: '#FFFFFF',
                    borderLeft: '1px solid rgba(230, 235, 250, 0.95)',
                    borderTop: '1px solid rgba(230, 235, 250, 0.95)',
                    transform: 'rotate(45deg)',
                  }}
                  aria-hidden="true"
                />

                {/* Specular Liquid Edge Highlight Line */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '24px',
                    right: '24px',
                    height: '1px',
                    background:
                      'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 100%)',
                    pointerEvents: 'none',
                  }}
                  aria-hidden="true"
                />

                {/* Our Official Dots Brand Logo Mark */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
                  <DotsLogo size={32} showWordmark={false} />
                </div>

                {/* Heading */}
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

                {/* Subtitle */}
                <p
                  style={{
                    fontSize: '0.86rem',
                    color: '#6B7280',
                    margin: '0 0 18px',
                    lineHeight: 1.45,
                  }}
                >
                  Sign in to keep your plan in sync.
                </p>

                {/* Primary: Continue with Google Button */}
                <a
                  href="#early-access"
                  onClick={() => setProfileOpen(false)}
                  className="popover-google-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    background: '#FFFFFF',
                    color: '#1F2937',
                    padding: '11px 18px',
                    borderRadius: '9999px',
                    fontWeight: 600,
                    fontSize: '0.90rem',
                    textDecoration: 'none',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <GoogleIcon size={18} />
                  <span>Continue with Google</span>
                </a>

                {/* Subtle 'or' divider */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    margin: '12px 0',
                    color: '#9CA3AF',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                  aria-hidden="true"
                >
                  <div style={{ flex: 1, height: '1px', background: 'rgba(0, 0, 0, 0.08)' }} />
                  <span style={{ padding: '0 10px' }}>or</span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(0, 0, 0, 0.08)' }} />
                </div>

                {/* Secondary Sign In with Email Button */}
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
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  className="popover-sign-in-btn"
                >
                  Sign in with email
                </a>

                {/* Tertiary Get early access */}
                <a
                  href="#early-access"
                  onClick={() => setProfileOpen(false)}
                  style={{
                    display: 'inline-block',
                    color: '#2B2FD9',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    textDecoration: 'none',
                    marginTop: '12px',
                    transition: 'opacity 0.15s ease',
                  }}
                  className="popover-early-link"
                >
                  Get early access
                </a>

                {/* Subtle Divider */}
                <div
                  style={{
                    height: '1px',
                    background: 'rgba(0, 0, 0, 0.06)',
                    margin: '16px 0 12px',
                  }}
                />

                {/* Lock Guarantee Footnote */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    color: '#6B7280',
                    fontSize: '0.78rem',
                    fontWeight: 500,
                  }}
                >
                  <Lock size={13} color="#6B7280" />
                  <span>No password to remember.</span>
                </div>
              </div>
            )}
          </div>

          <a
            href="#early-access"
            className="nav-cta-button"
            style={{
              background: '#2B2FD9',
              color: '#FFFFFF',
              fontSize: '0.86rem',
              fontWeight: 600,
              padding: '9px 20px',
              borderRadius: '9999px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              justifyContent: 'center',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 8px 20px -6px rgba(43, 47, 217, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <span>Get started</span>
            <ArrowRight size={15} strokeWidth={2.4} />
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
            <a href="#product" className="mobile-link" onClick={closeMobile}>
              Product
            </a>
            <a href="#use-cases" className="mobile-link" onClick={closeMobile}>
              Use cases
            </a>
            <a href="#pricing" className="mobile-link" onClick={closeMobile}>
              Pricing
            </a>
            <a href="#faq" className="mobile-link" onClick={closeMobile}>
              FAQ
            </a>
            <hr style={{ border: 'none', borderTop: '1px solid rgba(0, 0, 0, 0.06)', margin: '4px 0' }} />
            <a
              href="#account"
              className="mobile-link"
              onClick={closeMobile}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <UserRound size={18} />
              <span>Profile</span>
            </a>
            <a
              href="#early-access"
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
              Get started
            </a>
          </div>
        )}
      </nav>

      <style>{`
        .nav-link-pill {
          font-size: 0.875rem;
          font-weight: 500;
          color: #4B5563;
          text-decoration: none;
          padding: 8px 14px;
          border-radius: 9999px;
          transition: all 0.18s ease;
        }
        .nav-link-pill:hover {
          color: #111827;
          background: rgba(0, 0, 0, 0.045);
        }
        .nav-link-pill.is-active {
          color: #2B2FD9;
          font-weight: 700;
          background: rgba(43, 47, 217, 0.08);
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.8), 0 1px 3px rgba(43, 47, 217, 0.08);
        }
        .nav-profile-btn:hover {
          color: #111827 !important;
          background: rgba(0, 0, 0, 0.08) !important;
          transform: translateY(-1px);
        }
        .nav-cta-button:hover {
          background: #2024BC !important;
          transform: translateY(-1px);
          box-shadow: 0 12px 26px -6px rgba(43, 47, 217, 0.55) !important;
        }
        .nav-cta-button:active {
          transform: translateY(0);
        }
        .mobile-link {
          font-size: 0.96rem;
          font-weight: 600;
          color: #1F2937;
          text-decoration: none;
          padding: 8px 4px;
          border-radius: 8px;
          transition: color 0.15s ease, background 0.15s ease;
        }
        .mobile-link.is-active {
          color: #2B2FD9;
          background: rgba(43, 47, 217, 0.06);
          padding-inline: 8px;
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
