// lib/rate-limit-edge.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let limiter: Ratelimit | null = null;

function getLimiter() {
  if (!limiter) {
    const redis = Redis.fromEnv(); // uses UPSTASH_REDIS_REST_URL / TOKEN
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(1, "19 s"),
      analytics: true,
      prefix: "rl:gen19",
    });
  }
  return limiter;
}

export async function limitByKeyEdge(key: string) {
  return getLimiter().limit(key);
}
