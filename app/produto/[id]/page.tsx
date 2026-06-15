import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/queries";
import AddToCart from "@/components/AddToCart";

export const revalidate = 0;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const images = (product.product_images ?? []).sort(
    (a, b) => Number(b.is_cover) - Number(a.is_cover) || a.position - b.position
  );

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-neutral-500 hover:text-black">
        ← Voltar
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-3">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-neutral-100">
            {images[0] ? (
              <Image
                src={images[0].url}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-neutral-400">
                Sem imagem
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.slice(1, 5).map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100"
                >
                  <Image
                    src={img.url}
                    alt={product.name}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {product.categories?.name && (
            <span className="text-xs uppercase tracking-wide text-neutral-400">
              {product.categories.name}
            </span>
          )}
          <h1 className="text-3xl font-bold">{product.name}</h1>
          {product.description && (
            <p className="whitespace-pre-line leading-relaxed text-neutral-600">
              {product.description}
            </p>
          )}
          <AddToCart product={product} />
        </div>
      </div>
    </div>
  );
}
