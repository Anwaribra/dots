import React, { useState, useEffect } from 'react';
import {
  Lock,
  Activity,
  Target,
  BarChart3,
  ChevronRight,
  Check,
} from 'lucide-react';

export const LivingPlanCanvas: React.FC = () => {
  const [isApproved, setIsApproved] = useState(false);
  const [animationStep, setAnimationStep] = useState(4); // default to complete for SSR / immediate

  useEffect(() => {
    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setAnimationStep(4);
      return;
    }

    // Sequence: 1 -> 2 -> 3 -> 4
    setAnimationStep(0);
    const t1 = setTimeout(() => setAnimationStep(1), 300);  // draw lime line
    const t2 = setTimeout(() => setAnimationStep(2), 700);  // urgent task lights up
    const t3 = setTimeout(() => setAnimationStep(3), 1100); // research shifts
    const t4 = setTimeout(() => setAnimationStep(4), 1400); // approve button glows

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const handleApprove = () => {
    setIsApproved(!isApproved);
  };

  return (
    <div className="living-plan-stage">
      {/* Background Depth Card (Editorial layered effect) */}
      <div className="living-plan-depth-layer" aria-hidden="true" />

      {/* Top-Right Floating Annotation Card: REAL LIFE INPUT */}
      <div className="annotation-card annotation-card--top-right">
        <span className="annotation-card__label">REAL LIFE INPUT</span>
        <div className="annotation-card__body">
          <span className="annotation-card__dot annotation-card__dot--lime" />
          <span className="annotation-card__text">Client request · 2h</span>
        </div>
      </div>

      {/* Bottom-Left Floating Annotation Card: PROTECTED COMMITMENT */}
      <div className="annotation-card annotation-card--bottom-left">
        <span className="annotation-card__label">PROTECTED COMMITMENT</span>
        <div className="annotation-card__body">
          <Lock size={12} color="#3846F8" className="annotation-card__lock" />
          <span className="annotation-card__text">Team sync · protected</span>
        </div>
      </div>

      {/* SVG Connectors Overlay (Desktop only) */}
      <svg
        className="living-plan-svg-overlay"
        viewBox="0 0 740 460"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* 1. Lime Line: From Top-Right Input into Timeline, down and across into Decision */}
        <path
          d="M 640 18 L 470 148 L 470 216 L 602 216"
          stroke="#C9F455"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`connector-line connector-line--lime ${animationStep >= 1 ? 'is-drawn' : ''}`}
        />
        <circle cx="640" cy="18" r="3.5" fill="#D2F64C" />
        <circle cx="470" cy="148" r="3" fill="#D2F64C" />
        <circle cx="602" cy="216" r="3.5" fill="#C9F455" />

        {/* 2. Blue Line: From Team sync row down to Bottom-Left Card */}
        <path
          d="M 526 318 C 526 350, 480 354, 130 354"
          stroke="#3846F8"
          strokeWidth="2"
          strokeLinecap="round"
          className={`connector-line connector-line--blue ${animationStep >= 1 ? 'is-drawn' : ''}`}
        />
        <circle cx="526" cy="318" r="3" fill="#3846F8" />
        <circle cx="130" cy="354" r="3.5" fill="#3846F8" />
      </svg>

      {/* Main Living Plan Window */}
      <div className="living-plan-window">
        {/* macOS Style Window Chrome Header */}
        <div className="living-plan-chrome">
          <div className="living-plan-chrome__left">
            <span className="window-dot window-dot--red" />
            <span className="window-dot window-dot--yellow" />
            <span className="window-dot window-dot--green" />
            <span className="window-title-app">Dots</span>
          </div>

          <div className="living-plan-chrome__center">
            <span className="window-canvas-name">THE LIVING PLAN</span>
          </div>

          <div className="living-plan-chrome__right">
            <span className="window-timestamp">TUESDAY · 9:14 AM</span>
          </div>
        </div>

        {/* Canvas Body (Left Rail + Timeline / Today's Plan + Decision Area) */}
        <div className="living-plan-body">
          {/* 1. Left Rail (Context, Priorities, Capacity ONLY) */}
          <aside className="living-plan-rail" aria-label="Plan dimensions">
            <div className="rail-item rail-item--active" title="Context">
              <Activity size={15} color="#3846F8" />
              <span>Context</span>
            </div>
            <div className="rail-item" title="Priorities">
              <Target size={15} color="#475569" />
              <span>Priorities</span>
            </div>
            <div className="rail-item" title="Capacity">
              <BarChart3 size={15} color="#475569" />
              <span>Capacity</span>
            </div>
          </aside>

          {/* 2. Center Content: Timeline + Today's Plan List */}
          <div className="living-plan-main">
            {/* Timeline Section */}
            <div className="timeline-section">
              {/* Timeline Hours Axis */}
              <div className="timeline-axis">
                <span>9 AM</span>
                <span>10 AM</span>
                <span>11 AM</span>
                <span>12 PM</span>
                <span>1 PM</span>
                <span>2 PM</span>
                <span>3 PM</span>
                <span>4 PM</span>
                <span>5 PM</span>
              </div>

              {/* Timeline Grid Track */}
              <div className="timeline-grid-track">
                {/* 9:00 - 11:00: Deep work (2 hrs = 25%) */}
                <div className="timeline-block block--deep-work" style={{ left: '0%', width: '25%' }}>
                  <span className="timeline-block__title">Deep work</span>
                  <span className="timeline-block__time">9:00 – 11:00</span>
                </div>

                {/* 12:00 - 1:00: Lunch (1 hr = 12.5%) */}
                <div className="timeline-block block--lunch" style={{ left: '37.5%', width: '12.5%' }}>
                  <span className="timeline-block__title">Lunch</span>
                  <span className="timeline-block__time">12:00 – 1:00</span>
                </div>

                {/* 1:00 - 3:00: Urgent client task (Active, Vivid Lime) */}
                <div
                  className={`timeline-block block--urgent ${animationStep >= 2 ? 'is-active' : ''}`}
                  style={{ left: '50%', width: '25%' }}
                >
                  <span className="timeline-block__title">Urgent client task</span>
                  <span className="timeline-block__time">1:00 – 3:00</span>

                  {/* 2 hours found badge */}
                  <div className="hours-found-badge">
                    <span>2 hours found</span>
                  </div>
                </div>

                {/* 3:00 - 4:00: Team sync (Protected, Cobalt Blue outline) */}
                <div className="timeline-block block--team-sync" style={{ left: '75%', width: '12.5%' }}>
                  <div className="timeline-block__header">
                    <span className="timeline-block__title">Team sync</span>
                    <Lock size={10} color="#3846F8" />
                  </div>
                  <span className="timeline-block__time">3:00 – 4:00</span>
                </div>

                {/* 4:00 - 5:00: Research (Shifted -> tomorrow) */}
                <div
                  className={`timeline-block block--research ${animationStep >= 3 ? 'is-shifted' : ''}`}
                  style={{ left: '87.5%', width: '12.5%' }}
                >
                  <span className="timeline-block__title">Research</span>
                  <span className="timeline-block__time">{animationStep >= 3 ? '→ tomorrow' : '4:00 – 5:00'}</span>
                </div>
              </div>
            </div>

            {/* Today's Plan Itemized List */}
            <div className="todays-plan-section">
              <span className="todays-plan__label">TODAY'S PLAN</span>
              <div className="todays-plan__list">
                {/* Deep work */}
                <div className="plan-row">
                  <span className="plan-row__dot plan-row__dot--neutral" />
                  <span className="plan-row__title">Deep work</span>
                  <span className="plan-row__time">9:00 – 11:00</span>
                </div>

                {/* Lunch */}
                <div className="plan-row">
                  <span className="plan-row__dot plan-row__dot--neutral" />
                  <span className="plan-row__title">Lunch</span>
                  <span className="plan-row__time">12:00 – 1:00</span>
                </div>

                {/* Urgent client task */}
                <div className={`plan-row plan-row--highlight ${animationStep >= 2 ? 'is-active' : ''}`}>
                  <span className="plan-row__dot plan-row__dot--lime" />
                  <span className="plan-row__title">Urgent client task</span>
                  <span className="plan-row__time">1:00 – 3:00</span>
                </div>

                {/* Team sync (Protected) */}
                <div className="plan-row plan-row--protected">
                  <Lock size={12} color="#3846F8" className="plan-row__lock" />
                  <span className="plan-row__title">Team sync</span>
                  <span className="plan-row__time">3:00 – 4:00</span>
                  <span className="protected-pill">Protected</span>
                </div>

                {/* Research */}
                <div className={`plan-row plan-row--shifted ${animationStep >= 3 ? 'is-shifted' : ''}`}>
                  <span className="plan-row__dot plan-row__dot--muted" />
                  <span className="plan-row__title">Research</span>
                  <span className="plan-row__time plan-row__time--deferred">
                    {animationStep >= 3 ? '→ tomorrow' : '4:00 – 5:00'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Right Decision Area: NEXT MOVE */}
          <aside className="living-plan-decision" aria-label="Decision area">
            <div className="decision-header">
              <h3 className="decision-title">NEXT MOVE</h3>
              <p className="decision-copy">Make space. Keep what matters.</p>
            </div>

            {/* Decision Task List Cards */}
            <div className="decision-items">
              {/* Card 1: Urgent client task */}
              <div className="decision-card decision-card--urgent">
                <span className="decision-card__dot decision-card__dot--lime" />
                <div className="decision-card__content">
                  <span className="decision-card__title">Urgent client task</span>
                  <span className="decision-card__subtitle">1–3 PM</span>
                </div>
                <ChevronRight size={13} color="#94A3B8" />
              </div>

              {/* Card 2: Team sync (Protected) */}
              <div className="decision-card decision-card--protected">
                <Lock size={12} color="#3846F8" />
                <div className="decision-card__content">
                  <span className="decision-card__title">Team sync</span>
                  <span className="decision-card__subtitle">3–4 PM</span>
                </div>
                <span className="protected-pill">Protected</span>
                <ChevronRight size={13} color="#94A3B8" />
              </div>

              {/* Card 3: Research */}
              <div className="decision-card decision-card--deferred">
                <span className="decision-card__dot decision-card__dot--muted" />
                <div className="decision-card__content">
                  <span className="decision-card__title">Research</span>
                  <span className="decision-card__subtitle">→ tomorrow</span>
                </div>
              </div>
            </div>

            {/* Primary Action Button: Approve plan */}
            <button
              type="button"
              className={`approve-plan-btn ${isApproved ? 'is-approved' : ''} ${animationStep >= 4 ? 'is-ready' : ''}`}
              onClick={handleApprove}
              aria-label={isApproved ? 'Plan approved' : 'Approve plan'}
            >
              {isApproved ? (
                <>
                  <Check size={16} strokeWidth={2.5} />
                  <span>Plan approved</span>
                </>
              ) : (
                <span>Approve plan</span>
              )}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
};
