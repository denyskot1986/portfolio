import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async redirects() {
    return [
      { source: "/blog", destination: "/", permanent: true },
      { source: "/blog/:slug*", destination: "/", permanent: true },
      { source: "/posts", destination: "/", permanent: true },
      { source: "/posts/:slug*", destination: "/", permanent: true },
      { source: "/articles", destination: "/", permanent: true },
      { source: "/articles/:slug*", destination: "/", permanent: true },
      // Product rebrand: old slugs → new human names (SKY-101).
      { source: "/products/iborya", destination: "/products/boris", permanent: true },
      { source: "/products/ilucy", destination: "/products/eva", permanent: true },
      { source: "/products/idoctor", destination: "/products/patrik", permanent: true },
      { source: "/products/ileva", destination: "/products/taras", permanent: true },
      { source: "/products/iada", destination: "/products/ada", permanent: true },
      { source: "/products/ihogol", destination: "/products/hanna", permanent: true },
      { source: "/checkout/iborya", destination: "/checkout/boris", permanent: true },
      { source: "/checkout/ilucy", destination: "/checkout/eva", permanent: true },
      { source: "/checkout/idoctor", destination: "/checkout/patrik", permanent: true },
      { source: "/checkout/ileva", destination: "/checkout/taras", permanent: true },
      { source: "/checkout/iada", destination: "/checkout/ada", permanent: true },
      { source: "/checkout/ihogol", destination: "/checkout/hanna", permanent: true },
      // SKY-117: SKYNET Intake renamed to Orban (slug reclaimed).
      { source: "/products/skynet-intake", destination: "/products/orban", permanent: true },
      { source: "/checkout/skynet-intake", destination: "/checkout/orban", permanent: true },
    ];
  },
};

export default nextConfig;
