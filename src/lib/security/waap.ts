import { consumeToken, RateLimitConfig } from './rate-limit';

export interface RequestContext {
  ip: string;
  path: string;
  method: string;
  userAgent?: string;
  authContext?: {
    userId?: string;
    roles?: string[];
    riskScore?: number;
    mfaLevel?: string;
  };
  headers?: Record<string, string>;
}

const blockedIps = new Set<string>();
const sensitiveRoutes = ['/api/payout', '/api/invite', '/api/auth/step-up'];

const defaultRateLimit: RateLimitConfig = {
  windowMs: 60_000,
  tokens: 120
};

const sensitiveRateLimit: RateLimitConfig = {
  windowMs: 60_000,
  tokens: 20
};

export const registerBlockedIp = (ip: string) => blockedIps.add(ip);
export const unregisterBlockedIp = (ip: string) => blockedIps.delete(ip);

export const verifyRequest = (ctx: RequestContext) => {
  if (blockedIps.has(ctx.ip)) {
    const error: Error & { status?: number } = new Error('Forbidden');
    error.status = 403;
    throw error;
  }

  const rateKey = `${ctx.ip}:${ctx.path}`;
  const config = sensitiveRoutes.some((route) => ctx.path.startsWith(route))
    ? sensitiveRateLimit
    : defaultRateLimit;
  consumeToken(rateKey, config);

  if (ctx.authContext?.riskScore && ctx.authContext.riskScore > 70) {
    const error: Error & { status?: number; reason?: string } = new Error('Risk threshold exceeded');
    error.status = 423;
    error.reason = 'RISK_SCORE';
    throw error;
  }

  if (sensitiveRoutes.includes(ctx.path) && ctx.authContext?.mfaLevel !== 'webauthn') {
    const error: Error & { status?: number; reason?: string } = new Error('Step-up authentication required');
    error.status = 401;
    error.reason = 'STEP_UP_REQUIRED';
    throw error;
  }

  if (/bot|crawler|spider/i.test(ctx.userAgent ?? '')) {
    const error: Error & { status?: number; reason?: string } = new Error('Automated traffic blocked');
    error.status = 429;
    error.reason = 'BOT_DETECTED';
    throw error;
  }
};
