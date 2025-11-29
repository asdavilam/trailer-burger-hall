import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/middleware-utils' // 👇 Crearemos esto en un segundo

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
     * - manifest.json (PWA manifest)
     * - icons (PWA icons)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|manifest.json|icons).*)',
  ],
}