import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { formatBRL } from "@/lib/format";

export const revalidate = 0;

const STATUS_LABEL: Record<string, string> = {
  pending: "Aguardando pagamento",
  paid: "Pago",
  processing: "Em separação",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

type Header = { emoji: string; title: string; sub: string; box: string };

function header(status: string): Header {
  if (status === "paid" || status === "processing" || status === "shipped" || status === "delivered") {
    return {
      emoji: "✓",
      title: "Pagamento aprovado!",
      sub: "Recebemos seu pagamento. Já estamos cuidando do seu pedido.",
      box: "border-green-200 bg-green-50",
    };
  }
  if (status === "cancelled") {
    return {
      emoji: "✕",
      title: "Pagamento não concluído",
      sub: "O pagamento não foi aprovado. Você pode tentar comprar novamente.",
      box: "border-red-200 bg-red-50",
    };
  }
  return {
    emoji: "⏳",
    title: "Pedido criado!",
    sub: "Estamos aguardando a confirmação do pagamento. Esta página atualiza o status assim que o Mercado Pago confirmar.",
    box: "border-amber-200 bg-amber-50",
  };
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, status, total, payment_method, created_at, order_items(id, product_name, variant_info, unit_price, quantity, subtotal)"
    )
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();

  const h = header(order.status);

  const items =
    (order.order_items as {
      id: string;
      product_name: string;
      variant_info: string;
      unit_price: number;
      quantity: number;
      subtotal: number;
    }[]) ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className={`space-y-2 rounded-2xl border p-6 text-center ${h.box}`}>
        <div className="text-4xl">{h.emoji}</div>
        <h1 className="text-2xl font-bold">{h.title}</h1>
        <p className="text-neutral-600">{h.sub}</p>
        <p className="text-sm text-neutral-500">
          Pedido nº{" "}
          <span className="font-mono font-semibold">
            {order.id.slice(0, 8).toUpperCase()}
          </span>
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-500">Status</span>
          <span className="font-semibold">
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
        </div>

        <ul className="space-y-2 border-t border-neutral-200 pt-4 text-sm">
          {items.map((i) => (
            <li key={i.id} className="flex justify-between gap-2">
              <span className="text-neutral-600">
                {i.quantity}× {i.product_name}{" "}
                <span className="text-neutral-400">({i.variant_info})</span>
              </span>
              <span>{formatBRL(i.subtotal)}</span>
            </li>
          ))}
        </ul>

        <div className="flex justify-between border-t border-neutral-200 pt-4 text-lg font-bold">
          <span>Total</span>
          <span>{formatBRL(order.total)}</span>
        </div>
      </div>

      {order.status === "pending" && (
        <p className="text-center text-sm text-neutral-500">
          Já pagou? A confirmação pode levar alguns instantes. Atualize a página.
        </p>
      )}

      <Link
        href="/"
        className="block rounded-full bg-black px-6 py-3 text-center font-semibold text-white"
      >
        Voltar à loja
      </Link>
    </div>
  );
}
