import { createClient } from "@supabase/supabase-js";

function isValidHttpUrl(u: string) {
  try {
    const parsed = new URL(u);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

let cachedClient: any = null;

function pickSupabaseKey() {
  return (
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET ||
    process.env.SUPABASE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    ""
  );
}

export function ensureSupabase() {
  if (cachedClient) return cachedClient as any;
  const url = process.env.SUPABASE_URL || "";
  const key = pickSupabaseKey();
  if (isValidHttpUrl(url) && key) {
    cachedClient = createClient(url, key) as any;
    return cachedClient as any;
  }
  return null;
}

export const supabase = null as any; // deprecated: use ensureSupabase()
