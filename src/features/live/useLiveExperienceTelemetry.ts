import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useLiveBlueprintStore } from '@/stores/useLiveBlueprintStore';

const SUGGESTION_LIBRARY: Array<{ threshold: number; message: string }> = [
  {
    threshold: 0.55,
    message: 'Ask viewers about their mood to lift the vibe 💬',
  },
  {
    threshold: 0.68,
    message: 'Trigger a spotlight moment—invite reactions now ✨',
  },
  {
    threshold: 0.8,
    message: 'Celebrate the streak and shout out top supporters 🎉',
  },
];

type TelemetryOptions = {
  creatorId: string;
  initialViewers?: number;
  baseLatencyMs?: number;
  enabled?: boolean;
};

type TelemetryResult = {
  metrics: ReturnType<typeof useLiveBlueprintStore>['kpi'];
  isLive: boolean;
  cameraOn: boolean;
  goLive: () => void;
  endSession: () => void;
  toggleCamera: () => void;
  suggestions: string[];
};

const VIEWER_UPDATE_INTERVAL = 5000;
const TOKEN_UPDATE_INTERVAL = 12000;

export function useLiveExperienceTelemetry({
  creatorId,
  initialViewers = 420,
  baseLatencyMs = 190,
  enabled = true,
}: TelemetryOptions): TelemetryResult {
  const metrics = useLiveBlueprintStore((state) => state.kpi);
  const isLive = useLiveBlueprintStore((state) => state.isLive);
  const cameraOn = useLiveBlueprintStore((state) => state.cameraOn);
  const startSession = useLiveBlueprintStore((state) => state.startSession);
  const endSession = useLiveBlueprintStore((state) => state.endSession);
  const toggleCamera = useLiveBlueprintStore((state) => state.toggleCamera);
  const setViewerCount = useLiveBlueprintStore((state) => state.setViewerCount);
  const addTokens = useLiveBlueprintStore((state) => state.addTokens);
  const updateLatency = useLiveBlueprintStore((state) => state.updateLatency);
  const pushEngagement = useLiveBlueprintStore((state) => state.pushEngagement);
  const updateSentiment = useLiveBlueprintStore((state) => state.updateSentiment);
  const setReactionSuggestions = useLiveBlueprintStore((state) => state.setReactionSuggestions);

  useEffect(() => {
    if (!enabled) return undefined;

    startSession(initialViewers);
    setViewerCount(initialViewers);
    return () => {
      endSession();
    };
  }, [enabled, endSession, initialViewers, setViewerCount, startSession]);

  useEffect(() => {
    if (!isLive || !enabled) return undefined;

    const viewerInterval = window.setInterval(() => {
      const now = Date.now();
      const liveWave = Math.sin(now / 60000) * 0.08;
      const microSurge = Math.sin(now / 12000) * 0.05;
      const blendedRate = Math.max(0.55, 0.7 + liveWave + microSurge);
      const nextViewers = Math.max(12, Math.round(initialViewers * (1 + liveWave * 2 + microSurge)));
      const latency = baseLatencyMs + Math.sin(now / 5000) * 22;
      setViewerCount(nextViewers);
      pushEngagement(blendedRate);
      updateLatency(latency);
      updateSentiment(0.62 + Math.sin(now / 45000) * 0.14);
    }, VIEWER_UPDATE_INTERVAL);

    const tokenInterval = window.setInterval(() => {
      const wave = 1 + Math.sin(Date.now() / 20000);
      const burst = wave > 1.3 ? 120 : 60;
      addTokens(burst, { source: 'tips' });
    }, TOKEN_UPDATE_INTERVAL);

    return () => {
      window.clearInterval(viewerInterval);
      window.clearInterval(tokenInterval);
    };
  }, [addTokens, baseLatencyMs, enabled, initialViewers, isLive, pushEngagement, setViewerCount, updateLatency, updateSentiment]);

  const suggestionQuery = useQuery({
    queryKey: ['live-blueprint', creatorId, 'suggestions'],
    refetchInterval: 7000,
    enabled: isLive && enabled,
    queryFn: async () => {
      const snapshot = useLiveBlueprintStore.getState().kpi;
      const sorted = SUGGESTION_LIBRARY.filter((item) => snapshot.engagementRate <= item.threshold).map(
        (item) => item.message,
      );
      if (sorted.length === 0) {
        sorted.push('Keep the momentum! Try a quick Q&A pulse ⚡️');
      }
      return sorted;
    },
  });

  useEffect(() => {
    if (suggestionQuery.data) {
      setReactionSuggestions(suggestionQuery.data);
    }
  }, [setReactionSuggestions, suggestionQuery.data]);

  const suggestions = useMemo(() => suggestionQuery.data ?? metrics.reactionSuggestions, [metrics, suggestionQuery.data]);

  return {
    metrics,
    isLive,
    cameraOn,
    goLive: () => {
      if (!enabled) return;
      startSession(initialViewers);
    },
    endSession: () => {
      if (!enabled) return;
      endSession();
    },
    toggleCamera,
    suggestions,
  };
}

export default useLiveExperienceTelemetry;
