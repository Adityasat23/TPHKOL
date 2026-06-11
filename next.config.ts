import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Memaksa build tetap berjalan meskipun ada error ESLint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Memaksa build tetap berjalan meskipun ada error TypeScript
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
