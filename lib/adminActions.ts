"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "./supabaseAdmin";
import { ADMIN_COOKIE, checkPassword, makeToken } from "./adminAuth";

const BUCKET = "product-images";

type Result = { ok: boolean; error?: string };

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : "Erro inesperado.";
}

// ---------- AUTH ----------
export async function login(formData: FormData): Promise<Result> {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");
  if (!checkPassword(password)) {
    return { ok: false, error: "Senha incorreta." };
  }
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return { ok: false, error: "ADMIN_SECRET não configurado no servidor." };
  }
  const token = await makeToken(secret);
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
  });
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

// ---------- CATEGORIAS ----------
function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createCategory(formData: FormData): Promise<Result> {
  try {
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return { ok: false, error: "Nome obrigatório." };
    const slug = slugify(name);
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("categories").insert({ name, slug });
    if (error) throw error;
    revalidatePath("/admin/categorias");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function deleteCategory(id: string): Promise<Result> {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/categorias");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

// ---------- PRODUTOS ----------
export async function createProduct(
  formData: FormData
): Promise<{ ok: boolean; error?: string; id?: string }> {
  try {
    const name = String(formData.get("name") ?? "").trim();
    const price = Number(formData.get("price"));
    if (!name) return { ok: false, error: "Nome obrigatório." };
    if (!Number.isFinite(price) || price < 0)
      return { ok: false, error: "Preço inválido." };
    const category_id = String(formData.get("category_id") ?? "") || null;
    const description = String(formData.get("description") ?? "").trim() || null;
    const is_active = formData.get("is_active") === "on";

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("products")
      .insert({ name, price, category_id, description, is_active })
      .select("id")
      .single();
    if (error) throw error;
    revalidatePath("/admin/produtos");
    revalidatePath("/");
    return { ok: true, id: data.id };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function updateProduct(
  id: string,
  formData: FormData
): Promise<Result> {
  try {
    const name = String(formData.get("name") ?? "").trim();
    const price = Number(formData.get("price"));
    if (!name) return { ok: false, error: "Nome obrigatório." };
    if (!Number.isFinite(price) || price < 0)
      return { ok: false, error: "Preço inválido." };
    const category_id = String(formData.get("category_id") ?? "") || null;
    const description = String(formData.get("description") ?? "").trim() || null;
    const is_active = formData.get("is_active") === "on";

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("products")
      .update({
        name,
        price,
        category_id,
        description,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/produtos");
    revalidatePath(`/admin/produtos/${id}`);
    revalidatePath("/");
    revalidatePath(`/produto/${id}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function deleteProduct(id: string): Promise<Result> {
  try {
    const supabase = getSupabaseAdmin();
    // remove imagens do storage
    const { data: imgs } = await supabase
      .from("product_images")
      .select("url")
      .eq("product_id", id);
    const paths = (imgs ?? [])
      .map((i) => storagePathFromUrl(i.url))
      .filter((p): p is string => !!p);
    if (paths.length) await supabase.storage.from(BUCKET).remove(paths);

    await supabase.from("product_images").delete().eq("product_id", id);
    await supabase.from("product_variants").delete().eq("product_id", id);
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/produtos");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

// ---------- VARIANTES ----------
export async function addVariant(
  productId: string,
  formData: FormData
): Promise<Result> {
  try {
    const size = String(formData.get("size") ?? "").trim();
    const color = String(formData.get("color") ?? "").trim();
    const stock = Number(formData.get("stock") ?? 0);
    const sku = String(formData.get("sku") ?? "").trim() || null;
    if (!size || !color)
      return { ok: false, error: "Tamanho e cor são obrigatórios." };
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("product_variants").insert({
      product_id: productId,
      size,
      color,
      stock: Number.isFinite(stock) ? stock : 0,
      sku,
    });
    if (error) throw error;
    revalidatePath(`/admin/produtos/${productId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function updateVariantStock(
  variantId: string,
  productId: string,
  stock: number
): Promise<Result> {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("product_variants")
      .update({ stock })
      .eq("id", variantId);
    if (error) throw error;
    revalidatePath(`/admin/produtos/${productId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function deleteVariant(
  variantId: string,
  productId: string
): Promise<Result> {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("product_variants")
      .delete()
      .eq("id", variantId);
    if (error) throw error;
    revalidatePath(`/admin/produtos/${productId}`);
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error:
        "Não foi possível excluir (variante pode estar ligada a um pedido).",
    };
  }
}

// ---------- IMAGENS ----------
function storagePathFromUrl(url: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  return decodeURIComponent(url.slice(i + marker.length));
}

export async function uploadProductImage(
  productId: string,
  formData: FormData
): Promise<Result> {
  try {
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0)
      return { ok: false, error: "Selecione uma imagem." };
    const supabase = getSupabaseAdmin();

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${productId}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, bytes, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });
    if (upErr) throw upErr;

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);

    // primeira imagem vira capa
    const { count } = await supabase
      .from("product_images")
      .select("id", { count: "exact", head: true })
      .eq("product_id", productId);
    const isFirst = (count ?? 0) === 0;

    const { error } = await supabase.from("product_images").insert({
      product_id: productId,
      url: pub.publicUrl,
      position: count ?? 0,
      is_cover: isFirst,
    });
    if (error) throw error;
    revalidatePath(`/admin/produtos/${productId}`);
    revalidatePath("/");
    revalidatePath(`/produto/${productId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function deleteProductImage(
  imageId: string,
  productId: string
): Promise<Result> {
  try {
    const supabase = getSupabaseAdmin();
    const { data: img } = await supabase
      .from("product_images")
      .select("url, is_cover")
      .eq("id", imageId)
      .single();
    const path = img ? storagePathFromUrl(img.url) : null;
    if (path) await supabase.storage.from(BUCKET).remove([path]);
    const { error } = await supabase
      .from("product_images")
      .delete()
      .eq("id", imageId);
    if (error) throw error;

    // se removeu a capa, promove outra
    if (img?.is_cover) {
      const { data: rest } = await supabase
        .from("product_images")
        .select("id")
        .eq("product_id", productId)
        .order("position")
        .limit(1);
      if (rest && rest.length) {
        await supabase
          .from("product_images")
          .update({ is_cover: true })
          .eq("id", rest[0].id);
      }
    }
    revalidatePath(`/admin/produtos/${productId}`);
    revalidatePath("/");
    revalidatePath(`/produto/${productId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function setCoverImage(
  imageId: string,
  productId: string
): Promise<Result> {
  try {
    const supabase = getSupabaseAdmin();
    await supabase
      .from("product_images")
      .update({ is_cover: false })
      .eq("product_id", productId);
    const { error } = await supabase
      .from("product_images")
      .update({ is_cover: true })
      .eq("id", imageId);
    if (error) throw error;
    revalidatePath(`/admin/produtos/${productId}`);
    revalidatePath("/");
    revalidatePath(`/produto/${productId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

// ---------- PEDIDOS ----------
const ORDER_STATUSES = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<Result> {
  try {
    if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number]))
      return { ok: false, error: "Status inválido." };
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId);
    if (error) throw error;
    revalidatePath("/admin/pedidos");
    revalidatePath(`/admin/pedidos/${orderId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}
