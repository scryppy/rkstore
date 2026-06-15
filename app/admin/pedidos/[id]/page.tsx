import Link from "next/link";
import { notFound } from "next/navigation";
import { adminGetOrder } from "@/lib/adminQueries";
import { formatBRL } from "@/lib/format";
import { StatusBadge } from "@/components/admin/status";
import OrderStatusForm from "@/components/admin/OrderStatusForm";

export const revalidate = 0;

export default async function PedidoDetalhe({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await adminGetOrder(id);
  if (!order) notFound();

  const addr = order.customer_addresses;

  return (
    <div className="space-y-6">
      <Link href="/admin/pedidos" className="text-sm text-neutral-500 hover:text-black">
        ← Pedidos
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold">
            Pedido #{order.id.slice(0, 8)}
          </h1>
          <p className="text-sm text-neutral-500">
            {new Date(order.created_at).toLocaleString("pt-BR")} ·{" "}
            <StatusBadge status={order.status} />
          </p>
        </div>
        <OrderStatusForm orderId={order.id} status={order.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 p-4">
          <h2 className="mb-2 font-semibold">Cliente</h2>
          <p className="text-sm">{order.customers?.name ?? "—"}</p>
          <p className="text-sm text-neutral-500">{order.customers?.email}</p>
          <p className="text-sm text-neutral-500">
            {order.customers?.phone ?? "—"}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-200 p-4">
          <h2 className="mb-2 font-semibold">Entrega</h2>
          {addr ? (
            <p className="text-sm leading-relaxed text-neutral-600">
              {addr.street}
              {addr.number ? `, ${addr.number}` : ""}
              {addr.complement ? ` — ${addr.complement}` : ""}
              <br />
              {addr.neighborhood ? `${addr.neighborhood}, ` : ""}
              {addr.city} / {addr.state}
              <br />
              CEP {addr.zip_code}
            </p>
          ) : (
            <p className="text-sm text-neutral-500">Sem endereço.</p>
          )}
          <p className="mt-2 text-sm">
            <span className="text-neutral-500">Pagamento:</span>{" "}
            {order.payment_method ?? "—"}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 p-4">
        <h2 className="mb-3 font-semibold">Itens</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-neutral-500">
              <tr className="border-b border-neutral-200">
                <th className="py-2 pr-4">Produto</th>
                <th className="py-2 pr-4">Variante</th>
                <th className="py-2 pr-4">Unit.</th>
                <th className="py-2 pr-4">Qtd</th>
                <th className="py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items.map((it) => (
                <tr key={it.id} className="border-b border-neutral-100">
                  <td className="py-2 pr-4">{it.product_name}</td>
                  <td className="py-2 pr-4 text-neutral-500">
                    {it.variant_info}
                  </td>
                  <td className="py-2 pr-4">{formatBRL(Number(it.unit_price))}</td>
                  <td className="py-2 pr-4">{it.quantity}</td>
                  <td className="py-2 text-right">
                    {formatBRL(Number(it.subtotal))}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="py-3 pr-4 text-right font-semibold">
                  Total
                </td>
                <td className="py-3 text-right font-bold">
                  {formatBRL(Number(order.total))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {order.notes && (
        <div className="rounded-xl border border-neutral-200 p-4">
          <h2 className="mb-1 font-semibold">Observações</h2>
          <p className="text-sm text-neutral-600">{order.notes}</p>
        </div>
      )}
    </div>
  );
}
