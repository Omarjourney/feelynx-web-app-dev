export type ToneSample = {
  text?: string;
  emojis?: string;
  intensity?: number;
};

export type ToneAnalysis = {
  sentiment: number;
  mood: 'Calm' | 'Hype' | 'Flirty' | 'Supportive' | 'Playful';
  confidence: number;
  emojiDensity: number;
};

const emojiRegex = /([\p{Emoji_Presentation}\p{Emoji}\p{Extended_Pictographic}])/gu;

export const detectTone = (sample: ToneSample): ToneAnalysis => {
  const text = sample.text ?? '';
  const emojis = sample.emojis ?? '';
  const intensity = sample.intensity ?? 0.5;
  const emojiMatches = `${text}${emojis}`.match(emojiRegex) ?? [];
  const emojiDensity = Math.min(1, emojiMatches.length / Math.max(1, text.length));

  let sentiment = 0.6;
  if (/love|amazing|fire|wow|lit/i.test(text)) sentiment += 0.2;
  if (/sad|angry|frustrated|bug/i.test(text)) sentiment -= 0.25;
  sentiment = Math.max(0, Math.min(1, sentiment + (intensity - 0.5) * 0.4));

  const mood: ToneAnalysis['mood'] = sentiment > 0.8
    ? 'Calm'
    : sentiment > 0.7
      ? emojiDensity > 0.3
        ? 'Playful'
        : 'Hype'
      : sentiment > 0.6
        ? 'Flirty'
        : sentiment > 0.45
          ? 'Supportive'
          : 'Supportive';

  return {
    sentiment,
    mood,
    confidence: Number((0.55 + emojiDensity * 0.35).toFixed(2)),
    emojiDensity,
  };
};
