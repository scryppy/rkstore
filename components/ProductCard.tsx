import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { formatBRL, coverImage } from "@/lib/format";

export default function ProductCard({ product }: { product: Product }) {
  const img = coverImage(product);

  return (
    <Link
      href={`/produto/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:shadow-lg"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">
            Sem imagem
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        {product.categories?.name && (
          <span className="text-xs uppercase tracking-wide text-neutral-400">
            {product.categories.name}
          </span>
        )}
        <h3 className="font-semibold leading-tight">{product.name}</h3>
        <span className="mt-auto pt-2 text-lg font-bold">
          {formatBRL(product.price)}
        </span>
      </div>
    </Link>
  );
}
