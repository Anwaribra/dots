export type SilhouetteVariant = 'cobalt-wide' | 'lavender-low' | 'indigo-tall' | 'cobalt' | 'hero-asymmetric' | 'hero';

export interface SilhouetteDefinition {
  viewBox: string;
  path: string;
  defaultGradient: {
    id: string;
    stops: Array<{ offset: string; color: string; opacity?: number }>;
    angle?: { x1: string; y1: string; x2: string; y2: string };
  };
  highlight?: {
    cx: string;
    cy: string;
    rx: string;
    ry: string;
    opacity: number;
    blurStdDev?: number;
  };
}

export const SILHOUETTES: Record<string, SilhouetteDefinition> = {
  // 1. Broad asymmetric field for hero and product demonstrations (e.g. Adaptive Engine, Dots Loop)
  'cobalt-wide': {
    viewBox: '0 0 1000 680',
    path: 'M96 226 C122 126 228 82 342 104 C458 126 503 74 620 96 C764 121 904 196 880 318 C860 424 786 492 664 506 C552 518 498 604 374 584 C250 565 94 520 76 402 C66 342 76 276 96 226 Z',
    defaultGradient: {
      id: 'grad-cobalt-wide',
      angle: { x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
      stops: [
        { offset: '0%', color: '#3531e8' },
        { offset: '58%', color: '#4e46f5' },
        { offset: '100%', color: '#2a24b8' },
      ],
    },
    highlight: {
      cx: '420',
      cy: '190',
      rx: '260',
      ry: '110',
      opacity: 0.14,
      blurStdDev: 32,
    },
  },

  // 2. Low, calm shape for philosophy or supporting sections
  'lavender-low': {
    viewBox: '0 0 1200 480',
    path: 'M80 220 C110 110 260 70 440 85 C620 100 780 50 960 75 C1100 95 1150 160 1140 260 C1130 360 1020 420 860 410 C680 400 520 440 340 425 C180 410 60 330 80 220 Z',
    defaultGradient: {
      id: 'grad-lavender-low',
      angle: { x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
      stops: [
        { offset: '0%', color: '#E8EAFF', opacity: 0.72 },
        { offset: '50%', color: '#F1F3FF', opacity: 0.85 },
        { offset: '100%', color: '#E2E5FF', opacity: 0.7 },
      ],
    },
    highlight: {
      cx: '600',
      cy: '160',
      rx: '340',
      ry: '90',
      opacity: 0.28,
      blurStdDev: 24,
    },
  },

  // 3. Taller asymmetric field for vertical flows or mobile layouts
  'indigo-tall': {
    viewBox: '0 0 720 920',
    path: 'M90 280 C105 140 220 70 370 85 C520 100 640 160 650 310 C660 450 580 540 610 680 C640 810 520 870 360 860 C210 850 90 810 75 670 C60 520 120 440 80 350 C65 315 75 295 90 280 Z',
    defaultGradient: {
      id: 'grad-indigo-tall',
      angle: { x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
      stops: [
        { offset: '0%', color: '#312dc8' },
        { offset: '60%', color: '#443df0' },
        { offset: '100%', color: '#2520a8' },
      ],
    },
    highlight: {
      cx: '360',
      cy: '240',
      rx: '200',
      ry: '120',
      opacity: 0.15,
      blurStdDev: 28,
    },
  },

  // 4. Hero Asymmetric Organic Silhouette (Hand-authored broad Bezier path)
  'hero-asymmetric': {
    viewBox: '0 0 1000 700',
    path: 'M 120 168 C 176 90, 300 46, 430 82 C 540 112, 594 58, 716 92 C 826 122, 924 192, 900 304 C 878 392, 792 416, 738 492 C 684 568, 566 610, 448 574 C 336 540, 264 604, 164 552 C 78 508, 44 408, 78 320 C 96 274, 74 218, 120 168 Z',
    defaultGradient: {
      id: 'grad-hero-asymmetric',
      angle: { x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
      stops: [
        { offset: '0%', color: '#3531e8' },
        { offset: '58%', color: '#4e46f5' },
        { offset: '100%', color: '#2a24b8' },
      ],
    },
    highlight: {
      cx: '440',
      cy: '180',
      rx: '260',
      ry: '110',
      opacity: 0.14,
      blurStdDev: 32,
    },
  },
};

// Fixed, hand-authored Hero Silhouette Bezier Path
export const HERO_SILHOUETTE_PATH = SILHOUETTES['hero-asymmetric'].path;

// Convenient aliases
SILHOUETTES['cobalt'] = SILHOUETTES['cobalt-wide'];
SILHOUETTES['hero'] = SILHOUETTES['hero-asymmetric'];
