import React from 'react';

interface DotsLogoProps {
  size?: number | 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
  theme?: 'light' | 'dark';
}

export const DotsLogo: React.FC<DotsLogoProps> = ({
  size = 'md',
  showWordmark = true,
  className = '',
  theme = 'light',
}) => {
  const pixelSize =
    typeof size === 'number'
      ? size
      : size === 'sm'
      ? 22
      : size === 'lg'
      ? 36
      : 28;

  const textColor = theme === 'dark' ? '#FFFFFF' : '#111827';
  const lineColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.75)' : '#1F2937';
  const rightDotColor = theme === 'dark' ? '#E5E7EB' : '#111827';

  return (
    <div
      className={`dots-logo-lockup ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '9px',
        fontWeight: 800,
        textDecoration: 'none',
        color: textColor,
        letterSpacing: '-0.035em',
        userSelect: 'none',
      }}
    >
      <svg
        width={pixelSize * 1.15}
        height={pixelSize}
        viewBox="0 0 38 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        {/* Connecting Lines */}
        <line
          x1="10"
          y1="22.5"
          x2="19.5"
          y2="8.5"
          stroke={lineColor}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <line
          x1="19.5"
          y1="8.5"
          x2="29"
          y2="19"
          stroke={lineColor}
          strokeWidth="2.6"
          strokeLinecap="round"
        />

        {/* 1. Left Dot (Vibrant Cobalt Blue) */}
        <circle cx="10" cy="22.5" r="6.2" fill="#3846F8" />

        {/* 2. Top Apex Dot (Neon Electric Lime) */}
        <circle cx="19.5" cy="8.5" r="5.2" fill="#D2F64C" />

        {/* 3. Right Dot (Deep Ink Black) */}
        <circle cx="29" cy="19" r="4.6" fill={rightDotColor} />
      </svg>

      {/* Confident Wordmark */}
      {showWordmark && (
        <span
          style={{
            fontSize: `${pixelSize * 0.78}px`,
            fontWeight: 800,
            lineHeight: 1,
            color: textColor,
            letterSpacing: '-0.035em',
          }}
        >
          Dots
        </span>
      )}
    </div>
  );
};
