import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getPayment, mapPaymentStatus } from "@/lib/mercadopago";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Webhook do Mercado Pago. Não confiamos no corpo: pegamos o id e
// re-consultamos o pagamento na API do MP para confirmar o status real.
async function extractPaymentId(req: NextRequest): Promise<string | null> {
  const url = req.nextUrl;
  const qpId =
    url.searchParams.get("data.id") ||
    url.searchParams.get("id") ||
    null;
  const topic =
    url.searchParams.get("type") || url.searchParams.get("topic") || "";

  let bodyId: string | null = null;
  let bodyType = "";
  try {
    const body = (await req.json()) as {
      type?: string;
      action?: string;
      data?: { id?: string | number };
    };
    bodyType = body.type || body.action || "";
    if (body.data?.id != null) bodyId = String(body.data.id);
  } catch {
    // corpo vazio/sem json — ok, usamos query
  }

  const isPayment =
    topic.includes("payment") || bodyType.includes("payment") || (!topic && !bodyType);
  if (!isPayment) return null;
  return bodyId || qpId;
}

async function handle(req: NextRequest) {
  try {
    const paymentId = await extractPaymentId(req);
    if (!paymentId) return NextResponse.json({ ok: true, skipped: true });

    const payment = await getPayment(paymentId);
    if (!payment?.external_reference) {
      return NextResponse.json({ ok: true, noref: true });
    }

    const newStatus = mapPaymentStatus(payment.status);
    const supabase = getSupabaseAdmin();
    if (newStatus) {
      await supabase
        .from("orders")
        .update({
          status: newStatus,
          payment_id: String(payment.id),
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.external_reference);

      // Pagamento aprovado: baixa o estoque (idempotente no banco).
      if (newStatus === "paid") {
        await supabase.rpc("apply_order_stock", {
          p_order: payment.external_reference,
        });
      }
    } else {
      // registra o id do pagamento mesmo sem mudar status
      await supabase
        .from("orders")
        .update({ payment_id: String(payment.id) })
        .eq("id", payment.external_reference);
    }

    return NextResponse.json({ ok: true });
  } catch {
    // Responde 200 para o MP não ficar re-tentando em loop por erro nosso.
    return NextResponse.json({ ok: false });
  }
}

export async function POST(req: NextRequest) {
  return handle(req);
}

export async function GET(req: NextRequest) {
  return handle(req);
}
