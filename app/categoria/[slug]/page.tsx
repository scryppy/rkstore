import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { getProducts, getCategories } from "@/lib/queries";

export const revalidate = 0;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const products = await getProducts(slug);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{category.name}</h1>
      {products.length === 0 ? (
        <p className="text-neutral-500">Nenhum produto nesta categoria ainda.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
