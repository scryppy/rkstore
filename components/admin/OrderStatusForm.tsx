"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/lib/adminActions";
import { STATUS_ORDER, STATUS_LABEL } from "@/components/admin/status";

export default function OrderStatusForm({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
      >
        {STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={pending || value === status}
        onClick={() => {
          setError(null);
          start(async () => {
            const r = await updateOrderStatus(orderId, value);
            if (!r.ok) setError(r.error ?? "Erro.");
            else {
              setSaved(true);
              router.refresh();
            }
          });
        }}
        className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
      >
        {pending ? "Salvando…" : "Atualizar"}
      </button>
      {saved && <span className="text-sm text-emerald-600">Atualizado!</span>}
      {error && <span className="text-sm text-red-600">{error}</span>}
    </div>
  );
}
