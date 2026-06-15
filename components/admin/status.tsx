import type { ReactElement } from "react";

export const STATUS_ORDER = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  paid: "Pago",
  processing: "Processando",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-sky-100 text-sky-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-violet-100 text-violet-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: { status: string }): ReactElement {
  return (
    <span
      className={
        "inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold " +
        (STATUS_CLASS[status] ?? "bg-neutral-100 text-neutral-700")
      }
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
