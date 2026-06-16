import Link from "next/link";
import { adminGetOrders } from "@/lib/adminQueries";
import { formatBRL } from "@/lib/format";
import { StatusBadge, STATUS_LABEL, STATUS_ORDER } from "@/components/admin/status";

export const revalidate = 0;

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const all = await adminGetOrders();
  const query = (q ?? "").trim().toLowerCase();

  const orders = all.filter((o) => {
    if (status && o.status !== status) return false;
    if (query) {
      const hay = `${o.customers?.name ?? ""} ${o.customers?.email ?? ""}`.toLowerCase();
      if (!hay.includes(query)) return false;
    }
    return true;
  });

  const chip = (s: string | undefined, label: string) => {
    const active = (status ?? "") === (s ?? "");
    const params = new URLSearchParams();
    if (s) params.set("status", s);
    if (q) params.set("q", q);
    const href = `/admin/pedidos${params.toString() ? `?${params}` : ""}`;
    return (
      <Link
        key={label}
        href={href}
        className={
          "rounded-full px-3 py-1 text-sm font-medium transition " +
          (active ? "bg-black text-white" : "border border-neutral-300 hover:bg-neutral-100")
        }
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-bold">Pedidos ({orders.length})</h1>

      <div className="flex flex-wrap items-center gap-2">
        {chip(undefined, "Todos")}
        {STATUS_ORDER.map((s) => chip(s, STATUS_LABEL[s]))}
      </div>

      <form method="get" className="flex gap-2">
        {status && <input type="hidden" name="status" value={status} />}
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nome ou e-mail…"
          className="w-full max-w-sm rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
        />
        <button
          type="submit"
          className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
        >
          Buscar
        </button>
      </form>

      {orders.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhum pedido encontrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-neutral-500">
              <tr className="border-b border-neutral-200">
                <th className="py-2 pr-4">Cliente</th>
                <th className="py-2 pr-4">E-mail</th>
                <th className="py-2 pr-4">Total</th>
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
