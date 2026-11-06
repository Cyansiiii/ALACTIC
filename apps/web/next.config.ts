import type { NextConfig } from "next";

// cacheComponents is intentionally OFF: with it, Next keeps hidden pages mounted
// via <Activity>, which leaves GSAP ScrollTriggers/pins alive on invisible pages.
const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: { position: "bottom-right" },
  turbopack: {
    // wagmi's baseAccount connector → @base-org/account (node build) → @coinbase/cdp-sdk,
    // which has unresolvable optional deps. ALACTIC never uses it; stub it.
    resolveAlias: { "@coinbase/cdp-sdk": "./lib/shims/cdp-sdk.ts" },
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
  images: { formats: ["image/avif", "image/webp"] },
  experimental: {
    optimizePackageImports: ["motion", "@react-three/drei", "gsap"],
  },
};

export default nextConfig;
