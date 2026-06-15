"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  uploadProductImage,
  deleteProductImage,
  setCoverImage,
} from "@/lib/adminActions";
import type { ProductImage } from "@/lib/types";

export default function ImageManager({
  productId,
  images,
}: {
  productId: string;
  images: ProductImage[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const sorted = [...images].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-4">
      {sorted.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {sorted.map((img) => (
            <div
              key={img.id}
              className="overflow-hidden rounded-xl border border-neutral-200"
            >
              <div className="relative aspect-square bg-neutral-100">
                <Image
                  src={img.url}
                  alt=""
                  fill
                  sizes="200px"
                  className="object-cover"
                />
                {img.is_cover && (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-brand-accent px-2 py-0.5 text-[10px] font-bold text-black">
                    capa
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1 p-2 text-xs">
                {!img.is_cover && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      start(async () => {
                        await setCoverImage(img.id, productId);
                        router.refresh();
                      })
                    }
                    className="font-medium text-neutral-700 hover:underline"
                  >
                    Definir capa
                  </button>
                )}
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      const r = await deleteProductImage(img.id, productId);
                      if (!r.ok) setError(r.error ?? "Erro.");
                      else router.refresh();
                    })
                  }
                  className="ml-auto text-red-600 hover:underline"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <form
        action={(fd) => {
          setError(null);
          const file = fd.get("file") as File | null;
          if (file && file.size > 10 * 1024 * 1024) {
            setError("Imagem muito grande (máx. 10MB). Reduza e tente de novo.");
            return;
          }
          start(async () => {
            try {
              const r = await uploadProductImage(productId, fd);
              if (!r.ok) setError(r.error ?? "Erro no upload.");
              else router.refresh();
            } catch {
              setError("Falha no envio (arquivo grande demais ou conexão).");
            }
          });
        }}
        className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-neutral-300 p-3"
      >
        <input
          type="file"
          name="file"
          accept="image/*"
          required
          className="text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
        >
          {pending ? "Enviando…" : "Enviar foto"}
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
