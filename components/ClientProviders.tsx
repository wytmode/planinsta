// components/ClientProviders.tsx
"use client";

import { ReactNode, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { Toaster } from "@/components/ui/toaster";

export function ClientProviders({ children }: { children: ReactNode }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // If envs are missing in prod, don't crash the whole app
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== "undefined") {
      console.error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
      );
    }
    return (
      <>
        {children}
        <Toaster />
      </>
    );
  }

  const [supabaseClient] = useState(() =>
    createClientComponentClient({
      supabaseUrl,
      supabaseKey: supabaseAnonKey,
      options: {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          flowType: "pkce",
        },
      },
    })
  );

  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      {children}
      <Toaster />
    </SessionContextProvider>
  );
}
