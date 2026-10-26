import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  async redirects() {
    return [
      { source: "/alerts", destination: "/", permanent: false },
      { source: "/how-it-works", destination: "/", permanent: false },
      { source: "/pledge", destination: "/sign-in", permanent: false },
      { source: "/portfolio", destination: "/dashboard", permanent: false },
    ]
  },
};

export default nextConfig;
