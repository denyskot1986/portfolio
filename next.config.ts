import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/blog", destination: "/", permanent: true },
      { source: "/blog/:slug*", destination: "/", permanent: true },
      { source: "/posts", destination: "/", permanent: true },
      { source: "/posts/:slug*", destination: "/", permanent: true },
      { source: "/articles", destination: "/", permanent: true },
      { source: "/articles/:slug*", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
