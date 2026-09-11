import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH ?? undefined,
  trailingSlash: true,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
