"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import type { Product, ProductVariant } from "@/lib/types";
import { formatBRL, coverImage } from "@/lib/format";

export default function AddToCart({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const variants = product.product_variants ?? [];
  const [variantId, setVariantId] = useState<string>(
    variants.find((v) => v.stock > 0)?.id ?? variants[0]?.id ?? ""
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const selected: ProductVariant | undefined = variants.find(
    (v) => v.id === variantId
  );
  const outOfStock = !selected || selected.stock <= 0;

  function handleAdd(goToCart = false) {
    if (!selected) return;
    addItem({
      variantId: selected.id,
      productId: product.id,
      productName: product.name,
      variantInfo: `${selected.size}${
        selected.color && selected.color !== "Padrão" ? " / " + selected.color : ""
      }`,
      price: product.price,
      image: coverImage(product),
      quantity: Math.min(qty, selected.stock),
      maxStock: selected.stock,
    });
    if (goToCart) {
      router.push("/carrinho");
    } else {
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    }
  }

  return (
    <div className="space-y-5">
      <div className="text-3xl font-bold">{formatBRL(product.price)}</div>

      {variants.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-semibold">Tamanho</label>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const disabled = v.stock <= 0;
              const active = v.id === variantId;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setVariantId(v.id);
                    setQty(1);
                  }}
                  className={[
                    "min-w-12 rounded-lg border px-3 py-2 text-sm font-medium transition",
                    active
                      ? "border-black bg-black text-white"
                      : "border-neutral-300 bg-white hover:border-black",
                    disabled ? "cursor-not-allowed opacity-40 line-through" : "",
                  ].join(" ")}
                >
                  {v.size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-semibold">Quantidade</label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="h-10 w-10 rounded-lg border border-neutral-300 text-lg"
          >
            −
          </button>
          <span className="w-8 text-center font-semibold">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(selected?.stock ?? 1, q + 1))}
            className="h-10 w-10 rounded-lg border border-neutral-300 text-lg"
          >
            +
          </button>
          {selected && (
            <span className="text-sm text-neutral-500">
              {selected.stock} em estoque
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={outOfStock}
          onClick={() => handleAdd(false)}
          className="flex-1 rounded-full border border-black bg-white px-6 py-3 font-semibold transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {added ? "Adicionado ✓" : outOfStock ? "Esgotado" : "Adicionar ao carrinho"}
        </button>
        <button
          type="button"
          disabled={outOfStock}
          onClick={() => handleAdd(true)}
          className="flex-1 rounded-full bg-black px-6 py-3 font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Comprar agora
        </button>
      </div>
    </div>
  );
}
