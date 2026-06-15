import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";
import { adminGetCategories } from "@/lib/adminQueries";

export const revalidate = 0;

export default async function NovoProduto() {
  const categories = await adminGetCategories();
  return (
    <div className="max-w-2xl space-y-5">
      <Link href="/admin/produtos" className="text-sm text-neutral-500 hover:text-black">
        ← Produtos
      </Link>
      <h1 className="text-lg font-bold">Novo produto</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
