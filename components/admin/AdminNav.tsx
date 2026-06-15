"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Início" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/pedidos", label: "Pedidos" },
];

export default function AdminNav() {
  const path = usePathname();
  return (
    <nav className="flex flex-wrap gap-1">
      {LINKS.map((l) => {
        const active =
          l.href === "/admin" ? path === "/admin" : path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={
              "rounded-lg px-3 py-1.5 text-sm font-medium transition " +
              (active
                ? "bg-black text-white"
                : "text-neutral-700 hover:bg-neutral-100")
            }
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
