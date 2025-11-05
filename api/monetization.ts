export interface MonetizationSnapshot {
  creatorId: string;
  timestamp: string;
  tokenFlow: number;
  sessionEarnings: number;
  viewerCount: number;
}

export interface MonetizationOptions {
  creatorId: string;
  lastEarnings?: number;
}

const VIEWER_BASELINE = 120;

export function buildMockMonetization({ creatorId, lastEarnings }: MonetizationOptions): MonetizationSnapshot {
  const timestamp = new Date().toISOString();
  const baseEarnings = typeof lastEarnings === 'number' ? lastEarnings : 340;
  const delta = Math.round(Math.random() * 40 - 10); // -10 to +30
  const sessionEarnings = Math.max(0, baseEarnings + delta);
  const tokenFlow = Math.max(10, Math.round(sessionEarnings / 4 + Math.random() * 12));
  const viewerVariance = Math.round(Math.random() * 25 - 10);
  const viewerCount = Math.max(0, VIEWER_BASELINE + viewerVariance);

  return {
    creatorId,
    timestamp,
    tokenFlow,
    sessionEarnings,
    viewerCount,
  };
}
