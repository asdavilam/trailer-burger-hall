// apps/pos/src/app/login/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase'

/**
 * Inicia sesión recibiendo los datos del formulario (Server Action)
 */
export async function login(formData: FormData) {
    const supabase = await createClient()

    // 1. Extraer datos del formulario
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // 2. Intentar loguear con Supabase
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        // Si falla, regresamos al login con un parámetro de error
        return redirect('/login?error=Credenciales inválidas o error de conexión')
    }

    // 3. Si es exitoso:
    // Limpiamos la caché de la ruta raíz para que el layout sepa que ya hay usuario
    revalidatePath('/', 'layout')

    // Redirigimos al POS
    redirect('/')
}

/**
 * Cierra la sesión y regresa al login.
 */
export async function logout() {
    const supabase = await createClient()

    // Intenta cerrar sesión en Supabase
    try {
        await supabase.auth.signOut()
    } catch (err) {
        console.warn('[logout] Error al cerrar sesión en Supabase:', err)
    }

    // (Opcional) Limpieza manual de cookies zombie de Supabase
    const jar = await cookies()
    try {
        for (const c of jar.getAll()) {
            if (c.name.startsWith('sb-')) {
                jar.delete(c.name)
            }
        }
    } catch (e) {
        // Ignoramos errores de cookie store
    }

    // Redirigir al login
    revalidatePath('/', 'layout')
    redirect('/login')
}
