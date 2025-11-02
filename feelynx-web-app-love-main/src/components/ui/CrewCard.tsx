interface CrewCardProps {
  name: string;
  description: string;
  memberCount: number;
  category?: string;
}

export type { CrewCardProps };

export const CrewCard = ({ name, description, memberCount, category }: CrewCardProps) => {
  return (
    <article className="glass-card flex h-full flex-col gap-4 rounded-3xl p-5 text-foreground">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold leading-tight">{name}</h3>
        {category ? (
          <span className="rounded-full bg-secondary/20 px-3 py-1 text-xs uppercase tracking-wide text-secondary">
            {category}
          </span>
        ) : null}
      </div>
      <p className="text-sm text-foreground/70">{description}</p>
      <div className="flex items-center justify-between text-sm text-foreground/70">
        <span aria-label={`${memberCount.toLocaleString()} members`}>
          👥 {memberCount.toLocaleString()} members
        </span>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground/80">
          Fan Crew
        </span>
      </div>
    </article>
  );
};
