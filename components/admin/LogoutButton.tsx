"use client";

import { logout } from "@/lib/adminActions";

export default function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
      >
        Sair
      </button>
    </form>
  );
}
