import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  timestamps: number[];
}

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}

/**
 * In-Memory Sliding Window Rate Limiter
 * Provides thread-safe, high-performance request throttling per IP / Client Token
 */
export function createRateLimiter(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    message = 'Too many requests, please slow down.',
    keyGenerator = (req: Request) => {
      // Determine client IP or auth token
      const forwarded = req.headers['x-forwarded-for'];
      if (typeof forwarded === 'string') {
        return forwarded.split(',')[0].trim();
      }
      return req.ip || req.socket.remoteAddress || 'unknown-client';
    }
  } = options;

  const hits = new Map<string, RateLimitRecord>();

  // Periodically sweep expired records to prevent unbounded memory growth
  setInterval(() => {
    const now = Date.now();
    const expiry = now - windowMs;
    for (const [key, record] of hits.entries()) {
      record.timestamps = record.timestamps.filter(ts => ts > expiry);
      if (record.timestamps.length === 0) {
        hits.delete(key);
      }
    }
  }, Math.max(windowMs, 60000)).unref();

  return (req: Request, res: Response, next: NextFunction) => {
    // Exempt health probes and static asset queries
    if (req.path === '/health' || req.path === '/favicon.ico') {
      return next();
    }

    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = now - windowMs;

    let record = hits.get(key);
    if (!record) {
      record = { timestamps: [] };
      hits.set(key, record);
    }

    // Retain only requests within current sliding window
    record.timestamps = record.timestamps.filter(ts => ts > windowStart);

    const currentHits = record.timestamps.length;
    const remaining = Math.max(0, max - currentHits);
    const resetTime = new Date(now + windowMs);

    // Standard RFC RateLimit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining - 1));
    res.setHeader('X-RateLimit-Reset', Math.ceil(resetTime.getTime() / 1000));

    if (currentHits >= max) {
      const retryAfterSec = Math.ceil(windowMs / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      return res.status(429).json({
        success: false,
        error: 'TooManyRequests',
        message,
        retryAfter: `${retryAfterSec} seconds`
      });
    }

    record.timestamps.push(now);
    next();
  };
}

// Pre-configured Production Limiters
export const globalApiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 120 requests per minute
  message: 'API rate limit exceeded. Maximum 120 requests per minute.'
});

export const searchOrchestrationLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 AI agent search orchestrations per minute
  message: 'Archival Search rate limit reached. Please wait before launching another search query.'
});

export const mutationLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 50, // 50 mutations per minute
  message: 'Mutation rate limit reached. Please wait a moment.'
});
