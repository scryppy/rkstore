"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addVariantsBatch,
  deleteVariant,
  updateVariantStock,
} from "@/lib/adminActions";
import type { ProductVariant } from "@/lib/types";

export default function VariantManager({
  productId,
  variants,
}: {
  productId: string;
  variants: ProductVariant[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-4">
      {variants.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-neutral-500">
              <tr className="border-b border-neutral-200">
                <th className="py-2 pr-4">Tam.</th>
                <th className="py-2 pr-4">Cor</th>
                <th className="py-2 pr-4">Estoque</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v.id} className="border-b border-neutral-100">
                  <td className="py-2 pr-4">{v.size}</td>
                  <td className="py-2 pr-4">{v.color}</td>
                  <td className="py-2 pr-4">
                    <input
                      type="number"
                      min="0"
                      defaultValue={v.stock}
                      onBlur={(e) => {
                        const n = Number(e.target.value);
                        if (n === v.stock || !Number.isFinite(n)) return;
                        start(async () => {
                          await updateVariantStock(v.id, productId, n);
                          router.refresh();
                        });
                      }}
                      className="w-20 rounded border border-neutral-300 px-2 py-1"
                    />
                  </td>
                  <td className="py-2">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        start(async () => {
                          const r = await deleteVariant(v.id, productId);
                          if (!r.ok) setError(r.error ?? "Erro.");
                          else router.refresh();
                        });
                      }}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form
        action={(fd) => {
          setError(null);
          start(async () => {
            const r = await addVariantsBatch(productId, fd);
            if (!r.ok) setError(r.error ?? "Erro.");
            else {
              (document.getElementById("variant-form") as HTMLFormElement)?.reset();
              router.refresh();
            }
          });
        }}
        id="variant-form"
        className="flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-neutral-300 p-3"
      >
        <div>
          <label className="block text-xs font-medium text-neutral-500">
            Cor
          </label>
          <input
            name="color"
            required
            placeholder="Preto"
            className="mt-1 w-32 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-black"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-500">
            Tamanhos (separe por vírgula)
          </label>
          <input
            name="sizes"
            required
            placeholder="P, M, G, GG"
            className="mt-1 w-48 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-black"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-500">
            Estoque (cada)
          </label>
          <input
            name="stock"
            type="number"
            min="0"
            defaultValue="0"
            className="mt-1 w-24 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-black"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
        >
          Adicionar
        </button>
        <span className="w-full text-xs text-neutral-500">
          Ex.: cor “Preto” + tamanhos “P, M, G” cria 3 variantes de uma vez. O
          estoque de cada uma pode ser ajustado depois na tabela acima.
        </span>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
