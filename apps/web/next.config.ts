// next.config.ts
import withPWAInit from 'next-pwa'
import type { NextConfig } from 'next'

const withPWA = withPWAInit({
  dest: 'public',
  register: false,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline.html',
    image: '/web-app-manifest-192x192.png',
    audio: '/offline.html',
    video: '/offline.html',
    font: '/offline.html',
  },
  // Evita el error de precache en App Router:
  buildExcludes: [/app-build-manifest\.json$/],
})

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@trailer/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hrxwfhpzyludxdsnqibv.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // 🚫 Cache agresivo para manifest e iconos (evita que se quede el de Vercel)
  async headers() {
    return [
      {
        source: '/site.webmanifest',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
      // Favicon clásico y touch icons
      {
        source: '/favicon.ico',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
      },
      {
        source: '/apple-touch-icon.png',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
      },
      // Todos tus íconos bajo /public/icons
      {
        source: '/icons/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
      },
      // Security Headers
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ]
  },

  // 👇 Importar SVG como componentes React (SVGR)
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgo: true,
            // Mantener viewBox para que los iconos escalen bien
            svgoConfig: { plugins: [{ name: 'removeViewBox', active: false }] },
            titleProp: true,
            ref: true,
          },
        },
      ],
    })
    return config
  },
}

export default withPWA(nextConfig)