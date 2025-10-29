import React from 'react';
import { cn } from '@/lib/utils';

type FeelynxLogoProps = {
  /**
   * Width in pixels for the SVG. Height scales proportionally.
   */
  size?: number;
  /**
   * Enables the neon glow filter.
   */
  glow?: boolean;
  /**
   * Optional tagline rendered below the wordmark.
   */
  tagline?: string;
  /**
   * Additional class names passed to the wrapper.
   */
  className?: string;
};

const DEFAULT_WIDTH = 360;
const VIEWBOX_WIDTH = 1200;
const VIEWBOX_HEIGHT = 420;

export const FeelynxLogo: React.FC<FeelynxLogoProps> = ({
  size = DEFAULT_WIDTH,
  glow = true,
  tagline,
  className,
}) => {
  const width = size;
  const height = (size / VIEWBOX_WIDTH) * VIEWBOX_HEIGHT;

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
          <linearGradient id="feelynx-wordmark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--feelynx-pink)" />
            <stop offset="100%" stopColor="var(--feelynx-cyan)" />
          </linearGradient>
          <filter id="feelynx-neon" x="-40%" y="-50%" width="180%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <path id="feelynx-swoosh" d="M140 320 C 380 400, 820 400, 1060 300" />
        </defs>

        <g filter={glow ? 'url(#feelynx-neon)' : undefined}>
          <text
            x="50%"
            y="58%"
            textAnchor="middle"
            fontFamily="'Bangers', 'Impact', 'Trebuchet MS', system-ui, sans-serif"
            fontSize="220"
            fontWeight={900}
            transform="skewX(-8)"
            fill="url(#feelynx-wordmark)"
            stroke="var(--feelynx-outline)"
            strokeWidth="22"
            strokeLinejoin="round"
          >
            Feelynx
          </text>
        </g>

        <use
          href="#feelynx-swoosh"
          stroke="var(--feelynx-outline)"
          strokeWidth="28"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />
        <use
          href="#feelynx-swoosh"
          stroke="url(#feelynx-wordmark)"
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      {tagline ? (
        <span className="mt-2 text-sm font-medium text-foreground/80">{tagline}</span>
      ) : null}
    </div>
  );
};

export default FeelynxLogo;
