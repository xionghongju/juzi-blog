import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 性能优化 */
  reactStrictMode: true,

  /* 优化图片处理 */
  images: {
    // 开发环境下 DNS 可能将外部域名解析为私有 IP，Next.js 会拒绝代理，故跳过优化
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "dkyvaxnwcmuoigajlxxh.supabase.co" },
    ],
  },
};

export default nextConfig;
