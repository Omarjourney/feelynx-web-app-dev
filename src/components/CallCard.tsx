import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CallSession from './CallSession';

interface Creator {
  id: number;
  name: string;
  username: string;
  initial: string;
  gradientColors: string;
  videoRate: number;
}

export const CallCard = ({ creator }: { creator: Creator }) => (
  <Dialog>
    <div className="border rounded-lg overflow-hidden bg-card">
      <div className={`h-32 flex items-center justify-center text-6xl text-white ${creator.gradientColors}`}>{creator.initial}</div>
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{creator.name}</h3>
          <Badge>{creator.videoRate}💎/min</Badge>
        </div>
        <DialogTrigger asChild>
          <Button className="w-full bg-gradient-primary text-primary-foreground" size="sm">
            Call
          </Button>
        </DialogTrigger>
      </div>
    </div>
    <DialogContent>
      <CallSession creatorName={creator.name} ratePerMinute={creator.videoRate} />
    </DialogContent>
  </Dialog>
);
