import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: "https://zitoapi.excelintech.com/:path*",
      },
    ];
  },
};

export default nextConfig;