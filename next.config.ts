import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
        pathname: "/pics/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/shop",
        destination: "https://mareko-theslores.bandcamp.com/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
