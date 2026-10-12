import React, { useEffect, useRef, useState, useCallback } from 'react';

interface WireGeometry {
  width: number;
  height: number;
  pathLeft1: string;
  pathLeft2: string;
  pathRightUpper: string;
  pathRightLower: string;
  pathArrow: string;
  nodeLeft: { x: number; y: number };
  nodePinch: { x: number; y: number };
  node03: { x: number; y: number };
}

export const ConnectionPaths: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [geom, setGeom] = useState<WireGeometry | null>(null);

  const measureAndLayout = useCallback(() => {
    if (!containerRef.current) return;
    const wrapper = containerRef.current.parentElement;
    if (!wrapper) return;

    const wrapperRect = wrapper.getBoundingClientRect();
    const p1 = wrapper.querySelector<HTMLElement>('#stage-panel-left');
    const p2 = wrapper.querySelector<HTMLElement>('#stage-panel-center');
    const p3 = wrapper.querySelector<HTMLElement>('#stage-panel-right');
    const b03 = wrapper.querySelector<HTMLElement>('#badge-step-03-dot') || wrapper.querySelector<HTMLElement>('#badge-step-03');
    const mCard = wrapper.querySelector<HTMLElement>('#card-moved-to-make-space');

    if (!p1 || !p2 || !p3 || wrapperRect.width <= 0) return;

    const r1 = p1.getBoundingClientRect();
    const r2 = p2.getBoundingClientRect();
    const r3 = p3.getBoundingClientRect();
    const rb03 = b03?.getBoundingClientRect();
    const rmCard = mCard?.getBoundingClientRect();

    const w = wrapperRect.width;
    const h = wrapperRect.height;

    // 1. Left wire starting from right edge of Panel 01
    const x1 = r1.right - wrapperRect.left;
    const y1 = r1.top - wrapperRect.top + r1.height * 0.44;

    // 2. Floating node in gap between Panel 01 and Center Silhouette
    const xf = x1 + (r2.left - wrapperRect.left - x1) * 0.52;
    const yf = Math.min(y1 - 65, r2.top - wrapperRect.top + 52);

    // 3. Center panel shoulder path: line crosses into purple shape in soft white along the left shoulder
    // Hugs the shoulder contour strictly to the left of all text
    const xCrest = r2.left - wrapperRect.left + 30;
    const yCrest = r2.top - wrapperRect.top + 14;
    const xDeep = r2.left - wrapperRect.left + 42;
    const yDeep = r2.top - wrapperRect.top + 135;

    // 4. Funnel pinch apex (tip of the silhouette nozzle on right of Center Panel)
    const xp = r2.right - wrapperRect.left + 34;
    const yp = r2.top - wrapperRect.top + r2.height * 0.38;

    // 5. Node 03 badge dot in Panel 03
    const x03 = rb03
      ? rb03.left - wrapperRect.left + rb03.width * 0.5
      : r3.left - wrapperRect.left + 34;
    const y03 = rb03
      ? rb03.top - wrapperRect.top + rb03.height * 0.5
      : r3.top - wrapperRect.top + 34;

    // 6. Moved to make space card in Panel 03 — wire points directly at card before the green icon
    const cardLeft = rmCard ? rmCard.left - wrapperRect.left : r3.left - wrapperRect.left + 38;
    const cardTop = rmCard ? rmCard.top - wrapperRect.top : r3.top - wrapperRect.top + r3.height * 0.72;
    
    // Arrow tip points right at the card border, aiming at the lime transfer icon
    const xt = cardLeft - 6;
    const yt = cardTop + (rmCard ? rmCard.height * 0.44 : 24);

    // Tangent angle at arrival: incoming curve slopes down-right at ~32 degrees (0.56 rad)
    const arrivalAngle = 0.56;
    const ctrlDist = 44;
    const cp2x = xt - ctrlDist * Math.cos(arrivalAngle);
    const cp2y = yt - ctrlDist * Math.sin(arrivalAngle);

    // Perfectly symmetric arrowhead barbs aligned with the tangent of arrival
    const barbLen = 10;
    const barbSpread = 0.48; // ~27.5 degrees half-angle
    const b1x = xt - barbLen * Math.cos(arrivalAngle - barbSpread);
    const b1y = yt - barbLen * Math.sin(arrivalAngle - barbSpread);
    const b2x = xt - barbLen * Math.cos(arrivalAngle + barbSpread);
    const b2y = yt - barbLen * Math.sin(arrivalAngle + barbSpread);

    const pathLeft1 = `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${(x1 + (xf - x1) * 0.65).toFixed(1)} ${y1.toFixed(1)}, ${(xf - 24).toFixed(1)} ${(yf + 32).toFixed(1)}, ${xf.toFixed(1)} ${yf.toFixed(1)}`;
    const pathLeft2 = `M ${xf.toFixed(1)} ${yf.toFixed(1)} C ${(xf + 16).toFixed(1)} ${(yf - 24).toFixed(1)}, ${(xCrest - 16).toFixed(1)} ${(yCrest - 2).toFixed(1)}, ${xCrest.toFixed(1)} ${yCrest.toFixed(1)} C ${(xCrest + 12).toFixed(1)} ${(yCrest + 2).toFixed(1)}, ${(xDeep - 6).toFixed(1)} ${(yDeep - 40).toFixed(1)}, ${xDeep.toFixed(1)} ${yDeep.toFixed(1)}`;
    const pathRightUpper = `M ${xp.toFixed(1)} ${yp.toFixed(1)} C ${(xp + 34).toFixed(1)} ${(yp - 42).toFixed(1)}, ${(x03 - 24).toFixed(1)} ${(y03 + 12).toFixed(1)}, ${x03.toFixed(1)} ${y03.toFixed(1)}`;
    const pathRightLower = `M ${xp.toFixed(1)} ${yp.toFixed(1)} C ${(xp + 36).toFixed(1)} ${(yp + 42).toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${xt.toFixed(1)} ${yt.toFixed(1)}`;
    const pathArrow = `M ${b1x.toFixed(1)} ${b1y.toFixed(1)} L ${xt.toFixed(1)} ${yt.toFixed(1)} L ${b2x.toFixed(1)} ${b2y.toFixed(1)}`;

    setGeom({
      width: w,
      height: h,
      pathLeft1,
      pathLeft2,
      pathRightUpper,
      pathRightLower,
      pathArrow,
      nodeLeft: { x: xf, y: yf },
      nodePinch: { x: xp, y: yp },
      node03: { x: x03, y: y03 },
    });
  }, []);

  useEffect(() => {
    measureAndLayout();

    const handleResize = () => {
      measureAndLayout();
    };

    window.addEventListener('resize', handleResize);

    const wrapper = containerRef.current?.parentElement;
    let observer: ResizeObserver | null = null;
    if (wrapper && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        measureAndLayout();
      });
      observer.observe(wrapper);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      observer?.disconnect();
    };
  }, [measureAndLayout]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Sensible desktop fallback paths if not yet measured
  const fallbackGeom: WireGeometry = {
    width: 1440,
    height: 560,
    pathLeft1: 'M 320 330 C 375 330, 410 220, 442 165',
    pathLeft2: 'M 442 165 C 460 142, 475 135, 490 138 C 500 140, 508 175, 510 220',
    pathRightUpper: 'M 1042 278 C 1085 240, 1110 180, 1152 165',
    pathRightLower: 'M 1042 278 C 1088 320, 1120 395, 1156 422',
    pathArrow: 'M 1147 416 L 1156 422 L 1150 430',
    nodeLeft: { x: 442, y: 165 },
    nodePinch: { x: 1042, y: 278 },
    node03: { x: 1152, y: 165 },
  };

  const g = geom || fallbackGeom;

  return (
    <div
      ref={containerRef}
      className={`connection-paths-wrapper ${inView ? 'is-animated' : ''}`}
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      <svg
        viewBox={`0 0 ${g.width} ${g.height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          overflow: 'visible',
        }}
        className="connection-svg"
      >
        <defs>
          {/* Subtle transition to soft white inside purple silhouette */}
          <linearGradient id="wireToWhiteGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2B2FD9" />
            <stop offset="28%" stopColor="#2B2FD9" />
            <stop offset="42%" stopColor="rgba(255, 255, 255, 0.8)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.65)" />
          </linearGradient>
        </defs>

        {/* 1. Left Wire Path (Panel 01 -> Floating Lime Node) */}
        <path
          d={g.pathLeft1}
          stroke="#2B2FD9"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="anim-path path-left-1"
        />

        {/* 2. Left Wire Path (Soft white line arching on shoulder, clear of text) */}
        <path
          d={g.pathLeft2}
          stroke="url(#wireToWhiteGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          className="anim-path path-left-2"
        />

        {/* 3. Floating Solid Lime Node between Left Panel and Center Silhouette */}
        <g className="anim-node node-left-floating">
          <circle cx={g.nodeLeft.x} cy={g.nodeLeft.y} r="9.5" fill="#D2F64C" />
        </g>

        {/* 4. Right Wire Upper Branch (From Funnel Pinch Apex -> Node 03 in Right Panel) */}
        <path
          d={g.pathRightUpper}
          stroke="#2B2FD9"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="anim-path path-right-upper"
        />

        {/* 5. Right Wire Lower Branch (From Funnel Pinch Apex -> Enters INSIDE Moved to make space card) */}
        <path
          d={g.pathRightLower}
          stroke="#2B2FD9"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="anim-path path-right-lower"
        />

        {/* Arrowhead pointing into 'Moved to make space' Card — positioned INSIDE the card surface */}
        <path
          d={g.pathArrow}
          stroke="#2B2FD9"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="anim-node node-arrow"
        />

        {/* 6. Solid Lime Node at the Funnel Pinch Apex */}
        <g className="anim-node node-funnel-tip">
          <circle cx={g.nodePinch.x} cy={g.nodePinch.y} r="10.5" fill="#D2F64C" />
        </g>
      </svg>

      <style>{`
        .anim-path {
          stroke-dasharray: 1800;
          stroke-dashoffset: 1800;
          transition: stroke-dashoffset 0.7s ease;
        }
        .anim-node {
          opacity: 0;
          transform-origin: center;
          transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .is-animated .path-left-1 {
          animation: drawPath 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.1s forwards;
        }
        .is-animated .node-left-floating {
          animation: nodePop 0.35s ease 0.35s forwards;
        }
        .is-animated .path-left-2 {
          animation: drawPath 0.65s cubic-bezier(0.4, 0, 0.2, 1) 0.45s forwards;
        }
        .is-animated .node-funnel-tip {
          animation: nodePop 0.35s ease 0.65s forwards;
        }
        .is-animated .path-right-upper {
          animation: drawPath 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.75s forwards;
        }
        .is-animated .path-right-lower {
          animation: drawPath 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.85s forwards;
        }
        .is-animated .node-arrow {
          animation: nodePop 0.3s ease 1.15s forwards;
        }

        @keyframes drawPath {
          from { stroke-dashoffset: 1800; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes nodePop {
          0% { opacity: 0; transform: scale(0.3); }
          80% { opacity: 1; transform: scale(1.15); }
          100% { opacity: 1; transform: scale(1); }
        }

        @media (max-width: 1024px) {
          .connection-svg {
            display: none !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .anim-path {
            stroke-dashoffset: 0 !important;
            animation: none !important;
          }
          .anim-node {
            opacity: 1 !important;
            transform: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};
