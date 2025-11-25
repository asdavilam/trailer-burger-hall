import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/middleware-utils' // 👇 Crearemos esto en un segundo

export async function middleware(request: NextRequest) {
  // Esta función refresca la sesión y protege las rutas
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Coincidir con todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (imágenes optimizadas)
     * - favicon.ico (icono)
     * - login (obviamente queremos que el login sea público)
     * - auth (rutas de callback si las usaras)
     * - images, icons (assets públicos)
     */
    '/((?!_next/static|_next/image|favicon.ico|login|auth|images|icons).*)',
  ],
}