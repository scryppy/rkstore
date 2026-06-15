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

  const variants = product.product_variants ?? [];
  const images = product.product_images ?? [];

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

      <p className="rounded-lg bg-neutral-100 px-4 py-3 text-sm text-neutral-600">
        Esta página tem <strong>3 partes que salvam separadamente</strong>:
        dados do produto, variantes e fotos. Cada uma tem o seu próprio botão —
        clique no botão da parte que você editou.
      </p>

      <section className="max-w-2xl">
        <h2 className="mb-4 text-lg font-bold">1. Dados do produto</h2>
        <ProductForm product={product} categories={categories} />
      </section>

      <section>
        <h2 className="mb-1 text-lg font-bold">2. Variantes (tamanho / cor / estoque)</h2>
        {variants.length === 0 && (
          <p className="mb-3 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">
            Sem variantes: o produto aparece como <strong>Esgotado</strong> e
            não pode ser comprado. Adicione ao menos uma variante com estoque.
          </p>
        )}
        <VariantManager productId={product.id} variants={variants} />
      </section>

      <section>
        <h2 className="mb-1 text-lg font-bold">3. Fotos</h2>
        {images.length === 0 && (
          <p className="mb-3 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">
            Sem fotos: a loja mostra “Sem imagem”. Envie ao menos uma (máx.
            10MB cada). A primeira vira a capa automaticamente.
          </p>
        )}
        <ImageManager productId={product.id} images={images} />
      </section>

      <section className="border-t border-neutral-200 pt-6">
        <DeleteProductButton id={product.id} />
      </section>
    </div>
  );
}
