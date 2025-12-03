declare module 'next-pwa' {
    import { NextConfig } from 'next';

    export default function withPWA(config: {
        dest?: string;
        disable?: boolean;
        register?: boolean;
        scope?: string;
        sw?: string;
        skipWaiting?: boolean;
        runtimeCaching?: any[];
        buildExcludes?: any[];
        cacheOnFrontEndNav?: boolean;
        reloadOnOnline?: boolean;
        customWorkerDir?: string;
        fallbacks?: {
            document?: string;
            image?: string;
            audio?: string;
            video?: string;
            font?: string;
        };
    }): (nextConfig: NextConfig) => NextConfig;
}
