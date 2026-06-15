import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import Navbar from "@/components/Navbar";
import { getCategories } from "@/lib/queries";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "R&K Store",
  description: "Loja oficial R&K Store — roupas e acessórios.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let categories: { name: string; slug: string }[] = [];
  try {
    categories = await getCategories();
  } catch {
    categories = [];
  }

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <CartProvider>
          <Navbar categories={categories} />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-neutral-200 bg-white">
            <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-neutral-500">
              © {new Date().getFullYear()} R&K Store. Todos os direitos
              reservados.
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
