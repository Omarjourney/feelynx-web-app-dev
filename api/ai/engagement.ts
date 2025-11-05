export type SentimentTrend = 'up' | 'down' | 'steady';

export interface EngagementSnapshot {
  creatorId: string;
  timestamp: string;
  engagementScore: number;
  mood: 'calm' | 'hype' | 'focus' | 'reflective';
  sentimentTrend: SentimentTrend;
}

export interface EngagementOptions {
  creatorId: string;
  lastScore?: number;
}

const MOOD_SEQUENCE: EngagementSnapshot['mood'][] = ['calm', 'focus', 'hype', 'reflective'];

export function buildMockEngagement({ creatorId, lastScore }: EngagementOptions): EngagementSnapshot {
  const timestamp = new Date().toISOString();
  const baseScore = typeof lastScore === 'number' ? lastScore : 62;
  const variation = Math.floor(Math.random() * 18) - 6; // -6 to +11
  const engagementScore = Math.max(0, Math.min(100, baseScore + variation));

  const moodIndex = Math.floor(engagementScore / 25);
  const mood = MOOD_SEQUENCE[Math.min(MOOD_SEQUENCE.length - 1, Math.max(0, moodIndex))];

  let sentimentTrend: SentimentTrend = 'steady';
  if (typeof lastScore === 'number') {
    if (engagementScore > lastScore + 2) sentimentTrend = 'up';
    else if (engagementScore < lastScore - 2) sentimentTrend = 'down';
  }

  return {
    creatorId,
    timestamp,
    engagementScore,
    mood,
    sentimentTrend,
  };
}
