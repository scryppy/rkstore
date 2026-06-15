"use server";

import { getSupabaseAdmin } from "./supabaseAdmin";
import type { CartItem } from "./types";

export type CheckoutInput = {
  name: string;
  email: string;
  phone?: string;
  address: {
    street: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city: string;
    state: string;
    zip_code: string;
  };
  payment_method: string;
  notes?: string;
  items: CartItem[];
};

export type CheckoutResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string };

export async function createOrder(
  input: CheckoutInput
): Promise<CheckoutResult> {
  try {
    if (!input.items || input.items.length === 0) {
      return { ok: false, error: "Carrinho vazio." };
    }

    const supabase = getSupabaseAdmin();
    const total = input.items.reduce((s, i) => s + i.price * i.quantity, 0);

    // 1. Cliente (reaproveita por e-mail)
    const { data: existing } = await supabase
      .from("customers")
      .select("id")
      .eq("email", input.email)
      .maybeSingle();

    let customerId = existing?.id as string | undefined;

    if (!customerId) {
      const { data: cust, error: custErr } = await supabase
        .from("customers")
        .insert({
          name: input.name,
          email: input.email,
          phone: input.phone || null,
        })
        .select("id")
        .single();
      if (custErr) throw custErr;
      customerId = cust.id;
    }

    // 2. Endereço
    const { data: addr, error: addrErr } = await supabase
      .from("customer_addresses")
      .insert({
        customer_id: customerId,
        street: input.address.street,
        number: input.address.number || null,
        complement: input.address.complement || null,
        neighborhood: input.address.neighborhood || null,
        city: input.address.city,
        state: input.address.state,
        zip_code: input.address.zip_code,
        is_default: true,
      })
      .select("id")
      .single();
    if (addrErr) throw addrErr;

    // 3. Pedido
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        customer_id: customerId,
        status: "pending",
        total,
        payment_method: input.payment_method,
        shipping_address_id: addr.id,
        notes: input.notes || null,
      })
      .select("id")
      .single();
    if (orderErr) throw orderErr;

    // 4. Itens do pedido
    const itemsPayload = input.items.map((i) => ({
      order_id: order.id,
      variant_id: i.variantId,
      product_name: i.productName,
      variant_info: i.variantInfo,
      unit_price: i.price,
      quantity: i.quantity,
      subtotal: i.price * i.quantity,
    }));

    const { error: itemsErr } = await supabase
      .from("order_items")
      .insert(itemsPayload);
    if (itemsErr) throw itemsErr;

    return { ok: true, orderId: order.id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro ao processar o pedido.";
    return { ok: false, error: msg };
  }
}
