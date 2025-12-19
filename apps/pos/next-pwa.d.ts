declare module '@ducanh2912/next-pwa' {
    import type { NextConfig } from 'next';

    export interface PWAConfig {
        dest?: string;
        disable?: boolean;
        register?: boolean;
        skipWaiting?: boolean;
        scope?: string;
        sw?: string;
        fallbacks?: {
            document?: string;
            image?: string;
            audio?: string;
            video?: string;
            font?: string;
        };
        cacheOnFrontEndNav?: boolean;
        aggressiveFrontEndNavCaching?: boolean;
        reloadOnOnline?: boolean;
        workboxOptions?: Record<string, unknown>;
    }

    export default function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;
}
