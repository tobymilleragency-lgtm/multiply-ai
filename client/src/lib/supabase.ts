import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_MULTIPLY_AI_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_MULTIPLY_AI_SUPABASE_ANON_KEY as string | undefined;

type BrowserSupabaseClient = SupabaseClient & {
  auth: SupabaseClient["auth"] & {
    getUser: SupabaseClient["auth"]["getUser"];
    onAuthStateChange: SupabaseClient["auth"]["onAuthStateChange"];
    signOut: SupabaseClient["auth"]["signOut"];
    signInWithPassword: SupabaseClient["auth"]["signInWithPassword"];
    signUp: SupabaseClient["auth"]["signUp"];
  };
};

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabaseSetupMessage = "Multiply.ai Supabase setup is required before login, signup, assessments, reports, and saved agent workflows can run.";

if (!isSupabaseConfigured) {
  console.warn(supabaseSetupMessage);
}

export const supabase = createClient(
  supabaseUrl || "https://setup-required.multiply-ai.local",
  supabaseAnonKey || "setup-required",
  {
    auth: {
      persistSession: isSupabaseConfigured,
      autoRefreshToken: isSupabaseConfigured,
    },
  },
) as BrowserSupabaseClient;
