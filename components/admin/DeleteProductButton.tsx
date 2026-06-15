"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/lib/adminActions";

export default function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm("Excluir este produto? Esta ação não pode ser desfeita."))
            return;
          start(async () => {
            const r = await deleteProduct(id);
            if (!r.ok) setError(r.error ?? "Erro.");
            else router.push("/admin/produtos");
          });
        }}
        className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
      >
        {pending ? "Excluindo…" : "Excluir produto"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
