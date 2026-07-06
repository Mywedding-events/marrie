import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/mr-logo.png",
      },
      {
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
