import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { creators } from '@/data/creators';
import { CallCard } from '@/components/CallCard';
import { usePresence } from '@/lib/presence';
import IvibesLogo from '@/components/brand/IvibesLogo';
import { BRAND } from '@/config';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const Connect = () => {
  const navigate = useNavigate();
  const handleTab = (t: string) => navigate(t === 'connect' ? '/connect' : `/${t}`);
  const presence = usePresence();
  const [format, setFormat] = useState<'any' | 'video' | 'voice'>('any');
  const [maxRate, setMaxRate] = useState<number | ''>('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const filterRate = (c: any) => {
    const rate = format === 'voice' ? c.voiceRate : c.videoRate;
    return maxRate === '' || rate <= Number(maxRate);
  };
  const filterAvail = (c: any) => !onlyAvailable || presence[c.username] === 'available';
  const sortByAvail = (a: any, b: any) => {
    const sa = presence[a.username] === 'available' ? 0 : 1;
    const sb = presence[b.username] === 'available' ? 0 : 1;
    if (sa !== sb) return sa - sb;
    const ra = format === 'voice' ? a.voiceRate : a.videoRate;
    const rb = format === 'voice' ? b.voiceRate : b.videoRate;
    return ra - rb;
  };
  const list = creators.filter(filterRate).filter(filterAvail).slice().sort(sortByAvail);
  const available = list.filter((c) => presence[c.username] === 'available');
  return (
    <div className="min-h-screen bg-background md:flex">
      <Navigation activeTab="discover" onTabChange={handleTab} />
      <main className="flex-1 overflow-x-hidden pb-24 md:pb-12">
        <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-10">
          <div className="rounded-3xl border border-border/60 bg-background/80 p-4">
            <h1 className="mb-4 text-2xl font-semibold text-foreground">Connect</h1>
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <div className="mb-1 text-xs text-muted-foreground">Format</div>
                <Select value={format} onValueChange={(v) => setFormat(v as any)}>
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
                  onChange={(e) => {
                    const v = e.target.value;
                    setMaxRate(v === '' ? '' : Number(v.replace(/[^0-9]/g, '')));
                  }}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                />
                Only available now
              </label>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-foreground">Available Now</h2>
            {available.length === 0 ? (
              <div className="rounded-2xl border border-border/60 bg-background/70 p-6 text-center">
                {BRAND.v2Wordmark ? (
                <IvibesLogo
                  size={160}
                  glow={false}
                  tagline="No one is available right now"
                  theme="light"
                />
                ) : (
                  <p className="text-sm text-muted-foreground">No one is available right now.</p>
                )}
                <p className="mt-3 text-xs text-muted-foreground">
                  Check back soon to grab a spot.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {available.map((c) => (
                  <CallCard key={c.id} creator={c} status={presence[c.username]} />
                ))}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">All Users</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {list.map((c) => (
                <CallCard key={c.id} creator={c} status={presence[c.username]} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Connect;
