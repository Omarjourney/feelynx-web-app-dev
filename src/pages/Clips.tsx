import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Share2, Sparkles, Download } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { request } from '@/lib/api';
import { getUserMessage } from '@/lib/errors';

interface HighlightRecord {
  id: string;
  streamId: string;
  title: string;
  start: number;
  end: number;
  duration: number;
  clipUrl: string;
  previewImage: string;
  generatedAt: string;
  shareCounts: Record<string, number>;
  engagementPeak: number;
}

type HighlightsResponse = Record<string, HighlightRecord[]>;

type SharePlatform = 'tiktok' | 'instagram' | 'x';

const SOCIAL_ENDPOINT: Record<SharePlatform, (clip: HighlightRecord) => string> = {
  tiktok: (clip) => `https://www.tiktok.com/upload?video=${encodeURIComponent(clip.clipUrl)}`,
  instagram: (clip) => `intent://share?video=${encodeURIComponent(clip.clipUrl)}`,
  x: (clip) =>
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(clip.title)}&url=${encodeURIComponent(clip.clipUrl)}`,
};

const platformLabels: Record<SharePlatform, string> = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  x: 'X',
};

interface TrimState {
  startOffset: number;
  endOffset: number;
}

const getOffsetSeconds = (ms: number) => Math.round(ms / 100) / 10;

const ClipsPage = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<HighlightsResponse>({
    queryKey: ['highlights', 'all'],
    queryFn: () => request<HighlightsResponse>('/api/highlights'),
    staleTime: 30_000,
  });

  const flattened = useMemo(() => {
    if (!data) return [] as HighlightRecord[];
    return Object.values(data).flat();
  }, [data]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const activeHighlight = flattened.find((item) => item.id === activeId) ?? flattened[0];

  const [trimState, setTrimState] = useState<TrimState | null>(null);

  const patchHighlight = useMutation({
    mutationFn: async (variables: { highlight: HighlightRecord; trim: TrimState }) => {
      const { highlight, trim } = variables;
      const startMs = highlight.start + trim.startOffset * 1000;
      const endMs = highlight.end - (highlight.duration - trim.endOffset) * 1000;
      return request<HighlightRecord>(`/api/highlights/${highlight.streamId}/${highlight.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start: startMs, end: endMs }),
      });
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<HighlightsResponse>(['highlights', 'all'], (prev) => {
        if (!prev) return prev;
        const next: HighlightsResponse = { ...prev };
        const list = next[updated.streamId]?.map((item) => (item.id === updated.id ? updated : item));
        if (list) {
          next[updated.streamId] = list;
        }
        return next;
      });
      toast({ title: 'Highlight trimmed', description: 'Export window updated and ready to share.' });
    },
    onError: (error) => {
      toast({
        title: 'Unable to trim highlight',
        description: getUserMessage(error),
        variant: 'destructive',
      });
    },
  });

  const shareHighlight = useMutation({
    mutationFn: async (variables: { highlight: HighlightRecord; platform: SharePlatform }) => {
      return request<{ shareCounts: Record<string, number> }>(
        `/api/highlights/${variables.highlight.streamId}/${variables.highlight.id}/share`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ platform: variables.platform }),
        },
      );
    },
    onMutate: async ({ highlight, platform }) => {
      const previous = queryClient.getQueryData<HighlightsResponse>(['highlights', 'all']);
      queryClient.setQueryData<HighlightsResponse>(['highlights', 'all'], (prev) => {
        if (!prev) return prev;
        const next: HighlightsResponse = { ...prev };
        const list = next[highlight.streamId]?.map((item) =>
          item.id === highlight.id
            ? {
                ...item,
                shareCounts: {
                  ...item.shareCounts,
                  [platform]: (item.shareCounts[platform] ?? 0) + 1,
                },
              }
            : item,
        );
        if (list) {
          next[highlight.streamId] = list;
        }
        return next;
      });
      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['highlights', 'all'], context.previous);
      }
      toast({
        title: 'Share tracking failed',
        description: getUserMessage(error),
        variant: 'destructive',
      });
    },
    onSuccess: (data, { highlight }) => {
      queryClient.setQueryData<HighlightsResponse>(['highlights', 'all'], (prev) => {
        if (!prev) return prev;
        const next: HighlightsResponse = { ...prev };
        const list = next[highlight.streamId]?.map((item) =>
          item.id === highlight.id ? { ...item, shareCounts: data.shareCounts } : item,
        );
        if (list) {
          next[highlight.streamId] = list;
        }
        return next;
      });
    },
  });

  const handleTrimChange = (highlight: HighlightRecord, field: keyof TrimState, value: number) => {
    setTrimState((prev) => {
      const baseline: TrimState =
        prev ?? {
          startOffset: 0,
          endOffset: highlight.duration,
        };
      const nextValue = Math.max(0, Math.min(highlight.duration, value));
      const updated = { ...baseline, [field]: nextValue } as TrimState;
      if (field === 'startOffset' && updated.startOffset >= updated.endOffset) {
        updated.endOffset = Math.min(highlight.duration, updated.startOffset + 1);
      }
      if (field === 'endOffset' && updated.endOffset <= updated.startOffset) {
        updated.startOffset = Math.max(0, updated.endOffset - 1);
      }
      return updated;
    });
  };

  const commitTrim = (highlight: HighlightRecord) => {
    const state = trimState ?? { startOffset: 0, endOffset: highlight.duration };
    patchHighlight.mutate({ highlight, trim: state });
  };

  const openShareWindow = (platform: SharePlatform, highlight: HighlightRecord) => {
    const targetUrl = SOCIAL_ENDPOINT[platform](highlight);
    window.open(targetUrl, '_blank', 'noopener');
    shareHighlight.mutate({ platform, highlight });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-56 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!flattened.length) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-6 text-center">
        <Sparkles className="mx-auto h-12 w-12 text-primary" />
        <h1 className="text-3xl font-semibold">No highlights yet</h1>
        <p className="text-muted-foreground">
          Go live and let the AI curator auto-capture your peak moments. As soon as engagement surges, your
          highlights will land here ready to export.
        </p>
      </div>
    );
  }

  const trimTarget = activeHighlight ?? flattened[0];
  const effectiveTrim = trimState ?? { startOffset: 0, endOffset: trimTarget.duration };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-primary/70">Virality Lab</p>
          <h1 className="text-3xl font-semibold tracking-tight">AI Highlight Generator</h1>
          <p className="text-sm text-muted-foreground">
            Preview engagement spikes, trim auto-generated 10–20 second windows, and push viral clips to every network in one
            tap.
          </p>
        </div>
        <Button variant="outline" onClick={() => window.location.reload()} className="rounded-full">
          Refresh Clips
        </Button>
      </header>

      <main className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Moments</CardTitle>
            <CardDescription>Pick a spike to preview and share.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[28rem] pr-2">
              <div className="space-y-3">
                {flattened.map((highlight) => (
                  <button
                    key={highlight.id}
                    type="button"
                    onClick={() => {
                      setActiveId(highlight.id);
                      setTrimState(null);
                    }}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      (activeHighlight?.id ?? flattened[0].id) === highlight.id
                        ? 'border-primary/70 bg-primary/10 shadow'
                        : 'border-border bg-muted/30 hover:border-primary/40'
                    }`}
                  >
                    <p className="text-sm font-semibold">{highlight.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {getOffsetSeconds(highlight.start)}s → {getOffsetSeconds(highlight.end)}s ·
                      {` Engagement peak ${Math.round(highlight.engagementPeak)}`}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Shares: {Object.values(highlight.shareCounts).reduce((acc, value) => acc + value, 0)}
                    </p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <AnimatePresence mode="wait">
          {trimTarget ? (
            <motion.div
              key={trimTarget.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <Card className="overflow-hidden">
                <video
                  controls
                  poster={trimTarget.previewImage}
                  className="h-64 w-full object-cover"
                  src={trimTarget.clipUrl}
                >
                  <track
                    kind="captions"
                    label="English captions"
                    srcLang="en"
                    src={trimTarget.clipUrl.replace(/\.mp4$/, '.vtt')}
                    default
                  />
                </video>
                <div className="space-y-4 p-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">{trimTarget.title}</h2>
                      <p className="text-sm text-muted-foreground">
                        Generated {new Date(trimTarget.generatedAt).toLocaleString()} · {trimTarget.duration}s window
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {(Object.keys(SOCIAL_ENDPOINT) as SharePlatform[]).map((platform) => (
                        <Button
                          key={platform}
                          size="sm"
                          variant="secondary"
                          onClick={() => openShareWindow(platform, trimTarget)}
                          className="rounded-full"
                        >
                          <Share2 className="mr-2 h-4 w-4" />
                          {platformLabels[platform]}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Tabs defaultValue="trim">
                    <TabsList>
                      <TabsTrigger value="trim">Trim</TabsTrigger>
                      <TabsTrigger value="export">Export</TabsTrigger>
                      <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </TabsList>
                    <TabsContent value="trim" className="mt-4 space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="trim-start">Start offset (seconds)</Label>
                          <Input
                            id="trim-start"
                            type="number"
                            min={0}
                            max={trimTarget.duration - 1}
                            value={effectiveTrim.startOffset}
                            onChange={(event) =>
                              handleTrimChange(trimTarget, 'startOffset', Number(event.target.value))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="trim-end">End offset (seconds)</Label>
                          <Input
                            id="trim-end"
                            type="number"
                            min={1}
                            max={trimTarget.duration}
                            value={effectiveTrim.endOffset}
                            onChange={(event) =>
                              handleTrimChange(trimTarget, 'endOffset', Number(event.target.value))
                            }
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Exporting {Math.max(1, Math.round(effectiveTrim.endOffset - effectiveTrim.startOffset))}s highlight
                        </p>
                        <Button
                          onClick={() => commitTrim(trimTarget)}
                          disabled={patchHighlight.isPending}
                          className="rounded-full"
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                          Save Trim
                        </Button>
                      </div>
                    </TabsContent>
                    <TabsContent value="export" className="mt-4 space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Download the clip and schedule the drop across your social calendar.
                      </p>
                      <Button asChild variant="outline" className="w-fit rounded-full">
                        <a href={trimTarget.clipUrl} download>
                          <Download className="mr-2 h-4 w-4" /> Download MP4
                        </a>
                      </Button>
                    </TabsContent>
                    <TabsContent value="analytics" className="mt-4 space-y-2">
                      <div className="rounded-2xl border border-border bg-muted/30 p-4 text-sm">
                        <p>
                          Share velocity:{' '}
                          <span className="font-semibold">
                            {Object.values(trimTarget.shareCounts).reduce((acc, value) => acc + value, 0)} total shares
                          </span>
                        </p>
                        <p className="text-muted-foreground">
                          Engagement score {Math.round(trimTarget.engagementPeak)} · Auto-generated from viewer spikes,
                          💎 bursts, and reactions.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </Card>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ClipsPage;
