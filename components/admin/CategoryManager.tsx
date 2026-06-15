"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCategory, deleteCategory } from "@/lib/adminActions";
import type { Category } from "@/lib/types";

export default function CategoryManager({
  categories,
}: {
  categories: Category[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="max-w-lg space-y-4">
      {categories.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhuma categoria ainda.</p>
      ) : (
        <ul className="divide-y divide-neutral-100 rounded-xl border border-neutral-200">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between p-3 text-sm"
            >
              <span>
                {c.name}{" "}
                <span className="text-neutral-400">/{c.slug}</span>
              </span>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  if (!confirm(`Excluir a categoria "${c.name}"?`)) return;
                  start(async () => {
                    const r = await deleteCategory(c.id);
                    if (!r.ok) setError(r.error ?? "Erro.");
                    else router.refresh();
                  });
                }}
                className="text-red-600 hover:underline"
              >
                Excluir
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        action={(fd) => {
          setError(null);
          start(async () => {
            const r = await createCategory(fd);
            if (!r.ok) setError(r.error ?? "Erro.");
            else router.refresh();
          });
        }}
        className="flex gap-2"
      >
        <input
          name="name"
          required
          placeholder="Nova categoria (ex: Camisetas)"
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
        >
          Adicionar
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
