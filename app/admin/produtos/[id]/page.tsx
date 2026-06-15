import Link from "next/link";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import VariantManager from "@/components/admin/VariantManager";
import ImageManager from "@/components/admin/ImageManager";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import { adminGetProduct, adminGetCategories } from "@/lib/adminQueries";

export const revalidate = 0;

export default async function EditarProduto({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    adminGetProduct(id),
    adminGetCategories(),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <Link href="/admin/produtos" className="text-sm text-neutral-500 hover:text-black">
          ← Produtos
        </Link>
        <Link
          href={`/produto/${product.id}`}
          target="_blank"
          className="text-sm text-neutral-500 hover:text-black"
        >
          Ver na loja ↗
        </Link>
      </div>

      <section className="max-w-2xl">
        <h1 className="mb-4 text-lg font-bold">Editar produto</h1>
        <ProductForm product={product} categories={categories} />
      </section>

      <section>
        <h2 className="mb-3 font-semibold">Variantes</h2>
        <VariantManager
          productId={product.id}
          variants={product.product_variants ?? []}
        />
      </section>

      <section>
        <h2 className="mb-3 font-semibold">Fotos</h2>
        <ImageManager
          productId={product.id}
          images={product.product_images ?? []}
        />
      </section>

      <section className="border-t border-neutral-200 pt-6">
        <DeleteProductButton id={product.id} />
      </section>
    </div>
  );
}
