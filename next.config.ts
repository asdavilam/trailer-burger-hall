// next.config.ts
import withPWAInit from 'next-pwa'

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

const nextConfig = {
  reactStrictMode: true,
}

export default withPWA(nextConfig)
