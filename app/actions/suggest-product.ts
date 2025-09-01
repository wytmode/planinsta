"use server";

import OpenAI from "openai";

type ProductDraft = {
  name?: string;
  features?: string[];
  uniqueSellingPoint?: string;
};

function dedup(arr: string[] = []) {
  const seen = new Set<string>();
  return arr
    .map((s) => (s || "").trim())
    .filter(Boolean)
    .filter((s) => {
      const k = s.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
}

export async function suggestProduct(
  context: Record<string, any>,
  productIndex: number,
  productDraft: ProductDraft
) {
  // remove obvious PII before sending to model
  const { email, phone, ...safeContext } = context || {};
  const existingFeatures = Array.isArray(productDraft?.features)
    ? productDraft.features
    : [];

  const apiKey = process.env.OPENAI_API_KEY;

  // If no API key, return a deterministic fallback so UI stays usable
  if (!apiKey) {
    return {
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
    };
  }

  const client = new OpenAI({ apiKey });

  const sys = `You generate short suggestion lists for a product form, grounded in prior answers.
Return STRICT JSON:
{
  "productNames": string[],       // 5–8 short options
  "featurePhrases": string[],     // 8–12 short phrases
  "uspSentences": string[]        // 5–8 one-sentence USPs (plain text)
}
Rules:
- Use the context faithfully (industry, audience, pricing, channels, operations, traction, vision, success drivers, legal/ownership, location, finances, etc.).
- Avoid duplicating features already typed by the user.
- Keep items concise (≤ 10 words for features, 1 sentence for USPs).
- No markdown, no extra keys.`;

  const usr = `
CONTEXT (all answers from previous pages, JSON):
${JSON.stringify(safeContext).slice(0, 12000)}

PRODUCT BEING EDITED:
- index: ${productIndex}
- name draft: ${productDraft?.name ?? ""}
- existing features: ${(existingFeatures || []).join(" | ")}
- USP draft: ${productDraft?.uniqueSellingPoint ?? ""}

Also avoid clashing with earlier products' names/features if present in context.
`;

  try {
    const res = await client.chat.completions.create({
      model: (process.env.OPENAI_MODEL ?? "gpt-4o-mini").trim(),
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 700,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: usr },
      ],
    });

    const raw = res.choices?.[0]?.message?.content || "{}";
    const data = JSON.parse(raw);

    const typed = existingFeatures.map((x) => x.toLowerCase().trim());

    const productNames = dedup(data.productNames || []);
    const featurePhrases = dedup(
      (data.featurePhrases || []).filter((s: string) => {
        const k = (s || "").toLowerCase().trim();
        return k && !typed.includes(k);
      })
    );
    const uspSentences = dedup(data.uspSentences || []);

    return { productNames, featurePhrases, uspSentences };
  } catch (e) {
    // soft-fail fallback
    return {
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
    };
  }
}
