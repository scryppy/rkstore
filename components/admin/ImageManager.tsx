"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  uploadProductImage,
  deleteProductImage,
  setCoverImage,
  reorderImage,
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
          {sorted.map((img, idx) => (
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
              <div className="space-y-1 p-2 text-xs">
                {sorted.length > 1 && (
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      disabled={pending || idx === 0}
                      onClick={() =>
                        start(async () => {
                          await reorderImage(productId, img.id, "left");
                          router.refresh();
                        })
                      }
                      className="rounded border border-neutral-300 px-2 py-0.5 disabled:opacity-30"
                    >
                      ←
                    </button>
                    <span className="text-neutral-400">{idx + 1}</span>
                    <button
                      type="button"
                      disabled={pending || idx === sorted.length - 1}
                      onClick={() =>
                        start(async () => {
                          await reorderImage(productId, img.id, "right");
                          router.refresh();
                        })
                      }
                      className="rounded border border-neutral-300 px-2 py-0.5 disabled:opacity-30"
                    >
                      →
                    </button>
                  </div>
                )}
                <div className="flex items-center justify-between gap-1">
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
            </div>
          ))}
        </div>
      )}

      <form
        action={(fd) => {
          setError(null);
          const files = fd
            .getAll("file")
            .filter((f): f is File => f instanceof File && f.size > 0);
          if (files.some((f) => f.size > 10 * 1024 * 1024)) {
            setError("Cada imagem deve ter no máximo 10MB.");
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
          multiple
          required
          className="text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
        >
          {pending ? "Enviando…" : "Enviar foto(s)"}
        </button>
        <span className="text-xs text-neutral-500">
          Pode selecionar várias de uma vez.
        </span>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
