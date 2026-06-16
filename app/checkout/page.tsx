"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatBRL } from "@/lib/format";
import { createOrderAndCheckout } from "@/lib/actions";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clear, ready } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cepStatus, setCepStatus] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    zip_code: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    payment_method: "mercadopago",
    notes: "",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function buscarCep(cep: string) {
    setCepStatus("Buscando endereço…");
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const d = await r.json();
      if (d.erro) {
        setCepStatus("CEP não encontrado.");
        return;
      }
      setForm((f) => ({
        ...f,
        street: d.logradouro || f.street,
        neighborhood: d.bairro || f.neighborhood,
        city: d.localidade || f.city,
        state: d.uf || f.state,
      }));
      setCepStatus(null);
    } catch {
      setCepStatus("Não foi possível buscar o CEP agora.");
    }
  }

  function onCepChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    const masked =
      digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    set("zip_code", masked);
    if (cepStatus) setCepStatus(null);
    if (digits.length === 8) buscarCep(digits);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await createOrderAndCheckout({
      name: form.name,
      email: form.email,
      phone: form.phone,
      payment_method: form.payment_method,
      notes: form.notes,
      address: {
        street: form.street,
        number: form.number,
        complement: form.complement,
        neighborhood: form.neighborhood,
        city: form.city,
        state: form.state,
        zip_code: form.zip_code,
      },
      items,
    });
    if (res.ok) {
      setRedirecting(true);
      clear();
      // redireciona para o ambiente seguro do Mercado Pago
      window.location.href = res.initPoint;
    } else {
      setLoading(false);
      setError(res.error);
    }
  }

  if (redirecting) {
    return (
      <div className="space-y-3 py-16 text-center">
        <h1 className="text-2xl font-bold">Redirecionando para o pagamento…</h1>
        <p className="text-neutral-500">
          Você será levado ao ambiente seguro do Mercado Pago.
        </p>
      </div>
    );
  }

  if (ready && items.length === 0) {
    return (
      <div className="space-y-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Nada para finalizar</h1>
        <Link
          href="/"
          className="inline-block rounded-full bg-black px-6 py-3 font-semibold text-white"
        >
          Voltar à loja
        </Link>
      </div>
    );
  }

  const input =
    "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black";

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Finalizar compra</h1>

      <form
        onSubmit={handleSubmit}
        className="grid gap-8 lg:grid-cols-[1fr_320px]"
      >
        <div className="space-y-6">
          <fieldset className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
            <legend className="px-2 font-semibold">Seus dados</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                required
                placeholder="Nome completo"
                className={input}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
              <input
                required
                type="email"
                placeholder="E-mail"
                className={input}
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
              <input
                placeholder="Telefone / WhatsApp"
                className={input}
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>
          </fieldset>

          <fieldset className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
            <legend className="px-2 font-semibold">Endereço de entrega</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <input
                  required
                  inputMode="numeric"
                  placeholder="CEP"
                  maxLength={9}
                  className={input}
                  value={form.zip_code}
                  onChange={(e) => onCepChange(e.target.value)}
                />
                {cepStatus && (
                  <span className="text-xs text-neutral-500">{cepStatus}</span>
                )}
              </div>
              <input
                required
                placeholder="Rua"
                className={input}
                value={form.street}
                onChange={(e) => set("street", e.target.value)}
              />
              <input
                placeholder="Número"
                className={input}
                value={form.number}
                onChange={(e) => set("number", e.target.value)}
              />
              <input
                placeholder="Complemento"
                className={input}
                value={form.complement}
                onChange={(e) => set("complement", e.target.value)}
              />
              <input
                placeholder="Bairro"
                className={input}
                value={form.neighborhood}
                onChange={(e) => set("neighborhood", e.target.value)}
              />
              <input
                required
                placeholder="Cidade"
                className={input}
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
              />
              <input
                required
                placeholder="Estado (UF)"
                maxLength={2}
                className={input}
                value={form.state}
                onChange={(e) => set("state", e.target.value.toUpperCase())}
              />
            </div>
          </fieldset>

          <fieldset className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
            <legend className="px-2 font-semibold">Pagamento</legend>
            <p className="text-sm text-neutral-600">
              Você escolhe a forma de pagamento (Pix, cartão ou boleto) na
              próxima etapa, no ambiente seguro do Mercado Pago.
            </p>
            <textarea
              placeholder="Observações (opcional)"
              className={input}
              rows={3}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </fieldset>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>

        <aside className="h-fit space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-bold">Seu pedido</h2>
          <ul className="space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.variantId} className="flex justify-between gap-2">
                <span className="text-neutral-600">
                  {i.quantity}× {i.productName}{" "}
                  <span className="text-neutral-400">({i.variantInfo})</span>
                </span>
                <span>{formatBRL(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-neutral-200 pt-4 text-lg font-bold">
            <span>Total</span>
            <span>{formatBRL(total)}</span>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="block w-full rounded-full bg-black px-6 py-3 text-center font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            {loading ? "Processando…" : "Ir para o pagamento"}
          </button>
        </aside>
      </form>
    </div>
  );
}
