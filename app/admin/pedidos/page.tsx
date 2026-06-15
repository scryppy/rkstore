import Link from "next/link";
import { adminGetOrders } from "@/lib/adminQueries";
import { formatBRL } from "@/lib/format";
import { StatusBadge } from "@/components/admin/status";

export const revalidate = 0;

export default async function PedidosPage() {
  const orders = await adminGetOrders();

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-bold">Pedidos ({orders.length})</h1>
      {orders.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhum pedido ainda.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-neutral-500">
              <tr className="border-b border-neutral-200">
                <th className="py-2 pr-4">Cliente</th>
                <th className="py-2 pr-4">E-mail</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2 pr-4">Pgto.</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Data</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-neutral-100 hover:bg-neutral-50"
                >
                  <td className="py-2 pr-4">
                    <Link
                      href={`/admin/pedidos/${o.id}`}
                      className="font-medium hover:underline"
                    >
                      {o.customers?.name ?? "—"}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 text-neutral-500">
                    {o.customers?.email ?? "—"}
                  </td>
                  <td className="py-2 pr-4">{formatBRL(Number(o.total))}</td>
                  <td className="py-2 pr-4 text-neutral-500">
                    {o.payment_method ?? "—"}
                  </td>
                  <td className="py-2 pr-4">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="py-2 text-neutral-500">
                    {new Date(o.created_at).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
