// next.config.ts
import withPWAInit from 'next-pwa'
import type { NextConfig } from 'next'

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline.html',
    image: '/icons/icon-192.png',
    audio: '/offline.html',
    video: '/offline.html',
    font: '/offline.html',
  },
  // Evita el error de precache en App Router:
  buildExcludes: [/app-build-manifest\.json$/],
})

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // 👇 Habilita importar SVG como componentes React (SVGR)
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgo: true,
            // Mantén viewBox para que los iconos escalen correctamente
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