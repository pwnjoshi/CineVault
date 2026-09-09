const path = require('path');

const API_PORT = process.env.INTERNAL_API_PORT || '5000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'archive.org' },
      { protocol: 'https', hostname: 'ia800108.us.archive.org' },
      { protocol: 'https', hostname: 'ia800201.us.archive.org' },
      { protocol: 'https', hostname: 'ia800300.us.archive.org' },
      { protocol: 'https', hostname: 'ia600000.us.archive.org' },
      { protocol: 'https', hostname: 'ia900000.us.archive.org' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'img.clerk.com' }
    ]
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
  async rewrites() {
    return [
      { source: '/api/:path*', destination: `http://127.0.0.1:${API_PORT}/api/:path*` },
      { source: '/premiere', destination: `http://127.0.0.1:${API_PORT}/premiere/` },
      { source: '/premiere/:path*', destination: `http://127.0.0.1:${API_PORT}/premiere/:path*` }
    ];
  }
};
module.exports = nextConfig;
