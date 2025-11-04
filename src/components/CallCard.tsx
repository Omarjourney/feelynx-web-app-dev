import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CallSession from './CallSession';
import { PresenceStatus } from '@/lib/presence';

interface Creator {
  id: number;
  name: string;
  username: string;
  initial: string;
  gradientColors?: string;
  videoRate?: number;
}

export const CallCard = ({ creator, status }: { creator: Creator; status?: PresenceStatus }) => {
  const rateLabel = creator.videoRate != null ? `${creator.videoRate}💎/min` : '—';
  const gradient = creator.gradientColors ?? 'bg-gradient-to-br from-purple-600 to-pink-500';

  return (
  <Dialog>
    <div className="border rounded-lg overflow-hidden bg-card">
      <div className={`h-32 flex items-center justify-center text-6xl text-white ${gradient}`}>
        {creator.initial}
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{creator.name}</h3>
            {status && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${
                  status === 'available'
                    ? 'bg-emerald-600 text-white'
                    : status === 'busy'
                      ? 'bg-amber-600 text-white'
                      : 'bg-muted text-muted-foreground'
                }`}
                title={`Status: ${status}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${status === 'available' ? 'bg-white' : 'bg-white/70'}`}
                />
                {status}
              </span>
            )}
          </div>
          <Badge>{rateLabel}</Badge>
        </div>
        <DialogTrigger asChild>
          <Button className="w-full bg-gradient-primary text-primary-foreground" size="sm">
            Call
          </Button>
        </DialogTrigger>
      </div>
    </div>
    <DialogContent>
      <CallSession creatorName={creator.name} ratePerMinute={creator.videoRate ?? 0} />
    </DialogContent>
  </Dialog>
  );
};
