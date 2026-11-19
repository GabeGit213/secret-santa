import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
}
if (anonKey.startsWith("sb_secret_")) {
  throw new Error("A Supabase secret key cannot be used in the frontend");
}

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});
