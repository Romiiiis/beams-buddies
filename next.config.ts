import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {},
  adapterPath: path.resolve("./vercel-adapter.js"),
  async redirects() {
    return [
      { source: '/dashboard/revenue', destination: '/dashboard/reports', permanent: false },
      { source: '/dashboard/expenses', destination: '/dashboard', permanent: false },
    ]
  },
};

export default nextConfig;