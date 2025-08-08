import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost', '172.16.0.23:1337'], // Adicione os domínios permitidos para imagens
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      // ... adicione outros domínios aqui, se necessário
    ],
  },
};

export default nextConfig;
