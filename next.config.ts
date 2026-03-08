import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/reels-agent",
        destination: "https://reels-agent.vercel.app/reels-agent",
      },
      {
        source: "/reels-agent/:path*",
        destination: "https://reels-agent.vercel.app/reels-agent/:path*",
      },
    ];
  },
};

export default nextConfig;
