// app/actions/suggest-traction.ts
"use server";

import OpenAI from "openai";

type Target = "achievements" | "nextMilestone";
type Context = {
  businessName?: string;
  businessModel?: string;
  stage?: string;
  monthlyRevenue?: number;
  region?: string;
  oneLiner?: string;
};

function uniq(arr: string[]) {
  return Array.from(new Set(arr.filter(Boolean).map(s => s.trim()))).slice(0, 8);
}

export async function suggestTraction({
  context = {},
  target,
  count = 5,
}: {
  context?: Context;
  target: Target;
  count?: number;
}) {
  const stage = (context.stage || "").toLowerCase();
  const region = context.region || "your target region";
  const rev = context.monthlyRevenue ?? 10000;

  // Fast, no-AI baseline
  const baseAchievements = uniq([
    stage.includes("mvp") ? "Launched MVP with 50 beta users" : "Completed 30+ customer discovery interviews",
    "Closed 5 pilot customers",
    "Secured angel investment",
    stage.includes("profit") ? "Achieved monthly profitability" : `Reached ₹${rev.toLocaleString()} MRR`,
    `Established reseller pipeline in ${region}`,
  ]);

  const baseNext = uniq([
    "Reach ₹80,000 MRR within next 2 quarters",
    "Onboard 10 reseller partners and 50 merchants",
    "Expand into accessories & maintenance services",
    "Improve NPS to 60+ via post-purchase follow-ups",
    "Reduce CAC by 20% via SEO & referrals",
  ]);

  // If no key, return baseline
  if (!process.env.OPENAI_API_KEY) {
    return target === "achievements" ? baseAchievements : baseNext;
  }

  // AI enhancement with fallback
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const prompt = `
Generate ${count} concise ${target === "achievements" ? "past achievements" : "next milestones"} for a startup.
Context:
- Name: ${context.businessName || "Business"}
- One-liner: ${context.oneLiner || "-"}
- Model: ${context.businessModel || "-"}
- Stage: ${context.stage || "-"}
- Region: ${region}
- Monthly revenue (INR): ${rev}

Rules:
- Max 12 words each, crisp and specific.
- Use INR for money.
- No numbering, just hyphen lines.

Output:
- item 1
- item 2
- item 3
- item 4
- item 5
`.trim();

    const resp = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }],
    });

    const text = resp.choices?.[0]?.message?.content || "";
    const ai = Array.from(text.matchAll(/^\s*-\s*(.+)$/gm)).map(m => m[1]).slice(0, count);

    const merged = uniq([
      ...ai,
      ...(target === "achievements" ? baseAchievements : baseNext),
    ]);

    return merged.slice(0, 8);
  } catch {
    return target === "achievements" ? baseAchievements : baseNext;
  }
}
