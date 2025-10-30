import React from 'react';
import { cn } from '@/lib/utils';

export type FeelynxLogoProps = {
  /** Width in pixels for the rendered SVG. Height is calculated from the viewBox ratio. */
  size?: number;
  /** Enables the outer glow treatment used on dark surfaces. */
  glow?: boolean;
  /** Optional tagline displayed beneath the wordmark. */
  tagline?: string;
  /** Optional wrapper class name for positioning adjustments. */
  className?: string;
  /** Enables subtle gradient motion and underline draw animations. */
  animate?: boolean;
  /** Explicit theme override for surfaces that don't follow the system preference. */
  theme?: 'auto' | 'light' | 'dark';
};

const DEFAULT_WIDTH = 360;
const VIEWBOX_WIDTH = 1200;
const VIEWBOX_HEIGHT = 420;

const DARK_COLORS = {
  gradientFrom: '#E8338B',
  gradientTo: '#5CC8FF',
  outline: '#1B1230',
  underline: '#2B1A45',
  tagline: '#F8E9FF',
};

const LIGHT_COLORS = {
  gradientFrom: '#E64A9A',
  gradientTo: '#32BFFF',
  outline: '#F7EAFE',
  underline: '#CFD7FF',
  tagline: '#322347',
};

export const FeelynxLogo: React.FC<FeelynxLogoProps> = ({
  size = DEFAULT_WIDTH,
  glow = true,
  tagline,
  className,
  animate = false,
  theme = 'auto',
}) => {
  const width = size;
  const height = (size / VIEWBOX_WIDTH) * VIEWBOX_HEIGHT;

  const prefersDark =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : true;

  const isDark = theme === 'dark' || (theme === 'auto' && prefersDark);
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  return (
    <div className={cn('inline-flex flex-col items-center text-center', className)}>
      <svg
        role="img"
        aria-label="Feelynx logo"
        width={width}
        height={height}
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        className="max-w-full"
      >
        <defs>
          <linearGradient id="feelynx-wordmark" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.gradientFrom}>
              {animate ? (
                <animate
                  attributeName="stop-color"
                  values={`${colors.gradientFrom};${colors.gradientTo};${colors.gradientFrom}`}
                  dur="6s"
                  repeatCount="indefinite"
                />
              ) : null}
            </stop>
            <stop offset="100%" stopColor={colors.gradientTo}>
              {animate ? (
                <animate
                  attributeName="stop-color"
                  values={`${colors.gradientTo};${colors.gradientFrom};${colors.gradientTo}`}
                  dur="6s"
                  repeatCount="indefinite"
                />
              ) : null}
            </stop>
          </linearGradient>
          <filter id="feelynx-neon" x="-40%" y="-40%" width="180%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <path id="feelynx-underline" d="M180 318 C 380 392, 760 392, 980 300" />
        </defs>

        <g filter={glow ? 'url(#feelynx-neon)' : undefined}>
          <text
            x="50%"
            y="56%"
            textAnchor="middle"
            fontFamily="'Poppins', 'Inter', 'Segoe UI', system-ui, sans-serif"
            fontSize="206"
            fontWeight={800}
            letterSpacing={5}
            transform="skewX(-5)"
            fill="url(#feelynx-wordmark)"
            stroke={colors.outline}
            strokeWidth="18"
            strokeLinejoin="round"
          >
            Feelynx
          </text>
        </g>

        <use
          href="#feelynx-underline"
          stroke={colors.underline}
          strokeWidth="28"
          strokeLinecap="round"
          fill="none"
          opacity="0.65"
        />
        <use
          href="#feelynx-underline"
          stroke="url(#feelynx-wordmark)"
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
        >
          {animate ? (
            <animate
              attributeName="stroke-dasharray"
              from="0 800"
              to="820 20"
              dur="1.8s"
              fill="freeze"
            />
          ) : null}
        </use>
      </svg>
      {tagline ? (
        <span
          className="mt-2 text-sm font-medium"
          style={{ color: colors.tagline, letterSpacing: 1 }}
        >
          {tagline}
        </span>
      ) : null}
      {glow ? (
        <style>{`
          @keyframes feelynx-glow {
            0%, 100% { filter: drop-shadow(0 0 18px rgba(232,51,139,0.45)) drop-shadow(0 0 28px rgba(92,200,255,0.45)); }
            50% { filter: drop-shadow(0 0 26px rgba(232,51,139,0.75)) drop-shadow(0 0 36px rgba(92,200,255,0.7)); }
          }
          svg text { animation: feelynx-glow 2.8s ease-in-out infinite; }
        `}</style>
      ) : null}
    </div>
  );
};

export default FeelynxLogo;
