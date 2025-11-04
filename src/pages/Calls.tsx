import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CallCard } from '@/components/CallCard';
import { usePresence } from '@/lib/presence';
import FeelynxLogo from '@/components/brand/FeelynxLogo';
import { BRAND } from '@/config';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { fetchCreators } from '@/data/creators';
import type { Creator } from '@/types/creator';
import { toast } from '@/hooks/use-toast';
import { getUserMessage } from '@/lib/errors';

const Calls = () => {
  const presence = usePresence();
  const [format, setFormat] = useState<'any' | 'video' | 'voice'>('any');
  const [maxRate, setMaxRate] = useState<number | ''>('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const {
    data: creators = [],
    isLoading,
  } = useQuery({
    queryKey: ['calls-creators'],
    queryFn: ({ signal }) => fetchCreators({}, signal),
    staleTime: 30_000,
    onError: (error) =>
      toast({
        title: 'Unable to load calls roster',
        description: getUserMessage(error),
        variant: 'destructive',
      }),
  });

  const matchRate = (creator: Creator) => {
    const rate = format === 'voice' ? creator.voiceRate : creator.videoRate;
    if (maxRate === '') return true;
    if (rate == null) return false;
    return rate <= Number(maxRate);
  };

  const filterAvailability = (creator: Creator) =>
    !onlyAvailable || presence[creator.username] === 'available';

  const sortCreators = (a: Creator, b: Creator) => {
    const availabilityA = presence[a.username] === 'available' ? 0 : 1;
    const availabilityB = presence[b.username] === 'available' ? 0 : 1;
    if (availabilityA !== availabilityB) return availabilityA - availabilityB;
    const rateA = format === 'voice' ? a.voiceRate ?? Infinity : a.videoRate ?? Infinity;
    const rateB = format === 'voice' ? b.voiceRate ?? Infinity : b.videoRate ?? Infinity;
    return rateA - rateB;
  };

  const filteredCreators = creators.filter(matchRate).filter(filterAvailability).sort(sortCreators);
  const available = filteredCreators.filter((creator) => presence[creator.username] === 'available');

  return (
    <div className="min-h-screen bg-background">
      <main className="flex-1 overflow-x-hidden pb-24 md:pb-12">
        <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10">
          <div className="flex flex-wrap items-end gap-3 rounded-3xl border border-border/60 bg-background/80 p-4">
            <div>
              <div className="mb-1 text-xs text-muted-foreground">Format</div>
              <Select value={format} onValueChange={(value) => setFormat(value as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="voice">Voice</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="mb-1 text-xs text-muted-foreground">Max rate (💎/min)</div>
              <Input
                className="w-28"
                inputMode="numeric"
                placeholder="No cap"
                value={maxRate}
                onChange={(event) => {
                  const value = event.target.value;
                  setMaxRate(value === '' ? '' : Number(value.replace(/[^0-9]/g, '')));
                }}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(event) => setOnlyAvailable(event.target.checked)}
              />
              Only available now
            </label>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Available Now</h2>
            {available.length === 0 ? (
              <div className="rounded-2xl border border-border/60 bg-background/70 p-6 text-center">
                {BRAND.v2Wordmark ? (
                  <FeelynxLogo
                    size={160}
                    glow={false}
                    tagline={isLoading ? 'Syncing availability…' : 'No one is available right now'}
                    theme="light"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? 'Syncing availability…' : 'No one is available right now.'}
                  </p>
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  Check back soon to line up your call.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {available.map((creator) => (
                  <CallCard key={creator.id} creator={creator} status={presence[creator.username]} />
                ))}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">All Creators</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filteredCreators.map((creator) => (
                <CallCard key={creator.id} creator={creator} status={presence[creator.username]} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Calls;
