import { create } from 'zustand';

export type EmotionState = 'Calm' | 'Hype' | 'Flirty' | 'Supportive' | 'Playful';

export type LiveSessionKPI = {
  viewerCount: number;
  peakViewers: number;
  tokenTotal: number;
  tokensPerMinute: number;
  engagementRate: number;
  sentimentScore: number;
  latencyMs: number;
  sessionStart: number | null;
  lastUpdated: number;
  reactionSuggestions: string[];
};

type TokenEvent = {
  timestamp: number;
  amount: number;
  source: 'tips' | 'gifts' | 'subscription';
};

type LiveBlueprintStore = {
  isLive: boolean;
  cameraOn: boolean;
  kpi: LiveSessionKPI;
  tokenEvents: TokenEvent[];
  emotionState: EmotionState;
  lastEmotionShift: number | null;
  startSession: (initialViewers?: number) => void;
  endSession: () => void;
  toggleCamera: () => void;
  setViewerCount: (count: number) => void;
  addTokens: (amount: number, metadata?: { source?: TokenEvent['source'] }) => void;
  updateLatency: (latency: number) => void;
  pushEngagement: (engagement: number) => void;
  updateSentiment: (sentiment: number) => void;
  setReactionSuggestions: (suggestions: string[]) => void;
  setEmotionState: (state: EmotionState) => void;
  reset: () => void;
};

const initialKpi: LiveSessionKPI = {
  viewerCount: 0,
  peakViewers: 0,
  tokenTotal: 0,
  tokensPerMinute: 0,
  engagementRate: 0.65,
  sentimentScore: 0.6,
  latencyMs: 240,
  sessionStart: null,
  lastUpdated: Date.now(),
  reactionSuggestions: [],
};

const MAX_TOKEN_EVENTS = 36;

export const useLiveBlueprintStore = create<LiveBlueprintStore>((set, _get) => ({
  isLive: false,
  cameraOn: true,
  kpi: initialKpi,
  tokenEvents: [],
  emotionState: 'Calm',
  lastEmotionShift: null,
  startSession: (initialViewers = 0) => {
    const now = Date.now();
    set((state) => ({
      isLive: true,
      cameraOn: true,
      kpi: {
        ...state.kpi,
        viewerCount: initialViewers,
        peakViewers: Math.max(initialViewers, state.kpi.peakViewers),
        sessionStart: state.kpi.sessionStart ?? now,
        lastUpdated: now,
      },
    }));
  },
  endSession: () => {
    set((state) => ({
      isLive: false,
      kpi: {
        ...state.kpi,
        viewerCount: 0,
        tokensPerMinute: 0,
        latencyMs: 0,
        lastUpdated: Date.now(),
      },
    }));
  },
  toggleCamera: () => set((state) => ({ cameraOn: !state.cameraOn })),
  setViewerCount: (count) => {
    set((state) => ({
      kpi: {
        ...state.kpi,
        viewerCount: count,
        peakViewers: Math.max(count, state.kpi.peakViewers),
        lastUpdated: Date.now(),
      },
    }));
  },
  addTokens: (amount, metadata) => {
    if (!amount) return;

    set((state) => {
      const now = Date.now();
      const start = state.kpi.sessionStart ?? now;
      const elapsedMinutes = Math.max(1 / 60, (now - start) / 60000);
      const nextTokenTotal = state.kpi.tokenTotal + amount;
      const nextTokensPerMinute = nextTokenTotal / elapsedMinutes;
      const event: TokenEvent = {
        timestamp: now,
        amount,
        source: metadata?.source ?? 'tips',
      };

      if (typeof window !== 'undefined' && 'vibrate' in window.navigator) {
        window.navigator.vibrate(24);
      }

      return {
        kpi: {
          ...state.kpi,
          tokenTotal: nextTokenTotal,
          tokensPerMinute: Math.round(nextTokensPerMinute),
          lastUpdated: now,
        },
        tokenEvents: [...state.tokenEvents.slice(-MAX_TOKEN_EVENTS + 1), event],
      };
    });
  },
  updateLatency: (latency) => {
    set((state) => ({
      kpi: {
        ...state.kpi,
        latencyMs: Math.max(0, Math.round(latency)),
        lastUpdated: Date.now(),
      },
    }));
  },
  pushEngagement: (engagement) => {
    set((state) => ({
      kpi: {
        ...state.kpi,
        engagementRate: Math.min(0.99, Math.max(0.2, engagement)),
        lastUpdated: Date.now(),
      },
    }));
  },
  updateSentiment: (sentiment) => {
    set((state) => ({
      kpi: {
        ...state.kpi,
        sentimentScore: Math.min(1, Math.max(0, sentiment)),
        lastUpdated: Date.now(),
      },
    }));
  },
  setReactionSuggestions: (suggestions) => {
    set((state) => ({
      kpi: {
        ...state.kpi,
        reactionSuggestions: suggestions,
        lastUpdated: Date.now(),
      },
    }));
  },
  setEmotionState: (state) => {
    set((current) => ({
      emotionState: state,
      lastEmotionShift: Date.now(),
    }));
  },
  reset: () => {
    set({
      isLive: false,
      cameraOn: true,
      kpi: { ...initialKpi, lastUpdated: Date.now() },
      tokenEvents: [],
      emotionState: 'Calm',
      lastEmotionShift: null,
    });
  },
}));

export type { TokenEvent };
