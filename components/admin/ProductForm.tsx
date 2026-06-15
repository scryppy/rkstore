"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/lib/adminActions";
import type { Category, Product } from "@/lib/types";

export default function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: Category[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const editing = !!product;

  return (
    <form
      action={(fd) => {
        setError(null);
        setSaved(false);
        start(async () => {
          if (editing) {
            const r = await updateProduct(product!.id, fd);
            if (!r.ok) return setError(r.error ?? "Erro ao salvar.");
            setSaved(true);
            router.refresh();
          } else {
            const r = await createProduct(fd);
            if (!r.ok || !r.id) return setError(r.error ?? "Erro ao criar.");
            router.push(`/admin/produtos/${r.id}`);
          }
        });
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium">Nome</label>
        <input
          name="name"
          required
          defaultValue={product?.name ?? ""}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-black"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Preço (R$)</label>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={product?.price ?? ""}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Categoria</label>
          <select
            name="category_id"
            defaultValue={product?.category_id ?? ""}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-black"
          >
            <option value="">— sem categoria —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Descrição</label>
        <textarea
          name="description"
          rows={4}
          defaultValue={product?.description ?? ""}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-black"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={product ? product.is_active : true}
          className="h-4 w-4"
        />
        Ativo (visível na loja)
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-emerald-600">Salvo!</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-black px-5 py-2.5 font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
      >
        {pending ? "Salvando…" : editing ? "Salvar alterações" : "Criar produto"}
      </button>
      {!editing && (
        <p className="text-sm text-neutral-500">
          Depois de criar você poderá adicionar variantes e fotos.
        </p>
      )}
    </form>
  );
}
