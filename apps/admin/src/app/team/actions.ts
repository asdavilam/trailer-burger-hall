'use server'

import { createClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import { UserRole } from '@trailer/shared'

import { requireAdmin } from '@/lib/auth'

// 1. CAMBIAR ROL
export async function updateUserRole(userId: string, newRole: UserRole) {
  try {
    const me = await requireAdmin()
    if (me.id === userId) return { error: 'No puedes cambiar tu propio rol' }

    const { error } = await supabaseAdmin // Usamos admin para saltar RLS si fuera necesario
      .from('user_profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) throw error
    revalidatePath('/team')
    return { success: true }
  } catch (e: any) {
    return { error: e.message }
  }
}

// 2. ACTIVAR / DESACTIVAR (Soft Delete)
export async function toggleUserStatus(userId: string, isActive: boolean) {
  try {
    const me = await requireAdmin()
    if (me.id === userId) return { error: 'No puedes desactivarte a ti mismo' }

    // Actualizamos perfil
    const { error } = await supabaseAdmin
      .from('user_profiles')
      .update({ is_active: isActive })
      .eq('id', userId)

    // Opcional: Banear en Auth real para matar sesiones activas
    if (!isActive) {
      await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: '876000h' }) // 100 años
    } else {
      await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: 'none' })
    }

    if (error) throw error
    revalidatePath('/team')
    return { success: true }
  } catch (e: any) {
    return { error: e.message }
  }
}

// 3. CREAR USUARIO (Invitar)
// 3. INVITAR USUARIO (Por Email)
export async function inviteUser(formData: FormData) {
  try {
    await requireAdmin()

    const email = formData.get('email') as string
    const role = formData.get('role') as UserRole
    const name = formData.get('name') as string

    // Enviar invitación por email (Supabase Auth)
    // Redirigir a /auth/callback?next=/update-password para que establezcan su contraseña
    const getBaseUrl = () => {
      if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
      if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
      if (process.env.NODE_ENV === 'production') return 'https://portal.trailerburgerhall.com.mx'
      return 'http://localhost:3000'
    }

    const redirectUrl = `${getBaseUrl()}/auth/callback?next=/update-password`

    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { display_name: name }, // Metadata inicial
      redirectTo: redirectUrl
    })

    if (error) throw error
    if (!data.user) throw new Error('No se pudo invitar al usuario')

    // Actualizar rol y nombre en user_profiles
    // (El trigger lo crea al insertar en auth.users, aquí lo actualizamos con el rol correcto)
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        role,
        display_name: name,
        is_active: true
      })
      .eq('id', data.user.id)

    if (profileError) {
      // Si falla la actualización del perfil, al menos el usuario fue invitado.
      console.error('Error updating profile for invited user:', profileError)
    }

    revalidatePath('/team')
    return { success: true }
  } catch (e: any) {
    return { error: e.message }
  }
}

// 4. ELIMINAR USUARIO
export async function deleteUser(userId: string) {
  try {
    const me = await requireAdmin()
    if (me.id === userId) return { error: 'No puedes eliminarte a ti mismo' }

    // Eliminar de Auth (esto debería disparar cascade en user_profiles si está configurado,
    // pero si no, Supabase Auth es la fuente de verdad)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (error) throw error
    revalidatePath('/team')
    return { success: true }
  } catch (e: any) {
    return { error: e.message }
  }
}