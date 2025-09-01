// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { limitByKeyEdge } from "@/lib/rate-limit-edge"; // ⬅️ Edge-safe import (NOT "@/lib/rate-limit")

export const config = {
  matcher: [
    "/api/generate-plan",
    "/api/generate-plan/:path*",
    "/api/bouncer-probe",
  ],
};

function computeRetryAfter(reset: unknown) {
  const nowMs = Date.now();
  const n = Number(reset);
  let retryAfter = 19;
  let resetAt: string | undefined;

  if (Number.isFinite(n)) {
    if (n < 1e6) {
      retryAfter = Math.ceil(n / 1000);                 // duration ms → s
    } else if (n > 1e9 && n < 1e12) {
      retryAfter = Math.ceil(n - nowMs / 1000);         // epoch seconds
      resetAt = new Date(n * 1000).toISOString();
    } else if (n >= 1e12) {
      retryAfter = Math.ceil((n - nowMs) / 1000);       // epoch ms
      resetAt = new Date(n).toISOString();
    }
  }

  return { retryAfter: Math.max(0, Math.min(60, retryAfter)), resetAt };
}

export default async function middleware(req: NextRequest) {
  // ⚠️ No req.ip here. Use headers (Edge-safe) and optional x-user-id
  const h = req.headers;
  const userId = h.get("x-user-id")?.trim();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip")?.trim() ||
    h.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("cf-connecting-ip")?.trim() ||
    "127.0.0.1";

  const key = userId ? `user:${userId}` : `ip:${ip}`;

  try {
    const { success, limit, remaining, reset } = await limitByKeyEdge(key);
    const { retryAfter, resetAt } = computeRetryAfter(reset);

    if (!success) {
      return NextResponse.json(
        { error: "You’re generating too quickly—try again in a bit." },
        {
          status: 429,
          headers: {
            "X-Bouncer": "limited",
            "X-RateLimit-Limit": String(limit ?? ""),
            "X-RateLimit-Remaining": String(remaining ?? ""),
            "X-RateLimit-Reset": String(reset ?? ""),
            ...(resetAt ? { "X-RateLimit-Reset-At": resetAt } : {}),
            "Retry-After": String(retryAfter),
          },
        }
      );
    }

    const res = NextResponse.next();
    res.headers.set("X-Bouncer", "hit");
    if (limit != null) res.headers.set("X-RateLimit-Limit", String(limit));
    if (remaining != null) res.headers.set("X-RateLimit-Remaining", String(remaining));
    if (reset != null) res.headers.set("X-RateLimit-Reset", String(reset));
    if (resetAt) res.headers.set("X-RateLimit-Reset-At", resetAt);
    return res;
  } catch {
    // Degraded mode: don’t block; just tag the request
    return NextResponse.next({ headers: { "X-Bouncer": "degraded" } });
  }
}
