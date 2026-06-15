"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/CartProvider";
import { formatBRL } from "@/lib/format";

export default function CartPage() {
  const { items, updateQty, removeItem, total, ready } = useCart();

  if (!ready) {
    return <p className="text-neutral-500">Carregando…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="space-y-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Seu carrinho está vazio</h1>
        <p className="text-neutral-500">Que tal dar uma olhada nos produtos?</p>
        <Link
          href="/"
          className="inline-block rounded-full bg-black px-6 py-3 font-semibold text-white"
        >
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Carrinho</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.variantId}
              className="flex gap-4 rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.productName}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{item.productName}</h3>
                    <p className="text-sm text-neutral-500">{item.variantInfo}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    className="text-sm text-neutral-400 hover:text-red-600"
                  >
                    Remover
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.variantId, item.quantity - 1)}
                      className="h-8 w-8 rounded-md border border-neutral-300"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(item.variantId, item.quantity + 1)}
                      className="h-8 w-8 rounded-md border border-neutral-300"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-bold">
                    {formatBRL(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-bold">Resumo</h2>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Subtotal</span>
            <span>{formatBRL(total)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-neutral-500">Frete</span>
            <span className="text-neutral-500">a calcular</span>
          </div>
          <div className="flex justify-between border-t border-neutral-200 pt-4 text-lg font-bold">
            <span>Total</span>
            <span>{formatBRL(total)}</span>
          </div>
          <Link
            href="/checkout"
            className="block rounded-full bg-black px-6 py-3 text-center font-semibold text-white transition hover:bg-neutral-800"
          >
            Finalizar compra
          </Link>
        </aside>
      </div>
    </div>
  );
}
