"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export default function Navbar({
  categories,
}: {
  categories: { name: string; slug: string }[];
}) {
  const { count, ready } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          R&amp;K <span className="text-brand-accent">Store</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-neutral-700 md:flex">
          <Link href="/" className="hover:text-black">
            Início
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/categoria/${c.slug}`}
              className="hover:text-black"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <Link
          href="/carrinho"
          className="relative inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
        >
          Carrinho
          {ready && count > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-accent px-1 text-xs font-bold text-black">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
