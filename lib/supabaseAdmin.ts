import "server-only";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente server-side com service role — ignora RLS. NUNCA importar no client.
// Usado para criar pedidos e ler pedidos (tabelas protegidas por RLS).
export function getSupabaseAdmin() {
  if (!url || !serviceKey) {
    throw new Error(
      "Configure SUPABASE_SERVICE_ROLE_KEY (.env.local e Vercel) para criar/ler pedidos."
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
