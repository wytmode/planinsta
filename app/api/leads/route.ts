// app/api/leads/route.ts
import { NextRequest, NextResponse } from "next/server";
import { saveLead } from "@/app/actions/save-lead";

// Ensure Node runtime (safe for DB/Supabase service key usage)
export const runtime = "nodejs";
// Prevent static analysis/SSG on this route
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await saveLead(body);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
