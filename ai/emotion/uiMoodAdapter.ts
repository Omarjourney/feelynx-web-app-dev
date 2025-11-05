import { EmotionState } from '../../src/stores/useLiveBlueprintStore';

type CSSVariables = Record<string, string>;

const moodTokens: Record<EmotionState, CSSVariables> = {
  Calm: {
    '--feelynx-glow-intensity': '0.3',
    '--feelynx-surface-alpha': '0.85',
    '--feelynx-motion-scale': '0.4',
    '--feelynx-highlight-color': 'rgba(120, 200, 255, 0.35)',
  },
  Hype: {
    '--feelynx-glow-intensity': '0.95',
    '--feelynx-surface-alpha': '0.65',
    '--feelynx-motion-scale': '1.2',
    '--feelynx-highlight-color': 'rgba(255, 80, 150, 0.55)',
  },
  Flirty: {
    '--feelynx-glow-intensity': '0.7',
    '--feelynx-surface-alpha': '0.75',
    '--feelynx-motion-scale': '0.9',
    '--feelynx-highlight-color': 'rgba(255, 120, 200, 0.48)',
  },
  Supportive: {
    '--feelynx-glow-intensity': '0.55',
    '--feelynx-surface-alpha': '0.9',
    '--feelynx-motion-scale': '0.5',
    '--feelynx-highlight-color': 'rgba(110, 220, 180, 0.4)',
  },
  Playful: {
    '--feelynx-glow-intensity': '0.85',
    '--feelynx-surface-alpha': '0.7',
    '--feelynx-motion-scale': '1.1',
    '--feelynx-highlight-color': 'rgba(255, 200, 120, 0.6)',
  },
};

export const applyMoodToDocument = (mood: EmotionState) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const tokens = moodTokens[mood];
  Object.entries(tokens).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  root.setAttribute('data-feelynx-mood', mood.toLowerCase());
};

export const getMoodTokens = (mood: EmotionState) => ({ ...moodTokens[mood] });
