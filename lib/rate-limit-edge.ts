// lib/rate-limit-edge.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let limiter: Ratelimit | null = null;

function getLimiter() {
  // Uses env vars UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
  // This client is fetch-based (Edge compatible).
  if (!limiter) {
    const redis = Redis.fromEnv(); // throws if env missing
    limiter = new Ratelimit({
      redis,
      // 1 request per 19 seconds (sliding window), same as your Node version
      limiter: Ratelimit.slidingWindow(1, "19 s"),
      analytics: true,
      prefix: "rl:gen19",
    });
  }
  return limiter;
}

export async function limitByKeyEdge(key: string) {
  const rl = getLimiter();
  return rl.limit(key);
}
