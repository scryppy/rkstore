import "server-only";
import { getSupabaseAdmin } from "./supabaseAdmin";
import type { Category, Product } from "./types";

// Leitura admin (service-role): ignora RLS e inclui inativos.

const ADMIN_PRODUCT_SELECT =
  "id, category_id, name, description, price, is_active, created_at, product_images(id, url, position, is_cover), product_variants(id, size, color, stock, sku), categories(id, name, slug)";

export async function adminGetProducts(): Promise<Product[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("products")
    .select(ADMIN_PRODUCT_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Product[];
}

export async function adminGetProduct(id: string): Promise<Product | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("products")
    .select(ADMIN_PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as Product) ?? null;
}

export async function adminGetCategories(): Promise<Category[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export type AdminOrderRow = {
  id: string;
  status: string;
  total: number;
  payment_method: string | null;
  created_at: string;
  customers: { name: string; email: string } | null;
};

export async function adminGetOrders(): Promise<AdminOrderRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .select("id, status, total, payment_method, created_at, customers(name, email)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as AdminOrderRow[];
}

export type AdminOrderDetail = {
  id: string;
  status: string;
  total: number;
  payment_method: string | null;
  notes: string | null;
  tracking_code: string | null;
  created_at: string;
  customers: { name: string; email: string; phone: string | null } | null;
  customer_addresses: {
    street: string;
    number: string | null;
    complement: string | null;
    neighborhood: string | null;
    city: string;
    state: string;
    zip_code: string;
  } | null;
  order_items: {
    id: string;
    product_name: string;
    variant_info: string;
    unit_price: number;
    quantity: number;
    subtotal: number;
  }[];
};

export async function adminGetOrder(id: string): Promise<AdminOrderDetail | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, status, total, payment_method, notes, tracking_code, created_at, customers(name, email, phone), customer_addresses!orders_shipping_address_id_fkey(street, number, complement, neighborhood, city, state, zip_code), order_items(id, product_name, variant_info, unit_price, quantity, subtotal)"
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as AdminOrderDetail) ?? null;
}

export async function adminStats() {
  const supabase = getSupabaseAdmin();
  const [prod, orders, pending] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);
  return {
    products: prod.count ?? 0,
    orders: orders.count ?? 0,
    pending: pending.count ?? 0,
  };
}
