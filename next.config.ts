import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'public-assets.wompi.com',
      },
      {
        protocol: 'https',
        hostname: 'productos-wompi.s3.us-west-2.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'logos-wolff.s3.us-west-2.amazonaws.com',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  }
};

export default nextConfig;
