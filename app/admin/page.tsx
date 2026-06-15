import Link from "next/link";
import { adminStats, adminGetOrders } from "@/lib/adminQueries";
import { formatBRL } from "@/lib/format";
import { STATUS_LABEL, StatusBadge } from "@/components/admin/status";

export const revalidate = 0;

export default async function AdminHome() {
  const [stats, orders] = await Promise.all([
    adminStats(),
    adminGetOrders(),
  ]);
  const recent = orders.slice(0, 5);

  const cards = [
    { label: "Produtos", value: stats.products, href: "/admin/produtos" },
    { label: "Pedidos", value: stats.orders, href: "/admin/pedidos" },
    { label: "Pendentes", value: stats.pending, href: "/admin/pedidos" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-xl border border-neutral-200 p-5 transition hover:border-black"
          >
            <div className="text-3xl font-bold">{c.value}</div>
            <div className="mt-1 text-sm text-neutral-500">{c.label}</div>
          </Link>
        ))}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Pedidos recentes</h2>
          <Link href="/admin/pedidos" className="text-sm text-neutral-500 hover:text-black">
            Ver todos
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-neutral-500">Nenhum pedido ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-neutral-500">
                <tr className="border-b border-neutral-200">
                  <th className="py-2 pr-4">Cliente</th>
                  <th className="py-2 pr-4">Total</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2">Data</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id} className="border-b border-neutral-100">
                    <td className="py-2 pr-4">
                      <Link href={`/admin/pedidos/${o.id}`} className="hover:underline">
                        {o.customers?.name ?? "—"}
                      </Link>
                    </td>
                    <td className="py-2 pr-4">{formatBRL(Number(o.total))}</td>
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
    </div>
  );
}
