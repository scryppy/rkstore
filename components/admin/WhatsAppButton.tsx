"use client";

export default function WhatsAppButton({
  phone,
  customerName,
  orderId,
  status,
  trackingCode,
}: {
  phone: string | null;
  customerName: string | null;
  orderId: string;
  status: string;
  trackingCode: string | null;
}) {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) {
    return (
      <p className="text-sm text-neutral-400">
        Cliente sem telefone cadastrado.
      </p>
    );
  }
  const intl = digits.startsWith("55") ? digits : `55${digits}`;
  const num = orderId.slice(0, 8).toUpperCase();

  let msg = `Olá ${customerName ?? ""}! Sobre o seu pedido #${num} na R&K Store: `;
  if (status === "paid" || status === "processing") {
    msg += "recebemos seu pagamento e já estamos preparando o envio.";
  } else if (status === "shipped") {
    msg += trackingCode
      ? `ele foi enviado! Código de rastreio: ${trackingCode}.`
      : "ele foi enviado!";
  } else if (status === "delivered") {
    msg += "ele foi entregue. Obrigado pela compra!";
  } else if (status === "pending") {
    msg += "estamos aguardando a confirmação do pagamento.";
  } else {
    msg += "tudo certo?";
  }

  const href = `https://wa.me/${intl}?text=${encodeURIComponent(msg)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
    >
      Avisar cliente no WhatsApp
    </a>
  );
}
