import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 1. OBTENER USUARIO
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // REGLA 1: Protección básica (Si no hay user, al login)
  // Permitimos acceso a /auth/callback y /update-password aunque no haya user (el callback crea la sesión)
  if (!user && !path.startsWith('/login') && !path.startsWith('/auth') && !path.startsWith('/update-password') && !path.startsWith('/forgot-password')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // REGLA 2: Si ya tiene sesión y está en Login, sacar de ahí
  if (user && path.startsWith('/login')) {
    const url = request.nextUrl.clone()
    // Por defecto al home, la Regla 4 lo corregirá si es staff luego
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // --- 🔒 SEGURIDAD AVANZADA ---

  if (user) {
    // Consultar Perfil (Rol y Estado)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single()

    // REGLA 3: Usuario Baneado/Desactivado
    if (profile && profile.is_active === false) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'Tu cuenta ha sido desactivada.')

      const response = NextResponse.redirect(url)
      // Limpiar cookies manualmente para asegurar cierre
      response.cookies.getAll().forEach(cookie => {
        if (cookie.name.startsWith('sb-')) response.cookies.delete(cookie.name)
      })
      return response
    }

    // REGLA 4: Restricción Estricta (Staff = Solo Inventario) [MODIFICADO]
    const isAdmin = profile?.role === 'admin'

    if (!isAdmin) {
      // Si NO es admin... 
      // y la ruta NO empieza con /supplies/count NI es /update-password
      if (!path.startsWith('/supplies/count') && !path.startsWith('/update-password')) {
        const url = request.nextUrl.clone()
        url.pathname = '/supplies/count' // 👈 Redirección forzada a la única pantalla permitida
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}