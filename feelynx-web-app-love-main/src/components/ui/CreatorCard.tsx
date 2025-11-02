import type { KeyboardEvent } from 'react';
import { Tooltip } from './Tooltip';

interface CreatorCardProps {
  name: string;
  live: boolean;
  thumbnail: string;
  earnings: string;
  onSelect?: () => void;
}

export type { CreatorCardProps };

export const CreatorCard = ({ name, live, thumbnail, earnings, onSelect }: CreatorCardProps) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.key === 'Enter' || event.key === ' ') && onSelect) {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <article
      className="glass-card flex flex-col overflow-hidden rounded-3xl text-foreground transition hover:bg-white/10"
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      aria-label={`Open creator profile for ${name}`}
    >
      <div className="relative h-44 w-full overflow-hidden">
        <img
          src={thumbnail}
          alt=""
          className="h-full w-full object-cover"
        />
        {live && (
          <Tooltip label="LIVE with Lovense">
            <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
              <span className="h-2 w-2 rounded-full bg-white" aria-hidden />
              Live now
            </span>
          </Tooltip>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold leading-tight">{name}</h3>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-foreground/70">
            {earnings}
          </span>
        </div>
        <p className="text-sm text-foreground/70">
          Chill ambience, responsive chat, and safe moderation for a steady fan crew.
        </p>
      </div>
    </article>
  );
};
