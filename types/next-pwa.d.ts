// types/next-pwa.d.ts
declare module 'next-pwa' {
  import type { NextConfig } from 'next'
  export interface NextPWAOptions {
    dest?: string
    register?: boolean
    skipWaiting?: boolean
    disable?: boolean
    fallbacks?: {
      document?: string
      image?: string
      audio?: string
      video?: string
      font?: string
    }
    buildExcludes?: (RegExp | string)[]
    workboxOptions?: Record<string, unknown>
  }
  export default function withPWA(options?: NextPWAOptions): (config: NextConfig) => NextConfig
}
