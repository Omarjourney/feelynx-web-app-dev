import { CrewCard } from '@/components/ui/CrewCard';
import { Tooltip } from '@/components/ui/Tooltip';

type Crew = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  category?: string;
};

interface CommunitySectionProps {
  crews: Crew[];
}

export const CommunitySection = ({ crews }: CommunitySectionProps) => {
  return (
    <section aria-labelledby="community" className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 id="community" className="text-2xl font-medium">
            Crews & families
          </h2>
          <p className="text-base leading-relaxed text-foreground/70">
            Join moderated spaces to share playlists, rituals, and private updates.
          </p>
        </div>
        <Tooltip label="PK Battles are time-boxed competitions between crews with audience boosts.">
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
            PK Battles
          </span>
        </Tooltip>
      </div>

      <div className="grid gap-6 md:grid-cols-2" role="list">
        {crews.map((crew) => (
          <CrewCard
            key={crew.id}
            name={crew.name}
            members={crew.memberCount}
            description={crew.description}
            category={crew.category}
          />
        ))}
      </div>
    </section>
  );
};
