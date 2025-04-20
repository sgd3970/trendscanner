/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 🔥 빌드 시 ESLint 오류 무시
    ignoreDuringBuilds: true,
  },  
  env: {
    SERPAPI_KEY: process.env.SERPAPI_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.wikipedia.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'commons.wikimedia.org',
        pathname: '/**',
      }
    ],
  },
  devIndicators: {
    buildActivity: false
  },
  typescript: {
    // ⚠️ 타입 체크 오류 무시
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig 