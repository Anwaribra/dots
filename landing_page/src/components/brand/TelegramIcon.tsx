import React from 'react';

interface TelegramIconProps {
  size?: number;
  className?: string;
  variant?: 'plane' | 'circle';
}

const PLANE_PATH =
  'M16.906 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z';

/** Official Telegram logo / paper airplane symbol */
export const TelegramIcon: React.FC<TelegramIconProps> = ({
  size = 20,
  className,
  variant = 'plane',
}) => {
  if (variant === 'circle') {
    return (
      <svg
        aria-hidden="true"
        className={className}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        style={{ flexShrink: 0, display: 'inline-block' }}
      >
        <circle cx="12" cy="12" r="12" fill="#24A1DE" />
        <path fill="#FFFFFF" d={PLANE_PATH} />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      style={{ flexShrink: 0, display: 'inline-block' }}
    >
      <path d={PLANE_PATH} />
    </svg>
  );
};
