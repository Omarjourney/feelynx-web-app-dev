'use client';
import { motion } from 'framer-motion';
import FeelynxLogo from './FeelynxLogo';

export default function HeroLogoReveal() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#0B0720] to-[#120322] overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        <FeelynxLogo size={560} glow animate tagline="Feel. Connect. Sync." />
      </motion.div>

      <motion.div
        className="mt-10 flex gap-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <button className="px-8 py-4 bg-gradient-to-r from-[#E8338B] to-[#5CC8FF] text-white font-bold rounded-2xl hover:scale-105 transition-all">
          Get Started
        </button>
        <button className="px-8 py-4 border border-white/40 text-white rounded-2xl hover:bg-white/10 transition-all">
          Learn More
        </button>
      </motion.div>
    </div>
  );
}
