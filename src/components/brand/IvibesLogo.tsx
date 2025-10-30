import React from 'react';
import { cn } from '@/lib/utils';

export type IvibesLogoProps = {
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
  gradientFrom: '#00E5FF',
  gradientTo: '#4D7CFF',
  outline: '#0A183C',
  underline: '#15306A',
  tagline: '#C7D6FF',
};

const LIGHT_COLORS = {
  gradientFrom: '#0062FF',
  gradientTo: '#00B9FF',
  outline: '#5B7FE6',
  underline: '#90ABFF',
  tagline: '#102043',
};

export const IvibesLogo: React.FC<IvibesLogoProps> = ({
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
        aria-label="iVibes logo"
        width={width}
        height={height}
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        className="max-w-full"
      >
        <defs>
          <linearGradient id="ivibes-wordmark" x1="0%" y1="0%" x2="100%" y2="0%">
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
          <filter id="ivibes-neon" x="-40%" y="-40%" width="180%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <path id="ivibes-underline" d="M180 318 C 380 392, 760 392, 980 300" />
        </defs>

        <g filter={glow ? 'url(#ivibes-neon)' : undefined}>
          <text
            x="50%"
            y="56%"
            textAnchor="middle"
            fontFamily="'Poppins', 'Inter', 'Segoe UI', system-ui, sans-serif"
            fontSize="212"
            fontWeight={800}
            letterSpacing={6}
            transform="skewX(-5)"
            fill="url(#ivibes-wordmark)"
            stroke={colors.outline}
            strokeWidth="18"
            strokeLinejoin="round"
          >
            iVibes
          </text>
        </g>

        <use
          href="#ivibes-underline"
          stroke={colors.underline}
          strokeWidth="28"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
        <use
          href="#ivibes-underline"
          stroke="url(#ivibes-wordmark)"
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
          @keyframes ivibes-glow {
            0%, 100% { filter: drop-shadow(0 0 18px rgba(77,124,255,0.55)) drop-shadow(0 0 28px rgba(0,229,255,0.45)); }
            50% { filter: drop-shadow(0 0 26px rgba(77,124,255,0.85)) drop-shadow(0 0 36px rgba(0,229,255,0.7)); }
          }
          svg text { animation: ivibes-glow 2.8s ease-in-out infinite; }
        `}</style>
      ) : null}
    </div>
  );
};

export default IvibesLogo;
