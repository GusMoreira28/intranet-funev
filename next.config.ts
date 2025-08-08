import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '172.16.0.23',
        port: '1337',
        pathname: '/uploads/**',
      },
      // ... adicione outros domínios aqui, se necessário
    ],
  },
};

export default nextConfig;
