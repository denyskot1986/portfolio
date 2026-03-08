import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/reels-agent",
        destination: "https://reels-agent.vercel.app/",
      },
      {
        source: "/reels-agent/:path*",
        destination: "https://reels-agent.vercel.app/:path*",
      },
    ];
  },
};
export default nextConfig;
