"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderTracking } from "@/lib/adminActions";

export default function TrackingForm({
  orderId,
  trackingCode,
  status,
}: {
  orderId: string;
  trackingCode: string | null;
  status: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const alreadyShipped = ["shipped", "delivered"].includes(status);

  return (
    <form
      action={(fd) => {
        setError(null);
        setSaved(false);
        start(async () => {
          const r = await updateOrderTracking(orderId, fd);
          if (!r.ok) setError(r.error ?? "Erro.");
          else {
            setSaved(true);
            router.refresh();
          }
        });
      }}
      className="space-y-3"
    >
      <div>
        <label className="block text-sm font-medium">Código de rastreio</label>
        <input
          name="tracking_code"
          defaultValue={trackingCode ?? ""}
          placeholder="Ex.: AA123456789BR"
          className="mt-1 w-full max-w-sm rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
        />
      </div>
      {!alreadyShipped && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="mark_shipped" className="h-4 w-4" />
          Marcar pedido como <strong>Enviado</strong>
        </label>
      )}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
        >
          {pending ? "Salvando…" : "Salvar rastreio"}
        </button>
        {saved && <span className="text-sm text-emerald-600">Salvo!</span>}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  );
}
