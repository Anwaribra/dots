import React, { useId } from 'react';
import { SILHOUETTES, SilhouetteVariant } from '../../constants/silhouettes';

export interface OrganicSilhouetteProps extends React.SVGProps<SVGSVGElement> {
  variant?: SilhouetteVariant;
  className?: string;
  fill?: string;
  highlightOpacity?: number;
  preserveAspectRatio?: string;
}

export const OrganicSilhouette: React.FC<OrganicSilhouetteProps> = ({
  variant = 'cobalt-wide',
  className = '',
  fill,
  highlightOpacity,
  preserveAspectRatio,
  style,
  ...rest
}) => {
  const uniqueId = useId().replace(/:/g, '');
  const data = SILHOUETTES[variant] || SILHOUETTES['cobalt-wide'];
  const clipId = `clip-${variant}-${uniqueId}`;
  const gradId = `grad-${variant}-${uniqueId}`;
  const blurFilterId = `blur-${variant}-${uniqueId}`;

  const hasGradient = !fill && !!data.defaultGradient;
  const fillValue = fill || (hasGradient ? `url(#${gradId})` : '#3531e8');
  const aspectMode = preserveAspectRatio || 'xMidYMid meet';

  return (
    <svg
      viewBox={data.viewBox}
      preserveAspectRatio={aspectMode}
      aria-hidden="true"
      className={className}
      style={{ display: 'block', width: '100%', height: '100%', ...style }}
      {...rest}
    >
      <defs>
        {/* Fixed clipPath matching the exact organic silhouette */}
        <clipPath id={clipId}>
          <path d={data.path} />
        </clipPath>

        {/* Deterministic Gradient Fill */}
        {hasGradient && data.defaultGradient && (
          <linearGradient
            id={gradId}
            x1={data.defaultGradient.angle?.x1 || '0%'}
            y1={data.defaultGradient.angle?.y1 || '0%'}
            x2={data.defaultGradient.angle?.x2 || '100%'}
            y2={data.defaultGradient.angle?.y2 || '100%'}
          >
            {data.defaultGradient.stops.map((stop, i) => (
              <stop
                key={i}
                offset={stop.offset}
                stopColor={stop.color}
                stopOpacity={stop.opacity ?? 1}
              />
            ))}
          </linearGradient>
        )}

        {/* Blur filter for the soft deterministic inner highlight */}
        {data.highlight && (
          <filter id={blurFilterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={data.highlight.blurStdDev || 24} />
          </filter>
        )}
      </defs>

      {/* Main Base Organic Silhouette */}
      <path d={data.path} fill={fillValue} />

      {/* Soft Deterministic Highlight Clipped to the exact Silhouette */}
      {data.highlight && (
        <g clipPath={`url(#${clipId})`} pointerEvents="none">
          <ellipse
            cx={data.highlight.cx}
            cy={data.highlight.cy}
            rx={data.highlight.rx}
            ry={data.highlight.ry}
            fill="#FFFFFF"
            opacity={highlightOpacity ?? data.highlight.opacity}
            filter={`url(#${blurFilterId})`}
          />
        </g>
      )}
    </svg>
  );
};
