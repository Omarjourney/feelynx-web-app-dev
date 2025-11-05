import { NextResponse } from 'next/server';

export const runtime = 'edge';

const POSITIVE_KEYWORDS = [
  'love',
  'amazing',
  'great',
  'awesome',
  'incredible',
  'wow',
  'beautiful',
  'fire',
  'lit',
  'fantastic',
  'glow',
  'vibe',
  'best',
  'yay',
  'thank you',
  'support',
  'tip',
];

const NEGATIVE_KEYWORDS = [
  'hate',
  'bad',
  'boring',
  'lag',
  'slow',
  'broken',
  'annoying',
  'leave',
  'cringe',
  'sad',
  'angry',
  'upset',
  'nope',
  'fail',
  'bug',
];

const INTENSIFIERS: Record<string, number> = {
  very: 1.15,
  super: 1.2,
  mega: 1.25,
  insanely: 1.3,
  extremely: 1.25,
  kinda: 0.85,
  slightly: 0.7,
};

function computeSentimentScore(text: string) {
  const normalized = text.toLowerCase();
  const words = normalized.match(/[\w']+/g) ?? [];

  let positive = 0;
  let negative = 0;
  let modifier = 1;

  for (const word of words) {
    const intensity = INTENSIFIERS[word];
    if (intensity) {
      modifier = intensity;
      continue;
    }

    if (POSITIVE_KEYWORDS.includes(word)) {
      positive += modifier;
    } else if (NEGATIVE_KEYWORDS.includes(word)) {
      negative += modifier;
    }

    modifier = 1;
  }

  const score = positive - negative;
  const absoluteMagnitude = Math.abs(score);
  const totalHits = positive + negative;
  const confidence = totalHits === 0 ? 0.45 : Math.min(0.98, 0.55 + absoluteMagnitude / (totalHits + 1));

  let mood: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (score > 0.5) {
    mood = 'positive';
  } else if (score < -0.5) {
    mood = 'negative';
  }

  return { mood, confidence: Number(confidence.toFixed(2)) };
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const text = typeof payload?.text === 'string' ? payload.text.trim() : '';

    if (!text) {
      return NextResponse.json(
        { error: 'Missing text payload', mood: 'neutral', confidence: 0.4 },
        { status: 400 },
      );
    }

    const result = computeSentimentScore(text);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[emotion-api] Failed to analyze sentiment', error);
    return NextResponse.json({ mood: 'neutral', confidence: 0.35 }, { status: 500 });
  }
}
