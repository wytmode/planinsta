// lib/rate-limit.ts (Edge-safe)
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let limiter: Ratelimit | null = null;

function getLimiter() {
  if (!limiter) {
    // Reads UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN from env
    const redis = Redis.fromEnv();
    limiter = new Ratelimit({
      redis,
      // 1 request allowed every 19 seconds per key (sliding window)
      limiter: Ratelimit.slidingWindow(1, "19 s"),
      analytics: true,
      prefix: "rl:gen19",
    });
  }
  return limiter;
}

export async function limitByKeyEdge(key: string) {
  const rl = getLimiter();
  return rl!.limit(key);
}
