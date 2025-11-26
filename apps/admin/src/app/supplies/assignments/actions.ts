// apps/admin/src/app/supplies/assignments/actions.ts
'use server'

import { createClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

// 1. Obtener la "Foto Completa": Usuarios, Insumos y Asignaciones actuales
export async function getAssignmentData() {
  const supabase = await createClient()

  const [usersRes, suppliesRes, assignmentsRes] = await Promise.all([
    supabase.from('user_profiles').select('*').in('role', ['staff', 'kitchen']).eq('is_active', true),
    supabase.from('supplies').select('*').order('name'),
    supabase.from('inventory_assignments').select('*')
  ])

  return {
    users: usersRes.data || [],
    supplies: suppliesRes.data || [],
    assignments: assignmentsRes.data || []
  }
}

// 2. Guardar asignaciones de un usuario
export async function saveUserAssignments(userId: string, supplyIds: string[]) {
  const supabase = await createClient()

  // Estrategia: "Borrar y Re-crear" (Es lo más seguro para sincronizar listas)
  
  // A. Borrar todo lo que este usuario tenía asignado
  const { error: deleteError } = await supabase
    .from('inventory_assignments')
    .delete()
    .eq('user_id', userId)

  if (deleteError) return { error: 'Error al limpiar asignaciones previas' }

  if (supplyIds.length === 0) {
    revalidatePath('/supplies/assignments')
    return { success: true }
  }

  // B. Insertar las nuevas selecciones
  const toInsert = supplyIds.map(supplyId => ({
    user_id: userId,
    supply_id: supplyId
  }))

  const { error: insertError } = await supabase
    .from('inventory_assignments')
    .insert(toInsert)

  if (insertError) return { error: 'Error al guardar nuevas asignaciones' }

  revalidatePath('/supplies/assignments')
  return { success: true }
}