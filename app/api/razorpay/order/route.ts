// app/api/razorpay/order/route.ts
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getPriceRupees } from "@/lib/pricing";

const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// --- Allowed origins ---
// Static allow-list + previews helper for Vercel
const STATIC_ALLOWED = new Set<string>([
  "https://planinsta-gen.vercel.app", // ← your new prod
  "http://localhost:3000",            // dev
]);

function isAllowedOrigin(origin: string) {
  if (STATIC_ALLOWED.has(origin)) return true;
  try {
    const u = new URL(origin);
    // allow previews like https://planinsta-gen-<branch>.<team>.vercel.app
    return (
      u.protocol === "https:" &&
      /^planinsta-gen(-[\w-]+)?\.vercel\.app$/.test(u.hostname)
    );
  } catch {
    return false;
  }
}

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  };
}

// Convert ₹ (rupees) to paise with validation
function rupeesToPaise(v: unknown) {
  const n = typeof v === "string" ? Number(v) : Number(v ?? 0);
  if (!Number.isFinite(n)) throw new Error("Invalid amount");
  if (n < 1 || n > 100000) throw new Error("Amount must be between ₹1 and ₹100000");
  return Math.round(n * 100);
}

// Optional: handle CORS preflight cleanly
export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin") || "";
  if (!isAllowedOrigin(origin)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403, headers: { Vary: "Origin" } });
  }
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(request: Request) {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "missing_keys" }, { status: 500, headers: { "Vary": "Origin" } });
    }

    const origin = request.headers.get("origin") || "";
    if (!isAllowedOrigin(origin)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403, headers: { "Vary": "Origin" } });
    }

    const body = await request.json().catch(() => ({} as any));
    const rupees = getPriceRupees();                 // ← single global source
    const amountInPaise = rupeesToPaise(rupees);
    const currency = "INR";

    const order = await rzp.orders.create({
      amount: amountInPaise,
      currency,
      receipt: body?.receipt || `plan_receipt_${Date.now()}`,
      // notes: { ... } // optional
    });

    return NextResponse.json(order, {
      status: 200,
      headers: corsHeaders(origin),
    });
  } catch (err: any) {
    console.error("create-order failed", err);
    return NextResponse.json(
      { error: err?.message ?? "order_failed" },
      { status: 400, headers: { "Vary": "Origin" } }
    );
  }
}
