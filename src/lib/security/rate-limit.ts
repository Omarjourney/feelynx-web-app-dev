export interface RateLimitConfig {
  windowMs: number;
  tokens: number;
  refillRate?: number;
}

interface BucketState {
  tokens: number;
  updatedAt: number;
}

const buckets = new Map<string, BucketState>();
const ttlMap = new Map<string, number>();

export const isRateLimited = (key: string, config: RateLimitConfig): boolean => {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { tokens: config.tokens, updatedAt: now };
  const delta = now - bucket.updatedAt;
  const refillRate = config.refillRate ?? config.tokens / config.windowMs;
  const refillTokens = Math.floor(delta * refillRate);

  const newTokens = Math.min(config.tokens, bucket.tokens + refillTokens);
  const updatedBucket: BucketState = {
    tokens: newTokens > 0 ? newTokens - 1 : 0,
    updatedAt: now
  };

  buckets.set(key, updatedBucket);
  ttlMap.set(key, now + config.windowMs);

  return newTokens <= 0;
};

export const consumeToken = (key: string, config: RateLimitConfig) => {
  if (isRateLimited(key, config)) {
    const ttl = Math.max(0, (ttlMap.get(key) ?? Date.now()) - Date.now());
    const retryAfter = Math.ceil(ttl / 1000);
    const error: Error & { status?: number; retryAfter?: number } = new Error('Too many requests');
    error.status = 429;
    error.retryAfter = retryAfter;
    throw error;
  }
};
