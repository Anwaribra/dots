import React from 'react';
import { DotsLogo } from '../brand/DotsLogo';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        paddingBlock: '48px 56px',
        borderTop: '1px solid rgba(23, 23, 43, 0.08)',
        background: '#FFFFFF',
      }}
    >
      <div className="SectionCanvas" style={{ maxWidth: '1440px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '28px',
            flexWrap: 'wrap',
          }}
        >
          {/* Brand Left */}
          <a href="#hero" style={{ textDecoration: 'none' }}>
            <DotsLogo size={26} />
          </a>

          {/* Nav Center */}
          <ul
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '28px',
              listStyle: 'none',
              margin: 0,
              padding: 0,
              fontSize: '0.88rem',
              fontWeight: 600,
              color: '#4B5563',
            }}
          >
            <li>
              <a href="#how-it-works" className="footer-link">
                How it works
              </a>
            </li>
            <li>
              <a href="#planning" className="footer-link">
                Philosophy
              </a>
            </li>
            <li>
              <a href="#faq" className="footer-link">
                FAQ
              </a>
            </li>
          </ul>

          {/* Right Constellation Motif & Motto */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Constellation Wave */}
            <svg width="44" height="20" viewBox="0 0 44 20" fill="none">
              <path d="M 4 10 C 16 18, 28 2, 40 10" stroke="#818CF8" strokeWidth="1.5" />
              <circle cx="8" cy="12" r="4.5" fill="#C9F455" />
            </svg>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#9CA3AF',
              }}
            >
              A CALMER, MORE CAPABLE YOU.
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .footer-link {
          color: #4B5563;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .footer-link:hover {
          color: #111827;
        }
      `}</style>
    </footer>
  );
};
