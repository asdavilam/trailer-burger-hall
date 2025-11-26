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

  // 1. OBTENER USUARIO DE AUTH
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // REGLA 1: Protección básica de sesión
  // Si no hay usuario y no es login, mandar a login.
  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // REGLA 2: Si ya está en Login pero tiene sesión, mandar al Dashboard
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // --- 🔒 NUEVA SEGURIDAD AVANZADA ---
  
  if (user) {
    // 2. Consultar el PERFIL para ver Rol y Estado
    // (Esto es rápido en Supabase)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single()

    // REGLA 3: Usuario Desactivado ("Baneado")
    // Si el perfil existe y is_active es falso...
    if (profile && profile.is_active === false) {
      // Opcional: Cerrar sesión forzada (signOut no funciona bien en middleware, mejor redirigir)
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'Tu cuenta ha sido desactivada.')
      
      // Borramos las cookies de sesión para sacarlo de verdad
      const response = NextResponse.redirect(url)
      response.cookies.getAll().forEach(cookie => {
        if (cookie.name.startsWith('sb-')) response.cookies.delete(cookie.name)
      })
      return response
    }

    // REGLA 4: Protección de Rutas por Rol (RBAC)
    // Si intenta entrar a /team y NO es admin...
    if (request.nextUrl.pathname.startsWith('/team') && profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/' // Lo regresamos al Dashboard
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}