import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente público (anon) — leitura do catálogo (RLS: *_leitura_publica).
// Inicialização preguiçosa: só valida env em runtime, nunca no build.
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY (.env.local / Vercel)."
    );
  }
  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}
