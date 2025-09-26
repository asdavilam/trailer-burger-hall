// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const MAX_SESSION_AGE_MS = 1000 * 60 * 60 * 24 // 24h

export default function middleware(req: NextRequest) {
  const url = req.nextUrl

  // Solo vigilar rutas de admin
  if (!url.pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  const sessionStartStr = req.cookies.get('session-start')?.value

  // Primera vez: crea cookie de inicio
  if (!sessionStartStr) {
    const res = NextResponse.next()
    res.cookies.set('session-start', Date.now().toString(), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    })
    return res
  }

  // ¿Expirada?
  const startedAt = Number(sessionStartStr)
  const age = Date.now() - (Number.isFinite(startedAt) ? startedAt : 0)

  if (age > MAX_SESSION_AGE_MS) {
    const res = NextResponse.redirect(new URL('/admin/login', req.url))
    res.cookies.delete('session-start')
    // Borra cookies de supabase para evitar estados zombie
    for (const c of req.cookies.getAll()) {
      if (c.name.startsWith('sb-')) res.cookies.delete(c.name)
    }
    return res
  }

  return NextResponse.next()
}

// Limitar a secciones de admin
export const config = {
  matcher: ['/admin/:path*'],
}