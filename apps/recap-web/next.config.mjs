/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  transpilePackages: [
    "@recap-studio/content-pipeline",
    "@recap-studio/design-system",
    "@recap-studio/validation",
  ],
  experimental: {
    // Static-first generation: every page is server-rendered at build time.
  },
};

export default nextConfig;
