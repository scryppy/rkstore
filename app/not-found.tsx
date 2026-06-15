import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-4 py-20 text-center">
      <h1 className="text-4xl font-extrabold">404</h1>
      <p className="text-neutral-500">Página ou produto não encontrado.</p>
      <Link
        href="/"
        className="inline-block rounded-full bg-black px-6 py-3 font-semibold text-white"
      >
        Voltar à loja
      </Link>
    </div>
  );
}
