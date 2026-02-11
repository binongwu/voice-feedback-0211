import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
        port: '',
        pathname: '/v1/**',
      },
      {
        protocol: 'https',
        hostname: 'qrserver.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
