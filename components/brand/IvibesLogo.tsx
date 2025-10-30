'use client';

import React from 'react';
import { motion } from 'framer-motion';
import IvibesLogoBase, { type IvibesLogoProps } from '@/components/brand/IvibesLogo';

type Props = Omit<IvibesLogoProps, 'className'>;

const ENTER_VARIANTS = {
  hidden: { opacity: 0, y: 48, scale: 0.92 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export default function IvibesLogo({
  size = 480,
  glow = true,
  tagline,
  theme = 'auto',
  animate = true,
}: Props) {
  return (
    <div className="inline-flex select-none flex-col items-center gap-4 text-center">
      <motion.div
        initial={ENTER_VARIANTS.hidden}
        animate={ENTER_VARIANTS.visible}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <IvibesLogoBase size={size} glow={glow} tagline={tagline} animate={animate} theme={theme} />
      </motion.div>
    </div>
  );
}
