import { NextRequest, NextResponse } from "next/server";
import { suggestProduct } from "@/app/actions/suggest-product";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const context = (body?.context ?? {}) as Record<string, any>;
    const productIndex = Number(body?.productIndex ?? 0);
    const productDraft = (body?.productDraft ?? {}) as {
      name?: string;
      features?: string[];
      uniqueSellingPoint?: string;
    };

    const data = await suggestProduct(context, productIndex, productDraft);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      {
        productNames: [],
        featurePhrases: [
          "Automated task scheduling",
          "Analytics dashboard",
          "API integrations",
          "RBAC/SSO",
          "Webhook triggers",
        ],
        uspSentences: [
          "Learns from user behaviour to optimize workflows automatically.",
        ],
      },
      { status: 200 }
    );
  }
}
