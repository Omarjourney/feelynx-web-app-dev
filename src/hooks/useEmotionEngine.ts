import { useCallback } from 'react';
import { detectTone, ToneSample, ToneAnalysis } from '../../ai/emotion/toneDetector';
import { useLiveBlueprintStore } from '@/stores/useLiveBlueprintStore';

export const useEmotionEngine = () => {
  const setEmotionState = useLiveBlueprintStore((state) => state.setEmotionState);
  const updateSentiment = useLiveBlueprintStore((state) => state.updateSentiment);

  return useCallback(
    (sample: ToneSample): ToneAnalysis => {
      const analysis = detectTone(sample);
      setEmotionState(analysis.mood);
      updateSentiment(analysis.sentiment);
      return analysis;
    },
    [setEmotionState, updateSentiment],
  );
};

export type { ToneSample, ToneAnalysis } from '../../ai/emotion/toneDetector';
