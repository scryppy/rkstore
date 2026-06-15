import "server-only";

// Integração Mercado Pago via REST (sem SDK/dependência nova).
// Checkout Pro: criamos uma "preference" e redirecionamos o cliente pro init_point.

const MP_API = "https://api.mercadopago.com";

function token(): string {
  const t = process.env.MP_ACCESS_TOKEN;
  if (!t) throw new Error("Configure MP_ACCESS_TOKEN (.env.local e Vercel).");
  return t;
}

export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://rkstore-two.vercel.app"
  );
}

export type PrefItem = {
  title: string;
  quantity: number;
  unit_price: number;
};

export type CreatePreferenceArgs = {
  orderId: string;
  items: PrefItem[];
  payer?: { name?: string; email?: string };
};

export type Preference = { id: string; init_point: string };

export async function createPreference(
  args: CreatePreferenceArgs
): Promise<Preference> {
  const site = siteUrl();
  const body = {
    items: args.items.map((i, idx) => ({
      id: String(idx),
      title: i.title.slice(0, 250),
      quantity: i.quantity,
      unit_price: Number(i.unit_price),
      currency_id: "BRL",
    })),
    payer: args.payer?.email
      ? { name: args.payer.name, email: args.payer.email }
      : undefined,
    external_reference: args.orderId,
    back_urls: {
      success: `${site}/pedido/${args.orderId}`,
      pending: `${site}/pedido/${args.orderId}`,
      failure: `${site}/pedido/${args.orderId}`,
    },
    auto_return: "approved",
    notification_url: `${site}/api/webhooks/mercadopago`,
    statement_descriptor: "RKSTORE",
  };

  const res = await fetch(`${MP_API}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Mercado Pago (preference ${res.status}): ${detail}`);
  }

  const data = (await res.json()) as {
    id: string;
    init_point: string;
    sandbox_init_point?: string;
  };
  return { id: data.id, init_point: data.init_point };
}

export type MpPayment = {
  id: number;
  status: string; // approved | pending | in_process | rejected | cancelled | refunded ...
  external_reference: string | null;
};

export async function getPayment(paymentId: string): Promise<MpPayment | null> {
  const res = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!res.ok) return null;
  const d = (await res.json()) as MpPayment;
  return d;
}

// Mapeia status do MP -> enum order_status do banco.
export function mapPaymentStatus(mp: string): string | null {
  switch (mp) {
    case "approved":
      return "paid";
    case "pending":
    case "in_process":
    case "authorized":
      return "pending";
    case "rejected":
    case "cancelled":
      return "cancelled";
    default:
      return null; // refunded/charged_back etc: não mexe automaticamente
  }
}
