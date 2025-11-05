import { EmotionState } from '../../src/stores/useLiveBlueprintStore';

type VoiceProfile = {
  pitch: number;
  pace: number;
  warmth: number;
};

const voiceProfiles: Record<EmotionState, VoiceProfile> = {
  Calm: { pitch: -2, pace: 0.85, warmth: 0.9 },
  Hype: { pitch: 4, pace: 1.2, warmth: 0.6 },
  Flirty: { pitch: 2, pace: 1.05, warmth: 0.95 },
  Supportive: { pitch: -1, pace: 0.9, warmth: 1 },
  Playful: { pitch: 3, pace: 1.15, warmth: 0.8 },
};

export const getVoiceProfile = (state: EmotionState): VoiceProfile => voiceProfiles[state];

export const describeVoiceProfile = (state: EmotionState): string => {
  const profile = getVoiceProfile(state);
  return `pitch ${profile.pitch}, pace ${profile.pace}, warmth ${profile.warmth}`;
};
