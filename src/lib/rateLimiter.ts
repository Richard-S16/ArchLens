/**
 * In-memory sliding-window rate limiter.
 *
 * NOTE: This implementation stores state in process memory. It works correctly for
 * single-server deployments. For serverless or multi-instance environments (e.g. Vercel),
 * replace with an external store such as @upstash/ratelimit + @upstash/redis.
 */

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

const store = new Map<string, number[]>();

export function extractClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "127.0.0.1";
}

export function checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  const timestamps = (store.get(ip) ?? []).filter((timestamp) => timestamp > windowStart);

  if (timestamps.length >= MAX_REQUESTS) {
    const retryAfterSeconds = Math.ceil((timestamps[0] + WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  timestamps.push(now);
  store.set(ip, timestamps);

  if (store.size > 10_000) {
    for (const [key, entries] of store.entries()) {
      if (entries.every((timestamp) => timestamp <= windowStart)) {
        store.delete(key);
      }
    }
  }

  return { allowed: true, retryAfterSeconds: 0 };
}
