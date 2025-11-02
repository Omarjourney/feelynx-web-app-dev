import { CrewCard, type CrewCardProps } from '../ui/CrewCard';
import { Tooltip } from '../ui/Tooltip';

interface CommunitySectionProps {
  crews: CrewCardProps[];
}

export const CommunitySection = ({ crews }: CommunitySectionProps) => {
  return (
    <section id="community" aria-labelledby="community-heading" className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 id="community-heading">Crews & Families</h2>
          <p className="text-foreground/70">
            Organize supporters into collaborative squads with scheduling, moderation, and private reward drops.
          </p>
        </div>
        <Tooltip label="PK Battles are friendly competitions between crews to boost engagement without toxic pressure.">
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/70">
            PK Battles
          </span>
        </Tooltip>
      </div>

      <div className="grid gap-6 sm:grid-cols-2" role="list">
        {crews.map((crew) => (
          <CrewCard key={crew.name} {...crew} />
        ))}
      </div>
    </section>
  );
};
