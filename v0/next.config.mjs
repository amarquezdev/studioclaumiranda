/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/admin',
        destination: 'https://studio-clau-admin.vercel.app/admin',
      },
      {
        source: '/admin/:path*',
        destination: 'https://studio-clau-admin.vercel.app/admin/:path*',
      },
      {
        source: '/assets/:path*',
        destination: 'https://studio-clau-admin.vercel.app/assets/:path*',
      },
    ]
  },
}

export default nextConfig
