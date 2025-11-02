import { Users } from 'lucide-react';

interface CrewCardProps {
  name: string;
  members: number;
  description: string;
  category?: string;
}

export const CrewCard = ({ name, members, description, category }: CrewCardProps) => {
  return (
    <article
      className="glass-card flex h-full flex-col justify-between rounded-3xl p-5 shadow-lg transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      tabIndex={0}
      aria-label={`${name} crew with ${members} members`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">{name}</h3>
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary/40 px-3 py-1 text-xs font-medium text-foreground/80">
            <Users className="h-4 w-4" aria-hidden />
            {members.toLocaleString()} members
          </span>
        </div>
        <p className="text-sm leading-relaxed text-foreground/70">{description}</p>
      </div>
      {category && (
        <span className="mt-4 inline-flex w-fit items-center rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
          {category}
        </span>
      )}
    </article>
  );
};
