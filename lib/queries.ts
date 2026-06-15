import { getSupabase } from "./supabase";
import type { Category, Product } from "./types";

const PRODUCT_SELECT =
  "id, category_id, name, description, price, is_active, product_images(id, url, position, is_cover), categories(id, name, slug)";

const PRODUCT_DETAIL_SELECT =
  "id, category_id, name, description, price, is_active, product_images(id, url, position, is_cover), product_variants(id, size, color, stock, sku), categories(id, name, slug)";

export async function getCategories(): Promise<Category[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getProducts(categorySlug?: string): Promise<Product[]> {
  const supabase = getSupabase();
  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();
    if (!cat) return [];
    query = query.eq("category_id", cat.id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_DETAIL_SELECT)
    .eq("id", id)
    .eq("is_activ