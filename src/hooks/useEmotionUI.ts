import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { toast } from '@/hooks/use-toast';

export type EmotionMood = 'positive' | 'neutral' | 'negative';
export type EmotionTone = 'warm' | 'violet' | 'cool';

type EmotionPayload = {
  sentimentScore?: number;
  engagementRate?: number;
  tokensPerMinute?: number;
  viewerCount?: number;
};

type EmotionBurst = {
  id: number;
  emoji: string;
  left: number;
  rotation: number;
};

type LayoutState = {
  chatExpanded: boolean;
  showParticipants: boolean;
  quietMode: boolean;
};

export type EmotionUIController = {
  mood: EmotionMood;
  tone: EmotionTone;
  confidence: number;
  cssVariables: EmotionCSSVariables;
  backgroundGradient: string;
  backgroundFilter: string;
  glassSurfaceStyle: CSSProperties;
  emojiBursts: EmotionBurst[];
  layout: LayoutState;
  registerChatMessage: (message: string) => Promise<void>;
  registerTip: (amount: number) => void;
  registerEngagement: () => void;
  removeBurst: (id: number) => void;
};

type EmotionCSSVariables = CSSProperties & {
  '--glass-opacity'?: string;
  '--glow-intensity'?: string;
};

const POSITIVE_BURSTS = ['✨', '💖', '🌈', '🔥', '🎉', '🫶', '💫'];
const NEUTRAL_TONES: EmotionTone = 'violet';

const TONE_FROM_MOOD: Record<EmotionMood, EmotionTone> = {
  positive: 'warm',
  neutral: 'violet',
  negative: 'cool',
};

const TARGET_GLASS_OPACITY: Record<EmotionMood, number> = {
  positive: 0.35,
  neutral: 0.42,
  negative: 0.5,
};

const TARGET_GLOW: Record<EmotionMood, number> = {
  positive: 0.65,
  neutral: 0.42,
  negative: 0.28,
};

const MOOD_MESSAGES: Record<EmotionMood, { title: string; description: string }> = {
  positive: {
    title: 'Chat vibe is glowing ✨',
    description: 'Feelynx switched to warm lighting and celebratory bursts.',
  },
  neutral: {
    title: 'Holding a steady pulse 💜',
    description: 'Lighting softened so the focus stays on the creator.',
  },
  negative: {
    title: 'Cooling the room 🫧',
    description: 'We eased the lighting to calm the room and ease tension.',
  },
};

const FETCH_TIMEOUT_MS = 3200;
const IDLE_THRESHOLD_MS = 45_000;

export function useEmotionUI(payload: EmotionPayload): EmotionUIController {
  const { sentimentScore, engagementRate, tokensPerMinute, viewerCount } = payload;
  const [mood, setMood] = useState<EmotionMood>('neutral');
  const [tone, setTone] = useState<EmotionTone>(NEUTRAL_TONES);
  const [confidence, setConfidence] = useState(0.48);
  const [glassOpacity, setGlassOpacity] = useState(TARGET_GLASS_OPACITY.neutral);
  const [glowIntensity, setGlowIntensity] = useState(TARGET_GLOW.neutral);
  const [emojiBursts, setEmojiBursts] = useState<EmotionBurst[]>([]);
  const [layout, setLayout] = useState<LayoutState>({ chatExpanded: true, showParticipants: true, quietMode: false });

  const lastInteractionRef = useRef(Date.now());
  const lastToastRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const prevViewerRef = useRef(viewerCount ?? 0);

  const updateLayout = useCallback(
    (next: Partial<LayoutState>) => {
      setLayout((current) => {
        const merged = { ...current, ...next };
        if (
          merged.chatExpanded === current.chatExpanded &&
          merged.showParticipants === current.showParticipants &&
          merged.quietMode === current.quietMode
        ) {
          return current;
        }
        return merged;
      });
    },
    [],
  );

  const removeBurst = useCallback((id: number) => {
    setEmojiBursts((current) => current.filter((burst) => burst.id !== id));
  }, []);

  const pushBursts = useCallback((count = 3) => {
    setEmojiBursts((current) => {
      const now = Date.now();
      const newBursts: EmotionBurst[] = Array.from({ length: count }).map((_, index) => ({
        id: now + index,
        emoji: POSITIVE_BURSTS[Math.floor(Math.random() * POSITIVE_BURSTS.length)],
        left: Math.random(),
        rotation: Math.random() * 24 - 12,
      }));
      return [...current.slice(-10), ...newBursts];
    });
  }, []);

  const applyMood = useCallback(
    (nextMood: EmotionMood, nextConfidence: number, source: 'chat' | 'metrics' | 'tip') => {
      setMood((current) => {
        if (current !== nextMood) {
          const now = Date.now();
          if (now - lastToastRef.current > 2800) {
            const copy = MOOD_MESSAGES[nextMood];
            toast({ title: copy.title, description: copy.description });
            lastToastRef.current = now;
          }
          if (nextMood === 'positive') {
            pushBursts(4);
            updateLayout({ quietMode: false, chatExpanded: true });
          } else if (nextMood === 'negative') {
            updateLayout({ quietMode: true });
          } else {
            updateLayout({ quietMode: false });
          }
        }
        return nextMood;
      });
      setConfidence(Number(nextConfidence.toFixed(2)));
      setTone(TONE_FROM_MOOD[nextMood]);
      setGlassOpacity(TARGET_GLASS_OPACITY[nextMood]);
      setGlowIntensity(TARGET_GLOW[nextMood]);
    },
    [pushBursts, updateLayout],
  );

  const registerInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now();
    updateLayout({ quietMode: false });
  }, [updateLayout]);

  const registerTip = useCallback(
    (amount: number) => {
      registerInteraction();
      const magnitude = Math.min(1, amount / 250);
      pushBursts(2 + Math.round(magnitude * 3));
      const uplift = TARGET_GLOW.positive * (0.5 + magnitude * 0.5);
      setGlowIntensity((current) => Math.min(0.82, current * 0.85 + uplift * 0.35));
      toast({
        title: '💎 Tip surge detected',
        description: `Fans just added ${amount.toLocaleString()} tokens. Spotlight is on!`,
      });
    },
    [pushBursts, registerInteraction],
  );

  const registerEngagement = useCallback(() => {
    registerInteraction();
    setGlowIntensity((current) => Math.min(0.78, current + 0.05));
  }, [registerInteraction]);

  const registerChatMessage = useCallback(
    async (message: string) => {
      const text = message.trim();
      if (!text) return;
      registerInteraction();

      if (abortRef.current) {
        abortRef.current.abort();
      }

      const controller = new AbortController();
      abortRef.current = controller;
      const timeout = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      try {
        const response = await fetch('/api/emotion', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ text }),
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error('Failed to resolve chat mood');
        }
        const data: { mood?: EmotionMood; confidence?: number } = await response.json();
        const nextMood = data.mood ?? 'neutral';
        const nextConfidence = typeof data.confidence === 'number' ? data.confidence : confidence;
        applyMood(nextMood, nextConfidence, 'chat');
      } catch (error) {
        toast({
          title: 'Could not read the vibe',
          description: 'Sentiment service timed out. Holding neutral lighting.',
          variant: 'destructive',
        });
      } finally {
        window.clearTimeout(timeout);
      }
    },
    [applyMood, confidence, registerInteraction],
  );

  useEffect(() => {
    if (typeof sentimentScore === 'number') {
      const derivedMood: EmotionMood =
        sentimentScore > 0.68 ? 'positive' : sentimentScore < 0.46 ? 'negative' : 'neutral';
      const derivedConfidence = 0.55 + Math.abs(sentimentScore - 0.5);
      applyMood(derivedMood, derivedConfidence, 'metrics');
    }

    if (typeof engagementRate === 'number' || typeof tokensPerMinute === 'number') {
      const now = Date.now();
      const isHigh = (engagementRate ?? 0.5) > 0.74 || (tokensPerMinute ?? 0) > 220;
      const isIdle = (engagementRate ?? 0.5) < 0.45 && now - lastInteractionRef.current > IDLE_THRESHOLD_MS;
      updateLayout({ chatExpanded: isHigh, showParticipants: !isIdle });
      if (isIdle) {
        updateLayout({ quietMode: true });
      }
    }

    if (typeof viewerCount === 'number') {
      const previous = prevViewerRef.current || viewerCount;
      const delta = viewerCount - previous;
      const ratio = previous > 0 ? delta / previous : 0;
      if (delta > 25 || ratio > 0.15) {
        registerEngagement();
      }
      prevViewerRef.current = viewerCount;
    }
  }, [applyMood, engagementRate, registerEngagement, sentimentScore, tokensPerMinute, updateLayout, viewerCount]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const backgroundGradient = useMemo(() => {
    switch (tone) {
      case 'warm':
        return 'radial-gradient(circle at 10% 10%, rgba(255, 120, 190, 0.35), transparent 55%), radial-gradient(circle at 80% 0%, rgba(255, 169, 226, 0.25), transparent 50%), linear-gradient(135deg, rgba(60, 8, 32, 0.95), rgba(18, 5, 45, 0.9))';
      case 'cool':
        return 'radial-gradient(circle at 12% 20%, rgba(116, 210, 255, 0.22), transparent 55%), radial-gradient(circle at 90% 10%, rgba(84, 149, 255, 0.3), transparent 60%), linear-gradient(140deg, rgba(5, 12, 34, 0.95), rgba(3, 2, 20, 0.92))';
      default:
        return 'radial-gradient(circle at 20% 15%, rgba(168, 132, 255, 0.28), transparent 55%), radial-gradient(circle at 75% 12%, rgba(132, 94, 247, 0.24), transparent 60%), linear-gradient(145deg, rgba(16, 4, 40, 0.94), rgba(8, 2, 26, 0.92))';
    }
  }, [tone]);

  const backgroundFilter = useMemo(() => {
    if (tone === 'cool') {
      return 'saturate(0.88) blur(0px)';
    }
    if (tone === 'warm') {
      return 'brightness(1.05) saturate(1.05)';
    }
    return 'saturate(1)';
  }, [tone]);

  const cssVariables = useMemo<EmotionCSSVariables>(() => ({
    '--glass-opacity': glassOpacity.toFixed(2),
    '--glow-intensity': glowIntensity.toFixed(2),
    backgroundImage: backgroundGradient,
    backgroundColor: '#050312',
    transition: 'background-image 0.8s ease, filter 0.6s ease',
    filter: backgroundFilter,
  }), [backgroundFilter, backgroundGradient, glassOpacity, glowIntensity]);

  const glassSurfaceStyle = useMemo<CSSProperties>(
    () => ({
      background: 'rgba(12, 6, 32, var(--glass-opacity, 0.42))',
      borderColor: 'rgba(255, 255, 255, calc(0.14 + var(--glow-intensity, 0.4) * 0.25))',
      boxShadow: '0 24px 80px rgba(232, 121, 249, calc(var(--glow-intensity, 0.4) * 0.45))',
      backdropFilter: 'blur(calc(20px * var(--glow-intensity, 0.4) + 6px))',
    }),
    [],
  );

  return {
    mood,
    tone,
    confidence,
    cssVariables,
    backgroundGradient,
    backgroundFilter,
    glassSurfaceStyle,
    emojiBursts,
    layout,
    registerChatMessage,
    registerTip,
    registerEngagement,
    removeBurst,
  };
}

export type { EmotionBurst, LayoutState, EmotionCSSVariables };
