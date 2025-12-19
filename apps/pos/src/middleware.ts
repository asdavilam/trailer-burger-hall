import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/middleware-utils'

export async function middleware(request: NextRequest) {
    // Esta función refresca la sesión y protege las rutas
    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - login (login page)
         * - forgot-password (public route)
         * - manifest.json (legacy manifest)
         * - site.webmanifest (new manifest)
         * - icons (PWA icons)
         * - .*\\.png$ (PNG images)
         * - .*\\.jpg$ (JPG images)
         * - .*\\.svg$ (SVG images)
         * - sw.js, workbox, worker (PWA service workers)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|login|forgot-password|manifest.json|site.webmanifest|icons|.*\\.png$|.*\\.jpg$|.*\\.svg$|sw.js|workbox|worker|fallback).*)',
    ],
}
