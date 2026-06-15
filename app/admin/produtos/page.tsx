import Link from "next/link";
import Image from "next/image";
import { adminGetProducts } from "@/lib/adminQueries";
import { formatBRL, coverImage } from "@/lib/format";

export const revalidate = 0;

export default async function ProdutosPage() {
  const products = await adminGetProducts();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">Produtos ({products.length})</h1>
        <Link
          href="/admin/produtos/novo"
          className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
        >
          + Novo produto
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Nenhum produto. Clique em “Novo produto” para começar.
        </p>
      ) : (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200">
          {products.map((p) => {
            const cover = coverImage(p);
            const stock = (p.product_variants ?? []).reduce(
              (s, v) => s + (v.stock ?? 0),
              0
            );
            return (
              <Link
                key={p.id}
                href={`/admin/produtos/${p.id}`}
                className="flex items-center gap-4 p-3 transition hover:bg-neutral-50"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  {cover && (
                    <Image
                      src={cover}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{p.name}</div>
                  <div className="text-sm text-neutral-500">
                    {p.categories?.name ?? "sem categoria"} ·{" "}
                    {(p.product_variants ?? []).length} variante(s) · {stock} em
                    estoque
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {formatBRL(Number(p.price))}
                  </div>
                  <span
                    className={
                      "text-xs font-medium " +
                      (p.is_active ? "text-emerald-600" : "text-neutral-400")
                    }
                  >
                    {p.is_active ? "ativo" : "inativo"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
