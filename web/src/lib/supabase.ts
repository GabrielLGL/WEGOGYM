import { createClient, SupabaseClient } from "@supabase/supabase-js";

declare global {
  // eslint-disable-next-line no-var
  var _supabase: SupabaseClient | undefined;
}

export function getSupabase(): SupabaseClient {
  if (!globalThis._supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error("Missing Supabase env vars");
    }

    globalThis._supabase = createClient(url, key);
  }
  return globalThis._supabase;
}
