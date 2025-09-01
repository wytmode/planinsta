// components/SuggestedTraction.tsx
"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { suggestTraction } from "@/app/actions/suggest-traction";

type Target = "achievements" | "nextMilestone";
type Context = {
  businessName?: string;
  businessModel?: string;
  stage?: string;
  monthlyRevenue?: number;
  region?: string;
  oneLiner?: string;
};

export default function SuggestedTraction({
  context,
  target,
  onPick,
  className,
  active,
}: {
  context?: Context;
  target: Target;
  onPick: (text: string) => void;
  className?: string;
  active?: boolean; // fetch once when focused
}) {
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [suggestions, setSuggestions] = useState<string[] | null>(null);

  useEffect(() => {
    if (!active || fetched) return;
    setFetched(true);
    (async () => {
      setLoading(true);
      try {
        const s = await suggestTraction({ context, target });
        setSuggestions(s || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [active, fetched, context, target]);

  if (!active && !fetched) return null;

  return (
    <div className={className}>
      {loading && (
        <div className="rounded-2xl p-3">
          <div className="text-sm text-slate-600 mb-2">Thinking…</div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-11/12 mb-2" />
          <Skeleton className="h-4 w-9/12" />
        </div>
      )}

      {!loading && suggestions?.length ? (
        <div className="p-1">
          <div className="text-sm text-slate-600 mb-2">Suggestions</div>
          <div className="grid gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onPick(s)}
                className="text-left text-lg leading-7 rounded-2xl border px-5 py-3 hover:bg-gray-50"
                title="Click to use this"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
