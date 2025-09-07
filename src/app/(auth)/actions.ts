// src/app/(auth)/actions.ts
'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { supabaseServer } from '@/lib/supabaseServer'

/**
 * Cierra la sesión y regresa al login de admin.
 */
export async function logout() {
  const supabase = await supabaseServer()

  // Intenta cerrar sesión en Supabase (ignora errores para evitar loops)
  try {
    await supabase.auth.signOut()
  } catch {}

  // (Opcional) Limpia cookies sb-* para evitar estados zombie
  const jar = await cookies()
  for (const c of jar.getAll()) {
    if (c.name.startsWith('sb-')) {
      jar.delete(c.name)
    }
  }

  redirect('/admin/login')
}