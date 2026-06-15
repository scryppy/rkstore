import CategoryManager from "@/components/admin/CategoryManager";
import { adminGetCategories } from "@/lib/adminQueries";

export const revalidate = 0;

export default async function CategoriasPage() {
  const categories = await adminGetCategories();
  return (
    <div className="space-y-5">
      <h1 className="text-lg font-bold">Categorias</h1>
      <CategoryManager categories={categories} />
    </div>
  );
}
