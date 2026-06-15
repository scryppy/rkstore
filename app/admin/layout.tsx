import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import LogoutButton from "@/components/admin/LogoutButton";

export const metadata = { title: "Admin · R&K Store" };

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-4">
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/admin" className="font-bold">
            Admin
          </Link>
          <AdminNav />
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="text-sm text-neutral-500 hover:text-black"
          >
            Ver loja ↗
          </Link>
          <LogoutButton />
        </div>
      </div>
      {children}
    </div>
  );
}
