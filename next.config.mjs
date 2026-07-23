/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // the icon set is all PNG; serving avif/webp cuts them by 60–80%
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
  },
  experimental: {
    // tree-shake the barrel import so pages only pull the motion primitives
    // they actually use instead of the whole entry module
    optimizePackageImports: ["framer-motion"],
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
};

export default nextConfig;
