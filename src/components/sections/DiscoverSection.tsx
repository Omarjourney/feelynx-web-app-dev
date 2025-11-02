import { motion } from 'framer-motion';
import { CreatorCard } from '@/components/CreatorCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import type { Creator } from '@/types/creator';

interface DiscoverSectionProps {
  creators: Creator[];
  onViewProfile: (id: number) => void;
}

export const DiscoverSection = ({ creators, onViewProfile }: DiscoverSectionProps) => {
  const navigate = useNavigate();
  const liveCreators = creators.filter((c) => c.isLive).slice(0, 8);

  return (
    <motion.section
      aria-labelledby="discover-section"
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 id="discover-section" className="text-3xl font-semibold tracking-tight text-white">
            🔴 Live Creators
          </h2>
          <p className="mt-1 text-base leading-relaxed text-white/70">
            Featured creators streaming right now
          </p>
        </div>
        <Button
          variant="ghost"
          className="text-white/70 hover:text-white focus:ring-2 focus:ring-primary"
          onClick={() => navigate('/creators')}
          aria-label="View all live creators"
          tabIndex={0}
        >
          View all
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {liveCreators.map((creator) => (
          <CreatorCard key={creator.id} creator={creator} onViewProfile={onViewProfile} />
        ))}
      </div>
    </motion.section>
  );
};
