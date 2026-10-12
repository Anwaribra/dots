import React from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { HeroProductShell } from './HeroProductShell';

export const HeroSection: React.FC = () => (
  <section id="hero" className="hero-section">
    <div className="HeroCanvas">
      <div className="hero-grid-layout">
        <div className="hero-copy">
          <p className="hero-eyebrow">A calmer way to make progress</p>
          <h1>
            Make room for life. <span className="hero-dots-word">Dots</span> keeps you moving.
          </h1>
          <p className="hero-lede">
            Put your priorities in one place. Dots turns them into a realistic plan,
            then calmly adapts when the week changes.
          </p>

          <div className="hero-cta-row">
            <a href="#early-access" className="hero-lime-cta">
              <span>Get Early Access</span>
              <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a href="#demo" className="hero-secondary-cta">
              <span className="hero-play-icon"><Play size={10} fill="currentColor" aria-hidden="true" /></span>
              See how it works
            </a>
          </div>

          <div className="hero-feature-signals hero-proofline" aria-label="Dots planning principles">
            <span><i />Priorities first</span>
            <span><i />You approve changes</span>
            <span><i />Space for real life</span>
          </div>
        </div>

        <div className="hero-platform-stage" aria-label="Dots weekly planning platform preview">
          <HeroProductShell />
        </div>
      </div>
    </div>
  </section>
);
