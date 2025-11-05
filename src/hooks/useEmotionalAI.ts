import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { EngagementSnapshot } from '../../api/ai/engagement';

type AnimationState = 'calm' | 'focus' | 'hype' | 'reflective';

const DEFAULT_CREATOR_ID = 'demo-creator';

async function fetchEngagement(creatorId: string): Promise<EngagementSnapshot> {
  const search = new URLSearchParams({ creatorId });
  const response = await fetch(`/api/ai/engagement?${search.toString()}`);
  if (!response.ok) {
    throw new Error('Unable to load engagement insights');
  }

  return (await response.json()) as EngagementSnapshot;
}

const deriveAnimationState = (snapshot?: EngagementSnapshot): AnimationState => {
  if (!snapshot) return 'calm';

  if (snapshot.engagementScore >= 90) return 'hype';
  if (snapshot.engagementScore >= 70) return 'focus';
  if (snapshot.sentimentTrend === 'down') return 'calm';
  return snapshot.mood;
};

export const useEmotionalAI = (creatorId?: string) => {
  const [history, setHistory] = useState<EngagementSnapshot[]>([]);

  const query = useQuery<EngagementSnapshot>({
    queryKey: ['engagement', creatorId ?? DEFAULT_CREATOR_ID],
    queryFn: () => fetchEngagement(creatorId ?? DEFAULT_CREATOR_ID),
    refetchInterval: 10_000,
    refetchIntervalInBackground: true,
  });

  const { data } = query;

  useEffect(() => {
    if (!data) return;
    setHistory((prev) => {
      const next = [...prev, data];
      return next.slice(-12);
    });
  }, [data]);

  const animationState = useMemo(() => deriveAnimationState(data), [data]);

  return {
    ...query,
    animationState,
    history,
  };
};

export type UseEmotionalAIReturn = ReturnType<typeof useEmotionalAI>;
