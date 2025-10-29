'use client';
import React from 'react';
import { motion } from 'framer-motion';

type Props = {
  size?: number;
  glow?: boolean;
  tagline?: string;
  theme?: 'auto' | 'light' | 'dark';
  animate?: boolean;
};

export default function FeelynxLogo({
  size = 480,
  glow = true,
  tagline,
  theme = 'auto',
  animate = true,
}: Props) {
  const isDark =
    theme === 'dark' ||
    (theme === 'auto' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const gradientFrom = isDark ? '#E8338B' : '#FF4FD8';
  const gradientTo = isDark ? '#5CC8FF' : '#0077FF';
  const outline = isDark ? '#1B1230' : '#A2B4D0';

  return (
    <div className="inline-flex flex-col items-center select-none transition-all duration-500 ease-in-out">
      <motion.svg
        role="img"
        aria-label="Feelynx logo"
        width={size}
        viewBox="0 0 1200 420"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <defs>
          <linearGradient id="fx" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={gradientFrom}>
              <animate
                attributeName="stop-color"
                values="#E8338B;#5CC8FF;#E8338B"
                dur="6s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor={gradientTo}>
              <animate
                attributeName="stop-color"
                values="#5CC8FF;#E8338B;#5CC8FF"
                dur="6s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>

          <filter id="neon" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="b1" />
            <feMerge>
              <feMergeNode in="b1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <path id="swoosh" d="M170 320 C 410 400, 785 400, 1030 310" />
        </defs>

        {/* Wordmark */}
        <g filter={glow ? 'url(#neon)' : undefined}>
          <motion.text
            x="50%"
            y="58%"
            textAnchor="middle"
            fontFamily="Bangers, Impact, system-ui, sans-serif"
            fontSize="220"
            fontWeight="900"
            transform="skewX(-8)"
            fill="url(#fx)"
            stroke={outline}
            strokeWidth={20}
            strokeLinejoin="round"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Feelynx
          </motion.text>
        </g>

        {/* Animated underline */}
        <motion.use
          href="#swoosh"
          stroke={outline}
          strokeWidth={26}
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={animate ? { pathLength: 1 } : {}}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
        <motion.use
          href="#swoosh"
          stroke="url(#fx)"
          strokeWidth={14}
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={animate ? { pathLength: 1 } : {}}
          transition={{ duration: 2.3, delay: 0.2, ease: 'easeInOut' }}
        />
      </motion.svg>

      {tagline && (
        <motion.div
          className="mt-2 text-base md:text-lg text-center"
          style={{
            color: isDark ? '#EAE9FF' : '#0A0A0A',
            opacity: 0.9,
            letterSpacing: 1.5,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {tagline}
        </motion.div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { filter: drop-shadow(0 0 18px rgba(255,79,216,0.55)) drop-shadow(0 0 26px rgba(92,200,255,0.45)); }
          50% { filter: drop-shadow(0 0 28px rgba(255,79,216,0.85)) drop-shadow(0 0 38px rgba(92,200,255,0.7)); }
        }
        svg text { animation: ${glow ? 'pulse 2.4s ease-in-out infinite' : 'none'}; }
      `}</style>
    </div>
  );
}
