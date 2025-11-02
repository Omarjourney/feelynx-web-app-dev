import { CreatorCard, CreatorCardProps } from '@/components/ui/CreatorCard';
import { Tooltip } from '@/components/ui/Tooltip';

interface DiscoverSectionProps {
  creators: CreatorCardProps[];
  onSelectCreator?: (creator: CreatorCardProps) => void;
}

export const DiscoverSection = ({ creators, onSelectCreator }: DiscoverSectionProps) => {
  return (
    <section aria-labelledby="discover" className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 id="discover" className="text-2xl font-medium">
            Featured creators
          </h2>
          <p className="text-base leading-relaxed text-foreground/70">
            Curated live shows with transparent Lovense goals and consistent schedules.
          </p>
        </div>
        <Tooltip label="Fan Crew creators are verified hosts with steady vibes and moderated chats.">
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
            Fan Crew
          </span>
        </Tooltip>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
        {creators.map((creator) => (
          <CreatorCard
            key={creator.name}
            {...creator}
            onSelect={() => onSelectCreator?.(creator)}
          />
        ))}
      </div>
    </section>
  );
};
