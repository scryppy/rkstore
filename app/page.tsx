import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getProducts, getCategories } from "@/lib/queries";

export const revalidate = 0;

export default async function HomePage() {
  const products = await getProducts();
  const categories = await getCategories();

  return (
    <div className="space-y-12">
      <section className="overflow-hidden rounded-3xl bg-black px-8 py-16 text-white">
        <div className="max-w-xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-accent">
            Nova coleção
          </p>
          <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
            Estilo que combina com você.
          </h1>
          <p className="text-neutral-300">
            Camisetas, moletons, calças e acessórios selecionados pela R&K Store.
          </p>
          <a
            href="#produtos"
            className="inline-block rounded-full bg-brand-accent px-6 py-3 font-semibold text-black transition hover:opacity-90"
          >
            Ver produtos
          </a>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="flex flex-wrap gap-3">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/categoria/${c.slug}`}
              className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium transition hover:border-black"
            >
              {c.name}
            </Link>
          ))}
        </section>
      )}

      <section id="produtos" className="space-y-6">
        <h2 className="text-2xl font-bold">Todos os produtos</h2>
        {products.length === 0 ? (
          <p className="text-neutral-500">
            Nenhum produto cadastrado ainda. Adicione produtos no Supabase para
            aparecerem aqui.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
