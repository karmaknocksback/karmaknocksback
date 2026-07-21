import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "rukminim2.flixcart.com" },
    ],
    // Reduce image optimization invocations
    minimumCacheTTL: 86400,      // 24h min cache for optimized images
    formats: ["image/webp"],     // Only generate WebP (not AVIF = saves compute)
    deviceSizes: [640, 768, 1080, 1200], // Fewer sizes = fewer invocations
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  // ── Long-term cache for static assets ────────────────────────────
  // Vercel CDN caches these → zero function invocations for JS/CSS/fonts
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable", // 1 year, immutable
          },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Public images — 7 days CDN cache
      {
        source: "/:path*.(png|jpg|jpeg|gif|svg|ico|webp)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
      // API routes that are truly public/static-ish — 1h CDN cache
      {
        source: "/api/panchang",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=86400, max-age=3600, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/api/articles",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, max-age=300, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/api/japs",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, max-age=300, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
