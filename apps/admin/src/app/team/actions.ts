'use server'

import { createClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'
import { UserRole } from '@trailer/shared'

// Verificar si soy admin (Helper)
async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()
    
  if (profile?.role !== 'admin') throw new Error('No autorizado')
  return user
}

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
export async function createUser(formData: FormData) {
  try {
    await requireAdmin()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as UserRole
    const name = formData.get('name') as string

    // Crear en Auth (Usando Service Role)
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmado automático
      user_metadata: { display_name: name }
    })

    if (error) throw error
    if (!data.user) throw new Error('No se pudo crear el usuario')

    // Actualizar rol y nombre en user_profiles
    // (El trigger lo creó como 'staff' por defecto, aquí lo ajustamos)
    await supabaseAdmin
      .from('user_profiles')
      .update({ role, display_name: name, is_active: true })
      .eq('id', data.user.id)

    revalidatePath('/team')
    return { success: true }
  } catch (e: any) {
    return { error: e.message }
  }
}