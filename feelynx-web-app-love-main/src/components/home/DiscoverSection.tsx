import { CreatorCard, type CreatorCardProps } from '../ui/CreatorCard';
import { Tooltip } from '../ui/Tooltip';

interface DiscoverSectionProps {
  creators: CreatorCardProps[];
  onSelectCreator?: (creator: CreatorCardProps) => void;
}

export const DiscoverSection = ({ creators, onSelectCreator }: DiscoverSectionProps) => {
  return (
    <section id="discover" aria-labelledby="discover-heading" className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 id="discover-heading">Featured creators</h2>
          <p className="text-foreground/70">
            A calm grid that highlights safe, curated rooms with consistent schedules and vibe goals.
          </p>
        </div>
        <Tooltip label="Fan Crew creators are moderated performers with reliable Lovense setups and community guidelines.">
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/70">
            Fan Crew
          </span>
        </Tooltip>
      </div>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Featured creator profiles">
        {creators.map((creator) => (
          <li key={creator.name} className="list-none">
            <CreatorCard
              {...creator}
              onSelect={() => onSelectCreator?.(creator)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
};
