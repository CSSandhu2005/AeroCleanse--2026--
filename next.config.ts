import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["me7aitdbxq.ufs.sh"],
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;
