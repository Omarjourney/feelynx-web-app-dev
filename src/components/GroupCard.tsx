import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Group } from '@/data/groups';
import { Link } from 'react-router-dom';

export const GroupCard = ({ group }: { group: Group }) => (
  <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-background/80 p-4 shadow-premium transition-transform hover:-translate-y-1">
    <div
      className="absolute inset-0 opacity-30"
      style={{
        backgroundImage: `url(${group.thumbnail})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      aria-hidden
    />
    <div className="relative space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{group.name}</h3>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Crew · {group.members.toLocaleString()} members
          </p>
        </div>
        {group.isLive ? (
          <Badge className="bg-live text-white animate-pulse">Live</Badge>
        ) : (
          <Badge variant="secondary" className="bg-secondary/60 text-secondary-foreground">
            Offline
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground line-clamp-3">{group.description}</p>
      <div className="flex items-center justify-between rounded-2xl border border-border/40 bg-background/70 px-4 py-3 text-xs text-muted-foreground">
        <span>🔥 Active chat rooms</span>
        <div className="flex items-center gap-1">
          <span
            className="relative inline-flex h-2.5 w-2.5 animate-glow-pulse rounded-full bg-live"
            aria-hidden
          />
          <span>Pulse online</span>
        </div>
      </div>
      <Link to={`/groups/${group.id}`}>
        <Button className="button-ripple w-full rounded-2xl" size="sm">
          Enter crew space
        </Button>
      </Link>
    </div>
  </div>
);
