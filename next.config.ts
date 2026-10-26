import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  images: { unoptimized: true },
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  async redirects() {
    return [
      { source: "/alerts", destination: "/", permanent: false },
      { source: "/how-it-works", destination: "/", permanent: false },
      { source: "/pledge", destination: "/signup", permanent: false },
      { source: "/portfolio", destination: "/dashboard", permanent: false },
    ]
  },
}

export default nextConfig
