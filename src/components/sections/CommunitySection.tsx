import { motion } from 'framer-motion';
import { CrewCard } from '@/components/ui/CrewCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from '@/components/ui/Tooltip';

interface CommunityGroup {
  id: string | number;
  name: string;
  members: number;
  description: string;
  isLive?: boolean;
}

interface CommunitySectionProps {
  groups: CommunityGroup[];
}

export const CommunitySection = ({ groups }: CommunitySectionProps) => {
  const navigate = useNavigate();

  return (
    <motion.section
      aria-labelledby="community-section"
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 id="community-section" className="text-3xl font-semibold tracking-tight text-white">
            Family Crews
          </h2>
          <Tooltip content="Fan Crew: Curated micro-communities where fans gather for exclusive content, live chat boosts, and shared quests.">
            <p className="mt-1 text-base leading-relaxed text-white/70 cursor-help underline decoration-dotted">
              Join exclusive communities and unlock rewards
            </p>
          </Tooltip>
        </div>
        <Button
          variant="ghost"
          className="text-white/70 hover:text-white focus:ring-2 focus:ring-primary"
          onClick={() => navigate('/groups')}
          aria-label="View all family crews"
          tabIndex={0}
        >
          Explore all
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {groups.slice(0, 6).map((group) => (
          <CrewCard
            key={group.id}
            crew={{ ...group, xpReward: 150 }}
            onJoin={(id) => navigate(`/groups/${id}`)}
          />
        ))}
      </div>
    </motion.section>
  );
};
