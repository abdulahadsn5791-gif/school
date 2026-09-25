import type { NextConfig } from 'next';

const apiBase = process.env.NEXT_PUBLIC_API_URL?.trim()
  ? process.env.NEXT_PUBLIC_API_URL
  : 'http://localhost:8000';
const nextConfig: NextConfig = {
  transpilePackages: ['@ecomerece/domain', '@ecomerece/shared'],
  rewrites: async () => [
    {
      source: '/api/:path*',
      destination: `${apiBase}/:path*`,
    },
  ],
};

export default nextConfig;
