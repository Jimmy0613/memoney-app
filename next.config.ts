import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  output: 'export' as const,
  images: {
    unoptimized: true,
  },
  turbopack: {}
} satisfies import('next').NextConfig;

export default withPWA(nextConfig);