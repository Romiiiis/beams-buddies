import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {},
  adapterPath: path.resolve("./vercel-adapter.js"),
};

export default nextConfig;