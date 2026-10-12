import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FaqItem {
  id: string;
  q: string;
  a: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    id: 'faq-1',
    q: 'What is Dots?',
    a: 'Dots is an AI personal execution platform that connects your goals, plans your week, and adapts when life changes. It protects your key commitments and makes sure your daily schedule reflects reality.',
  },
  {
    id: 'faq-2',
    q: 'How does weekly planning work?',
    a: "You set your priorities, add what's on your mind, and Dots builds a flexible plan for the week ahead. When life changes, you can easily adjust and keep moving.",
  },
  {
    id: 'faq-3',
    q: 'Do I approve changes?',
    a: 'Yes. You are always in control. Dots evaluates trade-offs, protects your fixed meetings, and proposes reasoned adjustments for your one-tap approval.',
  },
  {
    id: 'faq-4',
    q: 'How does Dots adapt when urgent requests come up?',
    a: 'When interruptions strike, Dots identifies flexible blocks, reserves realistic buffer space, and prepares a clear adjustment for you to review.',
  },
];

export const FaqAccordion: React.FC = () => {
  // Default second item open matching reference image!
  const [openId, setOpenId] = useState<string | null>('faq-2');

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" style={{ paddingBlock: '60px 90px' }}>
      <div className="SectionCanvas" style={{ maxWidth: '980px', marginInline: 'auto' }}>
        {/* Eyebrow & Titles */}
        <div style={{ marginBottom: '44px' }}>
          <div
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#6B7280',
              marginBottom: '10px',
            }}
          >
            COMMON QUESTIONS
          </div>
          <h2
            style={{
              fontSize: 'clamp(2.1rem, 3.8vw, 3.2rem)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              color: '#111827',
              marginBottom: '12px',
            }}
          >
            Questions, answered.
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#52526B', margin: 0 }}>
            Straightforward answers to the basics.
          </p>
        </div>

        {/* Accordion List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {FAQ_DATA.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                style={{
                  borderRadius: isOpen ? '18px' : '12px',
                  background: isOpen ? '#EEF2FF' : 'transparent',
                  borderBottom: isOpen ? 'none' : '1px solid #E5E7EB',
                  padding: isOpen ? '22px 26px' : '20px 8px',
                  transition: 'all 0.2s ease',
                }}
              >
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  aria-expanded={isOpen}
                  aria-controls={`${item.id}-answer`}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: isOpen ? '#1E1B4B' : '#111827',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {item.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp size={20} color="#4338F2" />
                  ) : (
                    <ChevronDown size={20} color="#6B7280" />
                  )}
                </button>

                {isOpen && (
                  <div
                    id={`${item.id}-answer`}
                    style={{
                      marginTop: '14px',
                      fontSize: '0.94rem',
                      lineHeight: 1.65,
                      color: '#4B5563',
                    }}
                  >
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
