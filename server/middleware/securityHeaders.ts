import type { Request, Response, NextFunction } from 'express';

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Basic hardening headers
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Content-Security-Policy: relaxed default suitable for SPA + LiveKit; tighten per environment if needed
  if (process.env.CSP !== 'off') {
    const cspParts = [
      "default-src 'self'",
      "img-src 'self' data: https:",
      "media-src 'self' https: data:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https:",
      "connect-src 'self' https: ws: wss: http://localhost:3001",
      "font-src 'self' data: https:",
      "frame-ancestors 'none'",
    ];
    res.setHeader('Content-Security-Policy', cspParts.join('; '));
  }
  next();
}
