// lib/supabase/server.ts
import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Create a Supabase client for server contexts (API routes / Server Actions).
 * Env is read lazily at call-time, not at module import-time (avoids build crashes).
 */
export function getSupabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
