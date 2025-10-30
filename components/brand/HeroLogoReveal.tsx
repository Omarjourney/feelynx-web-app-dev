'use client';
import { motion } from 'framer-motion';
import FeelynxLogo from './FeelynxLogo';

export default function HeroLogoReveal() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#020617] via-[#051133] to-[#08174a] overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        <FeelynxLogo size={560} glow animate tagline="Feel the vibe. Live the show." />
      </motion.div>

      <motion.div
        className="mt-10 flex gap-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <button className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#00E5FF] via-[#3A7BFF] to-[#4D7CFF] text-white font-bold shadow-[0_0_35px_rgba(32,98,255,0.45)] transition-all hover:scale-105">
          Get Started
        </button>
        <button className="px-8 py-4 rounded-2xl border border-white/30 text-white/90 transition-all hover:bg-white/10">
          Learn more
        </button>
      </motion.div>
    </div>
  );
}
