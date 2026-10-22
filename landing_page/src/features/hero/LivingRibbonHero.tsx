import { useId, useState } from "react";
import "./living-ribbon.css";

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

type RibbonNode = {
  id: string;
  title: string;
  sub: string;
  detail: [string, string];
  x: number;
  y: number;
  /** label offset from node centre */
  lx: number;
  ly: number;
  anchor: "start" | "middle";
};

const NODES: RibbonNode[] = [
  {
    id: "matters",
    title: "What matters",
    sub: "CLARIFY TODAY",
    detail: ["Name the few things", "worth protecting."],
    x: 144,
    y: 250,
    lx: 26,
    ly: -28,
    anchor: "start",
  },
  {
    id: "changes",
    title: "What changes",
    sub: "MAKE SPACE",
    detail: ["Let go of what no", "longer fits."],
    x: 527,
    y: 389,
    lx: 28,
    ly: -30,
    anchor: "start",
  },
  {
    id: "next",
    title: "What next",
    sub: "MOVE FORWARD",
    detail: ["Take one small, clear", "step forward."],
    x: 920,
    y: 255,
    lx: 6,
    ly: -48,
    anchor: "middle",
  },
];

const PATH_D =
  "M20 255 C110 236 230 255 330 320 C420 378 520 400 610 385 C740 370 850 300 950 235 C990 212 1050 200 1100 192";

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function LivingRibbonHero() {
  const uid = useId().replace(/:/g, "");
  const id = (name: string) => `${name}-${uid}`;
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="lr-hero" aria-labelledby={id("headline")}>
      {/* ------------------------------ Copy ------------------------------ */}
      <div className="lr-copy">
        <p className="lr-eyebrow">A calmer way to make progress</p>

        <h1 className="lr-headline" id={id("headline")}>
          <span className="lr-line-ink">Life changes.</span>
          <span className="lr-line-blue">
            Keep{" "}
            <span className="lr-underlined">
              moving.
              <svg
                className="lr-brush"
                viewBox="0 0 260 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M 6 14 C 75 19, 175 19, 254 7"
                  stroke="#D2F64C"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </span>
        </h1>

        <p className="lr-subhead">
          Hold on to what matters. Make space for what is next.
        </p>

        <div className="lr-cta">
          <a href="#app" className="lr-btn lr-btn--primary">
            Start planning
          </a>
          <a href="#product" className="lr-btn lr-btn--secondary">
            See how it works
            <svg
              viewBox="0 0 20 20"
              width="18"
              height="18"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M3 10h13M11 4.5 16.5 10 11 15.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>

      {/* ------------------------------ Ribbon ---------------------------- */}
      <svg
        className="lr-ribbon"
        viewBox="0 0 1200 460"
        role="img"
        aria-label="A paper ribbon with a blue path running through three steps: what matters, what changes, what next."
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* paper gradients */}
          <linearGradient id={id("face")} x1="0" y1="0" x2="0.15" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.55" stopColor="#F4F6FA" />
            <stop offset="1" stopColor="#DCE3EC" />
          </linearGradient>
          <linearGradient id={id("faceB")} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#E3E9F1" />
            <stop offset="0.45" stopColor="#F7F9FC" />
            <stop offset="1" stopColor="#FFFFFF" />
          </linearGradient>
          <linearGradient id={id("under")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F1F5F9" />
            <stop offset="60%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>
          <linearGradient id={id("crest")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#F1F5F9" />
          </linearGradient>
          <linearGradient id={id("lit")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#EDF1F6" />
          </linearGradient>
          <linearGradient id={id("shade")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F8FAFC" />
            <stop offset="0.6" stopColor="#E2E8F0" />
            <stop offset="1" stopColor="#CBD5E1" />
          </linearGradient>
          <linearGradient id={id("fold")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#CBD5E1" />
            <stop offset="1" stopColor="#E8EDF4" />
          </linearGradient>

          {/* filters */}
          <filter id={id("blurSoft")} x="-20%" y="-60%" width="140%" height="220%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <filter id={id("blurTight")} x="-20%" y="-100%" width="140%" height="300%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <filter id={id("drop")} x="-30%" y="-30%" width="160%" height="170%">
            <feDropShadow
              dx="0"
              dy="6"
              stdDeviation="8"
              floodColor="#0F172A"
              floodOpacity="0.14"
            />
          </filter>
          <filter id={id("nodeDrop")} x="-80%" y="-80%" width="260%" height="260%">
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="2.5"
              floodColor="#3846F8"
              floodOpacity="0.28"
            />
          </filter>
        </defs>

        {/* ---------- Ground shadows ---------- */}
        <g aria-hidden="true">
          <path
            d="M60 300 C200 390 400 448 620 448 C800 448 930 380 1030 310 C940 400 790 462 620 462 C390 462 190 410 60 300 Z"
            fill="rgba(15,23,42,0.11)"
            filter={`url(#${id("blurSoft")})`}
          />
          <ellipse
            cx="620"
            cy="438"
            rx="210"
            ry="7"
            fill="rgba(15,23,42,0.12)"
            filter={`url(#${id("blurTight")})`}
          />
          <ellipse
            cx="40"
            cy="232"
            rx="110"
            ry="7"
            fill="rgba(15,23,42,0.07)"
            filter={`url(#${id("blurTight")})`}
          />
          <path
            d="M960 300 C1020 330 1100 320 1150 240 C1110 340 1020 360 960 300 Z"
            fill="rgba(15,23,42,0.07)"
            filter={`url(#${id("blurTight")})`}
          />
        </g>

        {/* ---------- Far-left roll ---------- */}
        <g className="lr-paper">
          {/* shaded underside */}
          <path
            d="M-20 52 C24 2 104 -2 138 48 C168 92 150 150 108 182 C76 206 30 210 -20 212 Z"
            fill={`url(#${id("under")})`}
          />
          {/* illuminated outer crest */}
          <path
            d="M-20 112 C12 66 72 48 110 80 C142 108 128 160 92 188 C64 208 30 214 -20 218 Z"
            fill={`url(#${id("crest")})`}
            stroke="#E2E8F0"
            strokeWidth="1"
          />
          {/* soft inner shading where the paper curls */}
          <path
            d="M20 92 C58 62 98 70 112 98 C100 82 60 76 20 104 Z"
            fill="#94A3B8"
            opacity="0.28"
          />

          {/* ---------- Front face 1 → central cradle ---------- */}
          <path
            d="M-20 208 C110 172 235 198 335 274 C412 332 500 360 604 346 L642 428 C522 458 398 440 298 378 C198 318 90 296 -20 304 Z"
            fill={`url(#${id("face")})`}
            stroke="#E2E8F0"
            strokeWidth="1"
            filter={`url(#${id("drop")})`}
          />
          {/* long highlight along the upper edge */}
          <path
            d="M-20 214 C110 180 232 206 330 280 C410 338 498 366 600 352"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.9"
          />
          {/* lower-edge shade */}
          <path
            d="M-20 296 C90 290 198 312 298 372 C398 432 522 450 640 422 L642 428 C522 458 398 440 298 378 C198 318 90 296 -20 304 Z"
            fill="#94A3B8"
            opacity="0.22"
          />

          {/* ---------- Central twist / fold ---------- */}
          <path
            d="M598 346 C612 366 628 400 644 430 L680 424 C658 392 648 366 652 340 Z"
            fill={`url(#${id("fold")})`}
            opacity="0.85"
          />
          <path
            d="M604 346 L642 428"
            stroke="#94A3B8"
            strokeWidth="1"
            opacity="0.5"
          />

          {/* ---------- Right ascending ramp ---------- */}
          <path
            d="M604 346 C724 338 836 292 945 190 L962 285 C862 372 760 430 642 428 Z"
            fill={`url(#${id("faceB")})`}
            stroke="#E2E8F0"
            strokeWidth="1"
            filter={`url(#${id("drop")})`}
          />
          <path
            d="M612 350 C730 342 838 296 940 196"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* ---------- 3D arrowhead ---------- */}
          <path
            d="M958 238 L1172 185 L1015 330 L962 285 Z"
            fill={`url(#${id("shade")})`}
          />
          <path
            d="M945 190 L985 118 L1172 185 L958 238 Z"
            fill={`url(#${id("lit")})`}
            stroke="#E2E8F0"
            strokeWidth="1"
          />
          <path
            d="M958 238 L1172 185"
            stroke="#64748B"
            strokeWidth="1.2"
            opacity="0.45"
            strokeLinecap="round"
          />
        </g>

        {/* ---------- The living blue path ---------- */}
        <path
          className="lr-path"
          d={PATH_D}
          pathLength={1}
          fill="none"
          stroke="#3846F8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="lr-path-tip"
          d="M1088 181 L1110 190 L1092 204"
          fill="none"
          stroke="#3846F8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ---------- Nodes ---------- */}
        {NODES.map((n, i) => {
          const isActive = active === n.id;
          return (
            <g
              key={n.id}
              className={`lr-node${isActive ? " is-active" : ""}`}
              transform={`translate(${n.x} ${n.y})`}
              style={{ animationDelay: `${0.2 + i * 0.25}s` }}
              tabIndex={0}
              role="button"
              aria-label={`${n.title}. ${n.detail.join(" ")}`}
              onMouseEnter={() => setActive(n.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(n.id)}
              onBlur={() => setActive(null)}
            >
              <circle className="lr-hit" r="26" fill="transparent" />
              <circle className="lr-pulse" r="12" fill="none" stroke="#D2F64C" strokeWidth="2" />
              <g className="lr-node-body">
                <circle
                  r="12"
                  fill="#D2F64C"
                  filter={`url(#${id("nodeDrop")})`}
                />
                <circle r="4.6" fill="#3846F8" />
              </g>

              <text
                className="lr-label-title"
                x={n.lx}
                y={n.ly}
                textAnchor={n.anchor}
              >
                {n.title}
              </text>
              <text
                className="lr-label-sub"
                x={n.lx}
                y={n.ly + 17}
                textAnchor={n.anchor}
              >
                {n.sub}
              </text>

              {/* micro-card tooltip */}
              <g
                className="lr-tip"
                transform={`translate(-98 -128)`}
                opacity={isActive ? 1 : 0}
                pointerEvents="none"
              >
                <rect
                  width="196"
                  height="70"
                  rx="14"
                  fill="#FFFFFF"
                  stroke="#E2E8F0"
                  filter={`url(#${id("drop")})`}
                />
                <circle cx="20" cy="22" r="5" fill="#D2F64C" stroke="#3846F8" strokeWidth="1.5" />
                <text className="lr-tip-title" x="34" y="26">
                  {n.title}
                </text>
                <text className="lr-tip-body" x="16" y="46">
                  {n.detail[0]}
                </text>
                <text className="lr-tip-body" x="16" y="61">
                  {n.detail[1]}
                </text>
              </g>
            </g>
          );
        })}
      </svg>

      {/* ------------------- Mobile vertical step list -------------------- */}
      <ol className="lr-steps" aria-label="Three steps">
        {NODES.map((n, i) => (
          <li key={n.id} className="lr-step">
            <span className="lr-step-dot" aria-hidden="true">
              <span />
            </span>
            <div>
              <p className="lr-step-title">{n.title}</p>
              <p className="lr-step-sub">{n.sub}</p>
              <p className="lr-step-body">{n.detail.join(" ")}</p>
            </div>
            <span className="lr-step-num" aria-hidden="true">
              0{i + 1}
            </span>
          </li>
        ))}
      </ol>

      {/* ------------------------ Brand mark ------------------------------ */}
      <div className="lr-mark" aria-hidden="true">
        <span>Same you.</span>
        <span className="lr-mark-row">
          A brighter tomorrow. <i />
        </span>
      </div>
    </section>
  );
}

export default LivingRibbonHero;
