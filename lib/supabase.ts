import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Lazily initialized browser client (anon key, respects RLS)
let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _supabase;
}

// Convenience alias — same lazy init, safe to import at module level
export const supabase = {
  get from() { return getSupabase().from.bind(getSupabase()); },
};

// Server-side Supabase client (service role key, bypasses RLS)
// Only use in API routes and Server Components — never expose to the browser.
export function createServiceClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
