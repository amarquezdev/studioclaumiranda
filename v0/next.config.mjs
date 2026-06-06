/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination: 'https://studio-clau-admin.vercel.app',
        permanent: false,
      },
      {
        source: '/admin/:path*',
        destination: 'https://studio-clau-admin.vercel.app/:path*',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
