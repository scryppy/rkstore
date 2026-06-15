"use client";

import { useState, useTransition } from "react";
import { login } from "@/lib/adminActions";

export default function LoginForm({ next }: { next: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      action={(fd) => {
        setError(null);
        start(async () => {
          const r = await login(fd);
          if (r && !r.ok) setError(r.error ?? "Falha no login.");
        });
      }}
      className="mx-auto mt-16 w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm"
    >
      <h1 className="text-xl font-bold">Painel R&amp;K Store</h1>
      <p className="mt-1 text-sm text-neutral-500">Acesso restrito.</p>
      <input type="hidden" name="next" value={next} />
      <label className="mt-6 block text-sm font-medium">Senha</label>
      <input
        type="password"
        name="password"
        autoFocus
        required
        className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none focus:border-black"
      />
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-6 w-full rounded-lg bg-black px-4 py-2.5 font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
