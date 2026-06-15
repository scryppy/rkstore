import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "bdldlnmuqhwbkqlwsnyi.supabase.co" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
  },
  experimental: {
    // Upload de fotos vai por server action; o padrão é 1MB (foto de celular estoura).
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
