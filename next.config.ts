import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 性能优化 */
  reactStrictMode: true,

  /* 优化图片处理 */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
